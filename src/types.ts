export interface WidgetConfig {
  apiBase: string;
  experimentId: string;
  userKey?: string;
  randomAssignment?: boolean; // true: 每次随机, false: 固定分配
  position?: WidgetPosition;
}

export type WidgetPosition =
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left'
  | 'left'
  | 'right';

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
