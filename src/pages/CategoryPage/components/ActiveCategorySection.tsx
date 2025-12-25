import { NormalBlackButton } from "@/shared/ui/Button";
import { TitleSection } from "@/shared/ui/TitleSection";
import { useEffect, useState } from "react";
import CategoryModal from "../components/CategoryModal.tsx";
import { useAuth } from "@/shared/hooks/useAuth.ts";
import { getCategories } from "@/shared/api/category.ts";
import { Space10, Space4 } from "@/shared/ui/Space.tsx";
import { Text2 } from "@/shared/ui/Text.tsx";
import ImageEmpty from "@/assets/images/empty.png";
import { CategoryItem } from "./CategoryItem.tsx";

export interface Category {
  id: string;
  name: string;
  color: string;
  status: "ACTIVE" | "ENDED";
}

export const ActiveTitleSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div className="flex items-center justify-between">
      <TitleSection text="진행중인 카테고리" />
      <NormalBlackButton text="추가" onClick={openModal} />
      {isOpen && (
        <CategoryModal onClose={() => setIsOpen(false)} mode="CREATE" />
      )}
    </div>
  );
};

export const ActiveCategories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = getCategories({
      userId: user.uid,
      status: "ACTIVE",
      onChange: setCategories,
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) return null;

  return (
    <div className="w-full flex flex-col items-center">
      {categories.length === 0 && (
        <div className="flex flex-col items-center">
          <img src={ImageEmpty} className=" h-15" />
          <Space4 direction="mb" />
          <Text2
            text="진행중인 카테고리가 없습니다."
            className="text-gray-400 "
          />
          <Text2 text="카테고리를 추가해보세요!" className="text-gray-400 " />
          <Space10 direction="mb" />
        </div>
      )}

      {categories.map((category) => (
        <CategoryItem category={category} key={category.id} />
      ))}
    </div>
  );
};
