/**
 * 랜딩 필름에 나오는 할 일 제목의 겉모습.
 * 클래스는 TaskReport/components/TaskItemsList.tsx 에서 그대로 가져왔다. 원본이 바뀌면 함께 고친다.
 */
import type { ReactNode } from "react";
import { Text, cn } from "@/shared/ui/primitives";

/** className 은 장면에서 글자를 키우거나 줄일 때만 쓴다. 필름은 이 크기를 재서 배율을 정한다 */
export const TaskRowTitle = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <Text variant="body" className={cn("whitespace-nowrap", className)}>
    {children}
  </Text>
);
