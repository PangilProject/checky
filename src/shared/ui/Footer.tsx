import { FaInstagram } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { LegalLinks } from "./LegalLinks";

const INSTAGRAM_URL = "https://www.instagram.com/checky.today/";
const CONTACT_EMAIL = "checky.today@gmail.com";

const contactClass =
  "flex items-center gap-1.5 hover:text-content pressable";

/**
 * 로그인한 화면 맨 아래의 푸터.
 *
 * 문의처와 약관을 어느 화면에서든 찾을 수 있게 둔다. 예전에는 마이 정보에만 있어
 * 그 화면을 모르면 약관으로 가는 길이 없었다.
 * 메일 주소는 개인정보 처리방침의 문의처와 같은 값이다.
 */
export const Footer = () => {
  return (
    <footer className="mt-10 flex flex-col gap-4 border-t border-line pt-6 pb-10 text-xs text-content-muted sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2">
        <LegalLinks />
        <p>© 2026 checky. All rights reserved.</p>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="checky 인스타그램 (새 창)"
          className={contactClass}
        >
          <FaInstagram size={14} aria-hidden="true" />
          @checky.today
        </a>
        <a href={`mailto:${CONTACT_EMAIL}`} className={contactClass}>
          <HiOutlineMail size={15} aria-hidden="true" />
          {CONTACT_EMAIL}
        </a>
      </div>
    </footer>
  );
};
