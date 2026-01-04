import { Text2, Text3 } from "@/shared/ui/Text";
import LogoImage from "../../assets/images/logoRound.png";
import { Space10, Space4 } from "@/shared/ui/Space";
import { NormalBlackButton } from "@/shared/ui/Button";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/services/firebase/firebase";
import { toast } from "react-toastify";
import { useAuth } from "@/shared/hooks/useAuth";
import { TitleText } from "@/shared/ui/TitleText";
import { deleteAccount } from "@/services/firebase/auth";

function MyPage() {
  return (
    <div>
      <TitleText text="마이 정보" />
      <Space4 direction="mb" />
      <UserInfoSection />
      <Space10 direction="mb" />
      <ButtonSection />
    </div>
  );
}

const UserInfoSection = () => {
  const user = useAuth();

  const name = user?.user?.displayName || "";
  const email = user?.user?.email || "";
  const imageUrl = user?.user?.photoURL || "";
  return (
    <div className="flex">
      <img src={imageUrl || LogoImage} className="w-16 rounded-4xl" />
      <Space4 direction="mr" />
      <div className="flex flex-col justify-center">
        <Text3 text={name || "이름"} />
        <Text2 text={email || "이메일"} />
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
      toast.success("로그아웃 되었습니다.");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert("로그아웃에 실패했습니다.");
    }
  };

  const handleWithdraw = async () => {
    const confirmed = confirm(
      "정말로 탈퇴하시겠습니까?\n모든 데이터가 삭제됩니다."
    );
    if (!confirmed) return;

    try {
      await deleteAccount();
      alert("회원탈퇴가 완료되었습니다.");
      navigate("/");
    } catch (e) {
      console.error(e);
      alert("회원탈퇴에 실패했습니다.");
    }
  };

  return (
    <div className="flex gap-3">
      <NormalBlackButton text="로그아웃" onClick={handleLogout} />
      <NormalBlackButton text="회원탈퇴" onClick={handleWithdraw} />
    </div>
  );
};
export default MyPage;
