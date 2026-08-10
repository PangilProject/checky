import ImageEmpty from "@/assets/images/empty.png";
import { Text } from "@/shared/ui/primitives";
import { Link } from "react-router-dom";

function EmptyRoutineList() {
  return (
    <div>
      <Text variant="title" className="mb-9">
        루틴 페이지
      </Text>
      <div className="flex flex-col items-center gap-4 pb-10">
        <img src={ImageEmpty} className="h-15" />
        {/* 두 줄은 한 문단이므로 사이를 벌리지 않는다 */}
        <div className="text-center">
          <Text variant="bodySm" tone="muted">
            아직 카테고리가 없습니다.
          </Text>
          <Text variant="bodySm" tone="muted">
            루틴은 카테고리 안에 만들어요. 카테고리부터 추가해 주세요.
          </Text>
        </div>
        <Link to="/category" className="text-xs text-accent hover:opacity-70">
          카테고리 만들러 가기
        </Link>
      </div>
    </div>
  );
}

export default EmptyRoutineList;
