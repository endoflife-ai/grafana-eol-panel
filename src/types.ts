export interface EolPanelOptions {
  products: string;
  apiKey: string;
  showScore: boolean;
  showEolDate: boolean;
  alertOnEol: boolean;
}

export interface EolStatus {
  slug: string;
  version: string;
  // 'not-tracked': endoflife.ai does not track the product or version (HTTP 404).
  // 'failed': the check did not complete (network or server error); `reason` says why.
  status: 'eol' | 'warn' | 'active' | 'not-tracked' | 'failed';
  reason?: string;
  is_eol: boolean;
  eol_date: string | null;
  days_until_eol: number | null;
  days_past_eol: number | null;
  latest_release: string | null;
  score_url: string | null;
}
