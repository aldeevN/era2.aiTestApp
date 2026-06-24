import { useContext } from "react";
import { QueueContext, type QueueContextValue } from "@/features/generation-queue/model/QueueProvider";

export function useQueue(): QueueContextValue {
  const context = useContext(QueueContext);

  if (!context) {
    throw new Error("useQueue must be used within a QueueProvider");
  }

  return context;
}
