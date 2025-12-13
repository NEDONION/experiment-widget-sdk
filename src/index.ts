import { ExpWidget } from './widget';
import type { WidgetConfig } from './types';

// IIFE - Self-executing function
(function initExperimentWidget() {
  // Prevent multiple initialization
  if ((window as any).__EXPERIMENT_WIDGET_LOADED__) {
    console.warn('[ExperimentWidget] Already loaded, skipping initialization');
    return;
  }

  (window as any).__EXPERIMENT_WIDGET_LOADED__ = true;

  // Get the current script tag
  const currentScript = document.currentScript as HTMLScriptElement;

  if (!currentScript) {
    console.error('[ExperimentWidget] Cannot find script tag, initialization failed');
    return;
  }

  // Read configuration from data attributes
  const apiBase = currentScript.dataset.apiBase;
  const experimentId = currentScript.dataset.experimentId;
  const userKey = currentScript.dataset.userKey;
  const randomAssignment = currentScript.dataset.randomAssignment === 'true';

  // Validate required parameters
  if (!apiBase) {
    console.error('[ExperimentWidget] Missing required attribute: data-api-base');
    return;
  }

  if (!experimentId) {
    console.error('[ExperimentWidget] Missing required attribute: data-experiment-id');
    return;
  }

  const config: WidgetConfig = {
    apiBase,
    experimentId,
    userKey,
    randomAssignment,
  };

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new ExpWidget(config);
    });
  } else {
    new ExpWidget(config);
  }
})();
