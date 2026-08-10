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
        <Text2 text="아직 카테고리가 없습니다." className="text-content-muted" />
        <Text2
          text="루틴은 카테고리 안에 만들어요. 카테고리부터 추가해 주세요."
          className="text-content-muted"
        />
        <Space2 direction="mb" />
        <Link
          to="/category"
          className="text-xs text-accent hover:opacity-70"
        >
          카테고리 만들러 가기
        </Link>
        <Space10 direction="mb" />
      </div>
    </div>
  );
}

export default EmptyRoutineList;
