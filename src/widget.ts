import { ApiClient } from './api';
import { ImpressionTracker, ClickTracker } from './tracker';
import { widgetStyles } from './styles';
import type { WidgetConfig, AssignData, ApiResponse } from './types';

export class ExpWidget {
  private config: WidgetConfig;
  private apiClient: ApiClient;
  private impressionTracker: ImpressionTracker;
  private clickTracker: ClickTracker;
  private anonId: string;
  private cacheKey: string | null;
  private cacheTTL: number;
  private hasCachedRender = false;
  private cachedCreative: AssignData | null = null;
  private container: HTMLElement;
  private shadowRoot: ShadowRoot;
  private creativeId: string | number | null = null;
  private isOpen = false;
  private toastTimer: number | null = null;

  constructor(config: WidgetConfig) {
    this.config = config;
    this.apiClient = new ApiClient(config.apiBase);
    this.anonId = this.getOrCreateAnonId();
    this.impressionTracker = new ImpressionTracker(
      this.apiClient,
      config.experimentId,
      this.anonId
    );
    this.clickTracker = new ClickTracker(
      this.apiClient,
      config.experimentId,
      this.anonId
    );
    const ttlFromConfig = Number.isFinite(this.config.cacheTTL)
      ? (this.config.cacheTTL as number)
      : 10 * 60 * 1000;
    this.cacheTTL = Math.max(0, ttlFromConfig);
    this.cacheKey = this.shouldUseCache() ? this.buildCacheKey() : null;

    // Create container and shadow DOM
    this.container = document.createElement('div');
    this.container.id = 'experiment-widget-root';
    this.shadowRoot = this.container.attachShadow({ mode: 'open' });

    // Inject styles
    const styleEl = document.createElement('style');
    styleEl.textContent = widgetStyles;
    this.shadowRoot.appendChild(styleEl);

    // Create UI
    this.createUI();

    const cachedCreative = this.loadCachedCreative();
    this.cachedCreative = cachedCreative;

    // Append to body
    document.body.appendChild(this.container);

    if (cachedCreative) {
      this.hasCachedRender = true;
      this.renderCreative(cachedCreative);
    }

    // Start assignment
    this.assign();
  }

  private getOrCreateAnonId(): string {
    const key = 'experiment_widget_anon_id';
    let id = localStorage.getItem(key);

    if (!id) {
      id = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(key, id);
    }

    return id;
  }

  private createUI(): void {
    const wrapper = document.createElement('div');
    wrapper.className = 'exp-widget-container';

    wrapper.innerHTML = `
      <div class="exp-widget-badge" id="badge" aria-label="A/B experiment ads">
        <span class="exp-widget-badge-icon">A/B</span>
        <span class="exp-widget-badge-label">Ads</span>
      </div>
      <div class="exp-widget-panel" id="panel">
        <div class="exp-widget-header">
          <div class="exp-widget-header-title">
            <span>Sponsored</span>
            <span class="exp-widget-chip">A/B Ads</span>
          </div>
          <button class="exp-widget-toggle" id="toggle">Hide</button>
        </div>
        <div class="exp-widget-body" id="body">
          <div class="exp-widget-status" id="status">Assigning...</div>
          <div class="exp-widget-card" id="card">
            <div class="exp-widget-thumbnail" id="thumbnail"></div>
            <div class="exp-widget-info">
              <div class="exp-widget-eyebrow">A/B Experiment</div>
              <div class="exp-widget-title" id="title"></div>
              <div class="exp-widget-meta" id="meta"></div>
              <div class="exp-widget-desc" id="desc"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="exp-widget-toast" id="toast"></div>
    `;

    this.shadowRoot.appendChild(wrapper);

    // Attach event listeners
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const badge = this.shadowRoot.getElementById('badge');
    const toggle = this.shadowRoot.getElementById('toggle');
    const card = this.shadowRoot.getElementById('card');

    badge?.addEventListener('click', () => this.togglePanel(true));
    toggle?.addEventListener('click', () => this.togglePanel());
    card?.addEventListener('click', () => this.handleCardClick());
  }

