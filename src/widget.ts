import { ApiClient } from './api';
import { ImpressionTracker, ClickTracker } from './tracker';
import { widgetStyles } from './styles';
import type { WidgetConfig, AssignData } from './types';

export class ExpWidget {
  private config: WidgetConfig;
  private apiClient: ApiClient;
  private impressionTracker: ImpressionTracker;
  private clickTracker: ClickTracker;
  private anonId: string;
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

    // Append to body
    document.body.appendChild(this.container);

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

    status.style.display = 'block';
    status.textContent = 'Assigning...';
    card.classList.remove('visible');

    try {
      // 如果启用随机分配，每次使用不同的随机ID
      const userKey = this.config.randomAssignment
        ? `random_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        : (this.config.userKey || this.anonId);

      const data = await this.apiClient.get<AssignData>(
        `/experiments/${this.config.experimentId}/assign?user_key=${encodeURIComponent(userKey)}`
      );

      if (data && data.creative_id) {
        this.renderCreative(data);
      } else {
        status.textContent = 'No creative assigned';
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      status.textContent = `Assignment error: ${message}`;
    }
  }

  private renderCreative(data: AssignData): void {
    this.creativeId = data.creative_id;

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
    this.impressionTracker.track(card, this.creativeId);
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
}
