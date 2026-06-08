const { renderBrandGuide, safeName } = require('../../shared/render-brand-guide-core');

exports.handler = async function handler(event) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { ...cors, 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { ...cors, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Use POST' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const html = renderBrandGuide(body);
    const clientName = body?.guide?.clientName || body?.project?.clientName || body?.clientName || 'brand-guide';

    return {
      statusCode: 200,
      headers: {
        ...cors,
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${safeName(clientName)}-brand-identity-guide.html"`
      },
      body: html
    };
  } catch (error) {
    return { statusCode: 500, headers: { ...cors, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: error.message || 'Render failed' }) };
  }
};
