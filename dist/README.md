# EOL Risk Score Panel — Grafana Plugin

**Display end-of-life risk scores for your software stack directly in Grafana.**

Powered by [endoflife.ai](https://endoflife.ai) — free EOL intelligence for 455+ products.

---

## What it does

Adds a panel to your Grafana dashboards showing the EOL status, risk level, and EOL date for any software product your team is running. Configure it once — it refreshes automatically every hour.

EOL products are highlighted in red. Approaching EOL shows a yellow warning. Everything supported shows green.

## Configuration

In the panel options:

| Option | Description | Default |
|---|---|---|
| Products to monitor | Comma-separated `slug:version` pairs | `nodejs:18,python:3.11,php:8.1,ubuntu:20.04` |
| API key | endoflife.ai Pro API key (optional) | — |
| Show EOL Risk Score | Display score card link | `true` |
| Show EOL date | Display the EOL date column | `true` |
| Highlight EOL in red | Red left border on EOL rows | `true` |

## Product slugs

Use the product slug from endoflife.ai URLs. Examples:

- `nodejs:18` — Node.js 18
- `python:3.11` — Python 3.11
- `ubuntu:20.04` — Ubuntu 20.04 LTS
- `php:8.1` — PHP 8.1
- `kubernetes:1.26` — Kubernetes 1.26
- `rhel:8` — Red Hat Enterprise Linux 8

Browse all 455+ products at [endoflife.ai/products](https://endoflife.ai/products)

## API & rate limits

Free tier: 100 requests/day per IP. For teams with many products or frequent refreshes, add a Pro API key in panel options.

[Get a Pro API key →](https://endoflife.ai/api)

## License

MIT — endoflife.ai
