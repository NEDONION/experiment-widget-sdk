import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AssignData } from '../src/types';
import { ExpWidget } from '../src/widget';

const getMock = vi.fn<[], Promise<AssignData>>();
const postMock = vi.fn();
const sendBeaconMock = vi.fn();

vi.mock('../src/api', () => {
  return {
    ApiClient: class {
      get = getMock;
      post = postMock;
      sendBeacon = sendBeaconMock;
    },
  };
});

const setAnonId = (id: string) => {
  localStorage.setItem('experiment_widget_anon_id', id);
  return id;
};

const setCachedCreative = (
  experimentId: string,
  userKey: string,
  creative: AssignData,
  ts: number
) => {
  const cacheKey = `exp_widget_cache_${experimentId}_${userKey}`;
  localStorage.setItem(
    cacheKey,
    JSON.stringify({
      data: creative,
      ts,
    })
  );
  return cacheKey;
};

const getTitleText = (): string | null => {
  const root = document.getElementById('experiment-widget-root') as HTMLElement | null;
  const shadow = root?.shadowRoot as ShadowRoot | null;
  return shadow?.getElementById('title')?.textContent ?? null;
};

const readCached = (cacheKey: string) => {
  const raw = localStorage.getItem(cacheKey);
  return raw ? JSON.parse(raw) : null;
};

describe('ExpWidget caching behavior', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
    getMock.mockReset();
    postMock.mockReset();
    sendBeaconMock.mockReset();

    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('renders cached creative immediately while fetch is pending', async () => {
    const anonId = setAnonId('anon_test');
    const cacheKey = setCachedCreative(
      'experiment123',
      anonId,
      { creative_id: 1, title: 'Cached Title' },
      Date.now() - 1_000
    );

    getMock.mockImplementation(
      () =>
        new Promise<AssignData>((resolve) =>
          setTimeout(() => resolve({ creative_id: 2, title: 'Network Title' }), 20)
        )
    );

    const widget = new ExpWidget({ apiBase: 'https://example.com', experimentId: 'experiment123' });

    expect(getTitleText()).toBe('Cached Title');
    await vi.waitFor(() => expect(getTitleText()).toBe('Network Title'), { timeout: 200 });

    expect(getTitleText()).toBe('Network Title');
    expect(readCached(cacheKey)?.data?.title).toBe('Network Title');

    widget.destroy();
  });

  it('skips rerender when creative_id is unchanged and refreshes cache timestamp', async () => {
    const anonId = setAnonId('anon_same');
    const oldTs = Date.now() - 60_000;
    const cacheKey = setCachedCreative(
      'exp_same',
      anonId,
      { creative_id: '100', title: 'Cached' },
      oldTs
    );

    getMock.mockResolvedValue({ creative_id: '100', title: 'Server Title' });

    const widget = new ExpWidget({ apiBase: 'https://example.com', experimentId: 'exp_same' });

    await vi.waitFor(() => expect(getMock).toHaveBeenCalled(), { timeout: 200 });
    await vi.waitFor(() => {
      const cached = readCached(cacheKey);
      expect(cached.ts).toBeGreaterThan(oldTs);
    });

    const cached = readCached(cacheKey);
    expect(cached.data.creative_id).toBe('100');
    expect(getTitleText()).toBe('Cached');

    widget.destroy();
  });

  it('rerenders and updates cache when a new creative arrives', async () => {
    const anonId = setAnonId('anon_new');
    const cacheKey = setCachedCreative(
      'exp_new',
      anonId,
      { creative_id: 'a', title: 'Old Title' },
      Date.now() - 60_000
    );

    getMock.mockResolvedValue({ creative_id: 'b', title: 'Fresh Title' });

    const widget = new ExpWidget({ apiBase: 'https://example.com', experimentId: 'exp_new' });

    await vi.waitFor(() => expect(getTitleText()).toBe('Fresh Title'), { timeout: 200 });

    const cached = readCached(cacheKey);
    expect(cached.data.creative_id).toBe('b');
    expect(cached.data.title).toBe('Fresh Title');

    widget.destroy();
  });
});
