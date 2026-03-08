import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Text2, Text3, Text5 } from "@/shared/ui/Text";
import {
  NormalBlackButton,
  NormalBlackUnFillButton,
  NormalRedUnFillButton,
} from "@/shared/ui/Button";
import { Space10, Space2, Space8 } from "@/shared/ui/Space";
import { useAuth } from "@/shared/hooks/useAuth";
import { ModalWrapper } from "@/shared/ui/Modal";
import {
  createRoutine,
  deleteRoutine,
  updateRoutine,
  type Routine,
  type RoutineScheduleHistoryItem,
} from "@/shared/api/routine";
import { routineKeys, routineReportKeys } from "@/shared/query/keys";
import { IoIosCheckbox } from "react-icons/io";
import { IoIosCheckboxOutline } from "react-icons/io";

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

const hasSameDays = (a: number[], b: number[]) => {
  if (a.length !== b.length) return false;
  const sa = [...a].sort((x, y) => x - y);
  const sb = [...b].sort((x, y) => x - y);
  return sa.every((value, index) => value === sb[index]);
};

const buildNextScheduleHistory = ({
  routine,
  effectiveFrom,
  days,
  shouldAppend,
}: {
  routine: Routine;
  effectiveFrom: string;
  days: number[];
  shouldAppend: boolean;
}): RoutineScheduleHistoryItem[] => {
  const baseHistory =
    routine.scheduleHistory && routine.scheduleHistory.length > 0
      ? routine.scheduleHistory
      : [{ effectiveFrom: routine.startDate, days: routine.days }];

  if (!shouldAppend) {
    return [...baseHistory].sort((a, b) =>
      a.effectiveFrom.localeCompare(b.effectiveFrom)
    );
  }

  const next = [...baseHistory];
  const index = next.findIndex((item) => item.effectiveFrom === effectiveFrom);

  if (index >= 0) {
    next[index] = { effectiveFrom, days };
  } else {
    next.push({ effectiveFrom, days });
  }

  return next.sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
};

export default function RoutineModal({
  mode = "CREATE",
  routine,
  categoryId,
  onClose,
}: RoutineModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(routine?.title ?? "");
  const [isComposing, setIsComposing] = useState(false);
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
  const [effectiveFrom, setEffectiveFrom] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [endDateEnabled, setEndDateEnabled] = useState(
    Boolean(routine?.endDate)
  );
  const [endDate, setEndDate] = useState(routine?.endDate ?? "");
  const isEditMode = currentMode === "EDIT";
  const isRepeatChanged = routine
    ? !hasSameDays(selectedDays, routine.days)
    : false;

  const handleSubmit = async () => {
    if (!title.trim() || selectedDays.length === 0 || !user) return;
    if (isEditMode && isRepeatChanged && !effectiveFrom) return;
    if (endDateEnabled && !endDate) return;
    if (endDateEnabled && endDate < startDate) return;

    try {
      if (currentMode === "CREATE") {
        await createRoutine({
          userId: user.uid,
          title,
          categoryId,
          days: selectedDays,
          startDate, // ✅ 필수
          endDate: endDateEnabled ? endDate : undefined,
        });
      }

      if (currentMode === "EDIT" && routine) {
        await updateRoutine({
          userId: user.uid,
          routineId: routine.id,
          title,
          days: selectedDays,
          scheduleHistory: buildNextScheduleHistory({
            routine,
            effectiveFrom,
            days: selectedDays,
            shouldAppend: isRepeatChanged,
          }),
          endDate: endDateEnabled ? endDate : null,
        });
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: routineKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: routineReportKeys.all,
        }),
      ]);

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

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: routineKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: routineReportKeys.all,
        }),
      ]);

      onClose();
    } catch (e) {
      console.error("루틴 삭제 실패", e);
    }
  };

  const [selectAllDays, setSelectAllDays] = useState(false);

  const handleSelectAllDays = () => {
    const ALL_DAYS = DAYS.map((d) => d.value); // [0,1,2,3,4,5,6]
    setSelectAllDays(!selectAllDays);
    setSelectedDays((prev) =>
      prev.length === ALL_DAYS.length ? [] : ALL_DAYS
    );
  };

  return (
    <ModalWrapper onClose={onClose}>
      <ModalTitle mode={currentMode} />
      <Space10 direction="mb" />

      {/* 루틴 이름 입력 */}
      <div>
        <Text3 text="루틴명" className="font-bold" />
        <Space2 direction="mb" />
        <input
          className={`w-full border-0 border-b border-gray-300 text-sm outline-none ${
            isComposing ? "ime-fallback" : "font-paperlogy"
          }`}
          placeholder="루틴 입력"
          value={title}
          disabled={isReadOnly}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter" || isComposing || isReadOnly) return;
            e.preventDefault();
            handleSubmit();
          }}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
        />
      </div>

      <Space8 direction="mb" />

      {/* 요일 선택 */}
      <div className="flex flex-col">
        <div className="w-full flex justify-between">
          <Text3 text="반복" className="font-bold" />
          {!isReadOnly && (
            <button
              className="flex items-center gap-1"
              onClick={handleSelectAllDays}
            >
              <Text2 text="전체" />
              {selectAllDays ? (
                <IoIosCheckbox size={15} />
              ) : (
                <IoIosCheckboxOutline size={15} />
              )}
            </button>
          )}
        </div>
        <Space2 direction="mb" />
        <div className="flex gap-3 justify-between">
          {DAYS.map((day) => {
            const active = selectedDays.includes(day.value);
            return (
              <button
                key={day.value}
                disabled={isReadOnly}
                onClick={() => toggleDay(day.value)}
                className={`
                  w-8 h-8 rounded-full text-sm
                  border pressable
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
        <Text3
          text={
            currentMode === "CREATE"
              ? "시작 날짜"
              : isRepeatChanged
                ? "변경 적용 날짜"
                : "시작 날짜"
          }
          className="font-bold"
        />
        <Space2 direction="mb" />
        {isReadOnly ? (
          <Text2 text={startDate} className="text-gray-700" />
        ) : currentMode === "EDIT" && !isRepeatChanged ? (
          <Text2 text={routine?.startDate ?? startDate} className="text-gray-700" />
        ) : currentMode === "EDIT" && isRepeatChanged ? (
          <input
            type="date"
            value={effectiveFrom}
            min={routine?.startDate}
            onChange={(e) => setEffectiveFrom(e.target.value)}
          />
        ) : (
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              const next = e.target.value;
              setStartDate(next);
              if (endDateEnabled && endDate && endDate < next) {
                setEndDate(next);
              }
            }}
          />
        )}
      </div>

      <Space8 direction="mb" />

      <div>
        <div className="flex items-center justify-between">
          <Text3 text="종료 날짜" className="font-bold" />
          {!isReadOnly && (
            <button
              className="flex items-center gap-1"
              onClick={() => {
                setEndDateEnabled((prev) => {
                  const next = !prev;
                  if (!next) setEndDate("");
                  return next;
                });
              }}
            >
              <Text2 text={endDateEnabled ? "삭제" : "추가"} />
              {endDateEnabled ? (
                <IoIosCheckbox size={15} />
              ) : (
                <IoIosCheckboxOutline size={15} />
              )}
            </button>
          )}
        </div>
        <Space2 direction="mb" />
        {isReadOnly ? (
          <Text2
            text={routine?.endDate ? routine.endDate : "없음"}
            className="text-gray-700"
          />
        ) : endDateEnabled ? (
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        ) : (
          <Text2 text="없음" className="text-gray-500" />
        )}
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
