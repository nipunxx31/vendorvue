// Dynamic API handler - catches all /api/* requests and proxies to backend
// Usage: GET, POST, PUT, PATCH, DELETE requests to /api/... are forwarded to backend

const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

const createApiClient = () => {
  return axios.create({
    baseURL: BACKEND_URL,
    timeout: 15000,
    validateStatus: () => true // Don't throw on any status code
  });
};

export default async function handler(req, res) {
  try {
    // Extract path from query slug
    const slug = req.query.slug || [];
    const pathArray = Array.isArray(slug) ? slug : [slug];
    const path = `/${pathArray.join('/')}`;
    
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle preflight CORS
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const apiClient = createApiClient();
    
    // Build headers, forwarding Authorization
    const forwardHeaders = {
      'Content-Type': 'application/json',
    };

    if (req.headers.authorization) {
      forwardHeaders['Authorization'] = req.headers.authorization;
    }

    // Build URL with query string
    let url = `/api${path}`;
    if (Object.keys(req.query).length > 0) {
      const filteredQuery = { ...req.query };
      delete filteredQuery.slug; // Remove slug from query params
      const queryString = new URLSearchParams(filteredQuery).toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    console.log(`[${req.method}] ${url}`);

    let response;

    try {
      switch (req.method) {
        case 'GET':
          response = await apiClient.get(url, { 
            headers: forwardHeaders,
            params: req.query 
          });
          break;
        case 'POST':
          response = await apiClient.post(url, req.body, { 
            headers: forwardHeaders 
          });
          break;
        case 'PUT':
          response = await apiClient.put(url, req.body, { 
            headers: forwardHeaders 
          });
          break;
        case 'PATCH':
          response = await apiClient.patch(url, req.body, { 
            headers: forwardHeaders 
          });
          break;
        case 'DELETE':
          response = await apiClient.delete(url, { 
            headers: forwardHeaders 
          });
          break;
        default:
          return res.status(405).json({ error: 'Method not allowed' });
      }

      // Forward response status and data
      res.status(response.status);
      res.json(response.data);
    } catch (backendError) {
      console.error('Backend request error:', backendError.message);
      throw backendError;
    }
  } catch (error) {
    console.error('API Handler Error:', error.message);
    
    // Check if it's a connection error
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({ 
        error: 'Backend service unavailable',
        message: `Cannot connect to backend at ${process.env.BACKEND_URL || 'http://localhost:5000'}`,
        details: error.message
      });
    }

    // Return error response
    res.status(error.response?.status || 500).json({
      error: 'API request failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
