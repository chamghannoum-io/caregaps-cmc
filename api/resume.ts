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
    const { resumeUrl, data } = req.body;

    if (!resumeUrl) {
      return res.status(400).json({
        success: false,
        error: 'resumeUrl is required',
      });
    }

    console.log('Resuming workflow at:', resumeUrl);
    console.log('📝 Response data:', data);

    const response = await fetch(resumeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('n8n resume response status:', response.status);

    const result = await response.json().catch(() => ({ success: true }));
    console.log('Resume response:', result);

    return res.status(response.status).json(result);
  } catch (error: any) {
    console.error('Resume proxy error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

