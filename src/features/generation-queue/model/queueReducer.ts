import type { GenerationTask, TaskStatus } from "@/entities/generation-task/model/types";

export type QueueAction =
  | { type: "INIT"; tasks: GenerationTask[] }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; error: boolean }
  | { type: "TICK"; id: string; progress: number }
  | { type: "COMPLETE"; id: string }
  | { type: "FAIL"; id: string; message: string }
  | { type: "START"; id: string }
  | { type: "CANCEL"; id: string }
  | { type: "RETRY"; id: string }
  | { type: "DELETE"; id: string }
  | { type: "CLEAR_DONE" };

export interface QueueState {
  tasks: GenerationTask[];
  loading: boolean;
  error: boolean;
}

export function queueReducer(state: QueueState, action: QueueAction): QueueState {
  switch (action.type) {
    case "INIT":
      return { ...state, tasks: action.tasks, loading: false, error: false };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "SET_ERROR":
      return { ...state, error: action.error, loading: false };
    case "TICK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, progress: Math.round(action.progress) } : task
        ),
      };
    case "COMPLETE":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id
            ? {
                ...task,
                status: "done",
                progress: 100,
                durationSeconds: Math.floor(Math.random() * 50 + 8),
                etaSeconds: undefined,
              }
            : task
        ),
      };
    case "FAIL":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id && task.status === "running"
            ? { ...task, status: "failed", errorMessage: action.message, etaSeconds: undefined }
            : task
        ),
      };
    case "START":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id && task.status === "queued"
            ? { ...task, status: "running", progress: 0, queuePosition: undefined }
            : task
        ),
      };
    case "CANCEL":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id && (task.status === "running" || task.status === "queued")
            ? { ...task, status: "canceled", etaSeconds: undefined }
            : task
        ),
      };
    case "RETRY":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id && (task.status === "failed" || task.status === "canceled")
            ? { ...task, status: "queued", progress: 0, errorMessage: undefined }
            : task
        ),
      };
    case "DELETE":
      return { ...state, tasks: state.tasks.filter((task) => task.id !== action.id) };
    case "CLEAR_DONE":
      return { ...state, tasks: state.tasks.filter((task) => task.status !== "done") };
    default:
      return state;
  }
}
