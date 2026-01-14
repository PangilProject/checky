import { Text2 } from "@/shared/ui/Text";
import { BiListCheck } from "react-icons/bi";
import { TaskSettingModal } from "./TaskSettingModal";
import { useState } from "react";

export function TaskSetting() {
  const [isOpenModal, setIsOpenModal] = useState(false);

  const toggleOpenModal = () => {
    setIsOpenModal(!isOpenModal);
  };
  return (
    <div className="w-full flex items-end flex-col">
      <button
        className="flex items-center gap-1  pressable"
        onClick={toggleOpenModal}
      >
        <BiListCheck size={20} />
        <Text2 text="리스트 메뉴" />
      </button>
      {isOpenModal && <TaskSettingModal onClose={toggleOpenModal} />}
    </div>
  );
}
