import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "@/pages/LoginPage";
import HomePage from "@/pages/HomePage";
import CategoryPage from "@/pages/CategoryPage";
import RoutinePage from "@/pages/RoutinePage";
import MyPage from "@/pages/MyPage";
import PageNotFound from "./pages/PageNotFound";
import PrivateRoute from "./shared/ui/PrivateRoute";
import AdminLayout from "./admin/layout/AdminLayout";
import AdminDashboardPage from "./admin/pages/dashboard/AdminDashboardPage";
import AdminNoticesPage from "./admin/pages/notices/AdminNoticesPage";
import AdminUsersPage from "./admin/pages/users/AdminUsersPage";
import AdminReportsPage from "./admin/pages/reports/AdminReportsPage";

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

        {/* 관리자 페이지 */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="" element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="notices" element={<AdminNoticesPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
