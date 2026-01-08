export const isKakaoInApp = () => {
  if (typeof navigator === "undefined") return false;
  return navigator.userAgent.toLowerCase().includes("kakaotalk");
};
