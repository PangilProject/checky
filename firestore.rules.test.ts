/**
 * firestore.rules 보안 감사 — 공격자 관점 테스트.
 *
 * 정상 프론트엔드를 거치지 않고 SDK 를 직접 호출하는 악의적 사용자를 가정한다.
 * UI 에서 버튼이 숨겨져 있다는 사실은 방어로 치지 않는다.
 *
 * 실행: npm run test:rules
 * Firestore 에뮬레이터를 띄우므로 JDK 21 이상이 필요하다.
 */
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  collectionGroup,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type Firestore,
} from "firebase/firestore";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

const VICTIM = "victim-uid";
const ATTACKER = "attacker-uid";
const ADMIN = "admin-uid";

let testEnv: RulesTestEnvironment;

/** 공격자 자격으로 본 Firestore */
const asAttacker = () => testEnv.authenticatedContext(ATTACKER).firestore();
/** 실제 관리자 자격 */
const asAdmin = () => testEnv.authenticatedContext(ADMIN).firestore();
/** 미인증 */
const asAnon = () => testEnv.unauthenticatedContext().firestore();

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "checky-rules-audit",
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
  });
});

afterAll(async () => {
  await testEnv?.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  // 규칙을 우회해 초기 데이터를 심는다 (공격 전 상태)
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore() as unknown as Firestore;
    await setDoc(doc(db, "users", VICTIM), {
      uid: VICTIM,
      name: "피해자",
      email: "victim@example.com",
    });
    await setDoc(doc(db, "users", ATTACKER), {
      uid: ATTACKER,
      name: "공격자",
      email: "attacker@example.com",
    });
    await setDoc(doc(db, "users", ADMIN), {
      uid: ADMIN,
      name: "관리자",
      email: "admin@example.com",
      isAdmin: true,
    });
    await setDoc(doc(db, "users", VICTIM, "tasks", "t1"), {
      title: "피해자의 할 일",
      date: "2026-08-09",
    });
    await setDoc(doc(db, "users", VICTIM, "routines", "r1"), {
      title: "피해자의 루틴",
      days: [1],
    });
    await setDoc(doc(db, "users", ATTACKER, "tasks", "a1"), {
      title: "공격자의 할 일",
      date: "2026-08-09",
    });
    // 실제 crud.ts 가 쓰는 모양과 같게 심는다. pinned 를 빼 두면
    // 규칙이 요구하는 필드를 테스트가 먼저 어겨 버린다.
    await setDoc(doc(db, "notices", "n1"), {
      title: "공지",
      content: "본문",
      pinned: false,
    });
  });
});

describe("공격 1. 다른 uid 의 users 문서 읽기", () => {
  it("타인 문서 get 은 차단된다", async () => {
    await assertFails(getDoc(doc(asAttacker(), "users", VICTIM)));
  });

  it("users 컬렉션 전체 list 는 차단된다 (사용자 열거 불가)", async () => {
    await assertFails(getDocs(collection(asAttacker(), "users")));
  });

  it("미인증 사용자도 차단된다", async () => {
    await assertFails(getDoc(doc(asAnon(), "users", VICTIM)));
  });

  it("본인 문서는 읽을 수 있다 (정상 동작 확인)", async () => {
    await assertSucceeds(getDoc(doc(asAttacker(), "users", ATTACKER)));
  });

  it("실제 관리자는 list 할 수 있다 (정상 동작 확인)", async () => {
    await assertSucceeds(getDocs(collection(asAdmin(), "users")));
  });
});

describe("공격 2. 다른 사용자의 tasks/routines 읽기", () => {
  it("타인 task 단건 읽기 차단", async () => {
    await assertFails(
      getDoc(doc(asAttacker(), "users", VICTIM, "tasks", "t1")),
    );
  });

  it("타인 tasks 컬렉션 쿼리 차단", async () => {
    await assertFails(
      getDocs(collection(asAttacker(), "users", VICTIM, "tasks")),
    );
  });

  it("타인 routines 차단", async () => {
    await assertFails(
      getDocs(collection(asAttacker(), "users", VICTIM, "routines")),
    );
  });

  it("collectionGroup 우회 차단 (전체 사용자 tasks 횡단)", async () => {
    await assertFails(getDocs(query(collectionGroup(asAttacker(), "tasks"))));
  });

  it("관리자조차 타인 하위 데이터는 읽을 수 없다 (설계상 프라이버시)", async () => {
    await assertFails(getDoc(doc(asAdmin(), "users", VICTIM, "tasks", "t1")));
  });
});

