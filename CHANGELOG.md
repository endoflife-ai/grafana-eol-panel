# 1.1.2 (2026-09-09)

- Tests: e2e suite runs green on Grafana 12.3 through 13.2 and nightly again (`@grafana/plugin-e2e` 3.12.0; the render test loads the panel from the provisioned dashboard instead of the visualization picker, which left the panel unselected on Grafana 12.4 with the newer harness).
- Docs: product coverage wording updated to 500+ products (README, plugin description).
- No functional changes to the panel.

# 1.1.1 (2026-08-05)

- Security: update transitive dependencies flagged by OSV — fast-uri 3.1.5 (CVE-2026-18446, CVE-2026-16221), ip-address 10.3.1 (CVE-2026-69192); npm audit fix for brace-expansion advisories
- No functional changes to the panel

# Changelog

## 1.1.0 (2026-07-16)

- Migrated to the official Grafana plugin build tooling (`@grafana/create-plugin`).
- Updated product coverage to 480+ products.

## 1.0.0 (2026-06-04)

- Initial release: EOL status panel powered by endoflife.ai with configurable product list, optional API key, EOL Risk Score links, EOL dates, and red/amber/green status highlighting with hourly refresh.
