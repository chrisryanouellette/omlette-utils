import { Throwable } from "@ouellettec/utils";
import {
  UseComponentStore,
  useComponentStore,
} from "@ouellettec/utils-react-state-zustand";
import { useCallback, useEffect, useMemo, useRef } from "react";

function getStartTime(): number {
  if (!window !== undefined) {
    return Number(
      document.timeline ? document.timeline.currentTime : performance.now(),
    );
  }
  return 0;
}

function schedule(
  time: number,
  startTime: number,
  ms: number,
  cb: (time: number) => void,
): NodeJS.Timeout {
  const elapsed = time - startTime;
  const roundedElapsed = Math.round(elapsed / ms) * ms;
  const targetNext = startTime + roundedElapsed + ms;
  const delay = targetNext - performance.now();
  return setTimeout(() => requestAnimationFrame(cb), delay);
}

export type UseTimerState = { time: number; active: boolean };

export type UseTimer = {
  /** Begins the timer */
  start: () => Throwable;
  /** Sets the timer back to 0 and begins runs the start function */
  restart: () => void;
  /** Stops the timer without resetting it */
  stop: () => void;
  /** Sets the timer, time is in milliseconds */
  set: (time: number) => void;
  store: UseComponentStore<UseTimerState>;
};

/** Creates a one tick timer and saves it in a store
 *
 * [Inspired by HTTP 203](https://gist.github.com/jakearchibald/cb03f15670817001b1157e62a076fe95)
 *
 * @param {number} ms - The milliseconds used to tick the timer
 * @return {Store}
 * @example
 * const timer = useTimer();
 * const time = useStore(timer);
 *
 * return <p>{time}</p>;
 */
function useTimer(ms = 1000): UseTimer {
  const store = useComponentStore<UseTimerState>({
    time: 0,
    active: false,
  });
  /* 
    Prefer currentTime, as it'll better sync animations queued in the
    same frame, but if it isn't supported, performance.now() is fine.
  */
  const startTime = useRef(getStartTime());
  const tick = useRef<number>(startTime.current);
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const pausedTick = useRef<number>(startTime.current);
  const controller = useRef<AbortController>(new AbortController());

  /** Update the store on each timeout callback */
  const frame = useCallback<(time: number) => void>(
    (time) => {
      if (controller.current.signal.aborted) return;
      tick.current = time;
      const last = store.getState().time;
      store.setState({ time: last + ms });
      timeout.current = schedule(time, startTime.current, ms, frame);
    },
    [ms, store],
  );

  const start = useCallback<UseTimer["start"]>(() => {
    if (store.getState().active) {
      return {
        isError: true,
        error: new Error("The timer is already running"),
      };
    }
    controller.current = new AbortController();
    store.setState({ active: true });
    timeout.current = schedule(tick.current, startTime.current, ms, frame);
    return { isError: false };
  }, [frame, ms, store]);

  const restart = useCallback<UseTimer["restart"]>(() => {
    store.setState({ time: 0 });
  }, [store]);

  const stop = useCallback<UseTimer["stop"]>(() => {
    controller.current.abort();
    timeout.current && clearTimeout(timeout.current);
    store.setState({ active: false });
  }, [store]);

  const set = useCallback<UseTimer["set"]>(
    (time) => {
      timeout.current && clearTimeout(timeout.current);
      store.setState({ time });
      if (store.getState().active) start();
    },
    [start, store],
  );

  useEffect(() => {
    const controller = new AbortController();
    document.addEventListener(
      "visibilitychange",
      function onVisibilityChange() {
        if (document.hidden) {
          /* Store where we paused so we can calculate it later */
          pausedTick.current = tick.current;
          stop();
        } else if (!store.getState().active) {
          /* Determine has long has passed while the page was hidden */
          const time = getStartTime();
          const elapsed = time - pausedTick.current;
          const roundedElapsed = Math.round(elapsed / ms) * ms;
          const passed = store.getState().time;
          tick.current = time;
          store.setState({ time: passed + roundedElapsed });
          start();
        }
      },
      { signal: controller.signal },
    );

    return function timerVisibilityCleanup() {
      controller.abort();
    };
  }, [ms, start, stop, store]);

  useEffect(function initCleanupTimer() {
    return function cleanup() {
      controller.current.abort();
      timeout.current && clearTimeout(timeout.current);
    };
  }, []);

  return useMemo(
    () => ({ store, start, restart, stop, set }),
    [stop, restart, start, set, store],
  );
}

export { useTimer };
