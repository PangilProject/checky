/**
 * 홈 화면에 설치한 앱(PWA)으로 열었는지.
 *
 * 설치해 쓰는 사람은 이미 Checky 를 아는 사람이라 소개 필름을 다시 볼 이유가 없다.
 * manifest 의 start_url 도 /home 이지만, 그 전에 설치한 iOS 앱은 설치할 때의 주소(/)를 계속 쓴다.
 * iOS 사파리는 display-mode 대신 navigator.standalone 으로 알려 준다.
 */
export const isInstalledApp = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;
