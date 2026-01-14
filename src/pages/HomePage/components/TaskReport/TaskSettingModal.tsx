import {
  TASK_ACTION_LIST,
  type TaskActionType,
} from "@/shared/constants/actionList";
import { NormalBlackUnFillButton } from "@/shared/ui/Button";
import { ModalWrapper } from "@/shared/ui/Modal";
import { Space4, Space8 } from "@/shared/ui/Space";
import { Text2, Text5 } from "@/shared/ui/Text";
import { useState, type JSX } from "react";
import {
  FaArrowAltCircleDown,
  FaArrowAltCircleRight,
  FaRegTimesCircle,
  FaPlusCircle,
  FaCheckCircle,
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
    null
  );
  return (
    <ModalWrapper onClose={onClose}>
      <ModalTitle text="리스트 메뉴" />
      <Space4 direction="mb" />
      <ActionItemList
        selectedAction={selectedAction}
        onSelect={setSelectedAction}
      />
      <Space8 direction="mb" />
      <ButtonList
        onClose={onClose}
        selectedAction={selectedAction}
        onConfirm={onConfirm}
      />
    </ModalWrapper>
  );
}

/*
  ModalTitle : 모달 타이틀 컴포넌트
*/
interface ModalTitleProps {
  text: string;
}

const ModalTitle = ({ text }: ModalTitleProps) => {
  return <Text5 text={text} className="font-bold" />;
};

/*
  ActionItemList : 메뉴 리스트 컴포넌트
*/
interface ActionItemListProps {
  selectedAction: TaskActionType | null;
  onSelect: (action: TaskActionType) => void;
}
const ActionItemList = ({ selectedAction, onSelect }: ActionItemListProps) => {
  return (
    <div className="flex flex-col gap-3">
      {TASK_ACTION_LIST.map((action) => (
        <ActionItem
          key={action.icon}
          text={action.text}
          icon={action.icon}
          isSelected={selectedAction === action.icon}
          onClick={() => onSelect(action.icon)}
        />
      ))}
    </div>
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
    copy: <FaPlusCircle size={20} className="text-[#0088FF]" />,
    "delete-all": <FaRegTimesCircle size={20} className="text-[#FF393C]" />,
  };

  return (
    <div className="flex justify-between" onClick={onClick}>
      <div className="flex gap-2">
        {ICON_MAP[icon]}
        <Text2 text={text} />
      </div>

      {isSelected ? (
        <FaCheckCircle size={20} />
      ) : (
        <button
          type="button"
          onClick={onClick}
          className="w-5 h-5 border-2 border-gray-400 rounded-2xl"
        />
      )}
    </div>
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
      <NormalBlackUnFillButton
        text="취소"
        className="flex-1"
        onClick={onClose}
      />

      <NormalBlackUnFillButton
        text="완료"
        className="flex-1"
        disabled={isDisabled}
        onClick={() => {
          if (isDisabled) return;
          onConfirm(selectedAction);
        }}
      />
    </div>
  );
};
