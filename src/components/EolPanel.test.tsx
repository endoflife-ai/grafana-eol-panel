import React from 'react';
import { render, screen } from '@testing-library/react';
import { PanelProps } from '@grafana/data';
import { EolPanel } from './EolPanel';
import { EolPanelOptions } from '../types';

const fetchMock = jest.fn();

// A minimal stand-in for the parts of a fetch Response the panel reads.
const answer = (status: number, body: unknown = {}, headers: Record<string, string> = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: { get: (name: string) => headers[name] ?? null },
  json: async () => body,
});

const supported = { is_eol: false, eol_date: '2030-01-01', days_until_eol: 1000 };

const renderPanel = (options: Partial<EolPanelOptions>) => {
  const props = {
    width: 600,
    height: 300,
    options: { products: 'nodejs:22', apiKey: '', showScore: true, showEolDate: true, alertOnEol: true, ...options },
  } as unknown as PanelProps<EolPanelOptions>;
  return render(<EolPanel {...props} />);
};

describe('EolPanel', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  it('asks for a key and does not call the API when the key is empty', () => {
    renderPanel({ apiKey: '  ' });

    expect(screen.getByRole('alert')).toHaveTextContent('API key needed');
    expect(screen.getByRole('alert')).toHaveTextContent('Paste it into the panel option "endoflife.ai API key".');
    expect(screen.getByRole('link', { name: 'endoflife.ai/api#free-key' })).toHaveAttribute(
      'href',
      'https://endoflife.ai/api#free-key'
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends the key and shows a checked row as before', async () => {
    fetchMock.mockResolvedValue(answer(200, supported));
    renderPanel({ apiKey: ' my-key ' });

    expect(await screen.findByText('Supported')).toBeInTheDocument();
    expect(screen.getByText('2030-01-01')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('https://api.endoflife.ai/v1/status/nodejs/22', {
      headers: { 'X-API-Key': 'my-key' },
    });
  });

  it('says the key was not accepted on a 401, instead of rows', async () => {
    fetchMock.mockResolvedValue(answer(401, { error: 'An API key is required.' }, { 'X-EOL-Key-Status': 'unknown' }));
    renderPanel({ apiKey: 'wrong-key', products: 'nodejs:22,python:3.13' });

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('API key not accepted');
    expect(alert).toHaveTextContent('It is not a key endoflife.ai issued.');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('says the daily limit was reached on a 429, and for how long', async () => {
    fetchMock.mockResolvedValue(answer(429, { error: 'Rate limit exceeded.' }, { 'Retry-After': '18000' }));
    renderPanel({ apiKey: 'my-key' });

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Daily limit reached');
    expect(alert).toHaveTextContent('The count resets in about 5 h.');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('tells a product that is not tracked from a check that failed', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.endsWith('/status/nodejs/22')) {
        return answer(200, supported);
      }
      if (url.endsWith('/status/no-such-product/1')) {
        return answer(404, { error: 'Product not found' });
      }
      if (url.endsWith('/status/python/3.13')) {
        return answer(500);
      }
      throw new TypeError('Failed to fetch');
    });
    renderPanel({ apiKey: 'my-key', products: 'nodejs:22,no-such-product:1,python:3.13,php:8.4' });

    expect(await screen.findByText('Not tracked')).toHaveAttribute(
      'title',
      'endoflife.ai does not track this product or version.'
    );
    expect(screen.getByText('Check failed — HTTP 500')).toBeInTheDocument();
    expect(screen.getByText('Check failed — network error')).toBeInTheDocument();
    // Only the row that was checked reads as supported and links to a score card.
    expect(screen.getAllByText('Supported')).toHaveLength(1);
    expect(screen.getAllByText('View →')).toHaveLength(1);
    expect(screen.queryByText('Unknown')).not.toBeInTheDocument();
  });
});
