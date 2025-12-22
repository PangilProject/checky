import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "@/pages/LoginPage";
import HomePage from "@/pages/HomePage";
import CategoryPage from "@/pages/CategoryPage";
import RoutinePage from "@/pages/RoutinePage";
import MyPage from "@/pages/MyPage";
import PageNotFound from "./pages/PageNotFound";
import PrivateRoute from "./shared/ui/PrivateRoute";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 로그인 */}
        <Route path="/" element={<LoginPage />} />

        {/* 메인 */}
        <Route element={<PrivateRoute />}>
          <Route path="/home" element={<HomePage />} />
        </Route>

        {/* 관리 페이지 */}
        <Route element={<PrivateRoute />}>
          <Route path="/category" element={<CategoryPage />} />
          <Route path="/routine" element={<RoutinePage />} />
          <Route path="/my" element={<MyPage />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
