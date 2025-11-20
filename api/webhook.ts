import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const webhookId = req.query.webhookId || '97f934a7-db3a-478f-a0f0-1cebca68112d';
    const n8nUrl = `https://n8n-test.iohealth.com/webhook/${webhookId}`;

    console.log('Proxying request to n8n:', n8nUrl);
    console.log('Request body:', req.body);

    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    console.log('n8n response status:', response.status);

    const data = await response.json().catch(() => ({}));
    console.log('n8n response data:', data);

    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error('Proxy error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

