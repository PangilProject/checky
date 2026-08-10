import { cn } from "./cn";

interface SkeletonBlockProps {
  className?: string;
}

export const SkeletonBlock = ({ className }: SkeletonBlockProps) => {
  return (
    <div
      aria-hidden="true"
      className={cn("bg-line rounded animate-pulse", className)}
    />
  );
};
