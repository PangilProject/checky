import ImageEmpty from "@/assets/images/empty.png";
import { Space10, Space2, Space4 } from "@/shared/ui/Space";
import { Text2, Text4 } from "@/shared/ui/Text";
import { Link } from "react-router-dom";

function EmptyRoutineList() {
  return (
    <div>
      <Text4 text="루틴 페이지" className="font-bold mb-5" />
      <Space4 direction="mb" />
      <div className="flex flex-col items-center">
        <img src={ImageEmpty} className="h-15" />
        <Space4 direction="mb" />
        <Text2 text="추가된 카테고리가 없습니다." className="text-gray-400" />
        <Text2
          text={`"카테고리 페이지에서 루틴을 추가해보세요.`}
          className="text-gray-400"
        />
        <Space2 direction="mb" />
        <Link
          to="/category"
          className="text-xs text-blue-400 hover:text-blue-200"
        >
          추가하러 가기
        </Link>
        <Space10 direction="mb" />
      </div>
    </div>
  );
}

export default EmptyRoutineList;
