import * as React from 'react';

type ApiOptions = Omit<RequestInit, 'body'> & { body?: Record<string, unknown> };

type AssignData = {
    creative_id: string | number;
    title?: string;
    product_name?: string;
    cta_text?: string;
    image_url?: string;
    selling_points?: string[];
};

const API_BASE =
    process.env.NEXT_PUBLIC_EXP_WIDGET_API_BASE || 'http://localhost:4000/api/v1';
const EXPERIMENT_ID =
    process.env.NEXT_PUBLIC_EXP_WIDGET_EXPERIMENT_ID || 'your-experiment-id';
const USER_KEY = process.env.NEXT_PUBLIC_EXP_WIDGET_USER_KEY || '';

export default function ExperimentWidget() {
    React.useEffect(() => {
        const root = document.getElementById('exp-widget');
        if (!root) return;

        root.innerHTML = `
      <div class="ad">
        <div class="hdr"><span>Sponsored</span><div class="pill" id="exp-toggle">Hide</div></div>
        <div class="body" id="exp-body">
          <div class="status" id="exp-status">Assigning...</div>
          <div class="card" id="exp-card" style="display:none">
            <div class="th" id="exp-thumb"></div>
            <div class="info">
              <div class="eyebrow">A/B Experiment</div>
              <div class="title" id="exp-title"></div>
              <div class="meta" id="exp-meta"></div>
              <div class="desc" id="exp-desc"></div>
            </div>
            <div class="cta-chip" id="exp-cta">View</div>
          </div>
        </div>
        <div id="exp-toast" class="toast" style="display:none"></div>
      </div>
    `;

        const api = async (path: string, opts: ApiOptions = {}) => {
            const { body, ...rest } = opts;
            const res = await fetch(`${API_BASE}${path}`, {
                headers: { 'Content-Type': 'application/json' },
                ...rest,
                body: body ? JSON.stringify(body) : undefined,
            });

            return res.json();
        };

        const bodyEl = root.querySelector<HTMLElement>('#exp-body');
        const statusEl = root.querySelector<HTMLElement>('#exp-status');
        const cardEl = root.querySelector<HTMLElement>('#exp-card');
        const titleEl = root.querySelector<HTMLElement>('#exp-title');
        const metaEl = root.querySelector<HTMLElement>('#exp-meta');
        const descEl = root.querySelector<HTMLElement>('#exp-desc');
        const thumbEl = root.querySelector<HTMLElement>('#exp-thumb');
        const toggleEl = root.querySelector<HTMLElement>('#exp-toggle');
        const toastEl = root.querySelector<HTMLElement>('#exp-toast');

        if (
            !bodyEl ||
            !statusEl ||
            !cardEl ||
            !titleEl ||
            !metaEl ||
            !descEl ||
            !thumbEl ||
            !toggleEl ||
            !toastEl
        )
            return undefined;

        let creativeId: string | number | null = null;
        let creativeData: AssignData | null = null;
        let open = true;
        let cancelled = false;
        let toastTimer: number | null = null;

        toggleEl.onclick = () => {
            open = !open;
            bodyEl.style.display = open ? 'block' : 'none';
            toggleEl.innerHTML = open ? 'Hide' : 'Show';
        };

        const assign = async () => {
            statusEl.style.display = 'block';
            statusEl.innerText = 'Assigning...';
            cardEl.style.display = 'none';

            if (!EXPERIMENT_ID) {
                statusEl.innerText = 'Experiment ID missing';
                return;
            }

            try {
                const res = await api(
                    `/experiments/${EXPERIMENT_ID}/assign?user_key=${encodeURIComponent(USER_KEY)}`
                );

                if (cancelled) return;

                if (res.code === 0 && res.data) {
                    creativeId = res.data.creative_id;
                    creativeData = res.data as AssignData;
                    statusEl.style.display = 'none';
                    const titleText =
                        creativeData.title || creativeData.product_name || `Creative #${creativeId}`;
                    titleEl.innerText = titleText;

                    const selling =
                        creativeData.selling_points && creativeData.selling_points.length > 0
                            ? creativeData.selling_points.slice(0, 2).join(' · ')
                            : '';
                    metaEl.innerText = selling || creativeData.product_name || 'Tap to view details';

                    descEl.innerText = creativeData.cta_text || 'Learn more';
                    thumbEl.style.backgroundImage = creativeData.image_url
                        ? `url(${creativeData.image_url})`
                        : 'linear-gradient(135deg, #38bdf8, #a78bfa)';
                    thumbEl.style.backgroundSize = creativeData.image_url ? 'cover' : 'auto';

                    cardEl.style.display = 'flex';
                    cardEl.setAttribute('data-ready', 'true');

                    api(`/experiments/${EXPERIMENT_ID}/hit`, {
                        method: 'POST',
                        body: { creative_id: creativeId },
                    }).catch(() => {});
                } else {
                    statusEl.style.display = 'block';
                    statusEl.innerText = res.message || 'Assignment failed';
                }
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                statusEl.style.display = 'block';
                statusEl.innerText = `Assignment error: ${message}`;
            }
        };

        cardEl.onclick = () => {
            if (!creativeId) return;

            api(`/experiments/${EXPERIMENT_ID}/click`, {
                method: 'POST',
                body: { creative_id: creativeId },
            }).catch(() => {});

            toastEl.innerText =
                'Click collected for A/B experiment. Thanks for your feedback.';
            toastEl.style.display = 'block';
            toastEl.style.opacity = '1';

            if (toastTimer) window.clearTimeout(toastTimer);
            toastTimer = window.setTimeout(() => {
                toastEl.style.opacity = '0';
                toastTimer = window.setTimeout(() => {
                    toastEl.style.display = 'none';
                }, 250);
            }, 1800);
        };

        assign();

        return () => {
            cancelled = true;
            toggleEl.onclick = null;
            cardEl.onclick = null;
            if (toastTimer) window.clearTimeout(toastTimer);
        };
    }, []);

    return <div id='exp-widget' className='exp-widget' />;
}
