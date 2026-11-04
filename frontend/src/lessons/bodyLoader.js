// Purpose: load many lesson bodies FAST after sign-in (pure scheduler, tested).
//  * concurrency (default 6) instead of one-by-one;
//  * priority: the lesson the user has open is fetched next (prioritize(key));
//  * results are delivered in small batches (onBatch every `flushMs`), so the
//    app re-renders a few times instead of once per lesson;
//  * progress { done, total, failed } for the «N از M» indicator.
// `read(key)` is injected (Firestore body store in the app, a fake in tests).

export function createBodyLoader({ read, keys, concurrency = 6, flushMs = 250, onBatch, onProgress, setTimer = setTimeout }) {
  const queue = [...new Set(keys)];
  const total = queue.length;
  let done = 0;
  let failed = 0;
  let running = 0;
  let stopped = false;
  let buffer = [];
  let timer = null;
  let resolveAll;
  const finished = new Promise((r) => { resolveAll = r; });

  const flush = () => {
    timer = null;
    if (!buffer.length) return;
    const batch = buffer;
    buffer = [];
    onBatch?.(batch);
  };
  const scheduleFlush = () => { if (!timer) timer = setTimer(flush, flushMs); };
  const report = () => onProgress?.({ done, total, failed });

  const pump = () => {
    if (stopped) return;
    while (running < concurrency && queue.length) {
      const key = queue.shift();
      running += 1;
      Promise.resolve()
        .then(() => read(key))
        .then((res) => { buffer.push({ key, ...res }); }, (error) => { failed += 1; buffer.push({ key, error }); })
        .finally(() => {
          running -= 1;
          done += 1;
          scheduleFlush();
          report();
          if (done === total) { flush(); resolveAll({ done, total, failed }); } else pump();
        });
    }
  };

  report();
  if (!total) resolveAll({ done, total, failed });
  pump();
  return {
    finished,
    /** Move a still-queued key to the front (the lesson the user opened). */
    prioritize(key) {
      const i = queue.indexOf(key);
      if (i > 0) { queue.splice(i, 1); queue.unshift(key); }
    },
    stop() { stopped = true; },
    get progress() { return { done, total, failed }; },
  };
}
