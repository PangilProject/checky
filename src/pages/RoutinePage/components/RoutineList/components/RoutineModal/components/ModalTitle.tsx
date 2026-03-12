import { Text5 } from "@/shared/ui/Text";
import type { RoutineModalMode } from "../types";

export const ModalTitle = ({ mode }: { mode: RoutineModalMode }) => {
  if (mode === "CREATE")
    return <Text5 text="루틴 추가" className="font-bold" />;
  if (mode === "EDIT") return <Text5 text="루틴 수정" className="font-bold" />;
  return <Text5 text="루틴 상세" className="font-bold" />;
};
