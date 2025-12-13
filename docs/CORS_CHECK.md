# CORS Configuration Check Report

## ✅ Fixed Issues

### 1. Widget File CORS Headers (vercel.json)
**Status**: ✅ Fixed

**Changes:**
- Updated source pattern from `/experiment-widget.js` to `/(.*\.js)` to cover all JS files
- Added `Access-Control-Max-Age: 86400` for preflight caching
- Added `Accept` to allowed headers
- Changed `X-Frame-Options` from `DENY` to `SAMEORIGIN` for better compatibility

### 2. API Client CORS Mode (src/api.ts)
**Status**: ✅ Fixed

**Changes:**
- Added explicit `mode: 'cors'` to all fetch requests
- Added error handling with proper error messages
- Added response status checks before parsing JSON

## ⚠️ Important Requirements

### Backend API CORS Configuration

Your backend API (specified in `data-api-base`) **must** implement CORS headers. The widget cannot function without proper backend CORS support.

**Required Headers:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Accept
Access-Control-Max-Age: 86400
```

**Common Frameworks:**

#### Node.js / Express
```javascript
const cors = require('cors');
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  maxAge: 86400
}));
```

#### Next.js API Routes
```javascript
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Your API logic
}
```

#### Python / Flask
```python
from flask_cors import CORS
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
```

#### FastAPI
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"],
    max_age=86400,
)
```

## 🧪 Testing CORS

### 1. Test Widget Loading
Open browser console and check:
```javascript
fetch('https://your-project.vercel.app/experiment-widget.js')
  .then(r => console.log('Widget loaded:', r.ok))
  .catch(e => console.error('CORS error:', e));
```

### 2. Test Backend API
```javascript
fetch('https://your-api.com/api/v1/experiments/exp_123/assign', {
  method: 'GET',
  mode: 'cors',
  headers: { 'Content-Type': 'application/json' }
})
  .then(r => r.json())
  .then(d => console.log('API response:', d))
  .catch(e => console.error('CORS error:', e));
```

### 3. Check Response Headers
In browser DevTools > Network tab:
- Look for the API request
- Check Response Headers should include:
  - `access-control-allow-origin: *`
  - `access-control-allow-methods: GET, POST, OPTIONS`

## 🔧 Debugging CORS Issues

### Error: "No 'Access-Control-Allow-Origin' header"
**Cause**: Backend API is not configured for CORS
**Fix**: Add CORS headers to your backend API (see examples above)

### Error: "CORS preflight request failed"
**Cause**: Backend doesn't handle OPTIONS requests
**Fix**: Add OPTIONS handler that returns 200/204 with CORS headers

### Error: "Credentials not supported if Access-Control-Allow-Origin is *"
**Cause**: Trying to use credentials with wildcard origin
**Fix**: Either remove credentials or specify exact origin

### Widget loads but API requests fail
**Cause**: Widget CORS is OK, but backend CORS is not configured
**Fix**: Configure backend CORS headers

## ✅ Deployment Checklist

Before deploying, verify:

- [ ] `vercel.json` has CORS headers configured
- [ ] Backend API has CORS headers configured
- [ ] Test widget loading from different origin
- [ ] Test API requests in browser console
- [ ] Check Network tab for CORS errors
- [ ] Verify OPTIONS preflight requests return 200/204

## 📝 Summary

**Widget Side (Vercel)**: ✅ Fully configured
**Backend Side**: ⚠️ Requires your configuration

The widget is ready to be loaded from any domain. Make sure your backend API is properly configured with CORS headers before deployment.
