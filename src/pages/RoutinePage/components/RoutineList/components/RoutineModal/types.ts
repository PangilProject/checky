import type { Routine } from "@/shared/api/routine";

export type RoutineModalMode = "CREATE" | "VIEW" | "EDIT";

export interface RoutineModalProps {
  mode?: RoutineModalMode;
  routine?: Routine;
  categoryId: string;
  onClose: () => void;
}
