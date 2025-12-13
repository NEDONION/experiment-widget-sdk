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
    if (this.trackedIds.has(creativeId)) {
      return;
    }

    if (!this.observer) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const el = entry.target;
            const cid = el.getAttribute('data-creative-id');

            if (!cid) return;

            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
              // Start timer for 500ms visibility
              if (!this.timers.has(el)) {
                const timer = window.setTimeout(() => {
                  this.sendImpression(cid);
                  this.timers.delete(el);
                }, 500);
                this.timers.set(el, timer);
              }
            } else {
              // Clear timer if element is no longer visible
              const timer = this.timers.get(el);
              if (timer) {
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
    this.observer.observe(element);
  }

  private sendImpression(creativeId: string | number): void {
    if (this.trackedIds.has(creativeId)) {
      return;
    }

    this.trackedIds.add(creativeId);

    this.apiClient.post(`/experiments/${this.experimentId}/hit`, {
      creative_id: creativeId,
      anon_id: this.anonId,
      ts: Date.now(),
      page_url: window.location.href,
    }).catch(() => {
      // Silent fail
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
    this.apiClient.sendBeacon(`/experiments/${this.experimentId}/click`, {
      creative_id: creativeId,
      anon_id: this.anonId,
      ts: Date.now(),
      page_url: window.location.href,
    });
  }
}