  private togglePanel(forceOpen?: boolean): void {
    this.isOpen = forceOpen ?? !this.isOpen;

    const badge = this.shadowRoot.getElementById('badge');
    const panel = this.shadowRoot.getElementById('panel');
    const toggle = this.shadowRoot.getElementById('toggle');

    if (badge && panel && toggle) {
      if (this.isOpen) {
        badge.classList.add('hidden');
        panel.classList.add('visible');
        toggle.textContent = 'Hide';
      } else {
        badge.classList.remove('hidden');
        panel.classList.remove('visible');
        toggle.textContent = 'Show';
      }
    }
  }

  private async assign(): Promise<void> {
    const status = this.shadowRoot.getElementById('status');
    const card = this.shadowRoot.getElementById('card');

    if (!status || !card) return;

    if (!this.hasCachedRender) {
      status.style.display = 'block';
      status.textContent = 'Assigning...';
      card.classList.remove('visible');
    } else {
      status.style.display = 'none';
    }

    try {
      // 如果启用随机分配，每次使用不同的随机ID
      const userKey = this.config.randomAssignment
        ? `random_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        : (this.config.userKey || this.anonId);

      const data = await this.apiClient.get<AssignData | ApiResponse<AssignData>>(
        `/experiments/${this.config.experimentId}/assign?user_key=${encodeURIComponent(userKey)}`
      );

      const creative = this.extractCreativePayload(data);

      if (creative) {
        const isSameCreative = this.cachedCreative
          ? this.isSameCreative(this.cachedCreative, creative)
          : false;

        if (isSameCreative) {
          this.cachedCreative = creative;
          this.refreshCacheTimestamp();
          return;
        }

        this.cachedCreative = creative;
        this.saveCreativeToCache(creative);
        this.hasCachedRender = false;
        this.renderCreative(creative);
      } else {
        status.textContent = 'No creative assigned';
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌❌❌ [ASSIGNMENT FAILED] ❌❌❌');
      console.error('❌ Experiment ID:', this.config.experimentId);
      console.error('❌ Error:', message);
      console.error('❌ Full error:', error);
      const fallback = this.cachedCreative || this.loadCachedCreative(true);
      if (fallback) {
        this.hasCachedRender = true;
        this.renderCreative(fallback);
        return;
      }
      if (!this.hasCachedRender) {
        status.textContent = `Assignment error: ${message}`;
      }
    }
  }

  private renderCreative(data: AssignData): void {
    const normalizedCreativeId = this.normalizeCreativeId(data.creative_id);
    this.creativeId = normalizedCreativeId;

    const status = this.shadowRoot.getElementById('status');
    const card = this.shadowRoot.getElementById('card');
    const thumbnail = this.shadowRoot.getElementById('thumbnail');
    const title = this.shadowRoot.getElementById('title');
    const meta = this.shadowRoot.getElementById('meta');
    const desc = this.shadowRoot.getElementById('desc');

    if (!status || !card || !thumbnail || !title || !meta || !desc) return;

    status.style.display = 'none';

    const titleText = data.title || data.product_name || `Creative #${this.creativeId}`;
    title.textContent = titleText;

    const selling =
      data.selling_points && data.selling_points.length > 0
        ? data.selling_points.slice(0, 2).join(' · ')
        : '';
    meta.textContent = selling || data.product_name || 'Tap to view details';

    desc.textContent = data.cta_text || 'Learn more';

    if (data.image_url) {
      thumbnail.style.backgroundImage = `url(${data.image_url})`;
      thumbnail.style.backgroundSize = 'cover';
    } else {
      thumbnail.style.backgroundImage = 'linear-gradient(135deg, #38bdf8, #a78bfa)';
      thumbnail.style.backgroundSize = 'auto';
    }

    card.classList.add('visible');

    // Start tracking impression
    this.impressionTracker.track(card, normalizedCreativeId);
  }

  private handleCardClick(): void {
    if (!this.creativeId) return;

    this.clickTracker.track(this.creativeId);

    const toast = this.shadowRoot.getElementById('toast');
    if (!toast) return;

    toast.textContent = 'Click collected for A/B experiment. Thanks for your feedback.';
    toast.classList.add('visible');

    if (this.toastTimer) {
      window.clearTimeout(this.toastTimer);
    }

    this.toastTimer = window.setTimeout(() => {
      toast.classList.remove('visible');
    }, 1800);
  }

  destroy(): void {
    this.impressionTracker.destroy();

    if (this.toastTimer) {
      window.clearTimeout(this.toastTimer);
    }

    this.container.remove();
  }

  // 将字符串数字转换为 number，避免后端要求整型时解析失败
  private normalizeCreativeId(id: string | number): string | number {
    if (typeof id === 'string') {
      const numeric = Number(id);
      if (!Number.isNaN(numeric) && Number.isFinite(numeric)) {
        return numeric;
      }
    }
    return id;
  }

  // 兼容 API 返回两种格式：
  // 1) 直接返回创意字段 { creative_id, ... }
  // 2) 包一层 { code, data: { creative_id, ... } }
  private extractCreativePayload(
    data: AssignData | ApiResponse<AssignData>
  ): AssignData | null {
    if ((data as AssignData)?.creative_id) {
      return data as AssignData;
    }
    if (
      (data as ApiResponse<AssignData>)?.data &&
      (data as ApiResponse<AssignData>).data?.creative_id
    ) {
      return (data as ApiResponse<AssignData>).data as AssignData;
    }
    return null;
  }

  private shouldUseCache(): boolean {
    if (this.config.disableCache) {
      return false;
    }
    if (this.config.randomAssignment) {
      return false;
    }
    return true;
  }

  private buildCacheKey(): string {
    const userKey = this.config.userKey || this.anonId;
    return `exp_widget_cache_${this.config.experimentId}_${userKey}`;
  }

  private loadCachedCreative(allowExpired = false): AssignData | null {
    if (!this.cacheKey || this.cacheTTL === 0) return null;

    try {
      const raw = localStorage.getItem(this.cacheKey);
      if (!raw) return null;

      const cached: CachedCreative = JSON.parse(raw);
      if (!cached?.data || !cached.ts) {
        return null;
      }

      const isExpired = Date.now() - cached.ts > this.cacheTTL;
      if (isExpired) {
        if (!allowExpired) {
          localStorage.removeItem(this.cacheKey);
          return null;
        }
      }

      return cached.data;
    } catch (error) {
      console.warn('[ExperimentWidget] Failed to read cache', error);
      return null;
    }
  }

  private saveCreativeToCache(data: AssignData): void {
    if (!this.cacheKey || this.cacheTTL === 0) return;

    const payload: CachedCreative = {
      data,
      ts: Date.now(),
    };

    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(payload));
    } catch (error) {
      console.warn('[ExperimentWidget] Failed to save cache', error);
    }
  }

  private refreshCacheTimestamp(): void {
    if (!this.cacheKey || this.cacheTTL === 0) return;
    try {
      const raw = localStorage.getItem(this.cacheKey);
      if (!raw) return;
      const cached: CachedCreative = JSON.parse(raw);
      if (!cached?.data) return;
      cached.ts = Date.now();
      localStorage.setItem(this.cacheKey, JSON.stringify(cached));
    } catch (error) {
      console.warn('[ExperimentWidget] Failed to refresh cache timestamp', error);
    }
  }

  private isSameCreative(a: AssignData, b: AssignData): boolean {
    return this.normalizeCreativeId(a.creative_id) === this.normalizeCreativeId(b.creative_id);
  }
}

interface CachedCreative {
  data: AssignData;
  ts: number;
}
