import { PanelPlugin } from '@grafana/data';
import { EolPanelOptions } from './types';
import { EolPanel } from './components/EolPanel';

export const plugin = new PanelPlugin<EolPanelOptions>(EolPanel).setPanelOptions((builder) => {
  return builder
    .addTextInput({
      path: 'products',
      name: 'Products to monitor',
      description: 'Comma-separated list of slug:version pairs. Example: nodejs:18,python:3.11,ubuntu:20.04',
      defaultValue: 'nodejs:18,python:3.11,php:8.1,ubuntu:20.04',
    })
    .addTextInput({
      path: 'apiKey',
      name: 'endoflife.ai API key',
      description: 'Required from 2026-11-16, when the API stops answering requests without a key (until then blank = anonymous, 50 req/day per IP). Free key: https://endoflife.ai/api#free-key. Anyone who can view this dashboard can read the key.',
      defaultValue: '',
    })
    .addBooleanSwitch({
      path: 'showScore',
      name: 'Show EOL Risk Score',
      defaultValue: true,
    })
    .addBooleanSwitch({
      path: 'showEolDate',
      name: 'Show EOL date',
      defaultValue: true,
    })
    .addBooleanSwitch({
      path: 'alertOnEol',
      name: 'Highlight EOL products in red',
      defaultValue: true,
    });
});
