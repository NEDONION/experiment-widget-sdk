# Experiment Widget SDK

[English](./README.md) | [中文](#)

## 概述

轻量级、零依赖的实验插件 SDK，支持 A/B 测试的自动曝光和点击追踪。

**特性：**
- **零配置接入**: 仅需一行 `<script>` 标签
- **轻量级**: 压缩后仅 3.38 KB (gzip)
- **样式隔离**: Shadow DOM 防止样式冲突
- **自动埋点**: 自动收集曝光和点击数据
- **TypeScript**: 完整的类型支持

---

## 快速开始

### 1. 部署到 Vercel（推荐）

**方式 A：一键部署脚本**

```bash
bash scripts/deploy.sh
```

**方式 B：手动部署**

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

你会得到一个 URL：`https://experiment-widget-sdk.vercel.app`

### 2. 嵌入插件

在任何网页中添加以下代码:

```html
<script
  src="https://your-project.vercel.app/experiment-widget.js"
  data-api-base="https://api.example.com/api/v1"
  data-experiment-id="exp_123"
  data-user-key="optional_user_id"
  async>
</script>
```

### 3. 参数说明

| 参数 | 必填 | 说明 |
|------|------|------|
| `src` | 是 | 插件的 CDN 地址 |
| `data-api-base` | 是 | 后端 API 基地址 |
| `data-experiment-id` | 是 | 实验 ID |
| `data-user-key` | 否 | 用户标识（可选） |
| `async` | 推荐 | 异步加载，不阻塞页面渲染 |

---

## 使用示例

### 基础示例

```html
<!DOCTYPE html>
<html>
<head>
  <title>我的网站</title>
</head>
<body>
  <h1>欢迎</h1>

  <script
    src="https://your-project.vercel.app/experiment-widget.js"
    data-api-base="https://api.example.com/api/v1"
    data-experiment-id="exp_123"
    async>
  </script>
</body>
</html>
```

### 使用 JavaScript 动态加载

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

### React 集成

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

  return <div className="App"><h1>我的 React 应用</h1></div>;
}
```

### Vue 3 集成

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

### Next.js 集成

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

## 本地开发

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问：`http://localhost:5173`

### 生产构建

```bash
npm run build
```

输出：`dist/experiment-widget.js` (10.83 kB, gzip: 3.38 kB)

### 预览构建产物

```bash
npm run preview
```

访问：`http://localhost:4173`

---

## API 接口

插件需要后端提供以下接口：

### ⚠️ 重要：后端 CORS 配置

你的后端 API **必须**支持 CORS，以允许插件从任何域名发起请求。在你的 API 响应中添加以下 headers：

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Accept
Access-Control-Max-Age: 86400
```

**配置示例：**

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

  // 你的 API 逻辑
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

### 1. 获取实验内容

```
GET /experiments/{experiment_id}/assign?user_key={user_key}
```

**响应示例：**

```json
{
  "code": 0,
  "data": {
    "creative_id": "c1",
    "title": "AI 创意生成平台",
    "product_name": "Product Name",
    "cta_text": "了解更多",
    "image_url": "https://example.com/image.jpg",
    "selling_points": ["卖点1", "卖点2"]
  }
}
```

### 2. 上报曝光

```
POST /experiments/{experiment_id}/hit
```

**请求体：**

```json
{
  "creative_id": "c1",
  "anon_id": "anon_xxx",
  "ts": 1234567890,
  "page_url": "https://example.com/page"
}
```

### 3. 上报点击

```
POST /experiments/{experiment_id}/click
```

**请求体：**

```json
{
  "creative_id": "c1",
  "anon_id": "anon_xxx",
  "ts": 1234567890,
  "page_url": "https://example.com/page"
}
```

---

## 埋点说明

### 曝光（Impression）

- **触发条件**: 元素进入可视区域 ≥ 50%，持续 ≥ 500ms
- **去重策略**: 同一 `creative_id` 仅上报一次
- **实现方式**: IntersectionObserver

### 点击（Click）

- **触发条件**: 用户点击广告卡片
- **上报方式**: 优先使用 `navigator.sendBeacon`，降级为 `fetch` with `keepalive`

---

## 架构说明

### 目录结构

```
experiment-widget-sdk/
├── src/
│   ├── index.ts        # 入口文件（IIFE）
│   ├── widget.ts       # 主组件
│   ├── api.ts          # API 客户端
│   ├── tracker.ts      # 埋点追踪
│   ├── styles.ts       # 样式（注入 Shadow DOM）
│   └── types.ts        # TypeScript 类型定义
├── dist/               # 构建产物
│   └── experiment-widget.js
├── vite.config.ts      # Vite 配置
├── tsconfig.json       # TypeScript 配置
└── package.json
```

### 技术栈

- **TypeScript**: 类型安全
- **Vite**: 快速构建，IIFE 格式输出
- **Shadow DOM**: 样式隔离
- **IntersectionObserver**: 高性能曝光监测
- **Navigator.sendBeacon**: 可靠的数据上报

---

## 部署

### 快速部署到 Vercel

**方法 1：使用 Vercel CLI（推荐）**

```bash
# 全局安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 部署到生产环境
vercel --prod
```

部署完成后，你会得到一个 URL：
```
https://experiment-widget-sdk-xxx.vercel.app
```

**方法 2：通过 GitHub 部署**

1. **推送到 GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/experiment-widget-sdk.git
git push -u origin main
```

