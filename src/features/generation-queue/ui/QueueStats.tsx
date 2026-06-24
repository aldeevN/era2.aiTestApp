import { useMemo } from "react";
import { cn } from "@/shared/lib/utils";
import type { GenerationTask } from "@/entities/generation-task/model/types";

const STAT_DOTS: Record<string, string> = {
  queued: "#6b6560",
  running: "#e85420",
  done: "#22c55e",
  failed: "#e84040",
};

interface QueueStatsProps {
  tasks: GenerationTask[];
}

export function QueueStats({ tasks }: QueueStatsProps) {
  const counts = useMemo(
    () => ({
      queued: tasks.filter((task) => task.status === "queued").length,
      running: tasks.filter((task) => task.status === "running").length,
      done: tasks.filter((task) => task.status === "done").length,
      failed: tasks.filter((task) => task.status === "failed").length,
    }),
    [tasks]
  );

  const stats = useMemo(
    () => [
      { key: "queued", label: "В очереди", value: counts.queued },
      { key: "running", label: "Идёт", value: counts.running },
      { key: "done", label: "Готово", value: counts.done },
      { key: "failed", label: "Ошибка", value: counts.failed },
    ],
    [counts]
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map(({ key, label, value }) => (
        <div key={key} className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STAT_DOTS[key] }} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
          <span className="text-3xl font-semibold text-foreground tabular-nums">{value}</span>
        </div>
      ))}
    </div>
  );
}
