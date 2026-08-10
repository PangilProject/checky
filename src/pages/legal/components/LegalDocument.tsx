import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * @file LegalDocument.tsx
 * @description 마크다운 법적 고지 문서를 화면에 렌더링합니다.
 *
 * 문서 원본은 docs/ 아래 마크다운 한 벌만 두고 여기서 읽어옵니다.
 * 화면용으로 JSX 사본을 만들면 개정할 때 한쪽만 고쳐 두 문서가 어긋납니다.
 */

/**
 * 편집자용 주석을 화면에서 제거합니다.
 *
 * 문서에는 유지보수 메모가 HTML 주석으로 들어 있습니다. 렌더러가 원시 HTML을
 * 무시하도록 두어도 되지만, 렌더러 설정이 바뀌면 이용자에게 노출될 수 있으므로
 * 입력 단계에서 지웁니다.
 */
const stripComments = (markdown: string) =>
  markdown.replace(/<!--[\s\S]*?-->/g, "");

/**
 * 마크다운 요소별 스타일.
 *
 * 타이포그래피 플러그인 대신 직접 지정해 앱의 다른 화면과 크기·색을 맞춘다.
 */
const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold wrap-break-word">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-10 mb-3 text-lg font-bold wrap-break-word">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 mb-2 text-base font-bold wrap-break-word">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="my-3 text-sm leading-relaxed text-content wrap-break-word">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="my-3 list-disc pl-5 text-sm leading-relaxed text-content">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 list-decimal pl-5 text-sm leading-relaxed text-content">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="my-1 wrap-break-word">{children}</li>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="underline underline-offset-2 hover:text-content"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-content">{children}</strong>
  ),
  hr: () => <hr className="my-8 border-t border-line" />,
  // 좁은 화면에서는 칸 안에서 줄바꿈해 표 전체가 보이게 한다.
  // 가로 스크롤은 요약표처럼 중요한 내용이 화면 밖으로 밀려나 놓치기 쉽다.
  // overflow-x-auto 는 줄바꿈으로도 감당이 안 되는 경우의 안전장치로 남긴다.
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-xs sm:text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-content-subtle px-2 py-2 text-left font-bold whitespace-nowrap sm:px-3">
      {children}
    </th>
  ),
  // break-keep: 칸이 좁으면 한글이 단어 중간에서 잘린다.
  // 어절 단위로 끊어야 "무엇을 수집하나요"가 "무엇 / 을 수 / 집하"로 쪼개지지 않는다.
  td: ({ children }) => (
    <td className="border-b border-line px-2 py-2 align-top text-content break-keep sm:px-3">
      {children}
    </td>
  ),
};

interface LegalDocumentProps {
  /** docs/ 에서 ?raw 로 읽어온 마크다운 원문 */
  markdown: string;
}

export const LegalDocument = ({ markdown }: LegalDocumentProps) => {
  return (
    <Markdown remarkPlugins={[remarkGfm]} components={components}>
      {stripComments(markdown)}
    </Markdown>
  );
};
