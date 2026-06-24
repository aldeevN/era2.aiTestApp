import { useEffect, useRef } from "react";
import type { GenerationTask, GenType, TaskStatus } from "@/entities/generation-task/model/types";
import type { QueueAction } from "@/features/generation-queue/model/queueReducer";

const MAX_CONCURRENT = 2;
const FAIL_CHANCE_PER_TICK = 0.15;
const ERROR_MESSAGES = [
  "Недостаточно кредитов",
  "Превышено время ожидания",
  "Модель временно недоступна",
];

const TICK_INTERVAL: Record<GenType, [number, number]> = {
  text: [300, 500],
  image: [450, 750],
  audio: [600, 1000],
  video: [900, 1500],
};

const TICK_STEP: Record<GenType, [number, number]> = {
  text: [4, 8],
  image: [2, 5],
  audio: [1.5, 4],
  video: [1, 3],
};

interface ActiveEntry {
  progress: number;
  type: GenType;
  timerId?: ReturnType<typeof setTimeout>;
}

function scheduleTick(
  id: string,
  type: GenType,
  dispatch: React.Dispatch<QueueAction>,
  activeRef: React.MutableRefObject<Map<string, ActiveEntry>>
) {
  const [minMs, maxMs] = TICK_INTERVAL[type];
  const [minStep, maxStep] = TICK_STEP[type];
  const delay = minMs + Math.random() * (maxMs - minMs);

  const timerId = setTimeout(() => {
    const entry = activeRef.current.get(id);
    if (!entry) return;

    if (Math.random() < FAIL_CHANCE_PER_TICK) {
      const message = ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)];
      dispatch({ type: "FAIL", id, message });
      activeRef.current.delete(id);
      return;
    }

    const step = minStep + Math.random() * (maxStep - minStep);
    const newProgress = Math.min(100, entry.progress + step);
    entry.progress = newProgress;

    if (newProgress >= 100) {
      dispatch({ type: "COMPLETE", id });
      activeRef.current.delete(id);
    } else {
      dispatch({ type: "TICK", id, progress: newProgress });
      scheduleTick(id, type, dispatch, activeRef);
    }
  }, delay);

  const existing = activeRef.current.get(id);
  if (existing) {
    existing.timerId = timerId;
  }
}

function getQueuedTasks(tasks: GenerationTask[]) {
  return tasks
    .filter((task) => task.status === "queued")
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function useQueueEngine(tasks: GenerationTask[], dispatch: React.Dispatch<QueueAction>) {
  const activeRef = useRef<Map<string, ActiveEntry>>(new Map());

  useEffect(() => {
    const runningIds = new Set(tasks.filter((task) => task.status === "running").map((task) => task.id));

    for (const [id, entry] of activeRef.current) {
      if (!runningIds.has(id)) {
        if (entry.timerId) {
          clearTimeout(entry.timerId);
        }
        activeRef.current.delete(id);
      }
    }

    const runningTasks = tasks.filter((task) => task.status === "running");
    runningTasks.forEach((task) => {
      if (!activeRef.current.has(task.id)) {
        activeRef.current.set(task.id, { progress: task.progress, type: task.type });
        scheduleTick(task.id, task.type, dispatch, activeRef);
      }
    });

    const runningCount = runningTasks.length;
    const availableSlots = Math.max(0, MAX_CONCURRENT - runningCount);
    if (availableSlots > 0) {
      getQueuedTasks(tasks)
        .slice(0, availableSlots)
        .forEach((task) => dispatch({ type: "START", id: task.id }));
    }
  }, [tasks, dispatch]);

  useEffect(() => {
    return () => {
      for (const entry of activeRef.current.values()) {
        if (entry.timerId) {
          clearTimeout(entry.timerId);
        }
      }
      activeRef.current.clear();
    };
  }, []);
}
