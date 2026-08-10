import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoadingPage from "@/pages/LoadingPage/LoadingPage";
import PrivateRoute from "./shared/ui/PrivateRoute";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const HomePage = lazy(() => import("@/pages/HomePage"));
const CategoryPage = lazy(() => import("@/pages/CategoryPage"));
const RoutinePage = lazy(() => import("@/pages/RoutinePage"));
const MyPage = lazy(() => import("@/pages/MyPage"));
const PageNotFound = lazy(() => import("./pages/PageNotFound"));
const PrivacyPage = lazy(() => import("@/pages/legal/PrivacyPage"));
const TermsPage = lazy(() => import("@/pages/legal/TermsPage"));
const AdminLayout = lazy(() => import("./admin/layout/AdminLayout"));
const AdminDashboardPage = lazy(
  () => import("./admin/pages/dashboard/AdminDashboardPage")
);
const AdminNoticesPage = lazy(
  () => import("./admin/pages/notices/AdminNoticesPage")
);
const AdminUsersPage = lazy(
  () => import("./admin/pages/users/AdminUsersPage")
);
const AdminReportsPage = lazy(
  () => import("./admin/pages/reports/AdminReportsPage")
);
/* 디자인 시스템 갤러리 (개발 빌드 전용).
   조건을 import 자체에 걸어야 한다. lazy(() => import(...)) 를 무조건 만들어 두면
   라우트를 등록하지 않아도 청크는 그대로 만들어져 배포 폴더에 남는다. */
const UiGalleryPage = import.meta.env.DEV
  ? lazy(() => import("@/pages/dev/UiGalleryPage"))
  : null;

function Router() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingPage />}>
        <Routes>
          {/* 로그인 */}
          <Route path="/" element={<LoginPage />} />

          {/* 약관·방침은 가입 전에 확인할 수 있어야 하므로 로그인 없이 연다 */}
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* 로그인이 필요한 페이지 (가드를 하나로 두어 화면 전환 시 재마운트를 피한다) */}
          <Route element={<PrivateRoute />}>
            <Route path="/home" element={<HomePage />} />
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

          {UiGalleryPage && (
            <Route path="/dev/ui" element={<UiGalleryPage />} />
          )}

          {/* fallback */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default Router;
