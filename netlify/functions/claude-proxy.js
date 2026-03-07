/**
 * ============================================================
 * HCI CLAUDE PROXY — Netlify Function
 * netlify/functions/claude-proxy.js
 *
 * HES Consultancy International
 * hes-consultancy-international.com
 *
 * WHAT THIS DOES:
 * Keeps the Anthropic API key and Slack webhook URL
 * server-side. The browser never sees these secrets.
 *
 * TWO ENDPOINTS (same function, action param):
 *   POST /.netlify/functions/claude-proxy
 *        { action: "claude", ... }   → Anthropic API
 *        { action: "slack", ... }    → Slack webhook alert
 *
 * ENVIRONMENT VARIABLES (set in Netlify dashboard):
 *   ANTHROPIC_API_KEY     → required for Claude calls
 *   SLACK_WEBHOOK_URL     → optional, for Tier 1 alerts
 *
 * CORS:
 *   Allows requests from your Netlify domain only.
 *   Update ALLOWED_ORIGINS if using a custom domain.
 *
 * RATE LIMITING:
 *   Basic in-memory rate limit — 30 requests/minute per IP.
 *   Not persistent across function cold starts (serverless).
 *   For production, use Netlify Edge or a Redis store.
 * ============================================================
 */

// ============================================================
// CONFIGURATION
// ============================================================
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const DEFAULT_MODEL     = 'claude-haiku-4-5-20251001';
const MAX_TOKENS        = 4096;

// Allowed origins — add your custom domain here when live
const ALLOWED_ORIGINS = [
  'https://hci-platform.netlify.app',
  'https://hes-consultancy-international.com',
  'https://www.hes-consultancy-international.com',
  'https://nxterasolutions.eu',
  'https://www.nxterasolutions.eu',
  'http://localhost:3000',
  'http://127.0.0.1:5500',
  'http://localhost:8888',
];

// Basic in-memory rate limiter (resets on cold start)
const rateLimitMap = new Map();
const RATE_LIMIT    = 30;   // requests per window
const RATE_WINDOW   = 60000; // 1 minute in ms

// ============================================================
// MAIN HANDLER
// ============================================================
exports.handler = async function(event, context) {

  // ── CORS preflight ────────────────────────────────────────
  const origin = event.headers.origin || event.headers.Origin || '';
  const corsHeaders = getCORSHeaders(origin);

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ''
    };
  }

  // ── Only POST allowed ─────────────────────────────────────
  if (event.httpMethod !== 'POST') {
    return respond(405, { error: 'Method not allowed' }, corsHeaders);
  }

  // ── Rate limiting ─────────────────────────────────────────
  const clientIP = event.headers['x-forwarded-for']
    || event.headers['client-ip']
    || 'unknown';

  if (isRateLimited(clientIP)) {
    return respond(429, { error: 'Too many requests. Please wait a moment.' }, corsHeaders);
  }

  // ── Parse body ────────────────────────────────────────────
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return respond(400, { error: 'Invalid JSON body' }, corsHeaders);
  }

  const action = body.action || 'claude';

  // ── Route to handler ─────────────────────────────────────
  try {
    if (action === 'claude') {
      return await handleClaude(body, corsHeaders);
    } else if (action === 'slack') {
      return await handleSlack(body, corsHeaders);
    } else {
      return respond(400, { error: 'Unknown action: ' + action }, corsHeaders);
    }
  } catch (err) {
    console.error('[HCI Proxy] Unhandled error:', err.message);
    return respond(500, {
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Please try again'
    }, corsHeaders);
  }
};

