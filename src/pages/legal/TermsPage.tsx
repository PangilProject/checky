// 문서 원본은 docs/ 한 벌만 유지하고 화면은 그것을 읽어 렌더링한다
import termsOfService from "../../../docs/terms-of-service.md?raw";
import { LegalDocument } from "./components/LegalDocument";
import { LegalPageLayout } from "./components/LegalPageLayout";

function TermsPage() {
  return (
    <LegalPageLayout>
      <LegalDocument markdown={termsOfService} />
    </LegalPageLayout>
  );
}

export default TermsPage;
