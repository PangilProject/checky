import { wickedMouseClass } from "@/styles/font";
import { useLogoSrc } from "@/shared/hooks/useLogoSrc";
import { Text } from "@/shared/ui/primitives";
import { Space6, Space12 } from "@/shared/ui/Space";

function LoadingSection() {
  const logoSrc = useLogoSrc("round");

  return (
    <div className="flex flex-col items-center no-select">
      <div className="flex items-center gap-3">
        <img src={logoSrc} className="w-10 h-10" alt="" />
        <span className={`text-4xl text-content ${wickedMouseClass}`}>
          CHECKY
        </span>
      </div>

      <Space6 direction="mb" />

      <div className="relative w-26 h-1 overflow-hidden rounded-full bg-surface-sunken">
        <span className="absolute top-0 left-0 h-full w-[42%] rounded-full bg-primary animate-checky-loading" />
      </div>

      <Space12 direction="mb" />

      <Text variant="bodySm" tone="muted">
        오늘도 하나씩, CHECKY
      </Text>
    </div>
  );
}

export default LoadingSection;
