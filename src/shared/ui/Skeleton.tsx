interface SkeletonBlockProps {
  className?: string;
}

export const SkeletonBlock = ({ className }: SkeletonBlockProps) => {
  return (
    <div
      aria-hidden="true"
      className={`bg-gray-200 rounded animate-pulse ${className ?? ""}`}
    />
  );
};
