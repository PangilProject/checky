import { useState } from "react";
import { Text3, Text5 } from "@/shared/ui/Text";
import {
  NormalBlackButton,
  NormalBlackUnFillButton,
  NormalRedUnFillButton,
} from "@/shared/ui/Button";
import { Space10, Space8 } from "@/shared/ui/Space";
import { useAuth } from "@/shared/hooks/useAuth";
import { ModalWrapper } from "@/shared/ui/Modal";
import {
  createRoutine,
  deleteRoutine,
  updateRoutine,
  type Routine,
} from "@/shared/api/routine";

interface RoutineModalProps {
  mode?: "CREATE" | "VIEW" | "EDIT"; // ✅ 추가 (optional 권장)
  routine?: Routine; // VIEW / EDIT 시 사용
  categoryId: string;
  onClose: () => void;
}

const DAYS = [
  { label: "일", value: 0 },
  { label: "월", value: 1 },
  { label: "화", value: 2 },
  { label: "수", value: 3 },
  { label: "목", value: 4 },
  { label: "금", value: 5 },
  { label: "토", value: 6 },
];

export default function RoutineModal({
  mode = "CREATE",
  routine,
  categoryId,
  onClose,
}: RoutineModalProps) {
  const { user } = useAuth();

  const [title, setTitle] = useState(routine?.title ?? "");
  const [selectedDays, setSelectedDays] = useState<number[]>(
    routine?.days ?? []
  );
  const [currentMode, setCurrentMode] = useState(mode);

  const isReadOnly = currentMode === "VIEW";

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const [startDate, setStartDate] = useState(
    routine?.startDate ?? new Date().toISOString().slice(0, 10)
  );

  const handleSubmit = async () => {
    if (!title.trim() || selectedDays.length === 0 || !user) return;

    try {
      if (currentMode === "CREATE") {
        await createRoutine({
          userId: user.uid,
          title,
          categoryId,
          days: selectedDays,
          startDate, // ✅ 필수
        });
      }

      if (currentMode === "EDIT" && routine) {
        await updateRoutine({
          userId: user.uid,
          routineId: routine.id,
          title,
          days: selectedDays,
          startDate, // (선택) 수정 가능
        });
      }

      onClose();
    } catch (e) {
      console.error("루틴 저장 실패", e);
    }
  };

  const handleDelete = async () => {
    if (!user || !routine) return;

    // const confirmed = window.confirm("이 루틴을 삭제할까요?");
    // if (!confirmed) return;

    try {
      await deleteRoutine({
        userId: user.uid,
        routineId: routine.id,
      });

      onClose();
    } catch (e) {
      console.error("루틴 삭제 실패", e);
    }
  };

  return (
    <ModalWrapper onClose={onClose}>
      <ModalTitle mode={currentMode} />
      <Space10 direction="mb" />

      {/* 루틴 이름 입력 */}
      <div>
        <Text3 text="루틴명" className="font-bold" />
        <input
          className="w-full border-0 border-b border-gray-300 text-sm outline-none"
          placeholder="루틴 입력"
          value={title}
          disabled={isReadOnly}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <Space8 direction="mb" />

      {/* 요일 선택 */}
      <div className="flex justify-between items-center">
        <Text3 text="반복" className="font-bold" />
        <div className="flex gap-2">
          {DAYS.map((day) => {
            const active = selectedDays.includes(day.value);
            return (
              <button
                key={day.value}
                disabled={isReadOnly}
                onClick={() => toggleDay(day.value)}
                className={`
                  w-7 h-7 rounded-full text-sm
                  border
                  ${
                    active
                      ? "bg-black text-white border-black"
                      : "border-gray-300 text-gray-500"
                  }
                `}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      <Space8 direction="mb" />

      <div>
        <Text3 text="시작 날짜" className="font-bold" />
        <input
          className="w-full border-0 border-b border-gray-300 text-sm outline-none"
          type="date"
          value={startDate}
          disabled={isReadOnly}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <Space10 direction="mb" />

      {/* 버튼 */}
      <ButtonSection
        mode={currentMode}
        onClose={onClose}
        onEdit={() => setCurrentMode("EDIT")}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </ModalWrapper>
  );
}

const ModalTitle = ({ mode }: { mode: "CREATE" | "VIEW" | "EDIT" }) => {
  if (mode === "CREATE")
    return <Text5 text="루틴 추가" className="font-bold" />;
  if (mode === "EDIT") return <Text5 text="루틴 수정" className="font-bold" />;
  return <Text5 text="루틴 상세" className="font-bold" />;
};

const ButtonSection = ({
  mode,
  onClose,
  onEdit,
  onSubmit,
  onDelete,
}: {
  mode: "CREATE" | "VIEW" | "EDIT";
  onClose: () => void;
  onEdit?: () => void;
  onSubmit?: () => void;
  onDelete?: () => void;
}) => {
  if (mode === "VIEW") {
    return (
      <div className="flex justify-between">
        <NormalBlackUnFillButton text="닫기" onClick={onClose} />
        <NormalRedUnFillButton text="삭제" onClick={onDelete} />
        <NormalBlackButton text="수정" onClick={onEdit} />
      </div>
    );
  }

  return (
    <div className="flex justify-between">
      <NormalBlackUnFillButton text="취소" onClick={onClose} />
      <NormalBlackButton text="저장" onClick={onSubmit} />
    </div>
  );
};