describe("공격 3. 다른 사용자의 데이터 수정", () => {
  it("타인 users 문서 수정 차단", async () => {
    await assertFails(
      updateDoc(doc(asAttacker(), "users", VICTIM), { name: "탈취됨" }),
    );
  });

  it("타인 task 수정 차단", async () => {
    await assertFails(
      updateDoc(doc(asAttacker(), "users", VICTIM, "tasks", "t1"), {
        title: "변조됨",
      }),
    );
  });

  it("타인 task 삭제 차단", async () => {
    await assertFails(
      deleteDoc(doc(asAttacker(), "users", VICTIM, "tasks", "t1")),
    );
  });

  it("타인 영역에 새 문서 생성 차단", async () => {
    await assertFails(
      setDoc(doc(asAttacker(), "users", VICTIM, "tasks", "injected"), {
        title: "주입",
      }),
    );
  });

  it("타인 users 문서 삭제 차단", async () => {
    await assertFails(deleteDoc(doc(asAttacker(), "users", VICTIM)));
  });
});

describe("공격 4. 자신의 isAdmin 을 true 로 변경 (권한 상승)", () => {
  it("update 로 isAdmin 추가 차단", async () => {
    await assertFails(
      updateDoc(doc(asAttacker(), "users", ATTACKER), { isAdmin: true }),
    );
  });

  it("set(merge) 로 isAdmin 추가 차단", async () => {
    await assertFails(
      setDoc(
        doc(asAttacker(), "users", ATTACKER),
        { isAdmin: true },
        { merge: true },
      ),
    );
  });

  it("set 전체 덮어쓰기로 isAdmin 추가 차단", async () => {
    await assertFails(
      setDoc(doc(asAttacker(), "users", ATTACKER), {
        uid: ATTACKER,
        name: "공격자",
        isAdmin: true,
      }),
    );
  });

  it("문서 삭제 후 재생성으로도 isAdmin 부여 불가 (create/delete 조합)", async () => {
    await assertSucceeds(deleteDoc(doc(asAttacker(), "users", ATTACKER)));
    await assertFails(
      setDoc(doc(asAttacker(), "users", ATTACKER), {
        uid: ATTACKER,
        isAdmin: true,
      }),
    );
  });

  it("중첩 필드 경로(isAdmin.x)로 우회 불가", async () => {
    await assertFails(
      updateDoc(doc(asAttacker(), "users", ATTACKER), { "isAdmin.x": true }),
    );
  });

  it("관리자가 자신의 isAdmin 을 지울 수 없다 (값 보존 강제)", async () => {
    await assertFails(
      updateDoc(doc(asAdmin(), "users", ADMIN), { isAdmin: deleteField() }),
    );
  });

  it("타인을 관리자로 만들 수 없다", async () => {
    await assertFails(
      updateDoc(doc(asAttacker(), "users", VICTIM), { isAdmin: true }),
    );
  });
});

describe("공격 5. 관리자 전용 collection 쓰기", () => {
  it("공지 생성 차단", async () => {
    await assertFails(
      setDoc(doc(asAttacker(), "notices", "evil"), { title: "가짜 공지" }),
    );
  });

  it("기존 공지 수정 차단", async () => {
    await assertFails(
      updateDoc(doc(asAttacker(), "notices", "n1"), { content: "변조" }),
    );
  });

  it("공지 삭제 차단", async () => {
    await assertFails(deleteDoc(doc(asAttacker(), "notices", "n1")));
  });

  it("실제 관리자는 쓸 수 있다 (정상 동작 확인)", async () => {
    await assertSucceeds(
      setDoc(doc(asAdmin(), "notices", "n2"), {
        title: "진짜 공지",
        content: "본문",
        pinned: false,
      }),
    );
  });

  it("규칙에 없는 최상위 컬렉션 쓰기 차단", async () => {
    await assertFails(
      setDoc(doc(asAttacker(), "reports", "x"), { any: "thing" }),
    );
    await assertFails(
      setDoc(doc(asAttacker(), "adminConfig", "x"), { any: "thing" }),
    );
  });
});

