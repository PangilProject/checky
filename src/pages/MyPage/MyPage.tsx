import { Text2, Text3, Text5 } from "@/shared/ui/Text";
import LogoImage from "../../assets/images/logoRound.png";
import { Space10, Space4 } from "@/shared/ui/Space";
import { NormalBlackButton } from "@/shared/ui/Button";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/services/firebase/firebase";

function MyPage() {
  return (
    <div>
      <PageTitleSection />
      <Space4 direction="mb" />
      <UserInfoSection />
      <Space10 direction="mb" />
      <ButtonSection />
    </div>
  );
}

const PageTitleSection = () => {
  return <Text5 text="마이 정보" className="font-bold" />;
};
const UserInfoSection = () => {
  return (
    <div className="flex">
      <img src={LogoImage} className="w-16" />
      <Space4 direction="mr" />
      <div className="flex flex-col justify-center">
        <Text3 text="김광일" />
        <Text2 text="oksk6689@gmail.com" />
      </div>
    </div>
  );
};

const ButtonSection = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert("로그아웃에 실패했습니다.");
    }
  };

  return (
    <div className="flex gap-3">
      <NormalBlackButton text="로그아웃" onClick={handleLogout} />
      <NormalBlackButton text="회원탈퇴" />
    </div>
  );
};
export default MyPage;
