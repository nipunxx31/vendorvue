# VendorVue - Vercel Deployment Guide

## Overview

VendorVue is a full-stack web application with:
- **Frontend**: React + Vite (deployed on Vercel as static site)
- **API**: Serverless functions on Vercel (`/api`)
- **Backend**: Express.js server (deployed separately, not on Vercel)

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Vercel Deployment                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Frontend (Static React App)                              │  │
│  │ - Built with Vite                                        │  │
│  │ - Served from /frontend/dist                             │  │
│  │ - Entry: index.html                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ API Proxy Layer (Serverless Functions)                   │  │
│  │ - Location: /api/[...slug].js                            │  │
│  │ - Routes all /api/* requests to Backend                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                      │
│        (Makes HTTP request to external Backend Server)           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                           ↓
                ┌──────────────────────────┐
                │   Backend Server         │
                │  (Express.js)            │
                │  MongoDB Connection      │
                │  Business Logic          │
                │                          │
                │ Deployed on:             │
                │ - Heroku                 │
                │ - Railway                │
                │ - AWS EC2                │
                │ - DigitalOcean           │
                │ - Render                 │
                └──────────────────────────┘
```

## Step 1: Prepare Frontend for Vercel Build

The frontend is configured with:
- **Build command**: `npm run build` (runs `vite build`)
- **Output directory**: `frontend/dist`
- **Framework**: React with Vite

No changes needed - already configured!

### Verify frontend build:
```bash
cd frontend
npm install
npm run build
```

This generates `frontend/dist/` with static files ready for Vercel.

## Step 2: Deploy Backend to External Service

Since Express.js cannot run on Vercel (serverless only), deploy to one of:

### Option A: Heroku (Free tier available)
```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create vendorvue-backend

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_connection_string

# Deploy
git subtree push --prefix backend heroku main
```

Backend runs at: `https://vendorvue-backend.herokuapp.com`

### Option B: Railway
```bash
# Connect to Railway
railway connect

# Deploy backend folder
# Set MONGODB_URI environment variable in Railway dashboard
```

### Option C: Render
- Connect GitHub repo
- Select `/backend` directory
- Set Environment: Node
- Set `MONGODB_URI` environment variable

### Option D: DigitalOcean App Platform
- Connect GitHub
- Select `/backend` directory  
- Configure `.env` with MongoDB URI

**Note**: All these services expect:
- **Root command**: `npm start` (or node server.js)
- **Environment variable**: `MONGODB_URI` set to your MongoDB connection string

## Step 3: Configure Vercel Environment Variables

On Vercel dashboard, set:

```
BACKEND_URL = https://your-backend-service.com
VITE_API_URL = /api
```

### Where to set:
1. Go to Vercel Dashboard → Your Project → Settings
2. → Environment Variables
3. Add `BACKEND_URL` with your backend service URL
4. Add `VITE_API_URL` = `/api`

## Step 4: Deploy to Vercel

### Method A: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from root directory
vercel --prod
```

### Method B: GitHub Integration (Recommended)
1. Push code to GitHub
2. Go to vercel.com → Add New → Import Git Repository
3. Select your vendorvue repo
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: ./frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: dist
5. Add Environment Variables (from Step 3)
6. Deploy!

### Method C: Vercel Dashboard
1. Go to vercel.com/new
2. Import GitHub repo
3. Follow deployment wizard
4. Set environment variables
5. Deploy

## Step 5: Verify Deployment

### Check Frontend:
- Visit your Vercel domain (e.g., `https://vendorvue.vercel.app`)
- Should see landing page

### Check API Proxy:
- Visit `https://vendorvue.vercel.app/api/test`
- Should return: `{"message":"Backend working 🚀"}`

### Check Backend Connection:
- Check browser console (F12) for any API errors
- Verify `BACKEND_URL` is set correctly in Vercel
- Ensure backend service is running and accessible

## Frontend Configuration Files

### `.env.production` (Used on Vercel)
```
VITE_API_URL=/api
```
- All API calls use `/api/*` routes
- Vercel redirects to `/api/[...slug].js`
- Which proxies to `$BACKEND_URL/api/*`

### `.env.development` (Used locally)
```
VITE_API_URL=http://localhost:5000/api
```
- Vite proxy (in vite.config.js) forwards to Express backend
- Backend runs on http://localhost:5000

## Development Workflow

### Local Development:

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm start
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
# Proxy forwards /api calls to http://localhost:5000
```

Visit `http://localhost:3000`

### With Custom Backend URL:

If backend is on external server (e.g., Railway):
```bash
cd frontend
BACKEND_URL=https://your-railway-app.up.railway.app npm run dev
```

## Troubleshooting

### API calls return 503 "Service unavailable"
- **Cause**: `BACKEND_URL` env var not set or backend is down
- **Fix**: 
  1. Check Vercel env vars are set
  2. Verify backend service is running
  3. Test backend URL directly in browser

### Frontend builds but API doesn't work
- **Cause**: Backend URL is incorrect or doesn't include `/api` path
- **Fix**: Backend URL should be like `https://api.example.com` (without `/api` suffix)

### CORS errors
- **Cause**: API proxy headers not configured
- **Fix**: Already handled in `/api/[...slug].js` - should work automatically

### "Cannot find module" errors on Vercel
- **Cause**: Dependencies not installed or .vercelignore excludes them
- **Fix**: Make sure `api/**/*.js` files can access node_modules

## File Structure for Deployment

```
vendorvue/
├── frontend/                    # React app (deployed to Vercel)
│   ├── dist/                   # Built static files (generated by vite build)
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.development        # Dev API URL
│   ├── .env.production         # Prod API URL (/api)
│   └── src/
│       ├── App.jsx
│       ├── pages/
│       ├── utils/api.js        # API helpers (uses VITE_API_URL)
│       └── ...
│
├── api/                         # Serverless functions (on Vercel)
│   ├── test.js                 # Example: /api/test
│   └── [...slug].js            # Dynamic proxy handler
│
├── backend/                     # Express server (deployed separately)
│   ├── server.js               # Main entry (node server.js)
│   ├── package.json
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── .env                    # MongoDB connection string
│
├── vercel.json                 # Vercel config (buildCommand, outputDirectory, rewrites)
└── .vercelignore               # Files/dirs to ignore in Vercel build
```

## Important Notes

### ✅ DO
- Set `BACKEND_URL` in Vercel environment variables
- Deploy backend to external service (Heroku, Railway, Render, etc.)
- Use relative `/api` paths in frontend for production
- Keep backend `.env` with MongoDB credentials secure

### ❌ DON'T
- Try to run Express server on Vercel (won't work - no long-running processes)
- Put MongoDB credentials in frontend code
- Use hardcoded backend URL in frontend code
- Commit `.env` files to Git

## Performance Tips

1. **Enable Caching**: Vercel caches static assets automatically
2. **Monitor Backend**: Set up monitoring/alerts for external backend service
3. **Use CDN**: Vercel includes Edge Network for fast global delivery
4. **Optimize Images**: Use Vite's image optimization
5. **Monitor Build Time**: Keep dependencies minimal

## Next Steps

1. ✅ Deploy backend to Railway/Heroku/Render
2. ✅ Get backend URL
3. ✅ Set `BACKEND_URL` env var in Vercel
4. ✅ Push to GitHub
5. ✅ Import repo in vercel.com
6. ✅ Deploy and test!

---

**Questions?** Check Vercel docs: https://vercel.com/docs
