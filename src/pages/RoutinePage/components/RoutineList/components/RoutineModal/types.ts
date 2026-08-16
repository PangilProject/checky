import type { Routine } from "@/shared/api/routine";
import type { ModalMode } from "@/shared/utils/getModalModeTitle";

export interface RoutineModalProps {
  mode?: ModalMode;
  routine?: Routine;
  categoryId: string;
  onClose: () => void;
}
