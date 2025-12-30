import { getCategories, type Category } from "@/shared/api/category";
import {
  getRoutinesByCategory,
  type RoutineCategory,
} from "@/shared/api/routine";
import { useAuth } from "@/shared/hooks/useAuth";
import { NormalBlackButton } from "@/shared/ui/Button";
import { Space10 } from "@/shared/ui/Space";
import { TitleText } from "@/shared/ui/TitleText";
import { useEffect, useState } from "react";

export const RoutineList = () => {
  const { user } = useAuth();
  const [routineCategories, setRoutineCategories] = useState<RoutineCategory[]>(
    []
  );

  useEffect(() => {
    if (!user) return;

    const unsubscribe = getCategories({
      userId: user.uid,
      status: "ACTIVE",
      onChange: async (categories) => {
        const result = await Promise.all(
          categories.map(async (category) => {
            const routines = await getRoutinesByCategory({
              userId: user.uid,
              categoryId: category.id,
            });

            return {
              category,
              routines,
            };
          })
        );

        setRoutineCategories(result);
      },
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <div>
      {routineCategories.map(({ category, routines }) => {
        const textColor = `text-[${category.color}]`;

        return (
          <div key={category.id}>
            {/* 카테고리 헤더 */}
            <div className="flex justify-between items-center">
              <TitleText text={category.name} className={textColor} />
              <NormalBlackButton text="추가" />
            </div>

            <Space10 direction="mb" />

            {/* 루틴 리스트 */}
            <div className="flex flex-col gap-2">
              {routines.map((routine) => (
                <div key={routine.id}>{routine.title}</div>
              ))}
            </div>

            <Space10 direction="mb" />
          </div>
        );
      })}
    </div>
  );
};
