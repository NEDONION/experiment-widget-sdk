# Experiment Widget SDK

[English](#) | [中文](./README.zh-CN.md)

## Overview

Lightweight, zero-dependency experiment widget SDK with automatic impression and click tracking for A/B testing.

**Features:**
- **Zero Configuration**: Just one `<script>` tag
- **Lightweight**: Only 3.38 KB gzipped
- **Style Isolation**: Shadow DOM prevents style conflicts
- **Auto Tracking**: Automatic impression and click tracking
- **TypeScript**: Full type support

---

## Quick Start

### 1. Deploy to Vercel (Recommended)

**Option A: One-Click Deploy Script**

```bash
bash scripts/deploy.sh
```

**Option B: Manual Deploy**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

You'll get a URL like: `https://experiment-widget-sdk.vercel.app`

### 2. Embed Widget

Add this script tag to any webpage:

```html
<script
  src="https://your-project.vercel.app/experiment-widget.js"
  data-api-base="https://api.example.com/api/v1"
  data-experiment-id="exp_123"
  data-user-key="optional_user_id"
  async>
</script>
```

### 3. Parameters

| Attribute | Required | Description |
|-----------|----------|-------------|
| `src` | Yes | Widget CDN URL |
| `data-api-base` | Yes | Backend API base URL |
| `data-experiment-id` | Yes | Experiment ID |
| `data-user-key` | No | User identifier (optional) |
| `async` | Recommended | Async loading, non-blocking |

---

## Usage Examples

### Basic Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome</h1>

  <script
    src="https://your-project.vercel.app/experiment-widget.js"
    data-api-base="https://api.example.com/api/v1"
    data-experiment-id="exp_123"
    async>
  </script>
</body>
</html>
```

### Dynamic Loading with JavaScript

```html
<script>
  const script = document.createElement('script');
  script.src = 'https://your-project.vercel.app/experiment-widget.js';
  script.async = true;
  script.dataset.apiBase = 'https://api.example.com/api/v1';
  script.dataset.experimentId = 'exp_123';
  script.dataset.userKey = 'user_456';

  document.body.appendChild(script);
</script>
```

### React Integration

```jsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://your-project.vercel.app/experiment-widget.js';
    script.async = true;
    script.dataset.apiBase = 'https://api.example.com/api/v1';
    script.dataset.experimentId = 'exp_react_app';
    script.dataset.userKey = 'user_123';

    document.body.appendChild(script);

    return () => {
      const widgetRoot = document.getElementById('exp-widget-root');
      if (widgetRoot) widgetRoot.remove();
      script.remove();
    };
  }, []);

  return <div className="App"><h1>My React App</h1></div>;
}
```

### Vue 3 Integration

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue';

let scriptElement = null;

onMounted(() => {
  scriptElement = document.createElement('script');
  scriptElement.src = 'https://your-project.vercel.app/experiment-widget.js';
  scriptElement.async = true;
  scriptElement.dataset.apiBase = 'https://api.example.com/api/v1';
  scriptElement.dataset.experimentId = 'exp_vue_app';

  document.body.appendChild(scriptElement);
});

onUnmounted(() => {
  const widgetRoot = document.getElementById('exp-widget-root');
  if (widgetRoot) widgetRoot.remove();
  if (scriptElement) scriptElement.remove();
});
</script>
```

### Next.js Integration

```jsx
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Script
        src="https://your-project.vercel.app/experiment-widget.js"
        strategy="afterInteractive"
        data-api-base="https://api.example.com/api/v1"
        data-experiment-id="exp_nextjs_app"
      />
    </>
  );
}
```

---

## Local Development

### Install Dependencies

```bash
npm install
```

### Development Mode

```bash
npm run dev
```

Visit: `http://localhost:5173`

### Production Build

```bash
npm run build
```

Output: `dist/experiment-widget.js` (10.83 kB, gzip: 3.38 kB)

### Preview Build

```bash
npm run preview
```

Visit: `http://localhost:4173`

---

## API Endpoints

The widget requires the following backend endpoints:

