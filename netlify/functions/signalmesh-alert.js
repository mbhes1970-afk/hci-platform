/**
 * SignalMesh v2 — Alert Proxy (Netlify Function)
 * 1. Forwards to n8n webhook (primary — handles PB save + Slack routing)
 * 2. Falls back to direct Slack if n8n is unavailable
 * Requires env vars: SLACK_WEBHOOK_URL
 */
const N8N_WEBHOOK = 'https://n8n.hes-consultancy-international.com/webhook/signalmesh-alert';

exports.handler = async (event) => {
  // CORS headers — restricted to HCI domains
  const ALLOWED_ORIGINS = [
    'https://hes-consultancy.nl',
    'https://www.hes-consultancy.nl',
    'https://hes-consultancy-international.com',
    'https://www.hes-consultancy-international.com',
    'https://hci-platform.netlify.app',
    'https://nxterasolutions.eu',
    'http://localhost:3000',
    'http://localhost:5173',
  ];
  const origin = event.headers.origin || '';
  const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  const headers = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const payload = JSON.parse(event.body);
    let n8nOk = false;

    // 1. Try n8n webhook first (handles PB save + tier-based Slack routing)
    try {
      const n8nRes = await fetch(N8N_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      n8nOk = n8nRes.ok;
    } catch {
      // n8n unavailable — fall through to direct Slack
    }

    // 2. Fallback: direct Slack alert if n8n failed and tier is hot+
    if (!n8nOk && (payload.tier === 'hot' || payload.tier === 'tier1')) {
      const webhookUrl = process.env.SLACK_WEBHOOK_URL;
      if (webhookUrl) {
        const slackPayload = {
          text: `*${payload.tier === 'tier1' ? 'TIER 1 LEAD' : 'HOT Lead'} — ${payload.icpType || 'unknown'}*`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: [
                  `*ICP:* ${payload.icpType} > *Sector:* ${payload.sector} > *Tier:* ${payload.tier}`,
                  `*Fit:* ${payload.fitScore}/100 | *Intent:* ${payload.intentScore}/100 | *DealFlow:* ${payload.dealFlowScore}/100`,
                  `*Bron:* ${payload.utmSource || 'direct'} | *Return:* ${payload.isReturnVisitor ? 'Ja' : 'Nee'}`,
                  `*Qualifier:* ${JSON.stringify(payload.qualifierAnswers || {})}`,
                  `*Storytelling:* ${payload.storySectionsRead || 0}/5 secties gelezen`,
                  n8nOk ? '' : '_n8n niet bereikbaar — direct Slack fallback_',
                ].filter(Boolean).join('\n'),
              },
            },
            {
              type: 'actions',
              elements: [{
                type: 'button',
                text: { type: 'plain_text', text: 'Bekijk in DealFlow' },
                url: 'https://api.hes-consultancy-international.com/_/collections/signalmesh_leads',
              }],
            },
          ],
        };

        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slackPayload),
        });
      }
    }

    return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok', n8n: n8nOk }) };
  } catch (err) {
    return { statusCode: 500, headers, body: err.message };
  }
};
