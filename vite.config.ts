import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 외부 네트워크에서도 dev 서버 접근 가능 (모바일 테스트 등)
  },
  build: {
    rollupOptions: {
      output: {
        /**
         * 📦 manualChunks
         * 번들 파일을 라이브러리 단위로 분리하여
         * 캐싱 효율 및 초기 로딩 성능을 개선하기 위한 설정
         *
         * - node_modules 기반으로만 분리 (앱 코드와 구분)
         * - 변경이 적은 라이브러리는 별도 chunk로 분리 → 캐싱 유지
         * - 초기 번들 크기 감소 효과
         *
         * ⚠️ 주의
         * - chunk를 너무 많이 나누면 오히려 요청 수 증가로 성능 저하 가능
         * - 큰 라이브러리 위주로만 분리하는 것이 핵심
         */
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("firebase")) return "firebase";
          if (id.includes("recharts")) return "charts";
          if (id.includes("react-router")) return "router";
          if (id.includes("@tanstack")) return "react-query";
          /**
           * 📦 vendor
           * - 나머지 모든 외부 라이브러리
           * - 공통 chunk로 묶어서 관리
           */
          return "vendor";
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