// ============================================================
// CLAUDE HANDLER
// Forwards request to Anthropic API
// ============================================================
async function handleClaude(body, corsHeaders) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error('[HCI Proxy] ANTHROPIC_API_KEY not set');
    return respond(500, {
      error: 'API key not configured',
      hint: 'Set ANTHROPIC_API_KEY in Netlify Environment Variables'
    }, corsHeaders);
  }

  // Build Anthropic request — only allow safe fields through
  const anthropicBody = {
    model:      body.model      || DEFAULT_MODEL,
    max_tokens: Math.min(body.max_tokens || MAX_TOKENS, MAX_TOKENS),
    messages:   body.messages   || [],
    system:     body.system     || undefined,
    temperature: typeof body.temperature === 'number'
      ? Math.min(Math.max(body.temperature, 0), 1)
      : undefined
  };

  // Remove undefined keys
  Object.keys(anthropicBody).forEach(k => {
    if (anthropicBody[k] === undefined) delete anthropicBody[k];
  });

  // Validate messages
  if (!Array.isArray(anthropicBody.messages) || anthropicBody.messages.length === 0) {
    return respond(400, { error: 'messages array is required and must not be empty' }, corsHeaders);
  }

  // Forward to Anthropic
  const anthropicResponse = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type':         'application/json',
      'x-api-key':            apiKey,
      'anthropic-version':    ANTHROPIC_VERSION,
    },
    body: JSON.stringify(anthropicBody)
  });

  const anthropicData = await anthropicResponse.json();

  if (!anthropicResponse.ok) {
    console.error('[HCI Proxy] Anthropic API error:', anthropicResponse.status, anthropicData);
    return respond(anthropicResponse.status, {
      error:   'Anthropic API error',
      status:  anthropicResponse.status,
      details: anthropicData?.error?.message || 'Unknown error'
    }, corsHeaders);
  }

  return respond(200, anthropicData, corsHeaders);
}

// ============================================================
// SLACK HANDLER
// Sends Tier 1 lead alerts to Slack
// ============================================================
async function handleSlack(body, corsHeaders) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    // Slack is optional — don't error, just skip
    return respond(200, { ok: true, skipped: 'SLACK_WEBHOOK_URL not configured' }, corsHeaders);
  }

  const { tier, score, org, icp, url, returnVisitor, utm } = body;

  // Build Slack message
  const tierEmoji  = tier === 'tier1' ? '🔥' : tier === 'hot' ? '⚡' : '🌡️';
  const tierLabel  = tier === 'tier1' ? 'TIER 1 — BEL NU' : tier === 'hot' ? 'HOT LEAD' : 'WARM LEAD';
  const icpLabels  = { gemeente: 'Gemeente', ziekenhuis: 'Ziekenhuis', software: 'Software CEO', euentry: 'EU Entry' };
  const returnFlag = returnVisitor ? ' 🔁 terugkerend' : '';
  const utmInfo    = utm && utm.campaign ? `\n• Campagne: ${utm.campaign}` : '';
  const sourceInfo = utm && utm.source   ? ` (${utm.source})`             : '';

  const slackPayload = {
    text: `${tierEmoji} *${tierLabel}*`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `${tierEmoji} ${tierLabel}`, emoji: true }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Organisatie*\n${org || 'Onbekend'}${returnFlag}` },
          { type: 'mrkdwn', text: `*ICP*\n${icpLabels[icp] || icp || 'Onbekend'}` },
          { type: 'mrkdwn', text: `*Intent Score*\n${score} punten` },
          { type: 'mrkdwn', text: `*Bron*\n${(utm && utm.source) ? utm.source + sourceInfo : 'Organisch'}` }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Pagina:* ${url || 'Onbekend'}${utmInfo}`
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '🎯 Open DealFlow', emoji: true },
            url: 'https://hes-consultancy-international.com/hci-dealflow.html',
            style: 'primary'
          }
        ]
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `HCI Intelligence · ${new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })}`
          }
        ]
      }
    ]
  };

  const slackResponse = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slackPayload)
  });

  if (!slackResponse.ok) {
    console.error('[HCI Proxy] Slack webhook error:', slackResponse.status);
    return respond(500, { error: 'Slack webhook failed' }, corsHeaders);
  }

  return respond(200, { ok: true, sent: true }, corsHeaders);
}

// ============================================================
// HELPERS
// ============================================================
function getCORSHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin':  allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age':       '86400',
    'Vary':                         'Origin',
    'Content-Type':                 'application/json'
  };
}

function respond(status, body, headers = {}) {
  return {
    statusCode: status,
    headers:    { 'Content-Type': 'application/json', ...headers },
    body:       JSON.stringify(body)
  };
}

function isRateLimited(ip) {
  const now  = Date.now();
  const data = rateLimitMap.get(ip) || { count: 0, windowStart: now };

  if (now - data.windowStart > RATE_WINDOW) {
    // Reset window
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (data.count >= RATE_LIMIT) return true;

  data.count++;
  rateLimitMap.set(ip, data);
  return false;
}
