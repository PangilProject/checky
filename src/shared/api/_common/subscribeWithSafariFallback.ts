import {
  type DocumentData,
  getDocs,
  type Query,
  type QuerySnapshot,
} from "firebase/firestore/lite";

const BASE_POLL_INTERVAL_MS = 30000;
const MAX_POLL_INTERVAL_MS = 5 * 60 * 1000;
const DISABLE_FIRESTORE_SUBSCRIPTIONS = false;
const SINGLE_FETCH_SUBSCRIPTION_MODE = true;
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
  if (DISABLE_FIRESTORE_SUBSCRIPTIONS) {
    return () => {};
  }

  if (SINGLE_FETCH_SUBSCRIPTION_MODE) {
    void getDocs(queryRef)
      .then((snapshot) => {
        onNext(snapshot);
      })
      .catch((error) => {
        onError?.(error);
      });
    return () => {};
  }

  bindPageLifecycleHandlers();

  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let currentIntervalMs = BASE_POLL_INTERVAL_MS;
  let isRequestInFlight = false;

  const extractErrorCode = (error: unknown): string | undefined => {
    if (!error || typeof error !== "object") return undefined;
    const maybeCode = (error as { code?: unknown }).code;
    return typeof maybeCode === "string" ? maybeCode : undefined;
  };

  const scheduleNext = (delayMs: number) => {
    if (stopped) return;
    timer = setTimeout(() => {
      void poll();
    }, delayMs);
  };

  const poll = async () => {
    if (stopped || isRequestInFlight) return;
    if (typeof document !== "undefined" && document.hidden) {
      scheduleNext(currentIntervalMs);
      return;
    }

    isRequestInFlight = true;
    try {
      const snapshot = await getDocs(queryRef);
      if (stopped) return;
      onNext(snapshot);
      currentIntervalMs = BASE_POLL_INTERVAL_MS;
    } catch (error) {
      onError?.(error);
      const errorCode = extractErrorCode(error);
      if (errorCode === "resource-exhausted" || errorCode === "429") {
        currentIntervalMs = Math.min(currentIntervalMs * 2, MAX_POLL_INTERVAL_MS);
      }
    } finally {
      isRequestInFlight = false;
      if (stopped) return;
      scheduleNext(currentIntervalMs);
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
