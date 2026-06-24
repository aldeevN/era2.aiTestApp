import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Play, MessageSquare, Music, MoreHorizontal, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { GenerationTask } from "@/entities/generation-task/model/types";
import { StatusBadge } from "@/features/generation-queue/ui/StatusBadge";
import { ProgressBar } from "@/features/generation-queue/ui/ProgressBar";
import { TaskActions } from "@/features/generation-queue/ui/TaskActions";

const TYPE_BG: Record<GenerationTask["type"], string> = {
  image: "bg-[#2a1f15]",
  video: "bg-[#1e2415]",
  text: "bg-[#151a24]",
  audio: "bg-[#201524]",
};

const TYPE_ICON_COLOR: Record<GenerationTask["type"], string> = {
  image: "text-[#e85420]",
  video: "text-[#86c53a]",
  text: "text-[#5a9ef0]",
  audio: "text-[#c05aeb]",
};

export function TypeIcon({ type, size = "md" }: { type: GenerationTask["type"]; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "w-8 h-8" : "w-11 h-11";
  const iconSize = size === "sm" ? 14 : 18;
  const Icon = type === "image" ? Image : type === "video" ? Play : type === "text" ? MessageSquare : Music;

  return (
    <div className={cn("flex items-center justify-center rounded-xl shrink-0", dim, TYPE_BG[type])}>
      <Icon size={iconSize} className={TYPE_ICON_COLOR[type]} strokeWidth={1.8} />
    </div>
  );
}

interface TaskRowProps {
  task: GenerationTask;
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: () => void;
}

const STATUS_META = {
  running: (task: GenerationTask) => `${task.etaSeconds ? `≈ ${task.etaSeconds} сек · ` : ""}${task.credits} кр`,
  queued: (task: GenerationTask) => `позиция ${task.queuePosition ?? "?"} в очереди · ${task.credits} кр`,
  done: (task: GenerationTask) => `${task.durationSeconds ? `за ${task.durationSeconds} сек · ` : ""}${task.credits} кр`,
  failed: (task: GenerationTask) => task.errorMessage ?? "Ошибка",
  canceled: () => "отменено пользователем",
} as const;

export function TaskRow({ task, onCancel, onRetry, onDelete, onDownload }: TaskRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isRunning = task.status === "running";

  const meta = useMemo(
    () => STATUS_META[task.status](task as GenerationTask),
    [task]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative flex items-center gap-4 px-4 py-3.5 rounded-md border transition-all",
        isRunning ? "border-[#e85420]/40 bg-[#1c1510]" : "border-border bg-card"
      )}
    >
      <TypeIcon type={task.type} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate mb-1">{task.prompt}</p>
        <div className="flex items-center gap-1.5 text-xs flex-wrap">
          <span className="font-mono font-medium text-[#e85420]">{task.model}</span>
          <span className="text-muted-foreground/50">·</span>
          <span className={cn("text-muted-foreground", task.status === "failed" && "text-[#f87171]")}>{meta}</span>
        </div>
        {isRunning && (
          <div className="mt-2">
            <ProgressBar progress={task.progress} />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isRunning && (
          <span className="text-sm font-mono font-medium text-[#e85420] w-10 text-right">{task.progress}%</span>
        )}
        <StatusBadge status={task.status} />
        <div className="flex items-center gap-1 ml-1">
          <TaskActions
            status={task.status}
            onCancel={() => onCancel(task.id)}
            onRetry={() => onRetry(task.id)}
            onDownload={onDownload}
          />
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              title="Ещё"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
            >
              <MoreHorizontal size={14} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 z-20 bg-popover border border-border rounded-lg shadow-xl overflow-hidden min-w-[120px]"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(task.id);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#f87171] hover:bg-white/5 transition-colors"
                    >
                      <X size={13} />
                      Удалить
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
