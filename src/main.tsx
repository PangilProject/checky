import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Router from "./router";
import "./styles/font.css";
import "./styles/index.css";
import { ToastContainer } from "react-toastify";

// React Query에서 사용할 QueryClient 인스턴스 생성 → API 요청 캐싱, 상태 관리 등을 담당
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  // QueryClientProvider로 앱 전체를 감싸서 어디서든 React Query 사용 가능하게 설정
  <QueryClientProvider client={queryClient}>
    {/* 라우터: 페이지 이동 및 화면 렌더링 담당 */}
    <Router />

    {/* Toast 알림 컨테이너 */}
    {/* draggable: 드래그로 알림 위치 이동 가능 */}
    <ToastContainer draggable />
  </QueryClientProvider>,
);
