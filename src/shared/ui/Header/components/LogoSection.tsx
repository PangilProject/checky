import { Link } from "react-router-dom";
import { Space2 } from "../../Space";
import { Text4, Text6 } from "../../Text";
import { wickedMouseClass } from "@/styles/font";
import LogoImage from "@/assets/images/logo.png";

export const LogoSection = () => {
  return (
    <Link to="/">
      <div className="flex items-center my-3 sm:my-4">
        <img src={LogoImage} className="w-6 sm:w-8" />
        <Space2 direction="mr" />
        <Text4
          className={`block sm:hidden ${wickedMouseClass}`}
          text="CHECKY"
        />
        <Text6
          className={`hidden sm:block ${wickedMouseClass}`}
          text="CHECKY"
        />
      </div>
    </Link>
  );
};
