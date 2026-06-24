export type GenType = "image" | "video" | "text" | "audio";

export type TaskStatus = "queued" | "running" | "done" | "failed" | "canceled";

export interface GenerationTask {
  id: string;
  type: GenType;
  prompt: string;
  model: string;
  status: TaskStatus;
  progress: number;
  createdAt: number;
  credits: number;
  etaSeconds?: number;
  durationSeconds?: number;
  queuePosition?: number;
  errorMessage?: string;
}
