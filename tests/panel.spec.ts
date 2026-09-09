import { test, expect } from '@grafana/plugin-e2e';

// Renders from the provisioned dashboard rather than picking the visualization
// through the viz picker: with @grafana/plugin-e2e 3.11+ the picker path leaves
// the panel unselected on Grafana 12.4 (passes on 12.3 and 13.x), which is a
// harness/version quirk, not a panel behaviour. The provisioned panel exercises
// the same render path on every version in the matrix.
test('should render the endoflife.ai header when added to a dashboard', async ({ gotoPanelEditPage, readProvisionedDashboard }) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '1' });
  await expect(panelEditPage.panel.locator).toContainText('endoflife.ai');
});

test('should expose the products option in the panel editor', async ({ gotoPanelEditPage, readProvisionedDashboard }) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '1' });
  const options = panelEditPage.getCustomOptions('EOL Risk Score');
  await expect(options.getTextInput('Products to monitor')).toBeVisible();
});
