import { test, expect } from '@grafana/plugin-e2e';

test('should render the endoflife.ai header when added to a dashboard', async ({ panelEditPage }) => {
  await panelEditPage.setVisualization('EOL Risk Score');
  await expect(panelEditPage.panel.locator).toContainText('endoflife.ai');
});

test('should expose the products option in the panel editor', async ({ panelEditPage }) => {
  await panelEditPage.setVisualization('EOL Risk Score');
  const options = panelEditPage.getCustomOptions('EOL Risk Score');
  await expect(options.getTextInput('Products to monitor').locator()).toBeVisible();
});
