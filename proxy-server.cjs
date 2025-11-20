const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'CORS proxy is running' });
});

// Proxy POST requests to n8n webhook (for triggering workflow and getting responses)
app.post('/webhook/:webhookId', async (req, res) => {
    try {
        const webhookId = req.params.webhookId;
        const n8nUrl = `https://n8n-test.iohealth.com/webhook/${webhookId}`;

        console.log('Proxying request to n8n:', n8nUrl);
        console.log('Request body:', req.body);

        const response = await fetch(n8nUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(req.body)
        });

        console.log('n8n response status:', response.status);

        const data = await response.json().catch(() => ({}));
        console.log('n8n response data:', data);

        res.status(response.status).json(data);

    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Proxy POST requests to n8n resume URL (for webhook-waiting responses)
app.post('/resume', async (req, res) => {
    try {
        const { resumeUrl, data } = req.body;

        if (!resumeUrl) {
            return res.status(400).json({
                success: false,
                error: 'resumeUrl is required'
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
            body: JSON.stringify(data)
        });

        console.log('n8n resume response status:', response.status);

        const result = await response.json().catch(() => ({ success: true }));
        console.log('Resume response:', result);

        res.status(response.status).json(result);

    } catch (error) {
        console.error('Resume proxy error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`CORS Proxy Server running on port ${PORT}`);
    console.log(`Webhook proxy: http://localhost:${PORT}/webhook/:webhookId`);
    console.log(`Resume proxy: http://localhost:${PORT}/resume`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});
