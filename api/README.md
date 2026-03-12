# VendorVue API - Serverless Handlers

## Overview

This directory contains Vercel serverless function handlers that:
1. **Proxy requests** to the backend Express server (main API)
2. **Handle specific endpoints** (health checks, custom logic)
3. **Manage CORS** and request/response formatting
4. **Forward headers** including Authorization tokens

## Files

### `[...slug].js` - Main API Proxy
**Purpose**: Catch-all handler for all `/api/*` requests

**How it works**:
- Any request to `/api/vendors` → captured by `[...slug].js`
- Path is extracted: `/vendors`
- Request is forwarded to `${BACKEND_URL}/api/vendors`
- Response is returned to client

**Supported Methods**: GET, POST, PUT, PATCH, DELETE, OPTIONS

**Example Requests**:
```
GET /api/vendors
GET /api/vendors/123
POST /api/orders
PATCH /api/orders/456/status
DELETE /api/menu/789
```

All are handled by `[...slug].js` and forwarded to backend.

### `test.js` - API Status
**File**: `/api/test.js`  
**Route**: `/api/test`  
**Method**: GET  
**Returns**:
```json
{
  "message": "Backend working 🚀"
}
```

### `health.js` - Health Check  
**File**: `/api/health.js`
**Route**: `/api/health`
**Method**: GET
**Returns**:
```json
{
  "status": "ok",
  "message": "VendorVue API is running",
  "backend": "https://your-backend-url.com",
  "timestamp": "2024-03-12T10:30:00Z"
}
```

## Configuration

### Environment Variables Required

Set these in Vercel Dashboard → Settings → Environment Variables:

```
BACKEND_URL = https://your-backend-service.com
```

**Examples**:
- Heroku: `https://vendorvue-backend.herokuapp.com`
- Railway: `https://vendorvue-backend.up.railway.app`
- Render: `https://vendorvue-backend.onrender.com`
- DigitalOcean: `https://app-name.app/`
- Custom: `https://api.yourdomain.com`

**Note**: Do NOT include `/api` in the URL - `[...slug].js` adds it automatically.

## How Routing Works

### Development (Local)

```
Browser: GET /api/vendors
         ↓
Frontend Vite Proxy (vite.config.js)
         ↓
Backend Express: GET /api/vendors on http://localhost:5000
         ↓
Response: JSON data
```

**Config in**: `frontend/vite.config.js`
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000'
  }
}
```

### Production (Vercel)

```
Browser: GET /api/vendors
         ↓
Vercel Router
         ↓
[...slug].js (Serverless Function)
         ↓
HTTP Request: GET ${BACKEND_URL}/api/vendors
         ↓
Backend Server Response: JSON data
         ↓
Response to Browser: JSON data
```

## CORS Handling

All handlers include CORS headers by default:

```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```

This allows:
- Frontend on any domain to call the API
- All HTTP methods
- Authorization headers for JWT tokens

## Authentication

JWT tokens are forwarded automatically:

```javascript
// Client sends:
GET /api/vendors
Authorization: Bearer eyJhbGc...

// [...slug].js forwards:
GET ${BACKEND_URL}/api/vendors
Authorization: Bearer eyJhbGc...

// Backend processes token & returns data
```

No changes needed for authentication - works transparently!

## Error Handling

### Backend Error
```
[...slug].js receives 404 from backend
↓
Returns 404 to client with backend error message
```

### Backend Unavailable
```
Cannot connect to ${BACKEND_URL}
↓
Returns 503 with message: "Backend service unavailable"
```

### Connection Timeout
```
No response from backend after 15 seconds
↓
Returns 504 Gateway Timeout
```

## Debugging

### Check Health
```bash
curl https://yourdomain.com/api/health
```

### Check Test Endpoint
```bash
curl https://yourdomain.com/api/test
```

### Check Backend Connection
Visit Vercel deployment settings → Functions → Logs

Look for:
```
[GET] /api/vendors
```

If error, check:
1. `BACKEND_URL` env var is set
2. Backend URL is accessible from internet
3. Backend server is running
4. No firewall/IP restrictions

## Creating Custom API Handlers

You can create additional serverless functions for specific routes:

### Example: Custom Auth Endpoint

**File**: `/api/auth.js`

```javascript
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'POST') {
    // Custom authentication logic
    const { username, password } = req.body;
    
    // Validate & create JWT token
    const token = createJWT(username);
    
    return res.status(200).json({ token });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
```

**Accessible at**: `https://yourdomain.com/api/auth`

### File Structure
```
api/
├── [...]slug].js          # Main proxy (all /api/* routes)
├── test.js                # GET /api/test
├── health.js              # GET /api/health  
├── auth.js                # Custom auth endpoint
└── custom.js              # Any other custom handler
```

## Performance Notes

### Cold Starts
- First request to serverless function: ~500-1000ms (cold start)
- Subsequent requests: ~50-100ms (warm)

### Timeouts
- Default: 60 seconds
- Max response time from backend: 15 seconds (configured in `[...slug].js`)

### Data Limits
- Request body: 6MB max
- Response body: 6MB max

## Monitoring

Monitor Vercel serverless functions at:
- Vercel Dashboard → Project → Functions → Metrics
- Check invocations, duration, errors

Set alerts for:
- High error rate
- High cold start count  
- Timeout errors

## Troubleshooting

### API returns 503 "Backend service unavailable"
1. Check `BACKEND_URL` in Vercel env vars
2. Verify backend service is running
3. Test backend URL directly: `curl ${BACKEND_URL}/api/test`

### API returns 504 "Gateway Timeout"
1. Backend is slow (> 15 seconds)
2. Check backend logs for slow queries
3. Increase timeout in `[...slug].js` if needed

### Missing Authorization header in backend
1. Check frontend sends header: `Authorization: Bearer ...`
2. `[...slug].js` should forward it automatically
3. Check backend console logs

### CORS errors in browser
1. Should be handled by CORS headers in handlers
2. Check browser console for exact error
3. Verify `Access-Control-Allow-Origin` header

---

For more info: [Vercel Docs](https://vercel.com/docs/serverless-functions/introduction)
