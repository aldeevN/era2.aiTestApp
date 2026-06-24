import { RotateCcw, Download, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { TaskStatus } from "@/entities/generation-task/model/types";

interface TaskActionsProps {
  status: TaskStatus;
  onCancel: () => void;
  onRetry: () => void;
  onDownload: () => void;
}

export function TaskActions({ status, onCancel, onRetry, onDownload }: TaskActionsProps) {
  return (
    <div className="flex items-center gap-1">
      {(status === "running" || status === "queued") && (
        <Button variant="ghost" size="icon" title="Отменить" onClick={onCancel}>
          <X size={14} />
        </Button>
      )}
      {(status === "failed" || status === "canceled") && (
        <Button variant="ghost" size="icon" title="Повторить" onClick={onRetry}>
          <RotateCcw size={14} />
        </Button>
      )}
      {status === "done" && (
        <Button variant="ghost" size="icon" title="Скачать" onClick={onDownload}>
          <Download size={14} />
        </Button>
      )}
    </div>
  );
}
