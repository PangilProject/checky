import { wickedMouseClass } from "@/styles/font";
import LogoImage from "@/assets/images/logoRound.png";
import { Text2 } from "@/shared/ui/Text";
import { Space6, Space12 } from "@/shared/ui/Space";

function LoadingSection() {
  return (
    <div className="flex flex-col items-center no-select">
      <div className="flex items-center gap-3">
        <img src={LogoImage} className="w-10 h-10" alt="" />
        <span className={`text-4xl text-[#141414] ${wickedMouseClass}`}>
          CHECKY
        </span>
      </div>

      <Space6 direction="mb" />

      <div className="relative w-26 h-1 overflow-hidden rounded-full bg-[#eaebe7]">
        <span className="absolute top-0 left-0 h-full w-[42%] rounded-full bg-[#141414] animate-checky-loading" />
      </div>

      <Space12 direction="mb" />

      <Text2 text="오늘도 하나씩, CHECKY" className="text-[#9a9d96]" />
    </div>
  );
}

export default LoadingSection;