### ⚠️ Important: Backend CORS Configuration

Your backend API **must** support CORS to allow the widget to make requests from any domain. Add these headers to your API responses:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Accept
Access-Control-Max-Age: 86400
```

**Example configurations:**

<details>
<summary>Node.js / Express</summary>

```javascript
const cors = require('cors');

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  maxAge: 86400
}));
```
</details>

<details>
<summary>Next.js API Routes</summary>

```javascript
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Your API logic here
}
```
</details>

<details>
<summary>Python / Flask</summary>

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
```
</details>

<details>
<summary>Nginx</summary>

```nginx
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
add_header Access-Control-Allow-Headers 'Content-Type, Accept';
add_header Access-Control-Max-Age 86400;

if ($request_method = 'OPTIONS') {
    return 204;
}
```
</details>

### 1. Get Experiment Content

```
GET /experiments/{experiment_id}/assign?user_key={user_key}
```

**Response Example:**

```json
{
  "code": 0,
  "data": {
    "creative_id": "c1",
    "title": "AI Creative Platform",
    "product_name": "Product Name",
    "cta_text": "Learn More",
    "image_url": "https://example.com/image.jpg",
    "selling_points": ["Point 1", "Point 2"]
  }
}
```

### 2. Track Impression

```
POST /experiments/{experiment_id}/hit
```

**Request Body:**

```json
{
  "creative_id": "c1",
  "anon_id": "anon_xxx",
  "ts": 1234567890,
  "page_url": "https://example.com/page"
}
```

### 3. Track Click

```
POST /experiments/{experiment_id}/click
```

**Request Body:**

```json
{
  "creative_id": "c1",
  "anon_id": "anon_xxx",
  "ts": 1234567890,
  "page_url": "https://example.com/page"
}
```

---

## Tracking Mechanics

### Impression Tracking

- **Trigger**: Element enters viewport ≥ 50%, duration ≥ 500ms
- **Deduplication**: Only reported once per `creative_id`
- **Implementation**: IntersectionObserver

### Click Tracking

- **Trigger**: User clicks the widget card
- **Method**: Prioritizes `navigator.sendBeacon`, falls back to `fetch` with `keepalive`

---

## Architecture

### Project Structure

```
experiment-widget-sdk/
├── src/
│   ├── index.ts        # Entry point (IIFE)
│   ├── widget.ts       # Main component
│   ├── api.ts          # API client
│   ├── tracker.ts      # Tracking logic
│   ├── styles.ts       # Styles (injected to Shadow DOM)
│   └── types.ts        # TypeScript types
├── dist/               # Build output
│   └── experiment-widget.js
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
└── package.json
```

### Tech Stack

- **TypeScript**: Type safety
- **Vite**: Fast build, IIFE output
- **Shadow DOM**: Style isolation
- **IntersectionObserver**: High-performance impression tracking
- **Navigator.sendBeacon**: Reliable data reporting

---

## Deployment

### Quick Deploy to Vercel

**Method 1: Using Vercel CLI (Recommended)**

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

After deployment, you'll get a URL like:
```
https://experiment-widget-sdk-xxx.vercel.app
```

**Method 2: Deploy via GitHub**

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/experiment-widget-sdk.git
git push -u origin main
```

2. **Import to Vercel**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Connect your GitHub account
   - Select the repository
   - Vercel will auto-detect settings
   - Click **Deploy**

3. **Automatic Deployments**
   - Every push to `main` triggers a new deployment
   - Preview deployments for pull requests

### Configuration Files

The project includes pre-configured files:

**vercel.json** - Vercel deployment settings
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "headers": [...]  // CORS headers already configured
}
```

**.node-version** - Node.js version
```
20
```

**package.json** - Build configuration
```json
{
  "scripts": {
    "build": "vite build"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Using Custom Domain

1. In Vercel dashboard, go to your project
2. Click **Settings** > **Domains**
3. Add your domain: `widget.yourdomain.com`
4. Follow DNS configuration instructions
5. Wait for DNS propagation (usually < 5 minutes)

Then use your custom domain:
```html
<script
  src="https://widget.yourdomain.com/experiment-widget.js"
  data-api-base="https://api.yourdomain.com/api/v1"
  data-experiment-id="exp_123"
  async>
