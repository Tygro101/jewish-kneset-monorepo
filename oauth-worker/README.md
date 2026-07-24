# kneset-oauth — Cloudflare Worker OAuth proxy for Decap CMS

Handles the GitHub OAuth token exchange so Decap CMS (browser-only) can commit to tenant repos.

## Setup (one-time)

### 1. Create a GitHub OAuth App

1. Go to <https://github.com/organizations/jewish-kneset/settings/applications> (or your personal settings → Developer settings → OAuth Apps).
2. **Application name:** `Kneset CMS`
3. **Homepage URL:** `https://jewish-kneset.github.io/tenant-base-template/admin/`
4. **Authorization callback URL:** `https://kneset-oauth.<your-subdomain>.workers.dev/callback`
   (you'll know the subdomain after first deploy; update if needed)
5. Generate a **client secret**. Save both `Client ID` and `Client Secret`.

### 2. Deploy the Worker

```bash
cd oauth-worker
npm install
npx wrangler login          # authenticate with Cloudflare (one-time)
npx wrangler deploy         # deploys to kneset-oauth.<subdomain>.workers.dev
```

### 3. Set Secrets

```bash
npx wrangler secret put GITHUB_CLIENT_ID
# paste the client ID

npx wrangler secret put GITHUB_CLIENT_SECRET
# paste the secret
```

### 4. Update tenant template

In `D:\GitHub\tenant-base-template\admin\config.yml`, add:

```yaml
backend:
  name: github
  repo: jewish-kneset/tenant-base-template
  branch: main
  base_url: https://kneset-oauth.<your-subdomain>.workers.dev
  auth_endpoint: /auth
```

Push the change. After this, `/admin/` will let users log in with GitHub and save edits.

## Routes

| Route      | Method | Description |
|------------|--------|-------------|
| `/auth`    | GET    | Redirects to GitHub authorize |
| `/callback`| GET    | Exchanges code for token, posts back to Decap popup |
| `/health`  | GET    | Health check |

## Local dev

```bash
npx wrangler dev
# Worker runs at http://localhost:8787
# For local testing, set the GitHub OAuth App callback to http://localhost:8787/callback
```
