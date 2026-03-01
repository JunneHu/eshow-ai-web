import request from '@/utils/request';

function loadOrCreateDistinctId() {
  try {
    const key = 'eshow_distinct_id';
    const stored = localStorage.getItem(key);
    if (stored) return stored;
    const id = `d_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
    localStorage.setItem(key, id);
    return id;
  } catch {
    return `d_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
  }
}

type TrackEvent = {
  event: string;
  ts: number;
  props?: Record<string, any>;
};

function joinUrl(base: string, path: string) {
  const b = (base || '').replace(/\/+$/, '');
  const p = (path || '').startsWith('/') ? path : `/${path || ''}`;
  return `${b}${p}`;
}

function buildTrackList(events: TrackEvent[]) {
  const distinctId = loadOrCreateDistinctId();

  return (events || []).map((e) => {
    const props = e && e.props ? { ...e.props } : {};

    const toolId = props.toolId;
    const adId = props.adId;
    const newsId = props.newsId;
    const position = props.position;
    const path = props.path || window.location.pathname;

    delete props.toolId;
    delete props.adId;
    delete props.newsId;
    delete props.position;
    delete props.path;

    return {
      eventType: e.event,
      distinctId,
      toolId,
      adId,
      newsId,
      position,
      path,
      props: {
        ts: e.ts,
        ...props,
      },
    };
  });
}

export const reportTrackBatch = (events: TrackEvent[]) => {
  const list = buildTrackList(events);
  return request.post<any>('/api/public/events/batch', { list });
};

export const reportTrackBatchBeacon = (events: TrackEvent[]) => {
  try {
    const list = buildTrackList(events);
    const url = joinUrl(window.configs.host.webapi, '/api/public/events/batch');

    const data = JSON.stringify({ list });
    const blob = new Blob([data], { type: 'application/json' });

    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      return navigator.sendBeacon(url, blob);
    }
    return false;
  } catch {
    return false;
  }
};