describe("공격 6. 허용되지 않은 필드 추가", () => {
  it("본인 users 문서에 모르는 필드를 넣을 수 없다", async () => {
    await assertFails(
      updateDoc(doc(asAttacker(), "users", ATTACKER), { role: "superadmin" }),
    );
  });

  it("대용량 쓰레기 필드로 문서를 부풀릴 수 없다", async () => {
    await assertFails(
      updateDoc(doc(asAttacker(), "users", ATTACKER), {
        arbitraryJunk: "x".repeat(10000),
      }),
    );
  });

  it("과도하게 긴 name 은 거부된다", async () => {
    await assertFails(
      updateDoc(doc(asAttacker(), "users", ATTACKER), {
        name: "가".repeat(200),
      }),
    );
  });

  it("서버 시각 대신 임의 타임스탬프를 넣을 수 없다 (지표 오염 차단)", async () => {
    await assertFails(
      updateDoc(doc(asAttacker(), "users", ATTACKER), {
        lastActiveAt: new Date("2099-01-01"),
      }),
    );
    await assertFails(
      updateDoc(doc(asAttacker(), "users", ATTACKER), {
        createdAt: new Date("2000-01-01"),
      }),
    );
  });

  it("name 을 지워 관리자 목록에서 사라질 수 없다", async () => {
    await assertFails(
      updateDoc(doc(asAttacker(), "users", ATTACKER), { name: deleteField() }),
    );
  });

  it("name 을 문자열이 아닌 값으로 바꿀 수 없다", async () => {
    await assertFails(
      updateDoc(doc(asAttacker(), "users", ATTACKER), { name: 12345 }),
    );
  });

  it("임의 이름의 하위 컬렉션을 만들 수 없다", async () => {
    await assertFails(
      setDoc(doc(asAttacker(), "users", ATTACKER, "attackerPayload", "x"), {
        blob: "y".repeat(50000),
      }),
    );
  });

  it("모르는 하위 컬렉션은 읽을 수도 없다", async () => {
    await assertFails(
      getDocs(collection(asAttacker(), "users", ATTACKER, "attackerPayload")),
    );
  });
});

describe("공격 7. owner uid 변경", () => {
  it("경로 기반 소유권이라 문서를 남의 영역으로 옮길 수 없다", async () => {
    await assertFails(
      setDoc(doc(asAttacker(), "users", VICTIM, "tasks", "moved"), {
        title: "이동 시도",
      }),
    );
  });

  it("문서 내부 uid 필드를 타인 uid 로 위조할 수 없다", async () => {
    await assertFails(
      updateDoc(doc(asAttacker(), "users", ATTACKER), { uid: VICTIM }),
    );
  });

  it("uid 필드를 지울 수 없다", async () => {
    await assertFails(
      updateDoc(doc(asAttacker(), "users", ATTACKER), { uid: deleteField() }),
    );
  });
});

describe("공격 8. batch write 를 이용한 우회", () => {
  it("배치에 허용된 쓰기를 섞어도 금지된 쓰기는 통과하지 못한다", async () => {
    const db = asAttacker();
    const batch = writeBatch(db);
    batch.set(doc(db, "users", ATTACKER, "tasks", "legit"), { title: "정상" });
    batch.update(doc(db, "users", VICTIM), { name: "탈취" });
    await assertFails(batch.commit());
  });

  it("배치로 isAdmin 상승 시도 차단", async () => {
    const db = asAttacker();
    const batch = writeBatch(db);
    batch.set(doc(db, "users", ATTACKER, "tasks", "legit"), { title: "정상" });
    batch.update(doc(db, "users", ATTACKER), { isAdmin: true });
    await assertFails(batch.commit());
  });

  it("같은 배치에서 isAdmin 을 켜고 공지를 쓰는 연쇄 공격 차단", async () => {
    const db = asAttacker();
    const batch = writeBatch(db);
    batch.update(doc(db, "users", ATTACKER), { isAdmin: true });
    batch.set(doc(db, "notices", "evil"), { title: "권한 상승 후 공지" });
    await assertFails(batch.commit());
  });

  it("배치가 실패하면 안에 있던 정상 쓰기도 반영되지 않는다 (원자성)", async () => {
    const db = asAttacker();
    const batch = writeBatch(db);
    batch.set(doc(db, "users", ATTACKER, "tasks", "shouldNotExist"), {
      title: "정상",
    });
    batch.update(doc(db, "users", VICTIM), { name: "탈취" });
    await assertFails(batch.commit());
    const snap = await getDoc(
      doc(asAttacker(), "users", ATTACKER, "tasks", "shouldNotExist"),
    );
    if (snap.exists()) throw new Error("배치 실패에도 문서가 생성되었다");
  });
});

