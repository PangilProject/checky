import { wickedMouseClass } from "@/styles/font";
import { useLogoSrc } from "@/shared/hooks/useLogoSrc";
import { Stack, Text } from "@/shared/ui/primitives";

function LoadingSection() {
  const logoSrc = useLogoSrc("round");

  return (
    <div className="flex flex-col items-center no-select">
      <Stack gap={3} direction="row" align="center">
        <img src={logoSrc} className="w-10 h-10" alt="" />
        <span className={`text-4xl text-content ${wickedMouseClass}`}>
          CHECKY
        </span>
      </Stack>

      <div className="relative my-6 w-26 h-1 overflow-hidden rounded-full bg-surface-sunken">
        <span className="absolute top-0 left-0 h-full w-[42%] rounded-full bg-primary animate-checky-loading" />
      </div>

      <Text variant="bodySm" tone="muted" className="mt-6">
        오늘도 하나씩, CHECKY
      </Text>
    </div>
  );
}

export default LoadingSection;
