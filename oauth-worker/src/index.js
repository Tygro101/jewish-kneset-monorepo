/**
 * Cloudflare Worker — GitHub OAuth proxy for Decap CMS.
 *
 * Two routes:
 *   GET /auth      → Redirects the user to GitHub's OAuth authorization page.
 *   GET /callback  → Receives the authorization code from GitHub, exchanges it for
 *                    an access token, and posts the token back to the Decap CMS popup.
 *
 * Environment secrets (set via `wrangler secret put`):
 *   GITHUB_CLIENT_ID
 *   GITHUB_CLIENT_SECRET
 *
 * Decap CMS expects the popup to post a message in the format:
 *   authorization:github:<status>:<payload>
 */

const GITHUB_AUTHORIZE = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN = 'https://github.com/login/oauth/access_token';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // --- CORS preflight (Decap sometimes does OPTIONS) ---
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // --- /auth: start the OAuth flow ---
    if (url.pathname === '/auth') {
      const authUrl = new URL(GITHUB_AUTHORIZE);
      authUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      authUrl.searchParams.set('redirect_uri', `${url.origin}/callback`);
      authUrl.searchParams.set('scope', 'repo,user');
      authUrl.searchParams.set('state', crypto.randomUUID());
      return Response.redirect(authUrl.toString(), 302);
    }

    // --- /callback: exchange code for token, return to Decap popup ---
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) {
        return new Response('Missing code parameter', { status: 400 });
      }

      const tokenRes = await fetch(GITHUB_TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });

      const data = await tokenRes.json();
      const hasToken = Boolean(data.access_token);
      const status = hasToken ? 'success' : 'error';
      const payload = hasToken
        ? JSON.stringify({ token: data.access_token, provider: 'github' })
        : JSON.stringify({ error: data.error_description || data.error || 'token_exchange_failed' });

      // Decap CMS popup handshake:
      // 1. The opener (Decap) posts "authorizing:github" to this popup.
      // 2. This popup listens for that message, then posts the result back.
      const html = `<!DOCTYPE html><html><head><title>Authorizing...</title></head><body>
<script>
(function() {
  function receiveMessage(e) {
    window.opener.postMessage(
      'authorization:github:${status}:${payload}',
      e.origin
    );
    window.removeEventListener('message', receiveMessage, false);
  }
  window.addEventListener('message', receiveMessage, false);
  window.opener.postMessage('authorizing:github', '*');
})();
</script>
</body></html>`;

      return new Response(html, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      });
    }

    // --- /health: quick health-check ---
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ ok: true, ts: Date.now() }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not found', { status: 404 });
  },
};
