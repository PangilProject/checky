import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/**
 * 목록 안의 한 항목을 잡을 수 있게 만든다.
 *
 * 돌려주는 것을 그대로 펼쳐 붙이면 된다. 끄는 동안의 생김새는 항목마다 다르므로
 * (그림자 크기·확대 비율) isDragging 만 알려주고 판단은 호출부에 맡긴다.
 */
export const useSortableItem = (id: string) => {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({ id });

  return {
    isDragging,
    dragHandleProps: {
      ref: setNodeRef,
      style: { transform: CSS.Transform.toString(transform), transition },
      ...attributes,
      ...listeners,
    },
  };
};
