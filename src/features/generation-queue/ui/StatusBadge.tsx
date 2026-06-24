import type { TaskStatus } from "@/entities/generation-task/model/types";
import { cn } from "@/shared/lib/utils";

const STATUS_LABEL: Record<TaskStatus, string> = {
  queued: "В очереди",
  running: "Идёт",
  done: "Готово",
  failed: "Ошибка",
  canceled: "Отменено",
};

const STATUS_STYLES: Record<TaskStatus, string> = {
  queued: "text-xs font-medium text-muted-foreground",
  running: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e85420] text-white",
  done: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#166534]/60 text-[#4ade80]",
  failed: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#7f1d1d]/60 text-[#f87171]",
  canceled: "text-xs font-medium text-muted-foreground",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={cn(STATUS_STYLES[status])} aria-label={STATUS_LABEL[status]}>
      {STATUS_LABEL[status]}
    </span>
  );
}
