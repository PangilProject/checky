import { useState } from "react";
import { Text3, Text5 } from "@/shared/ui/Text";
import { NormalBlackButton, NormalBlackUnFillButton } from "@/shared/ui/Button";
import { Space10, Space8 } from "@/shared/ui/Space";
import { useAuth } from "@/shared/hooks/useAuth";
import { ModalWrapper } from "@/shared/ui/Modal";
import { createRoutine } from "@/shared/api/routine";

interface RoutineModalProps {
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
  categoryId,
  onClose,
}: RoutineModalProps) {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleCreateRoutine = async () => {
    if (!title.trim() || selectedDays.length === 0 || !user) return;

    try {
      await createRoutine({
        userId: user.uid,
        title,
        categoryId,
        days: selectedDays,
      });
      onClose();
    } catch (e) {
      console.error("루틴 생성 실패", e);
    }
  };

  return (
    <ModalWrapper onClose={onClose}>
      <Text5 text="루틴 추가" className="font-bold" />
      <Space10 direction="mb" />

      {/* 루틴 이름 입력 */}
      <input
        className="w-full border-0 border-b border-gray-300 text-[16px] outline-none"
        placeholder="루틴 입력"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Space8 direction="mb" />

      {/* 요일 선택 */}
      <div className="flex justify-between items-center">
        <Text3 text="반복" />
        <div className="flex gap-2">
          {DAYS.map((day) => {
            const active = selectedDays.includes(day.value);
            return (
              <button
                key={day.value}
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

      <Space10 direction="mb" />

      {/* 버튼 */}
      <div className="flex justify-between">
        <NormalBlackUnFillButton text="닫기" onClick={onClose} />
        <NormalBlackButton text="완료" onClick={handleCreateRoutine} />
      </div>
    </ModalWrapper>
  );
}
