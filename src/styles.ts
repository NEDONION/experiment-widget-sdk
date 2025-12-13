export const widgetStyles = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .exp-widget-container {
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: auto;
    top: auto;
    transform: none;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    line-height: 1.5;
  }

  .exp-widget-badge {
    width: 60px;
    height: 60px;
    border-radius: 16px;
    background: linear-gradient(135deg, #0f172a 0%, #3b82f6 60%, #22d3ee 100%);
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    color: white;
    gap: 2px;
    padding: 8px;
    font-size: 13px;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .exp-widget-badge-icon {
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .exp-widget-badge-label {
    font-size: 11px;
    opacity: 0.85;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .exp-widget-badge:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  .exp-widget-badge.hidden {
    display: none;
  }

  .exp-widget-panel {
    width: 320px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    display: none;
    flex-direction: column;
  }

  .exp-widget-panel.visible {
    display: flex;
  }

  .exp-widget-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  .exp-widget-header-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #64748b;
    font-weight: 500;
  }

  .exp-widget-chip {
    font-size: 11px;
    color: #0f172a;
    background: #e0f2fe;
    border: 1px solid #bae6fd;
    border-radius: 999px;
    padding: 3px 8px;
    font-weight: 600;
    letter-spacing: 0.2px;
  }

  .exp-widget-toggle {
    background: #e2e8f0;
    border: none;
    padding: 6px 12px;
    border-radius: 12px;
    font-size: 11px;
    color: #475569;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s;
  }

  .exp-widget-toggle:hover {
    background: #cbd5e1;
  }

  .exp-widget-body {
    padding: 16px;
  }

  .exp-widget-status {
    text-align: center;
    padding: 24px;
    color: #64748b;
  }

  .exp-widget-card {
    display: none;
    flex-direction: row;
    gap: 12px;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .exp-widget-card.visible {
    display: flex;
  }

  .exp-widget-card:hover {
    transform: translateY(-2px);
  }

  .exp-widget-thumbnail {
    width: 80px;
    height: 80px;
    border-radius: 12px;
    background: linear-gradient(135deg, #38bdf8, #a78bfa);
    flex-shrink: 0;
    background-size: cover;
    background-position: center;
  }

  .exp-widget-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .exp-widget-eyebrow {
    font-size: 10px;
    color: #94a3b8;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .exp-widget-title {
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .exp-widget-meta {
    font-size: 12px;
    color: #64748b;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .exp-widget-desc {
    font-size: 12px;
    color: #3b82f6;
    font-weight: 500;
    margin-top: 4px;
  }

  .exp-widget-toast {
    position: fixed;
    bottom: 80px;
    left: 20px;
    right: auto;
    top: auto;
    transform: none;
    background: #0f172a;
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 13px;
    max-width: 280px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    opacity: 0;
    transition: opacity 0.25s;
    display: none;
  }

  .exp-widget-toast.visible {
    display: block;
    opacity: 1;
  }
`;
