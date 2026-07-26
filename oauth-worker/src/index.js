/**
 * Cloudflare Worker — GitHub OAuth proxy for Decap CMS (security-hardened).
 *
 * Routes:
 *   GET /auth      → Redirects the user to GitHub's OAuth authorization page.
 *   GET /callback  → Receives the authorization code from GitHub, exchanges it for
 *                    an access token, and posts the token back to the Decap CMS popup.
 *   GET /health    → Health-check endpoint.
 *
 * Environment secrets (set via `wrangler secret put`):
 *   GITHUB_CLIENT_ID
 *   GITHUB_CLIENT_SECRET
 *
 * Environment variables (set in wrangler.toml or dashboard):
 *   ENVIRONMENT    → "development" to allow localhost origins; anything else = production.
 *
 * Security measures:
 *   - Origin allowlist for postMessage (no wildcard).
 *   - Stateless CSRF via HMAC-SHA256 state parameter with timestamp expiry (10 min).
 *   - XSS-safe payload embedding via JSON data element (no script interpolation).
 *   - Narrowed OAuth scope to `public_repo` (repos are public).
 *   - CORS restricted to allowlisted origins only.
 *
 * Decap CMS expects the popup to post a message in the format:
 *   authorization:github:<status>:<payload>
 */

const GITHUB_AUTHORIZE = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN = 'https://github.com/login/oauth/access_token';

/** Maximum age (in milliseconds) for a valid CSRF state token. */
const STATE_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Returns the list of allowed origins based on the environment.
 * Production: only the GitHub Pages site.
 * Development: also localhost dev servers.
 */
function getAllowedOrigins(env) {
  const origins = ['https://jewish-kneset.github.io'];
  if (env.ENVIRONMENT === 'development') {
    origins.push('http://localhost:5173', 'http://localhost:3000');
  }
  return origins;
}

/**
 * Generate a stateless CSRF state parameter.
 * Format: `<timestamp_ms>.<hex_signature>`
 * The signature is HMAC-SHA256(timestamp, secret).
 */
async function generateState(secret) {
  const timestamp = Date.now().toString();
  const signature = await hmacSign(timestamp, secret);
  return `${timestamp}.${signature}`;
}

/**
 * Verify a state parameter by re-computing the HMAC and checking freshness.
 * Returns true if valid, false otherwise.
 */
async function verifyState(state, secret) {
  if (!state || typeof state !== 'string') return false;

  const dotIndex = state.indexOf('.');
  if (dotIndex === -1) return false;

  const timestamp = state.substring(0, dotIndex);
  const signature = state.substring(dotIndex + 1);

  // Verify timestamp is a valid number
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || ts <= 0) return false;

  // Check expiry — state must be less than 10 minutes old
  const age = Date.now() - ts;
  if (age < 0 || age > STATE_MAX_AGE_MS) return false;

  // Re-compute HMAC and compare (timing-safe)
  const expectedSignature = await hmacSign(timestamp, secret);
  return timingSafeEqual(signature, expectedSignature);
}

/**
 * Compute HMAC-SHA256 of `data` with `secret`, returning a hex string.
 */
async function hmacSign(data, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return arrayBufferToHex(sig);
}

/**
 * Convert an ArrayBuffer to a lowercase hex string.
 */
function arrayBufferToHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Build the CORS headers restricted to a specific allowed origin.
 * Returns null if the request origin is not on the allowlist.
 */
function getCorsHeaders(requestOrigin, allowedOrigins) {
  if (!requestOrigin || !allowedOrigins.includes(requestOrigin)) {
    return null;
  }
  return {
    'Access-Control-Allow-Origin': requestOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const allowedOrigins = getAllowedOrigins(env);

    // --- CORS preflight (Decap sometimes does OPTIONS) ---
    if (request.method === 'OPTIONS') {
      const requestOrigin = request.headers.get('Origin');
      const corsHeaders = getCorsHeaders(requestOrigin, allowedOrigins);
      if (!corsHeaders) {
        // Origin not allowed — return 403
        return new Response('Forbidden', { status: 403 });
      }
      return new Response(null, { headers: corsHeaders });
    }

    // --- /auth: start the OAuth flow ---
    if (url.pathname === '/auth') {
      // Generate a stateless CSRF state token (HMAC of timestamp)
      const state = await generateState(env.GITHUB_CLIENT_SECRET);

      const authUrl = new URL(GITHUB_AUTHORIZE);
      authUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      authUrl.searchParams.set('redirect_uri', `${url.origin}/callback`);
      authUrl.searchParams.set('scope', 'public_repo');
      authUrl.searchParams.set('state', state);
      return Response.redirect(authUrl.toString(), 302);
    }

    // --- /callback: exchange code for token, return to Decap popup ---
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');

      // Validate required parameters
      if (!code) {
        return new Response('Missing code parameter', { status: 400 });
      }
      if (!state) {
        return new Response('Missing state parameter', { status: 400 });
      }

      // Verify CSRF state token
      const stateValid = await verifyState(state, env.GITHUB_CLIENT_SECRET);
      if (!stateValid) {
        return new Response('Invalid or expired state parameter (possible CSRF attack)', {
          status: 403,
        });
      }

      // Exchange authorization code for access token
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

      if (!tokenRes.ok) {
        return new Response('Token exchange failed', { status: 502 });
      }

      const data = await tokenRes.json();
      const hasToken = Boolean(data.access_token);
      const status = hasToken ? 'success' : 'error';
      const payload = hasToken
        ? { token: data.access_token, provider: 'github' }
        : { error: data.error_description || data.error || 'token_exchange_failed' };

      // Build the data object to embed safely in HTML.
      // This is placed in a <script type="application/json"> element to avoid XSS —
      // the browser does not execute type="application/json" blocks, and JSON.stringify
      // ensures no `</script>` or HTML-breaking sequences can appear unescaped.
      const safeData = JSON.stringify({
        status,
        payload: JSON.stringify(payload),
        allowedOrigins,
      })
        // Defense-in-depth: escape sequences that could break out of a script tag
        // or be interpreted as HTML even inside a JSON block.
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026');

      // Decap CMS popup handshake:
      // 1. The opener (Decap) posts "authorizing:github" to this popup.
      // 2. This popup listens for that message, validates the sender's origin
      //    against the allowlist, then posts the token result back ONLY to that origin.
      const html = `<!DOCTYPE html>
<html>
<head><title>Authorizing...</title></head>
<body>
<script id="data" type="application/json">${safeData}</script>
<script>
(function() {
  var dataEl = document.getElementById('data');
  var config = JSON.parse(dataEl.textContent);
  var allowedOrigins = config.allowedOrigins;
  var message = 'authorization:github:' + config.status + ':' + config.payload;

  function isAllowedOrigin(origin) {
    for (var i = 0; i < allowedOrigins.length; i++) {
      if (allowedOrigins[i] === origin) return true;
    }
    return false;
  }

  function receiveMessage(e) {
    // Only respond to messages from allowed origins
    if (!isAllowedOrigin(e.origin)) return;

    // Post the authorization result back ONLY to the validated origin
    window.opener.postMessage(message, e.origin);
    window.removeEventListener('message', receiveMessage, false);
  }

  window.addEventListener('message', receiveMessage, false);

  // Notify the opener that we are ready — send to each allowed origin.
  // Only the actual opener will receive the message; others are no-ops.
  for (var i = 0; i < allowedOrigins.length; i++) {
    window.opener.postMessage('authorizing:github', allowedOrigins[i]);
  }
})();
</script>
</body>
</html>`;

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
