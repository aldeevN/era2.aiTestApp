import { createContext, useMemo, useReducer, type ReactNode, useEffect } from "react";
import type { QueueState, QueueAction } from "@/features/generation-queue/model/queueReducer";
import { queueReducer } from "@/features/generation-queue/model/queueReducer";
import { useQueueEngine } from "@/features/generation-queue/model/queueEngine";
import { generationTaskSeed } from "@/entities/generation-task/model/seed";
import type { GenerationTask } from "@/entities/generation-task/model/types";

const LS_KEY = "era2_queue";

export interface QueueContextValue {
  state: QueueState;
  dispatch: React.Dispatch<QueueAction>;
}

export const QueueContext = createContext<QueueContextValue | null>(null);

function saveTasks(tasks: GenerationTask[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(tasks));
  } catch {
    // ignore
  }
}

function loadTasks(): GenerationTask[] | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const tasks: GenerationTask[] = JSON.parse(raw);
    return tasks.map((task) =>
      task.status === "running" ? { ...task, status: "queued", progress: 0 } : task
    );
  } catch {
    return null;
  }
}

const initialState: QueueState = {
  tasks: [],
  loading: true,
  error: false,
};

export function QueueProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(queueReducer, initialState);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      const saved = loadTasks();
      dispatch({ type: "INIT", tasks: saved ?? generationTaskSeed });
    }, 600);
    return () => window.clearTimeout(timerId);
  }, []);

  useEffect(() => {
    if (!state.loading) {
      saveTasks(state.tasks);
    }
  }, [state.tasks, state.loading]);

  useQueueEngine(state.tasks, dispatch);

  const value = useMemo(
    () => ({ state, dispatch }),
    [state, dispatch]
  );

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
}
