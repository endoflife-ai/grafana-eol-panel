import React, { useEffect, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { API_KEY_OPTION_NAME, FREE_KEY_URL, PLANS_URL } from '../constants';
import { EolPanelOptions, EolStatus } from '../types';

const API_BASE = 'https://api.endoflife.ai/v1';

interface Props extends PanelProps<EolPanelOptions> {}

// The API refused the key itself: 401 (key not accepted) or 429 (daily limit reached).
// That applies to every row, so the panel shows one message in place of the table.
class KeyRefused extends Error {
  status: 401 | 429;
  detail: string | null; // X-EOL-Key-Status on a 401, Retry-After (seconds) on a 429

  constructor(status: 401 | 429, detail: string | null) {
    super(`HTTP ${status}`);
    this.status = status;
    this.detail = detail;
  }
}

// A row the API gave no lifecycle answer for.
function unchecked(slug: string, version: string, status: 'not-tracked' | 'failed', reason?: string): EolStatus {
  return {
    slug,
    version,
    status,
    reason,
    is_eol: false,
    eol_date: null,
    days_until_eol: null,
    days_past_eol: null,
    latest_release: null,
    score_url: null,
  };
}

async function fetchStatus(slug: string, version: string, apiKey: string): Promise<EolStatus> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/status/${slug}/${version}`, { headers: { 'X-API-Key': apiKey } });
  } catch {
    return unchecked(slug, version, 'failed', 'network error');
  }
  if (res.status === 401) {
    throw new KeyRefused(401, res.headers.get('X-EOL-Key-Status'));
  }
  if (res.status === 429) {
    throw new KeyRefused(429, res.headers.get('Retry-After'));
  }
  if (res.status === 404) {
    return unchecked(slug, version, 'not-tracked');
  }
  if (!res.ok) {
    return unchecked(slug, version, 'failed', `HTTP ${res.status}`);
  }

  try {
    const data = await res.json();
    const days = data.days_until_eol ?? (data.days_past_eol ? -data.days_past_eol : null);
    const status = data.is_eol ? 'eol' : days !== null && days <= 90 ? 'warn' : 'active';
    return {
      slug,
      version,
      status,
      is_eol: data.is_eol,
      eol_date: data.eol_date,
      days_until_eol: data.days_until_eol,
      days_past_eol: data.days_past_eol,
      latest_release: data.latest_release,
      score_url: `https://endoflife.ai/score/${slug}/${version}`,
    };
  } catch {
    return unchecked(slug, version, 'failed', 'unreadable response');
  }
}

// Retry-After is the number of seconds until the daily count resets (00:00 UTC).
function resetText(retryAfter: string | null): string {
  const seconds = Number(retryAfter);
  if (!retryAfter || !Number.isFinite(seconds) || seconds <= 0) {
    return 'The count resets at 00:00 UTC.';
  }
  const wait = seconds >= 3600 ? `${Math.round(seconds / 3600)} h` : `${Math.ceil(seconds / 60)} min`;
  return `The count resets in about ${wait}.`;
}

const linkStyle = { color: '#4ade80', textDecoration: 'none' };

const Notice: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div
    role="alert"
    style={{
      border: '1px solid rgba(251,191,36,0.4)',
      borderRadius: '4px',
      padding: '10px 12px',
      color: '#94a3b8',
      lineHeight: 1.5,
    }}
  >
    <div style={{ color: '#fbbf24', fontWeight: 700, marginBottom: '4px' }}>{title}</div>
    {children}
  </div>
);

const FreeKeyLink = () => (
  <a href={FREE_KEY_URL} target="_blank" rel="noopener noreferrer" style={linkStyle}>
    endoflife.ai/api#free-key
  </a>
);

