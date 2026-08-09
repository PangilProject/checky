import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Router from "./router";
import "./styles/font.css";
import "./styles/index.css";
import { ToastContainer } from "react-toastify";

// React Query에서 사용할 QueryClient 인스턴스 생성 → API 요청 캐싱, 상태 관리 등을 담당
// 앱 표준 캐시 정책을 기본값으로 둔다. 훅에는 기본과 다른 옵션만 남긴다.
// 기본값이 없으면 옵션을 잊은 훅이 staleTime 0 + 포커스 refetch + retry 3 을
// 조용히 상속해, 화면 하나가 Firestore read 를 반복 과금하게 된다.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60_000,
      gcTime: 30 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      // 권한 오류나 인덱스 누락은 재시도해도 실패한다. 기본 3회는 실패 쿼리를
      // 4번 과금하므로 1회로 줄인다.
      retry: 1,
    },
  },
});

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
