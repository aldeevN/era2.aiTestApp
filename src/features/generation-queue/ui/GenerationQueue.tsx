import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { useNavigate } from "@/shared/routing";
import { useQueue } from "@/features/generation-queue/model/useQueue";
import { useFilteredTasks, useQueueCounters, type FilterStatus, type SortOrder } from "@/features/generation-queue/model/selectors";
import { QueueStats } from "@/features/generation-queue/ui/QueueStats";
import { QueueToolbar } from "@/features/generation-queue/ui/QueueToolbar";
import { TaskRow } from "@/features/generation-queue/ui/TaskRow";
import { EmptyState } from "@/features/generation-queue/ui/states/EmptyState";
import { LoadingState } from "@/features/generation-queue/ui/states/LoadingState";
import { ErrorState } from "@/features/generation-queue/ui/states/ErrorState";

export function GenerationQueue() {
  const { state, dispatch } = useQueue();
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [search]);

  const filteredTasks = useFilteredTasks(state.tasks, filter, sort, debouncedSearch);
  const counters = useQueueCounters(state.tasks);
  const hasDone = counters.done > 0;

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-[calc(100vh-var(--header-height,64px))] mx-auto max-w-6xl">
        <div className="flex-1 overflow-y-auto w-full px-4 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row items-start justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-1">
                Очередь генераций
              </h1>
              <p className="text-sm text-muted-foreground">Все ваши задачи в реальном времени</p>
            </div>
            {hasDone && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => dispatch({ type: "CLEAR_DONE" })}
                className="shrink-0 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-card hover:border-white/15 transition-all"
              >
                Очистить готовые
              </motion.button>
            )}
          </div>

          <div className="mb-6">
            <QueueStats tasks={state.tasks} />
          </div>

          <div className="mb-5">
            <QueueToolbar
              filter={filter}
              onFilter={setFilter}
              sort={sort}
              onSort={setSort}
              search={search}
              onSearch={setSearch}
            />
          </div>

          <AnimatePresence mode="wait">
            {state.loading ? (
              <LoadingState />
            ) : state.error ? (
              <ErrorState onRetry={() => dispatch({ type: "INIT", tasks: state.tasks.length ? state.tasks : [] })} />
            ) : filteredTasks.length === 0 ? (
              <EmptyState filtered={filter !== "all" || search.trim().length > 0} />
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2">
                {filteredTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onCancel={(id) => dispatch({ type: "CANCEL", id })}
                    onRetry={(id) => dispatch({ type: "RETRY", id })}
                    onDelete={(id) => dispatch({ type: "DELETE", id })}
                    onDownload={() => {
                      // TODO: implement download
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ErrorBoundary>
  );
}
