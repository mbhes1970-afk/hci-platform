// HCI AI Assistant — Claude API Proxy
// API key is stored as Netlify environment variable: ANTHROPIC_API_KEY
// Never exposed to the client

const Anthropic = require('@anthropic-ai/sdk');

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { messages, system, language } = JSON.parse(event.body);

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Messages array required' }) };
    }

    // Rate limiting: basic check (Netlify has built-in rate limiting too)
    // In production, add IP-based rate limiting or auth tokens

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: system || 'You are a helpful assistant for HES Consultancy International.',
      messages: messages.slice(-10), // Last 10 messages for context window management
    });

    const reply = response.content
      .map((block) => (block.type === 'text' ? block.text : ''))
      .filter(Boolean)
      .join('\n');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply,
        usage: {
          input_tokens: response.usage?.input_tokens,
          output_tokens: response.usage?.output_tokens,
        },
      }),
    };
  } catch (err) {
    console.error('Claude API error:', err);

    const statusCode = err.status || 500;
    const message = err.status === 429
      ? 'Rate limit exceeded. Please wait a moment.'
      : err.status === 401
        ? 'API key invalid. Check Netlify environment variable.'
        : 'AI service temporarily unavailable.';

    return {
      statusCode,
      headers,
      body: JSON.stringify({ error: message }),
    };
  }
};
