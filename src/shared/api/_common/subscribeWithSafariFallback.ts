import {
  type DocumentData,
  getDocs,
  type Query,
  type QuerySnapshot,
} from "firebase/firestore/lite";

const SAFARI_POLL_INTERVAL_MS = 5000;
const activeUnsubscribes = new Set<() => void>();
let hasBoundPageLifecycleHandlers = false;

const cleanupActiveSubscriptions = () => {
  const unsubs = Array.from(activeUnsubscribes);
  activeUnsubscribes.clear();
  for (const unsubscribe of unsubs) {
    unsubscribe();
  }
};

const bindPageLifecycleHandlers = () => {
  if (hasBoundPageLifecycleHandlers) return;
  if (typeof window === "undefined") return;

  window.addEventListener("pagehide", cleanupActiveSubscriptions);
  window.addEventListener("beforeunload", cleanupActiveSubscriptions);
  hasBoundPageLifecycleHandlers = true;
};

export const subscribeWithSafariFallback = <T extends DocumentData>(
  queryRef: Query<T>,
  onNext: (snapshot: QuerySnapshot<T>) => void,
  onError?: (error: unknown) => void,
) => {
  bindPageLifecycleHandlers();

  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const poll = async () => {
    try {
      const snapshot = await getDocs(queryRef);
      if (stopped) return;
      onNext(snapshot);
    } catch (error) {
      onError?.(error);
    } finally {
      if (stopped) return;
      timer = setTimeout(() => {
        void poll();
      }, SAFARI_POLL_INTERVAL_MS);
    }
  };

  const stop = () => {
    stopped = true;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  activeUnsubscribes.add(stop);
  void poll();

  return () => {
    activeUnsubscribes.delete(stop);
    stop();
  };
};
