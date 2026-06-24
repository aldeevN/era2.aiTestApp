import { useMemo } from "react";
import type { GenerationTask, TaskStatus } from "@/entities/generation-task/model/types";

export type FilterStatus = "all" | TaskStatus;
export type SortOrder = "newest" | "oldest";

export function useFilteredTasks(
  tasks: GenerationTask[],
  filter: FilterStatus,
  sort: SortOrder,
  search: string
) {
  return useMemo(() => {
    let result = tasks;

    if (filter !== "all") {
      result = result.filter((task) => task.status === filter);
    }

    const trimmedSearch = search.trim().toLowerCase();
    if (trimmedSearch.length > 0) {
      result = result.filter((task) => task.prompt.toLowerCase().includes(trimmedSearch));
    }

    return [...result].sort((a, b) =>
      sort === "newest" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt
    );
  }, [tasks, filter, sort, search]);
}

export function useQueueCounters(tasks: GenerationTask[]) {
  return useMemo(
    () => ({
      queued: tasks.filter((task) => task.status === "queued").length,
      running: tasks.filter((task) => task.status === "running").length,
      done: tasks.filter((task) => task.status === "done").length,
      failed: tasks.filter((task) => task.status === "failed").length,
    }),
    [tasks]
  );
}
