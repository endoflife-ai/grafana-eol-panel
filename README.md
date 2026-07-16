# EOL Risk Score Panel — Grafana Plugin

**Display end-of-life risk scores for your software stack directly in Grafana.**

Powered by [endoflife.ai](https://endoflife.ai) — free EOL intelligence for 480+ products.

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

Browse all 480+ products at [endoflife.ai/products](https://endoflife.ai/products)

## API & rate limits

Anonymous: 100 requests/day per IP. Free key: 500 requests/day — grab one instantly at [endoflife.ai/api](https://endoflife.ai/api). For teams with many products or frequent refreshes, paid tiers start at $79/mo.

[Get an API key →](https://endoflife.ai/api)

## REST API

Everything this integration shows is also available as a REST API — EOL dates and EOL Risk Scores for 480+ products, with an [OpenAPI 3.0 spec](https://api.endoflife.ai/openapi.json) you can import straight into Postman, Insomnia, or your codegen tool.

```bash
curl https://api.endoflife.ai/v1/score/nodejs/18
```

Free tier: 100 requests/day anonymous, or [grab a free key](https://endoflife.ai/api#free-key) for 500/day. Full docs: [endoflife.ai/api](https://endoflife.ai/api)

## License

MIT — endoflife.ai
