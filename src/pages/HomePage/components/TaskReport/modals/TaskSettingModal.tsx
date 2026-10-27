import {
  TASK_ACTION_LIST,
  type TaskActionType,
} from "@/shared/constants/taskActions";
import { ModalWrapper } from "@/shared/ui/Modal";
import { ModalTitle } from "@/shared/ui/ModalTitle";
import { Button, Stack, Text } from "@/shared/ui/primitives";
import { useState, type JSX } from "react";
import {
  FaArrowAltCircleDown,
  FaArrowAltCircleRight,
  FaRegTimesCircle,
  FaPlusCircle,
  FaCheckCircle,
  FaRedoAlt,
} from "react-icons/fa";

interface TaskSettingModalProps {
  onClose: () => void;
  onConfirm: (action: TaskActionType) => void;
}
export function TaskSettingModal({
  onClose,
  onConfirm,
}: TaskSettingModalProps) {
  const [selectedAction, setSelectedAction] = useState<TaskActionType | null>(
    null,
  );
  return (
    <ModalWrapper onClose={onClose}>
      <ModalTitle text="리스트 메뉴" />
      <ActionItemList
        selectedAction={selectedAction}
        onSelect={setSelectedAction}
      />
      <div className="mt-8">
        <ButtonList
          onClose={onClose}
          selectedAction={selectedAction}
          onConfirm={onConfirm}
        />
      </div>
    </ModalWrapper>
  );
}

/*
  ActionItemList : 메뉴 리스트 컴포넌트
*/
interface ActionItemListProps {
  selectedAction: TaskActionType | null;
  onSelect: (action: TaskActionType) => void;
}
const ActionItemList = ({ selectedAction, onSelect }: ActionItemListProps) => {
  return (
    <Stack gap={3} direction="col" role="radiogroup" aria-label="할 작업">
      {TASK_ACTION_LIST.map((action) => (
        <ActionItem
          key={action.icon}
          text={action.text}
          icon={action.icon}
          isSelected={selectedAction === action.icon}
          onClick={() => onSelect(action.icon)}
        />
      ))}
    </Stack>
  );
};

/*
  ActionItem : 메뉴 컴포넌트
*/
interface ActionItemProps {
  text: string;
  icon: TaskActionType;
  isSelected: boolean;
  onClick: () => void;
}
const ActionItem = ({ text, icon, isSelected, onClick }: ActionItemProps) => {
  const ICON_MAP: Record<TaskActionType, JSX.Element> = {
    today: <FaArrowAltCircleDown size={20} />,
    after: <FaArrowAltCircleRight size={20} />,
    delete: <FaRegTimesCircle size={20} />,
    copy: <FaPlusCircle size={20} className="text-accent" />,
    "delete-all": <FaRegTimesCircle size={20} className="text-danger" />,
    "recalculate-monthly-stats": (
      <FaRedoAlt size={20} className="text-accent" />
    ),
  };

  return (
    // 줄 전체가 하나의 선택지다. 오른쪽 동그라미만 버튼이면 이름도 선택 상태도 없어 무엇을 고르는지 알 수 없다
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      className="flex w-full justify-between text-left"
      onClick={onClick}
    >
      <Stack gap={2} direction="row">
        {ICON_MAP[icon]}
        <Text variant="bodySm">{text}</Text>
      </Stack>

      {isSelected ? (
        <FaCheckCircle size={20} />
      ) : (
        <span className="w-5 h-5 border-2 border-content-muted rounded-2xl" />
      )}
    </button>
  );
};

/*
  ButtonList : 버튼 리스트 컴포넌트
*/
const ButtonList = ({
  onClose,
  selectedAction,
  onConfirm,
}: {
  onClose: () => void;
  selectedAction: TaskActionType | null;
  onConfirm: (action: TaskActionType) => void;
}) => {
  const isDisabled = !selectedAction;

  return (
    <div className="w-full flex gap-2 justify-between">
      <Button variant="outline" className="flex-1" onClick={onClose}>
        취소
      </Button>

      <Button
        variant="outline"
        className="flex-1"
        disabled={isDisabled}
        onClick={() => {
          if (isDisabled) return;
          onConfirm(selectedAction);
        }}
      >
        완료
      </Button>
    </div>
  );
};
