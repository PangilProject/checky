import { clearEmulators } from "./emulator";

/**
 * 실행마다 빈 에뮬레이터에서 시작한다.
 *
 * 테스트끼리는 사용자를 따로 써서 격리하므로 테스트마다 지우지는 않는다.
 * 여기서 지우는 것은 띄워 둔 에뮬레이터를 여러 번 재사용할 때 쌓이는 이전 실행의 잔여물이다.
 */
export default async function globalSetup() {
  await clearEmulators();
}