describe("공격 9. create 와 update 의 차이를 이용한 우회", () => {
  it("존재하지 않는 문서에 set 하면 create 규칙이 적용된다", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await deleteDoc(
        doc(ctx.firestore() as unknown as Firestore, "users", ATTACKER),
      );
    });
    await assertFails(
      setDoc(doc(asAttacker(), "users", ATTACKER), {
        uid: ATTACKER,
        name: "권한 상승 시도",
        isAdmin: true,
      }),
    );
    await assertSucceeds(
      setDoc(doc(asAttacker(), "users", ATTACKER), {
        uid: ATTACKER,
        name: "정상 생성",
      }),
    );
  });

  it("필수 필드(uid, name) 없이는 생성할 수 없다", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await deleteDoc(
        doc(ctx.firestore() as unknown as Firestore, "users", ATTACKER),
      );
    });
    await assertFails(
      setDoc(doc(asAttacker(), "users", ATTACKER), { name: "uid 없음" }),
    );
  });

  it("merge:true 로 create 하면서 isAdmin 을 넣을 수 없다", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await deleteDoc(
        doc(ctx.firestore() as unknown as Firestore, "users", ATTACKER),
      );
    });
    await assertFails(
      setDoc(
        doc(asAttacker(), "users", ATTACKER),
        { isAdmin: true },
        { merge: true },
      ),
    );
  });

  it("타인 uid 경로에는 create 도 불가", async () => {
    await assertFails(
      setDoc(doc(asAttacker(), "users", "brand-new-uid"), { name: "x" }),
    );
  });
});

/**
 * 규칙을 조인 뒤 실제 앱 동작이 막히지 않는지 확인한다.
 * 여기가 깨지면 규칙이 과하게 조여진 것이다 (src/shared/api/auth/user.ts 기준).
 */
