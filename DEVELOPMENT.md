# Development

This plugin is scaffolded with [`@grafana/create-plugin`](https://grafana.com/developers/plugin-tools/).

## Prerequisites

- Node.js 22+
- Docker (for the local Grafana dev server)

## Frontend

1. Install dependencies

   ```bash
   npm install
   ```

2. Build the plugin in development mode and watch for changes

   ```bash
   npm run dev
   ```

3. Build the plugin in production mode

   ```bash
   npm run build
   ```

4. Run unit tests

   ```bash
   npm run test:ci
   ```

5. Lint and typecheck

   ```bash
   npm run lint
   npm run typecheck
   ```

## Local Grafana

Start a Grafana instance with the plugin pre-provisioned:

```bash
npm run server
```

Then open http://localhost:3000.

## End-to-end tests

```bash
npm exec playwright install chromium
npm run e2e
```

## Releasing

Push a `v*` tag; the GitHub Actions workflow in `.github/workflows/build.yml` builds, packages, and attaches provenance attestation using `grafana/plugin-actions/build-plugin`.