</script>
```

### Deployment Checklist

Before deploying, make sure:

- [ ] Local build succeeds: `npm run build`
- [ ] `dist/experiment-widget.js` is generated
- [ ] Backend API supports CORS (see API Endpoints section)
- [ ] `vercel.json` is in project root
- [ ] Git repository is initialized

### Update Deployment

**Automatic (via GitHub):**
```bash
git add .
git commit -m "Update widget"
git push
# Vercel auto-deploys
```

**Manual (via CLI):**
```bash
vercel --prod
```

---

## Troubleshooting

### Build Errors

**Error: "Could not resolve entry module 'index.html'"**

This error occurs when Vite tries to find `index.html` instead of using library mode.

✅ **Solution**: Make sure your `vite.config.ts` has:
```typescript
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      // ...
    },
  },
});
```

And ensure `@types/node` is installed:
```bash
npm install -D @types/node
```

**Error: Build fails on Vercel but works locally**

✅ **Solution**:
1. Check Node.js version matches (`.node-version` file should have `20`)
2. Make sure all dependencies are in `package.json`
3. Run `npm install` and `npm run build` locally to verify

### Runtime Errors

**Widget Not Showing?**

1. Open browser console (F12)
2. Check for error messages
3. Verify `data-api-base` and `data-experiment-id` are set
4. Test if backend API is accessible

**CORS Error?**

Ensure your **backend API** has CORS headers configured (see API Endpoints section).

The widget file itself already has CORS configured in `vercel.json`.

**API Request Failed?**

Test API accessibility:
```bash
curl https://your-api.com/api/v1/experiments/exp_123/assign
```

Check response format matches the expected schema.

### Deployment Issues

**Vercel deployment times out**

✅ **Solution**:
- Default build timeout is 2 minutes (should be enough)
- If needed, upgrade Vercel plan for longer timeouts
- Check build logs for specific errors

**Changes not reflecting after deployment**

✅ **Solution**: Clear browser cache or use versioned URLs:
```html
<script src="https://your-project.vercel.app/experiment-widget.js?v=20231213" ...>
```

**Custom domain not working**

✅ **Solution**:
1. Verify DNS records are correctly configured
2. Wait 5-10 minutes for DNS propagation
3. Check Vercel dashboard for SSL certificate status
4. Try accessing via `https://` (not `http://`)

---

## Best Practices

### 1. Use CDN
Vercel provides global CDN automatically.

### 2. Version Control

```bash
npm version patch  # 1.0.0 -> 1.0.1
npm run build
git push --tags
vercel --prod
```

### 3. Preview Deployments

Use branches for testing:

```bash
git checkout -b feature/new-ui
git push origin feature/new-ui
# Vercel generates preview URL automatically
```

### 4. Error Monitoring

Integrate error tracking:

```typescript
try {
  new ExperimentWidget(config);
} catch (error) {
  if (window.Sentry) {
    Sentry.captureException(error);
  }
  console.error('[ExperimentWidget] Init failed', error);
}
```

---

## Comparison with Traditional Approach

### Traditional Approach (Invasive)

```tsx
import ExperimentWidget from './components/ExperimentWidget';

function App() {
  return (
    <div>
      <ExperimentWidget />
    </div>
  );
}
```

**Drawbacks:**
- Requires modifying client code
- Depends on client's React environment
- Tightly coupled with client codebase
- Requires client rebuild for updates

### New Approach (Independent)

```html
<script
  src="https://cdn.example.com/experiment-widget.js"
  data-api-base="https://api.example.com/api/v1"
  data-experiment-id="exp_123"
  async>
</script>
```

**Benefits:**
- Zero intrusion: no client code changes
- Independent deployment via CDN
- Zero dependencies: framework-agnostic
- Style isolation: Shadow DOM
- Instant updates: no client rebuild needed

---

## License

ISC
