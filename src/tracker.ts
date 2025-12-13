import type { ApiClient } from './api';

export class ImpressionTracker {
  private observer: IntersectionObserver | null = null;
  private trackedIds = new Set<string | number>();
  private apiClient: ApiClient;
  private experimentId: string;
  private anonId: string;
  private timers = new Map<Element, number>();

  constructor(apiClient: ApiClient, experimentId: string, anonId: string) {
    this.apiClient = apiClient;
    this.experimentId = experimentId;
    this.anonId = anonId;
  }

  track(element: Element, creativeId: string | number): void {
    console.log('[Impression] Starting to track element:', element, 'creative_id:', creativeId);

    if (this.trackedIds.has(creativeId)) {
      console.log('[Impression] Already tracked, skipping:', creativeId);
      return;
    }

    if (!this.observer) {
      console.log('[Impression] Creating IntersectionObserver');
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const el = entry.target;
            const cid = el.getAttribute('data-creative-id');

            console.log('[Impression] Observer callback:', {
              creative_id: cid,
              isIntersecting: entry.isIntersecting,
              intersectionRatio: entry.intersectionRatio,
              boundingClientRect: entry.boundingClientRect,
            });

            if (!cid) {
              console.warn('[Impression] No creative_id attribute found on element');
              return;
            }

            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
              // Start timer for 500ms visibility
              if (!this.timers.has(el)) {
                console.log('[Impression] Element visible ≥50%, starting 500ms timer for:', cid);
                const timer = window.setTimeout(() => {
                  console.log('[Impression] Timer fired, sending impression for:', cid);
                  this.sendImpression(cid);
                  this.timers.delete(el);
                }, 500);
                this.timers.set(el, timer);
              }
            } else {
              // Clear timer if element is no longer visible
              const timer = this.timers.get(el);
              if (timer) {
                console.log('[Impression] Element no longer visible, clearing timer for:', cid);
                window.clearTimeout(timer);
                this.timers.delete(el);
              }
            }
          });
        },
        {
          threshold: 0.5,
        }
      );
    }

    element.setAttribute('data-creative-id', String(creativeId));
    console.log('[Impression] Observing element with creative_id:', creativeId);
    this.observer.observe(element);
  }

  private sendImpression(creativeId: string | number): void {
    if (this.trackedIds.has(creativeId)) {
      return;
    }

    this.trackedIds.add(creativeId);

    const payload = {
      creative_id: creativeId,
    };

    console.log('[Impression] Sending:', payload);

    this.apiClient.post(`/experiments/${this.experimentId}/hit`, payload).catch((error) => {
      console.error('❌❌❌ [IMPRESSION FAILED] ❌❌❌');
      console.error('❌ Creative ID:', creativeId);
      console.error('❌ Experiment ID:', this.experimentId);
      console.error('❌ Error:', error.message);
      console.error('❌ Full error:', error);
    });
  }

  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    this.timers.forEach((timer) => window.clearTimeout(timer));
    this.timers.clear();
  }
}

export class ClickTracker {
  private apiClient: ApiClient;
  private experimentId: string;
  private anonId: string;

  constructor(apiClient: ApiClient, experimentId: string, anonId: string) {
    this.apiClient = apiClient;
    this.experimentId = experimentId;
    this.anonId = anonId;
  }

  track(creativeId: string | number): void {
    const payload = {
      creative_id: creativeId,
    };

    console.log('[Click] Sending:', payload);

    this.apiClient.sendBeacon(`/experiments/${this.experimentId}/click`, payload);
  }
}
