import { PanelPlugin } from '@grafana/data';
import { API_KEY_OPTION_NAME, FREE_KEY_URL } from './constants';
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
      name: API_KEY_OPTION_NAME,
      description: `Required. The endoflife.ai API refuses requests without a key. A free key gives 150 requests a day and does not expire: ${FREE_KEY_URL}. Anyone who can view this dashboard can read the key.`,
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