describe("정상 앱 동작 회귀 확인", () => {
  it("최초 로그인 프로필 생성 (createUser)", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await deleteDoc(
        doc(ctx.firestore() as unknown as Firestore, "users", ATTACKER),
      );
    });
    await assertSucceeds(
      setDoc(doc(asAttacker(), "users", ATTACKER), {
        uid: ATTACKER,
        email: "attacker@example.com",
        name: "공격자",
        photoURL: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        lastActiveAt: serverTimestamp(),
      }),
    );
  });

  it("마지막 접속 기록 (updateLastActive)", async () => {
    await assertSucceeds(
      updateDoc(doc(asAttacker(), "users", ATTACKER), {
        lastActiveAt: serverTimestamp(),
      }),
    );
  });

  it("마지막 로그인 기록 (updateLastLogin)", async () => {
    await assertSucceeds(
      updateDoc(doc(asAttacker(), "users", ATTACKER), {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("프로필 이름 변경", async () => {
    await assertSucceeds(
      updateDoc(doc(asAttacker(), "users", ATTACKER), { name: "새 이름" }),
    );
  });

  it("회원 탈퇴 시 프로필 삭제 (deleteUserDoc)", async () => {
    await assertSucceeds(deleteDoc(doc(asAttacker(), "users", ATTACKER)));
  });

  it("앱이 쓰는 6개 하위 컬렉션 읽기·쓰기가 모두 열려 있다", async () => {
    const db = asAttacker();
    const names = [
      "tasks",
      "taskLogs",
      "routines",
      "routineLogs",
      "categories",
      "monthlyStats",
    ];
    for (const name of names) {
      await assertSucceeds(
        setDoc(doc(db, "users", ATTACKER, name, "doc1"), { any: "value" }),
      );
      await assertSucceeds(getDocs(collection(db, "users", ATTACKER, name)));
      await assertSucceeds(deleteDoc(doc(db, "users", ATTACKER, name, "doc1")));
    }
  });

  it("본인 데이터 배치 쓰기가 동작한다 (일괄 작업·정렬 저장)", async () => {
    const db = asAttacker();
    const batch = writeBatch(db);
    batch.set(doc(db, "users", ATTACKER, "tasks", "b1"), { title: "일괄 1" });
    batch.set(doc(db, "users", ATTACKER, "tasks", "b2"), { title: "일괄 2" });
    batch.set(doc(db, "users", ATTACKER, "monthlyStats", "2026-08"), {
      days: {},
    });
    await assertSucceeds(batch.commit());
  });

  it("로그인 사용자는 공지를 읽을 수 있다", async () => {
    await assertSucceeds(getDocs(collection(asAttacker(), "notices")));
  });

  it("공지 생성 (createNotice)", async () => {
    await assertSucceeds(
      setDoc(doc(asAdmin(), "notices", "new"), {
        title: "제목",
        content: "내용",
        pinned: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("공지 내용 수정 (updateNotice)", async () => {
    await assertSucceeds(
      updateDoc(doc(asAdmin(), "notices", "n1"), {
        title: "고친 제목",
        content: "고친 내용",
        pinned: true,
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("상단 고정만 전환 (setNoticePinned — 부분 업데이트)", async () => {
    await assertSucceeds(
      updateDoc(doc(asAdmin(), "notices", "n1"), {
        pinned: true,
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("공지 삭제 (deleteNotice)", async () => {
    await assertSucceeds(deleteDoc(doc(asAdmin(), "notices", "n1")));
  });
});

/**
 * 입력값 검증 — 권한이 있어도 모양이 어긋난 값은 저장되지 않는지 본다.
 *
 * 화면의 maxLength 는 UX 를 위한 것이고, SDK 를 직접 부르면 아무 제한이 없다.
 * 그래서 길이·타입 검사는 규칙에도 있어야 한다.
 *
 * 반대로 "악성처럼 보이는 문자열"은 거부하지 않는다. 저장은 원문 그대로 하고
 * 화면에서 글자로만 보이게 하는 것이 이 앱의 방침이므로, 그 방침도 함께 고정한다.
 */
describe("공격 10. 입력값 검증 우회 (공지)", () => {
  const validNotice = (extra: Record<string, unknown> = {}) => ({
    title: "제목",
    content: "내용",
    pinned: false,
    ...extra,
  });

  it("과도하게 긴 제목은 거부된다 (100자 초과)", async () => {
    await assertFails(
      setDoc(
        doc(asAdmin(), "notices", "long-title"),
        validNotice({ title: "가".repeat(101) }),
      ),
    );
  });

  it("과도하게 긴 내용은 거부된다 (2000자 초과)", async () => {
    await assertFails(
      setDoc(
        doc(asAdmin(), "notices", "long-content"),
        validNotice({ content: "가".repeat(2001) }),
      ),
    );
  });

  it("경계값은 통과한다 (제목 100자 / 내용 2000자)", async () => {
    await assertSucceeds(
      setDoc(
        doc(asAdmin(), "notices", "boundary"),
        validNotice({ title: "가".repeat(100), content: "가".repeat(2000) }),
      ),
    );
  });

  it("빈 제목은 거부된다", async () => {
    await assertFails(
      setDoc(doc(asAdmin(), "notices", "empty"), validNotice({ title: "" })),
    );
  });

  it("제목을 문자열이 아닌 값으로 저장할 수 없다", async () => {
    await assertFails(
      setDoc(
        doc(asAdmin(), "notices", "type-title"),
        validNotice({ title: { $gt: "" } }),
      ),
    );
  });

  it("pinned 를 boolean 이 아닌 값으로 저장할 수 없다", async () => {
    await assertFails(
      setDoc(
        doc(asAdmin(), "notices", "type-pinned"),
        validNotice({ pinned: "true" }),
      ),
    );
  });

  it("모르는 필드를 넣을 수 없다 (문서 부풀리기 차단)", async () => {
    await assertFails(
      setDoc(
        doc(asAdmin(), "notices", "extra"),
        validNotice({ payload: "가".repeat(100_000) }),
      ),
    );
  });

  it("필수 필드 없이 만들 수 없다", async () => {
    await assertFails(
      setDoc(doc(asAdmin(), "notices", "partial"), { title: "제목만" }),
    );
  });

  it("작성 시각을 임의 값으로 위조할 수 없다", async () => {
    await assertFails(
      setDoc(
        doc(asAdmin(), "notices", "forged-time"),
        validNotice({ createdAt: new Date("2020-01-01") }),
      ),
    );
  });

  it("수정으로 제목을 지울 수 없다", async () => {
    await assertFails(
      updateDoc(doc(asAdmin(), "notices", "n1"), { title: deleteField() }),
    );
  });

  it("HTML 문자열은 정상 입력으로 저장된다 (필터링하지 않는다)", async () => {
    // 저장은 원문 그대로, 이스케이프는 출력 단계에서 한다.
    // 이 케이스는 나중에 입력 단계 필터링으로 되돌리려는 변경을 막는 역할도 한다.
    await assertSucceeds(
      setDoc(
        doc(asAdmin(), "notices", "html"),
        validNotice({
          title: "<script>alert(1)</script>",
          content: '<img src=x onerror=alert(1)> 그리고 1 < 2 이며 <b>강조</b>',
        }),
      ),
    );
  });
});

/**
 * 규칙을 조이기 전에 저장된 문서가 갱신 불가 상태가 되지 않는지 본다.
 * 접속 기록 실패는 authStore 에서 조용히 삼켜지므로, 여기서 막히면
 * 운영 중에 아무도 모르게 지표가 멈춘다.
 */
describe("기존 데이터 호환성 (규칙 강화 배포 안전성)", () => {
  /** 예전 스키마의 모르는 필드가 남아 있는 문서를 만든다 */
  const seedLegacyDoc = async (extra: Record<string, unknown>) => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(
        doc(ctx.firestore() as unknown as Firestore, "users", ATTACKER),
        { uid: ATTACKER, name: "공격자", ...extra },
      );
    });
  };

  it("모르는 필드가 남아 있어도 접속 기록은 계속 저장된다", async () => {
    await seedLegacyDoc({ legacyField: "옛 스키마" });
    await assertSucceeds(
      updateDoc(doc(asAttacker(), "users", ATTACKER), {
        lastActiveAt: serverTimestamp(),
      }),
    );
  });

  it("uid 가 없던 옛 문서도 갱신할 수 있다", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(
        doc(ctx.firestore() as unknown as Firestore, "users", ATTACKER),
        { name: "uid 없는 옛 문서" },
      );
    });
    await assertSucceeds(
      updateDoc(doc(asAttacker(), "users", ATTACKER), {
        lastActiveAt: serverTimestamp(),
      }),
    );
  });

  it("모르는 필드가 남아 있어도 새 모르는 필드는 추가할 수 없다", async () => {
    await seedLegacyDoc({ legacyField: "옛 스키마" });
    await assertFails(
      updateDoc(doc(asAttacker(), "users", ATTACKER), { role: "superadmin" }),
    );
  });

  it("남아 있는 모르는 필드의 값을 바꿀 수도 없다", async () => {
    await seedLegacyDoc({ legacyField: "옛 스키마" });
    await assertFails(
      updateDoc(doc(asAttacker(), "users", ATTACKER), {
        legacyField: "조작",
      }),
    );
  });

  it("이미 있는 name 은 여전히 지울 수 없다", async () => {
    await seedLegacyDoc({ legacyField: "옛 스키마" });
    await assertFails(
      updateDoc(doc(asAttacker(), "users", ATTACKER), { name: deleteField() }),
    );
  });
});
