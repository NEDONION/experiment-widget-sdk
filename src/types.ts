export interface WidgetConfig {
  apiBase: string;
  experimentId: string;
  userKey?: string;
}

export interface AssignData {
  creative_id: string | number;
  title?: string;
  product_name?: string;
  cta_text?: string;
  image_url?: string;
  selling_points?: string[];
}

export interface ApiResponse<T = any> {
  code: number;
  message?: string;
  data?: T;
}

export interface TrackingEvent {
  event: 'impression' | 'click';
  creative_id: string | number;
  anon_id: string;
  experiment_id: string;
  ts: number;
  page_url: string;
}
