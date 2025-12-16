export interface WidgetConfig {
  apiBase: string;
  experimentId: string;
  userKey?: string;
  randomAssignment?: boolean; // true: 每次随机, false: 固定分配
  /**
   * 缓存时长，毫秒。默认 1 小时。设置为 0 或 disableCache=true 可关闭缓存。
   */
  cacheTTL?: number;
  /**
   * 显式关闭缓存，避免与随机分配冲突。
   */
  disableCache?: boolean;
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
