/**
 * SignalMesh v2 — Slack Alert (Netlify Function)
 * Forwards SignalMesh alerts to Slack via webhook.
 * Requires env var: SLACK_WEBHOOK_URL
 */
exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    return { statusCode: 200, headers, body: 'no webhook configured' };
  }

  try {
    const payload = JSON.parse(event.body);

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return { statusCode: 502, headers, body: 'Slack returned ' + res.status };
    }

    return { statusCode: 200, headers, body: 'ok' };
  } catch (err) {
    return { statusCode: 500, headers, body: err.message };
  }
};
