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
  status: 'eol' | 'warn' | 'active' | 'unknown';
  is_eol: boolean;
  eol_date: string | null;
  days_until_eol: number | null;
  days_past_eol: number | null;
  latest_release: string | null;
  score_url: string;
}
