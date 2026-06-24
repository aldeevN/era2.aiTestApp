import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { FilterStatus, SortOrder } from "@/features/generation-queue/model/selectors";

interface QueueToolbarProps {
  filter: FilterStatus;
  onFilter: (filter: FilterStatus) => void;
  sort: SortOrder;
  onSort: (sort: SortOrder) => void;
  search: string;
  onSearch: (search: string) => void;
}

const FILTER_CHIPS: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "queued", label: "В очереди" },
  { value: "running", label: "Идёт" },
  { value: "done", label: "Готово" },
  { value: "failed", label: "Ошибка" },
];

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "newest", label: "Сначала новые" },
  { value: "oldest", label: "Сначала старые" },
];

export function QueueToolbar({ 
  filter, 
  onFilter, 
  sort, 
  onSort, 
  search, 
  onSearch 
}: QueueToolbarProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Закрытие по клику вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isButtonClick = buttonRef.current?.contains(target);
      const isDropdownClick = dropdownRef.current?.contains(target);
      
      // Close only if click is outside both button and dropdown
      if (!isButtonClick && !isDropdownClick) {
        setSortOpen(false);
      }
    };

    if (sortOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sortOpen]);

  // Обновление позиции дропдауна при открытии
  useEffect(() => {
    if (sortOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right - 160, // min-w-[160px]
      });
    }
  }, [sortOpen]);

  const handleSortToggle = () => {
    setSortOpen((prev) => !prev);
  };

  const handleSortSelect = (value: SortOrder) => {
    onSort(value);
    setSortOpen(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
        {FILTER_CHIPS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => onFilter(value)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all",
              filter === value
                ? "bg-[#e85420] text-white"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-white/15"
            )}
          >
            {label}
          </button>
        ))}

        <div className="relative ml-auto shrink-0">
          <button
            ref={buttonRef}
            type="button"
            onClick={handleSortToggle}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium bg-card border border-border text-muted-foreground hover:text-foreground hover:border-white/15 transition-all whitespace-nowrap"
          >
            {sort === "newest" ? "Сначала новые" : "Сначала старые"}
            <ChevronDown 
              size={13} 
              className={cn(
                "transition-transform duration-200",
                sortOpen && "rotate-180"
              )}
            />
          </button>

          {sortOpen && createPortal(
            <AnimatePresence>
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "absolute",
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  zIndex: 9999,
                }}
                className="bg-popover border border-border rounded-lg shadow-xl overflow-hidden min-w-[160px]"
              >
                {SORT_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleSortSelect(value)}
                    className={cn(
                      "w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors",
                      sort === value ? "text-[#e85420]" : "text-foreground"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </motion.div>
            </AnimatePresence>,
            document.body
          )}
        </div>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Поиск по промпту..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#e85420]/50 transition-colors"
        />
      </div>
    </div>
  );
}