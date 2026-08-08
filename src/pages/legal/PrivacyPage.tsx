// 문서 원본은 마크다운 한 벌만 유지하고 화면은 그것을 읽어 렌더링한다
import privacyPolicy from "./content/privacy-policy.md?raw";
import { LegalDocument } from "./components/LegalDocument";
import { LegalPageLayout } from "./components/LegalPageLayout";

function PrivacyPage() {
  return (
    <LegalPageLayout>
      <LegalDocument markdown={privacyPolicy} />
    </LegalPageLayout>
  );
}

export default PrivacyPage;
