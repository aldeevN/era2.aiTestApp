import { motion } from "framer-motion";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  filtered: boolean;
}

export function EmptyState({ filtered }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 gap-4 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center">
        <Inbox size={24} className="text-muted-foreground" />
      </div>
      <div>
        <p className="text-foreground font-medium mb-1">
          {filtered ? "Задач не найдено" : "Очередь пуста"}
        </p>
        <p className="text-sm text-muted-foreground">
          {filtered
            ? "Попробуйте изменить фильтр или поисковый запрос"
            : "Запустите генерацию, чтобы задачи появились здесь"}
        </p>
      </div>
    </motion.div>
  );
}
