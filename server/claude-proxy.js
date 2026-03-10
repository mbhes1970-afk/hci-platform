/**
 * ============================================================
 * HCI CLAUDE PROXY — Standalone Node.js HTTP Server
 * server/claude-proxy.js
 *
 * Hetzner deployment voor cmofmo.hes-consultancy-international.com
 * Caddy reverse-proxied via /api/claude → localhost:3001
 *
 * ENVIRONMENT VARIABLES:
 *   ANTHROPIC_API_KEY  → required
 *   SLACK_WEBHOOK_URL  → optional (Tier 1 lead alerts)
 *   PORT               → default 3001
 * ============================================================
 */

const http = require('http');
const https = require('https');

// ── CONFIG ────────────────────────────────────────────────────
const PORT              = parseInt(process.env.PORT || '3001', 10);
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const DEFAULT_MODEL     = 'claude-haiku-4-5-20251001';
const MAX_TOKENS        = 4096;

const ALLOWED_ORIGINS = [
  'https://cmofmo.hes-consultancy-international.com',
  'https://hes-consultancy-international.com',
  'https://www.hes-consultancy-international.com',
  'http://localhost:5173',
];

// Basic in-memory rate limiter
const rateLimitMap = new Map();
const RATE_LIMIT   = 30;
const RATE_WINDOW  = 60000;

// ── HELPERS ───────────────────────────────────────────────────
function getCORSHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin':  allowed,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age':       '86400',
    'Vary':                         'Origin',
    'Content-Type':                 'application/json',
  };
}

function respond(res, status, body, corsHeaders) {
  res.writeHead(status, corsHeaders);
  res.end(JSON.stringify(body));
}

function isRateLimited(ip) {
  const now  = Date.now();
  const data = rateLimitMap.get(ip) || { count: 0, windowStart: now };
  if (now - data.windowStart > RATE_WINDOW) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return false;
  }
  if (data.count >= RATE_LIMIT) return true;
  data.count++;
  rateLimitMap.set(ip, data);
  return false;
}

function fetchJSON(url, options) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: { raw: data } });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

// ── CLAUDE HANDLER ────────────────────────────────────────────
async function handleClaude(body, corsHeaders, res) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return respond(res, 500, { error: 'API key not configured' }, corsHeaders);
  }

  const anthropicBody = {
    model:      body.model      || DEFAULT_MODEL,
    max_tokens: Math.min(body.max_tokens || MAX_TOKENS, MAX_TOKENS),
    messages:   body.messages   || [],
  };
  if (body.system) anthropicBody.system = body.system;
  if (typeof body.temperature === 'number') {
    anthropicBody.temperature = Math.min(Math.max(body.temperature, 0), 1);
  }

  if (!Array.isArray(anthropicBody.messages) || anthropicBody.messages.length === 0) {
    return respond(res, 400, { error: 'messages array is required' }, corsHeaders);
  }

  const postBody = JSON.stringify(anthropicBody);
  const url = new URL(ANTHROPIC_API_URL);

  try {
    const result = await fetchJSON(url, {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        'Content-Length':    Buffer.byteLength(postBody),
      },
      body: postBody,
    });

    if (result.status !== 200) {
      console.error('[HCI Proxy] Anthropic error:', result.status, result.data);
    }
    respond(res, result.status, result.data, corsHeaders);
  } catch (err) {
    console.error('[HCI Proxy] Fetch error:', err.message);
    respond(res, 502, { error: 'Failed to reach Anthropic API' }, corsHeaders);
  }
}

// ── SLACK HANDLER ─────────────────────────────────────────────
async function handleSlack(body, corsHeaders, res) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    return respond(res, 200, { ok: true, skipped: 'SLACK_WEBHOOK_URL not configured' }, corsHeaders);
  }

  const { tier, score, org, icp, url: pageUrl, returnVisitor, utm } = body;
  const tierEmoji = tier === 'tier1' ? '🔥' : tier === 'hot' ? '⚡' : '🌡️';
  const tierLabel = tier === 'tier1' ? 'TIER 1 — BEL NU' : tier === 'hot' ? 'HOT LEAD' : 'WARM LEAD';

  const slackPayload = JSON.stringify({
    text: `${tierEmoji} *${tierLabel}*`,
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: `${tierEmoji} ${tierLabel}`, emoji: true } },
      { type: 'section', fields: [
        { type: 'mrkdwn', text: `*Organisatie*\n${org || 'Onbekend'}` },
        { type: 'mrkdwn', text: `*ICP*\n${icp || 'Onbekend'}` },
        { type: 'mrkdwn', text: `*Score*\n${score || 0}` },
        { type: 'mrkdwn', text: `*Bron*\n${(utm && utm.source) || 'Organisch'}` },
      ]},
      { type: 'context', elements: [
        { type: 'mrkdwn', text: `HCI Intelligence · ${new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })}` },
      ]},
    ],
  });

  try {
    const slackUrl = new URL(webhookUrl);
    await fetchJSON(slackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(slackPayload) },
      body: slackPayload,
    });
    respond(res, 200, { ok: true }, corsHeaders);
  } catch (err) {
    console.error('[HCI Proxy] Slack error:', err.message);
    respond(res, 500, { error: 'Slack webhook failed' }, corsHeaders);
  }
}

// ── HTTP SERVER ───────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const origin = req.headers.origin || '';
  const corsHeaders = getCORSHeaders(origin);

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    return res.end();
  }

  // Health check
  if (req.method === 'GET') {
    return respond(res, 200, {
      status: 'ok',
      model: DEFAULT_MODEL,
      timestamp: new Date().toISOString(),
      api_key_set: !!process.env.ANTHROPIC_API_KEY,
      slack_set: !!process.env.SLACK_WEBHOOK_URL,
    }, corsHeaders);
  }

  if (req.method !== 'POST') {
    return respond(res, 405, { error: 'Method not allowed' }, corsHeaders);
  }

  // Rate limiting
  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  if (isRateLimited(clientIP)) {
    return respond(res, 429, { error: 'Too many requests' }, corsHeaders);
  }

  // Read body
  let bodyData = '';
  req.on('data', chunk => bodyData += chunk);
  req.on('end', async () => {
    let body;
    try {
      body = JSON.parse(bodyData || '{}');
    } catch (e) {
      return respond(res, 400, { error: 'Invalid JSON' }, corsHeaders);
    }

    const action = body.action || 'claude';
    try {
      if (action === 'claude') {
        await handleClaude(body, corsHeaders, res);
      } else if (action === 'slack') {
        await handleSlack(body, corsHeaders, res);
      } else {
        respond(res, 400, { error: 'Unknown action: ' + action }, corsHeaders);
      }
    } catch (err) {
      console.error('[HCI Proxy] Unhandled:', err.message);
      respond(res, 500, { error: 'Internal server error' }, corsHeaders);
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[HCI Claude Proxy] Listening on 127.0.0.1:${PORT}`);
  console.log(`[HCI Claude Proxy] API key set: ${!!process.env.ANTHROPIC_API_KEY}`);
});
