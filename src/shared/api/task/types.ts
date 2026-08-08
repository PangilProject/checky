/** 특정 날짜에 하기로 한 할 일. date 는 `YYYY-MM-DD`, time 은 정한 경우에만 있다. */
export interface Task {
  id: string;
  title: string;
  categoryId: string;
  categoryColor: string;
  date: string;

  /**
   * 할 일을 처음 만든 시각. 화면의 `D+n` 라벨이 이 값으로 며칠 지났는지 센다.
   *
   * **날짜를 옮겨도 이 값은 그대로 둔다.** 며칠째 미루고 있는지가 쌓이게 하려는 것이며,
   * 라벨이 단순한 날짜 표시가 아니라 신호가 되는 이유다.
   * 복사는 같은 내용의 새 할 일이므로 새로 찍힌다.
   *
   * 선택 속성인 것은 이 필드가 생기기 전 문서에 값이 없기 때문이다.
   * **새로 만드는 쪽에서는 반드시 채워야 한다.** 비워도 저장은 되지만
   * 문서를 다시 읽어 오기 전까지 라벨이 뜨지 않는다.
   *
   * Firestore 문서에는 서버 시각으로 들어 있다. 읽어 올 때 `mapTaskDoc` 이 Date 로 바꾸므로,
   * 이 타입을 만들 때는 그 매퍼를 거쳐야 한다. 거치지 않으면 값이 Timestamp 인 채로
   * `Task` 라고 적히고, 라벨을 그릴 때 터진다.
   */
  createdAt?: Date;

  time?: string;
  orderIndex: number;
}
