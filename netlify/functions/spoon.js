// Serverless proxy for the Spoonacular API.
//
// Why this exists:
//  - Spoonacular does not send CORS headers, so the web app can't call it
//    directly from the browser.
//  - Keeping the API key in the client bundle would expose it publicly.
//
// This function runs server-side on Netlify, injects the key from an
// environment variable (SPOONACULAR_API_KEY), and returns the response with
// permissive CORS headers so the app can call it same-origin at
// /.netlify/functions/spoon
//
// Usage: /.netlify/functions/spoon?path=recipes/findByIngredients&ingredients=bread,cheese&number=6
// Every query param except `path` is forwarded to Spoonacular; `apiKey` is added
// server-side.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  const key = process.env.SPOONACULAR_API_KEY;
  if (!key) {
    return {
      statusCode: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'SPOONACULAR_API_KEY is not set on the server.' }),
    };
  }

  const params = event.queryStringParameters || {};
  const path = String(params.path || '').replace(/^\/+/, '');
  // Only allow known Spoonacular paths to be proxied.
  if (!path || !/^[a-zA-Z0-9/_-]+$/.test(path)) {
    return {
      statusCode: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing or invalid "path" parameter.' }),
    };
  }

  const forwarded = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (k !== 'path' && v != null) forwarded.set(k, String(v));
  }
  forwarded.set('apiKey', key);

  const url = `https://api.spoonacular.com/${path}?${forwarded.toString()}`;

  try {
    const res = await fetch(url);
    const text = await res.text();
    return {
      statusCode: res.status,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: text,
    };
  } catch (e) {
    return {
      statusCode: 502,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Upstream request failed: ' + String(e) }),
    };
  }
};
