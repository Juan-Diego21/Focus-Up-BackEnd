export interface IUpdateSessionProgress {
    status?: "completed" | "pending";
    elapsedMs?: number;
    notes?: string;
}
