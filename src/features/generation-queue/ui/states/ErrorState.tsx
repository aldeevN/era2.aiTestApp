import { AlertCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface ErrorStateProps {
  onRetry: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <AlertCircle size={32} className="text-[#f87171]" />
      <p className="text-foreground font-medium">Ошибка загрузки</p>
      <Button variant="destructive" size="default" onClick={onRetry}>
        Повторить
      </Button>
    </div>
  );
}
