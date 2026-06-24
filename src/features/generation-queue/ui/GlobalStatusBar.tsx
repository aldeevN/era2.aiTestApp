import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import type { GenerationTask } from "@/entities/generation-task/model/types";
import { TypeIcon } from "@/features/generation-queue/ui/TaskRow";
import { ProgressBar } from "@/features/generation-queue/ui/ProgressBar";

interface GlobalStatusBarProps {
  tasks: GenerationTask[];
  onNavigate: () => void;
}

export function GlobalStatusBar({ tasks, onNavigate }: GlobalStatusBarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const active = useMemo(
    () => tasks.filter((task) => task.status === "running" || task.status === "queued"),
    [tasks]
  );
  const running = useMemo(() => tasks.filter((task) => task.status === "running"), [tasks]);

  const avgProgress = useMemo(() => {
    if (running.length === 0) return 0;
    return Math.round(running.reduce((sum, task) => sum + task.progress, 0) / running.length);
  }, [running]);

  if (active.length === 0) return null;

  const handleNavigate = () => {
    onNavigate();
  };

  if (collapsed) {
    return (
      <motion.button
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={() => setCollapsed(false)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#1e1b18] border border-[#e85420]/30 shadow-2xl shadow-black/60 hover:border-[#e85420]/60 transition-all"
      >
        <Loader2 size={14} className="text-[#e85420] animate-spin" />
        <span className="text-sm font-medium text-foreground">
          {active.length} {active.length === 1 ? "генерация" : "генераций"} · {avgProgress}%
        </span>
      </motion.button>
    );
  }

  if (active.length === 1) {
    const task = active[0];
    return (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="fixed bottom-6 right-6 z-50 w-72 bg-[#1e1b18] border border-[#e85420]/25 rounded-2xl shadow-2xl shadow-black/70 p-4"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Loader2 size={14} className="text-[#e85420] animate-spin shrink-0 mt-0.5" />
            <span className="text-xs font-medium text-foreground leading-tight line-clamp-2">
              {task.prompt}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="text-muted-foreground hover:text-foreground ml-2 shrink-0"
            aria-label="Свернуть"
          >
            <X size={13} />
          </button>
        </div>
        <div className="mb-1.5">
          <ProgressBar progress={task.status === "running" ? task.progress : 0} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[#e85420]">
            {task.status === "running" ? `${task.progress}%` : "В очереди"}
          </span>
          <button
            type="button"
            onClick={handleNavigate}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Открыть очередь →
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      className="fixed bottom-6 right-6 z-50 w-80 bg-[#1e1b18] border border-[#e85420]/25 rounded-2xl shadow-2xl shadow-black/70 p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Loader2 size={14} className="text-[#e85420] animate-spin" />
          <span className="text-sm font-medium text-foreground">
            Генерации идут · {active.length} активны · {avgProgress}%
          </span>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Свернуть"
        >
          <X size={13} />
        </button>
      </div>

      <div className="space-y-2 mb-3">
        {running.slice(0, 3).map((task) => (
          <div key={task.id} className="flex items-center gap-2">
            <TypeIcon type={task.type} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground truncate mb-1">{task.prompt}</p>
              <ProgressBar progress={task.progress} />
            </div>
            <span className="text-xs font-mono text-[#e85420] w-8 text-right">{task.progress}%</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleNavigate}
        className="w-full text-xs text-center text-[#e85420] hover:text-[#ff6a30] transition-colors font-medium"
      >
        Открыть очередь →
      </button>
    </motion.div>
  );
}
