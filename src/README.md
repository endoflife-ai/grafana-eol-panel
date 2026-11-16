# EOL Risk Score Panel

**See the end-of-life status of your software stack directly in your Grafana dashboards.**

Powered by [endoflife.ai](https://endoflife.ai) — free EOL intelligence for 700+ products.

## What it does

Adds a panel that shows the EOL status, risk level, and EOL date for the software products your team runs. Configure it once — it refreshes automatically every hour.

Products that have reached end of life are highlighted in red. Products approaching end of life show a yellow warning. Everything still supported shows green.

## Configuration

In the panel options:

| Option               | Description                          | Default                                          |
| -------------------- | ------------------------------------ | ------------------------------------------------ |
| Products to monitor  | Comma-separated `slug:version` pairs | Node.js 18, Python 3.11, PHP 8.1, Ubuntu 20.04   |
| endoflife.ai API key | Required. The panel shows no results without it | —                                                |
| Show EOL Risk Score  | Display score card link              | `true`                                           |
| Show EOL date        | Display the EOL date column          | `true`                                           |
| Highlight EOL in red | Red left border on rows past EOL     | `true`                                           |

## Product identifiers

Each product is identified by the short slug used in endoflife.ai URLs, followed by the version you run:

```
python:3.11       Python 3.11
ubuntu:20.04      Ubuntu 20.04 LTS
php:8.1           PHP 8.1
kubernetes:1.26   Kubernetes 1.26
rhel:8            Red Hat Enterprise Linux 8
```

Browse all 700+ products and their slugs at [endoflife.ai/products](https://endoflife.ai/products).

## API and rate limits

An API key is required. The endoflife.ai API refuses requests without one, and the panel shows a message instead of results until a key is set. A free key gives 150 requests/day and does not expire. It is emailed at once from [endoflife.ai/api](https://endoflife.ai/api#free-key). Paid keys: Starter (USD 89 a month, 10,000 requests/day) and Pro (USD 299 a month, 100,000 requests/day, fair use).

The panel sends one request per product each time it loads, and again every hour while it stays open.

The key is stored in the panel options, so anyone who can view the dashboard can read it.

[Get an API key →](https://endoflife.ai/api)

## Messages

| The panel shows           | Meaning                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| `API key needed`          | The API key option is empty. The panel does not call the API.                                |
| `API key not accepted`    | The API refused the key (unknown or deactivated). Check the value.                           |
| `Daily limit reached`     | The key has used its requests for today. The count resets at 00:00 UTC.                      |
| `Not tracked` (on a row)  | endoflife.ai does not track that product or version. Check the slug.                         |
| `Check failed` (on a row) | The request did not complete. The reason follows, and the panel tries again within the hour. |

## REST API

Everything this panel shows is also available as a REST API — EOL dates and EOL Risk Scores for 700+ products, with an [OpenAPI 3.0 spec](https://api.endoflife.ai/openapi.json) you can import into Postman, Insomnia, or your code generator.

```bash
curl -H "X-API-Key: your_key" https://api.endoflife.ai/v1/score/python/3.11
```

Full documentation: [endoflife.ai/api](https://endoflife.ai/api)

## License

MIT — endoflife.ai
