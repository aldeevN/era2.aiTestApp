import { motion } from "framer-motion";

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-border bg-card animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-white/5" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-white/8 rounded w-2/3" />
        <div className="h-3 bg-white/5 rounded w-1/3" />
      </div>
      <div className="h-6 w-16 bg-white/5 rounded-full" />
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <SkeletonRow key={index} />
      ))}
    </div>
  );
}
