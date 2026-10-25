import { createContext } from "react";

/**
 * 모달 제목의 id.
 *
 * ModalWrapper 가 만들어 대화상자의 이름(aria-labelledby)으로 걸고, ModalTitle 이 그 id 를 단다.
 * 이름이 없는 대화상자는 스크린 리더가 무엇을 묻는 창인지 알려 주지 못하고,
 * 겹쳐 열린 모달들을 테스트에서 구분할 수도 없다.
 */
export const ModalTitleIdContext = createContext<string | undefined>(undefined);
