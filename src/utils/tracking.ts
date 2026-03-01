/*
 * 轻量埋点工具：PV、点击、批量上报
 */
import { reportTrackBatch, reportTrackBatchBeacon } from '../api/track';

type TrackEvent = {
  event: string;
  ts: number;
  props?: Record<string, any>;
};

const queue: TrackEvent[] = [];
let timer: any = null;

const IMMEDIATE_FLUSH_EVENTS = new Set(['comment_submit', 'tool_click_official', 'ad_click', 'news_view', 'news_click']);

function flush() {
  if (queue.length === 0) return;
  const payload = queue.splice(0, queue.length);
  try {
    reportTrackBatch(payload).catch(() => {
      // 静默失败
    });
  } catch (e) {
    // 静默失败
  }
}

function flushWithBeacon() {
  if (queue.length === 0) return;
  const payload = queue.splice(0, queue.length);

  let ok = false;
  try {
    ok = reportTrackBatchBeacon(payload);
  } catch {
    ok = false;
  }

  if (ok) return;
  try {
    reportTrackBatch(payload).catch(() => {
      // 静默失败
    });
  } catch {
    // 静默失败
  }
}

function scheduleFlush() {
  if (timer) return;
  timer = setTimeout(() => {
    timer = null;
    flush();
  }, 3000);
}

export function track(event: string, props?: Record<string, any>) {
  queue.push({ event, ts: Date.now(), props });
  if (IMMEDIATE_FLUSH_EVENTS.has(event)) {
    flush();
    return;
  }
  if (queue.length >= 10) {
    flush();
  } else {
    scheduleFlush();
  }
}

export function trackPV(pathname: string) {
  track('page_view', { pathname, referrer: document.referrer });
}

export function bindClickTracking(root: HTMLElement | Document = document) {
  root.addEventListener(
    'click',
    (e: any) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      const key = target.getAttribute('data-track-key');
      if (key) {
        track('click', { key });
      }
    },
    true,
  );
}

export function initTrackingUnloadFlush() {
  if (typeof window === 'undefined') return;

  const onHidden = () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      flushWithBeacon();
    }
  };

  const onPageHide = () => {
    flushWithBeacon();
  };

  window.addEventListener('pagehide', onPageHide);
  document.addEventListener('visibilitychange', onHidden);

  return () => {
    window.removeEventListener('pagehide', onPageHide);
    document.removeEventListener('visibilitychange', onHidden);
  };
}

export default { track, trackPV, bindClickTracking, initTrackingUnloadFlush };