2. **导入到 Vercel**
   - 访问 [vercel.com/new](https://vercel.com/new)
   - 连接你的 GitHub 账号
   - 选择仓库
   - Vercel 会自动检测配置
   - 点击 **Deploy**

3. **自动部署**
   - 每次推送到 `main` 分支都会触发新部署
   - Pull Request 会生成预览部署

### 配置文件

项目已包含预配置文件：

**vercel.json** - Vercel 部署设置
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "headers": [...]  // CORS 头已配置
}
```

**.node-version** - Node.js 版本
```
20
```

**package.json** - 构建配置
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

### 使用自定义域名

1. 在 Vercel 控制台进入你的项目
2. 点击 **Settings** > **Domains**
3. 添加你的域名：`widget.yourdomain.com`
4. 按照 DNS 配置说明操作
5. 等待 DNS 生效（通常 < 5 分钟）

然后使用自定义域名：
```html
<script
  src="https://widget.yourdomain.com/experiment-widget.js"
  data-api-base="https://api.yourdomain.com/api/v1"
  data-experiment-id="exp_123"
  async>
</script>
```

### 部署检查清单

部署前确保：

- [ ] 本地构建成功：`npm run build`
- [ ] 生成了 `dist/experiment-widget.js`
- [ ] 后端 API 支持 CORS（见 API 接口章节）
- [ ] 项目根目录有 `vercel.json`
- [ ] Git 仓库已初始化

### 更新部署

**自动更新（通过 GitHub）：**
```bash
git add .
git commit -m "更新 widget"
git push
# Vercel 自动部署
```

**手动更新（通过 CLI）：**
```bash
vercel --prod
```

---

## 常见问题

### 构建错误

**错误：「Could not resolve entry module 'index.html'」**

这个错误发生在 Vite 尝试查找 `index.html` 而不是使用库模式时。

✅ **解决方案**：确保你的 `vite.config.ts` 包含：
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

并确保已安装 `@types/node`：
```bash
npm install -D @types/node
```

**错误：在 Vercel 上构建失败但本地成功**

✅ **解决方案**：
1. 检查 Node.js 版本是否匹配（`.node-version` 文件应该是 `20`）
2. 确保所有依赖都在 `package.json` 中
3. 本地运行 `npm install` 和 `npm run build` 验证

### 运行时错误

**插件没有显示？**

1. 打开浏览器控制台（F12）
2. 检查是否有错误提示
3. 确认 `data-api-base` 和 `data-experiment-id` 已填写
4. 检查后端 API 是否可访问

**CORS 跨域错误？**

确保你的**后端 API** 配置了 CORS 响应头（见 API 接口章节）。

Widget 文件本身的 CORS 已经在 `vercel.json` 中配置好了。

**API 请求失败？**

测试 API 是否可访问：
```bash
curl https://your-api.com/api/v1/experiments/exp_123/assign
```

检查返回格式是否符合预期。

### 部署问题

**Vercel 部署超时**

✅ **解决方案**：
- 默认构建超时是 2 分钟（应该足够）
- 如需更长时间，升级 Vercel 套餐
- 检查构建日志查看具体错误

**部署后更改没有生效**

✅ **解决方案**：清除浏览器缓存或使用带版本号的 URL：
```html
<script src="https://your-project.vercel.app/experiment-widget.js?v=20231213" ...>
```

**自定义域名不工作**

✅ **解决方案**：
1. 验证 DNS 记录配置正确
2. 等待 5-10 分钟让 DNS 生效
3. 检查 Vercel 控制台中的 SSL 证书状态
4. 尝试使用 `https://`（不是 `http://`）

---

## 最佳实践

### 1. 使用 CDN
Vercel 自带全球 CDN，无需额外配置。

### 2. 版本控制

```bash
npm version patch  # 1.0.0 -> 1.0.1
npm run build
git push --tags
vercel --prod
```

### 3. 预览部署

使用分支进行测试:

```bash
git checkout -b feature/new-ui
git push origin feature/new-ui
# Vercel 会自动生成预览 URL
```

### 4. 错误监控

集成错误追踪:

```typescript
try {
  new ExperimentWidget(config);
} catch (error) {
  if (window.Sentry) {
    Sentry.captureException(error);
  }
  console.error('[ExperimentWidget] 初始化失败', error);
}
```

---

## 与原有方案的对比

### 原有方案（侵入式）

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

**缺点：**
- 需要修改客户端代码
- 依赖客户端的 React 环境
- 与客户端代码耦合
- 需要重新构建客户端项目

### 新方案（独立部署）

```html
<script
  src="https://cdn.example.com/experiment-widget.js"
  data-api-base="https://api.example.com/api/v1"
  data-experiment-id="exp_123"
  async>
</script>
```

**优点：**
- ✅ 零侵入: 无需修改客户端代码
- ✅ 独立部署: 通过 CDN 分发
- ✅ 零依赖: 不依赖客户端框架
- ✅ 样式隔离: Shadow DOM 防止样式冲突
- ✅ 即时更新: 更新插件无需重新构建客户端

---

## 许可证

ISC
