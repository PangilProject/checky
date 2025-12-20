import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "@/pages/LoginPage";
import HomePage from "@/pages/HomePage";
import CategoryPage from "@/pages/CategoryPage";
import RoutinePage from "@/pages/RoutinePage";
import MyPage from "@/pages/MyPage";
import PageNotFound from "./pages/PageNotFound";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 로그인 */}
        <Route path="/" element={<LoginPage />} />

        {/* 메인 */}
        <Route path="/home" element={<HomePage />} />

        {/* 관리 페이지 */}
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/routine" element={<RoutinePage />} />
        <Route path="/my" element={<MyPage />} />

        {/* fallback */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
