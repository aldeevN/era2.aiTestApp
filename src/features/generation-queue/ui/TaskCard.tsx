import { useMemo } from "react";
import { Image, Play, MessageSquare, Music } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { GenerationTask } from "@/entities/generation-task/model/types";
import { StatusBadge } from "@/features/generation-queue/ui/StatusBadge";
import { ProgressBar } from "@/features/generation-queue/ui/ProgressBar";

const TYPE_BG: Record<GenerationTask["type"], string> = {
  image: "bg-[#2a1f15]",
  video: "bg-[#1e2415]",
  text: "bg-[#151a24]",
  audio: "bg-[#201524]",
};

const ICON_COLOR: Record<GenerationTask["type"], string> = {
  image: "text-[#e85420]",
  video: "text-[#86c53a]",
  text: "text-[#5a9ef0]",
  audio: "text-[#c05aeb]",
};

function TypeIcon({ type }: { type: GenerationTask["type"] }) {
  const Icon = type === "image" ? Image : type === "video" ? Play : type === "text" ? MessageSquare : Music;
  return (
    <div className={cn("flex items-center justify-center rounded-xl w-12 h-12", TYPE_BG[type])}>
      <Icon size={18} className={ICON_COLOR[type]} strokeWidth={1.8} />
    </div>
  );
}

interface TaskCardProps {
  task: GenerationTask;
  onCancel: () => void;
  onRetry: () => void;
  onDownload: () => void;
}

export function TaskCard({ task, onCancel, onRetry, onDownload }: TaskCardProps) {
  const meta = useMemo(() => {
    switch (task.status) {
      case "running":
        return `${task.etaSeconds ? `≈ ${task.etaSeconds} сек · ` : ""}${task.credits} кр`;
      case "queued":
        return `позиция ${task.queuePosition ?? "?"} в очереди · ${task.credits} кр`;
      case "done":
        return `${task.durationSeconds ? `за ${task.durationSeconds} сек · ` : ""}${task.credits} кр`;
      case "failed":
        return task.errorMessage ?? "Ошибка";
      case "canceled":
        return "отменено пользователем";
    }
  }, [task]);

  return (
    <article className="bg-card border border-border rounded-3xl p-4 shadow-sm">
      <div className="flex items-start gap-4">
        <TypeIcon type={task.type} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-sm font-semibold text-foreground truncate">{task.prompt}</p>
            <StatusBadge status={task.status} />
          </div>
          <p className="text-xs text-muted-foreground mb-3 truncate">{task.model}</p>
          <p className="text-xs text-muted-foreground mb-3">{meta}</p>
          {task.status === "running" && <ProgressBar progress={task.progress} />}
          <div className="mt-3 flex flex-wrap gap-2">
            {(task.status === "running" || task.status === "queued") && (
              <button type="button" onClick={onCancel} className="text-sm text-muted-foreground hover:text-foreground">
                Отменить
              </button>
            )}
            {(task.status === "failed" || task.status === "canceled") && (
              <button type="button" onClick={onRetry} className="text-sm text-muted-foreground hover:text-foreground">
                Повторить
              </button>
            )}
            {task.status === "done" && (
              <button type="button" onClick={onDownload} className="text-sm text-muted-foreground hover:text-foreground">
                Скачать
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
