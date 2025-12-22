import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/services/firebase/firebase";

function HomePage() {
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
    <div>
      <p>HomePage</p>
      <button onClick={handleLogout} className="p-2 bg-red-500 text-white rounded">
        로그아웃
      </button>
    </div>
  );
}

export default HomePage;
