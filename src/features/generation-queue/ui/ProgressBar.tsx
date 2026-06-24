import { useMemo } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  progress: number;
}

export function ProgressBar({ progress, className, ...props }: ProgressBarProps) {
  const width = useMemo(() => `${Math.min(100, Math.max(0, progress))}%`, [progress]);

  return (
    <div className={cn("w-full h-0.5 bg-white/10 rounded-full overflow-hidden", className)} {...props}>
      <div
        className="h-full bg-[#e85420] rounded-full transition-all duration-300 ease-out"
        style={{ width }}
      />
    </div>
  );
}
