import React, { useEffect, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { EolPanelOptions, EolStatus } from '../types';

const API_BASE = 'https://api.endoflife.ai/v1';

interface Props extends PanelProps<EolPanelOptions> {}

async function fetchStatus(slug: string, version: string, apiKey: string): Promise<EolStatus> {
  const headers: Record<string, string> = {};
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }

  try {
    const res = await fetch(`${API_BASE}/status/${slug}/${version}`, { headers });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
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
    return {
      slug,
      version,
      status: 'unknown',
      is_eol: false,
      eol_date: null,
      days_until_eol: null,
      days_past_eol: null,
      latest_release: null,
      score_url: `https://endoflife.ai/${slug}`,
    };
  }
}

export const EolPanel: React.FC<Props> = ({ options, width, height }) => {
  const [results, setResults] = useState<EolStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
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

      const statuses = await Promise.all(entries.map((e) => fetchStatus(e.slug!, e.version!, options.apiKey)));
      setResults(statuses);
      setLastUpdated(new Date());
      setLoading(false);
    };

    load();
    const interval = setInterval(load, 60 * 60 * 1000); // refresh every hour
    return () => clearInterval(interval);
  }, [options.products, options.apiKey]);

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
    return 'Unknown';
  };

  const eolCount = results.filter((r) => r.status === 'eol').length;
  const warnCount = results.filter((r) => r.status === 'warn').length;

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
        {lastUpdated && (
          <span style={{ color: '#64748b', fontSize: '10px' }}>Updated {lastUpdated.toLocaleTimeString()}</span>
        )}
      </div>

      {/* Loading state */}
      {loading && <div style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>Checking endoflife.ai...</div>}

      {/* Results table */}
      {!loading && results.length > 0 && (
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
                  <span style={{ color: statusColor(r.status), fontWeight: 600 }}>{statusLabel(r)}</span>
                </td>
                {options.showEolDate && (
                  <td style={{ padding: '6px 8px', color: '#94a3b8' }}>{r.eol_date ?? '—'}</td>
                )}
                {options.showScore && (
                  <td style={{ padding: '6px 8px' }}>
                    <a
                      href={r.score_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#4ade80', textDecoration: 'none', fontSize: '11px' }}
                    >
                      View →
                    </a>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Empty state */}
      {!loading && results.length === 0 && (
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
