/*
 * 轻量埋点工具：PV、点击、批量上报
 */
import { reportTrackBatch } from '@/api/track';

type TrackEvent = {
  event: string;
  ts: number;
  props?: Record<string, any>;
};

const queue: TrackEvent[] = [];
let timer: any = null;

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

function scheduleFlush() {
  if (timer) return;
  timer = setTimeout(() => {
    timer = null;
    flush();
  }, 3000);
}

export function track(event: string, props?: Record<string, any>) {
  queue.push({ event, ts: Date.now(), props });
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

export default { track, trackPV, bindClickTracking };


