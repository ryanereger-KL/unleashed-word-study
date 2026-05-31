exports.handler = async function(event, context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: { message: 'Method not allowed' } }) };
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: { message: 'ANTHROPIC_API_KEY environment variable not set.' } }) };
  }

  let requestBody;
  try {
    requestBody = JSON.parse(event.body);
  } catch(e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: { message: 'Invalid request body.' } }) };
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    const text = await response.text();

    if (!text || text.trim() === '') {
      return { statusCode: 500, headers, body: JSON.stringify({ error: { message: 'Empty response from Anthropic API.' } }) };
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch(e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: { message: 'Invalid JSON from Anthropic API: ' + text.slice(0, 200) } }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify(data) };

  } catch(err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: { message: 'Fetch error: ' + err.message } }) };
  }
};
