import { Link } from "react-router-dom";

function PageNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      {/* 상태 코드 */}
      <h1 className="text-7xl font-extrabold text-gray-300">404</h1>

      {/* 메시지 */}
      <p className="mt-4 text-xl font-semibold text-gray-800">
        페이지를 찾을 수 없어요
      </p>
      <p className="mt-2 text-sm text-gray-500">
        주소가 잘못되었거나, 페이지가 이동되었을 수 있어요.
      </p>

      {/* 액션 버튼 */}
      <Link
        to="/"
        className="mt-8 rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-95"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}

export default PageNotFound;
