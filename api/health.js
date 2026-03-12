// Example Vercel Serverless API Handler
// This demonstrates how to create custom API endpoints
// Located at: /api/health.js
// Accessible at: https://yourdomain.com/api/health

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Health check endpoint
    if (req.method === 'GET') {
        return res.status(200).json({
            status: 'ok',
            message: 'VendorVue API is running',
            backend: process.env.BACKEND_URL || 'Not configured',
            timestamp: new Date().toISOString()
        });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