export const EolPanel: React.FC<Props> = ({ options, width, height }) => {
  const [results, setResults] = useState<EolStatus[]>([]);
  const [refused, setRefused] = useState<KeyRefused | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const apiKey = (options.apiKey ?? '').trim();

  useEffect(() => {
    // The API answers 401 to every request without a key, so do not call it.
    if (!apiKey) {
      return;
    }

    let stale = false;
    const load = async () => {
      setLoading(true);
      const entries = options.products
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => {
          const [slug, version] = s.split(':');
          return { slug: slug?.trim(), version: version?.trim() };
        })
        .filter((e) => e.slug && e.version);

      let statuses: EolStatus[] = [];
      let keyRefused: KeyRefused | null = null;
      try {
        statuses = await Promise.all(entries.map((e) => fetchStatus(e.slug!, e.version!, apiKey)));
      } catch (err) {
        if (!(err instanceof KeyRefused)) {
          throw err;
        }
        keyRefused = err;
      }
      if (stale) {
        return;
      }
      setResults(statuses);
      setRefused(keyRefused);
      setLastUpdated(new Date());
      setLoading(false);
    };

    load();
    const interval = setInterval(load, 60 * 60 * 1000); // refresh every hour
    return () => {
      stale = true;
      clearInterval(interval);
    };
  }, [options.products, apiKey]);

  const statusColor = (status: EolStatus['status']) => {
    if (status === 'eol') {
      return '#f87171';
    }
    if (status === 'warn') {
      return '#fbbf24';
    }
    if (status === 'active') {
      return '#4ade80';
    }
    return '#94a3b8';
  };

  const statusLabel = (r: EolStatus) => {
    if (r.status === 'eol') {
      return `EOL${r.days_past_eol ? ` — ${r.days_past_eol}d past` : ''}`;
    }
    if (r.status === 'warn') {
      return `Warning${r.days_until_eol ? ` — ${r.days_until_eol}d` : ''}`;
    }
    if (r.status === 'active') {
      return 'Supported';
    }
    if (r.status === 'not-tracked') {
      return 'Not tracked';
    }
    return `Check failed${r.reason ? ` — ${r.reason}` : ''}`;
  };

  // Hover text for rows without a lifecycle answer.
  const statusTitle = (r: EolStatus) => {
    if (r.status === 'not-tracked') {
      return 'endoflife.ai does not track this product or version.';
    }
    if (r.status === 'failed') {
      return `The check did not complete (${r.reason}). The panel tries again within the hour.`;
    }
    return undefined;
  };

  const hasKey = apiKey !== '';
  const showResults = hasKey && !loading;
  const eolCount = showResults ? results.filter((r) => r.status === 'eol').length : 0;
  const warnCount = showResults ? results.filter((r) => r.status === 'warn').length : 0;

  return (
    <div
      style={{
        width,
        height,
        padding: '12px',
        overflow: 'auto',
        fontFamily: 'monospace',
        fontSize: '12px',
        background: 'transparent',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: '8px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '13px' }}>endoflife.ai</span>
          {eolCount > 0 && (
            <span
              style={{
                background: 'rgba(248,113,113,0.2)',
                color: '#f87171',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
              }}
            >
              {eolCount} EOL
            </span>
          )}
          {warnCount > 0 && (
            <span
              style={{
                background: 'rgba(251,191,36,0.2)',
                color: '#fbbf24',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
              }}
            >
              {warnCount} Warning
            </span>
          )}
        </div>
        {showResults && lastUpdated && (
          <span style={{ color: '#64748b', fontSize: '10px' }}>Updated {lastUpdated.toLocaleTimeString()}</span>
        )}
      </div>

      {/* No key: the API is not called */}
      {!hasKey && (
        <Notice title="API key needed">
          The endoflife.ai API needs a key. A free key (150 requests a day) is emailed at once from <FreeKeyLink />.
          Paste it into the panel option &quot;{API_KEY_OPTION_NAME}&quot;.
        </Notice>
      )}

      {/* Loading state */}
      {hasKey && loading && (
        <div style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>Checking endoflife.ai...</div>
      )}

      {/* The API refused the key */}
      {showResults && refused?.status === 401 && (
        <Notice title="API key not accepted">
          endoflife.ai did not accept the key in the panel option &quot;{API_KEY_OPTION_NAME}&quot;.
          {refused.detail === 'unknown' && ' It is not a key endoflife.ai issued.'}
          {refused.detail === 'inactive' && ' The key has been deactivated.'} Check the value, or get a free key at{' '}
          <FreeKeyLink />.
        </Notice>
      )}
      {showResults && refused?.status === 429 && (
        <Notice title="Daily limit reached">
          This API key has used all of its requests for today. {resetText(refused.detail)} Keys with a higher daily
          limit:{' '}
          <a href={PLANS_URL} target="_blank" rel="noopener noreferrer" style={linkStyle}>
            endoflife.ai/api
          </a>
          .
        </Notice>
      )}

      {/* Results table */}
      {showResults && !refused && results.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: '#64748b', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              <th style={{ textAlign: 'left', padding: '4px 8px' }}>Product</th>
              <th style={{ textAlign: 'left', padding: '4px 8px' }}>Status</th>
              {options.showEolDate && <th style={{ textAlign: 'left', padding: '4px 8px' }}>EOL Date</th>}
              {options.showScore && <th style={{ textAlign: 'left', padding: '4px 8px' }}>Score Card</th>}
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr
                key={`${r.slug}-${r.version}`}
                style={{
                  background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                  borderLeft: options.alertOnEol && r.status === 'eol' ? '3px solid #f87171' : '3px solid transparent',
                }}
              >
                <td style={{ padding: '6px 8px', color: '#e2e8f0' }}>
                  <span style={{ fontWeight: 600 }}>{r.slug}</span>
                  <span style={{ color: '#64748b' }}> {r.version}</span>
                </td>
                <td style={{ padding: '6px 8px' }}>
                  <span style={{ color: statusColor(r.status), fontWeight: 600 }} title={statusTitle(r)}>
                    {statusLabel(r)}
                  </span>
                </td>
                {options.showEolDate && (
                  <td style={{ padding: '6px 8px', color: '#94a3b8' }}>{r.eol_date ?? '—'}</td>
                )}
                {options.showScore && (
                  <td style={{ padding: '6px 8px', color: '#94a3b8' }}>
                    {r.score_url ? (
                      <a
                        href={r.score_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ ...linkStyle, fontSize: '11px' }}
                      >
                        View →
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Empty state */}
      {showResults && !refused && results.length === 0 && (
        <div style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
          No products configured. Add products in panel options (e.g. nodejs:18,python:3.11)
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          marginTop: '12px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingTop: '6px',
          textAlign: 'right',
        }}
      >
        <a
          href="https://endoflife.ai"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#374151', fontSize: '10px', textDecoration: 'none' }}
        >
          powered by endoflife.ai
        </a>
      </div>
    </div>
  );
};
