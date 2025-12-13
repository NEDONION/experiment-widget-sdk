# Experiment Widget SDK 使用与部署指南

本文档介绍如何使用 Experiment Widget SDK，以及如何将其部署到 Vercel。

---

## 📋 目录

- [快速开始](#快速开始)
- [本地开发](#本地开发)
- [部署到 Vercel](#部署到-vercel)
- [使用已部署的插件](#使用已部署的插件)
- [配置说明](#配置说明)
- [常见问题](#常见问题)

---

## 🚀 快速开始

### 前置要求

- Node.js 16+
- npm 或 yarn
- Git
- Vercel 账号（可选，用于部署）

### 安装依赖

```bash
# 克隆项目（如果还没有）
git clone <your-repo-url>
cd experiment-widget-sdk

# 安装依赖
npm install
```

---

## 💻 本地开发

### 1. 开发模式（带热更新）

适合开发调试时使用：

```bash
npm run dev
```

- 访问：`http://localhost:5173`
- 会自动打开 `index.html`
- 修改代码后自动刷新
- TypeScript 实时编译

### 2. 生产构建

```bash
npm run build
```

**输出：**
```
dist/experiment-widget.js  10.83 kB │ gzip: 3.38 kB
```

### 3. 预览构建产物

```bash
npm run preview
```

- 访问：`http://localhost:4173`
- 预览生产环境的构建结果

### 4. 本地测试

打开 `example.html` 文件（需要先构建）：

```bash
npm run build
open example.html  # macOS
# 或者直接用浏览器打开 example.html
```

---

## ☁️ 部署到 Vercel

### 方法一：通过 Vercel CLI（推荐）

#### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 2. 登录 Vercel

```bash
vercel login
```

按提示完成登录（支持 GitHub、GitLab、Bitbucket、Email）。

#### 3. 部署项目

在项目根目录执行：

```bash
vercel
```

**首次部署时会提示：**

```
? Set up and deploy "~/experiment-widget-sdk"? [Y/n] y
? Which scope do you want to deploy to? Your Name
? Link to existing project? [y/N] n
? What's your project's name? experiment-widget-sdk
? In which directory is your code located? ./
```

选择：
- ✅ 部署到你的个人账号
- ✅ 创建新项目
- ✅ 项目名：`experiment-widget-sdk`
- ✅ 代码目录：`./`（默认）

#### 4. 配置构建设置

Vercel 会自动检测到 Vite 项目，但需要确认：

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

#### 5. 部署到生产环境

```bash
vercel --prod
```

**部署完成后会显示：**

```
✅  Production: https://experiment-widget-sdk.vercel.app [copied to clipboard]
```

---

### 方法二：通过 Vercel 网页端

#### 1. 推送代码到 Git

```bash
# 初始化 Git（如果还没有）
git init
git add .
git commit -m "Initial commit"

# 推送到 GitHub
git remote add origin https://github.com/your-username/experiment-widget-sdk.git
git branch -M main
git push -u origin main
```

#### 2. 导入到 Vercel

1. 访问 [vercel.com](https://vercel.com)
2. 点击 **"New Project"**
3. 选择你的 GitHub 仓库 `experiment-widget-sdk`
4. 配置项目：

```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

5. 点击 **"Deploy"**

#### 3. 等待部署完成

通常只需 30-60 秒，完成后会显示：

```
🎉 Your project is live at:
https://experiment-widget-sdk.vercel.app
```

---

### 添加 vercel.json 配置（可选但推荐）

在项目根目录创建 `vercel.json`：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "headers": [
    {
      "source": "/experiment-widget.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

**配置说明：**
- `Cache-Control`: 缓存 1 年（因为文件内容变化时 URL 会变）
- `Access-Control-Allow-Origin`: 允许跨域访问（重要！）

提交并推送：

```bash
git add vercel.json
git commit -m "Add Vercel config"
git push
```

Vercel 会自动重新部署。

---

## 📦 使用已部署的插件

部署完成后，你会得到一个 CDN 地址，例如：

```
https://experiment-widget-sdk.vercel.app/experiment-widget.js
```

### 在任何网站中使用

只需在 HTML 中添加一行代码：

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Website</title>
</head>
<body>
  <h1>Welcome to My Website</h1>
  <p>Some content here...</p>

  <!-- Experiment Widget SDK 插件 -->
  <script
    src="https://experiment-widget-sdk.vercel.app/experiment-widget.js"
    data-api-base="https://your-api.com/api/v1"
    data-experiment-id="exp_123"
    async>
  </script>
</body>
</html>
```

### 参数说明

| 参数 | 必填 | 示例 | 说明 |
|------|------|------|------|
| `src` | ✅ | `https://experiment-widget-sdk.vercel.app/experiment-widget.js` | 插件的 CDN 地址 |
| `data-api-base` | ✅ | `https://api.example.com/api/v1` | 后端 API 基地址 |
| `data-experiment-id` | ✅ | `exp_123` | 实验 ID |
| `data-user-key` | ❌ | `user_456` | 用户标识（可选） |
| `async` | 推荐 | - | 异步加载，不阻塞页面渲染 |

---

## ⚙️ 配置说明

### 环境变量（可选）

如果需要为不同环境配置不同的默认值，可以在 Vercel 中设置环境变量：

1. 进入 Vercel 项目设置
2. 点击 **"Environment Variables"**
3. 添加变量：

```
VITE_DEFAULT_API_BASE=https://api.example.com/api/v1
```

然后在代码中使用：

```typescript
// src/index.ts
const apiBase = currentScript.dataset.apiBase || import.meta.env.VITE_DEFAULT_API_BASE;
```

### 自定义域名

1. 在 Vercel 项目设置中点击 **"Domains"**
2. 添加你的域名，例如：`widget.yourdomain.com`
3. 配置 DNS（Vercel 会提供详细指引）
4. 等待 DNS 生效（通常几分钟）

使用自定义域名：

```html
<script
  src="https://widget.yourdomain.com/experiment-widget.js"
  data-api-base="https://api.yourdomain.com/api/v1"
  data-experiment-id="exp_123"
  async>
</script>
```

---

## 🔄 更新部署

### 自动部署

如果通过 GitHub 连接，每次推送到 `main` 分支都会自动部署：

```bash
# 修改代码
git add .
git commit -m "Update widget styles"
git push

# Vercel 会自动检测并部署
```

### 手动部署

使用 Vercel CLI：

```bash
# 开发环境预览
vercel

# 生产环境部署
vercel --prod
```

### 版本管理

建议使用带版本号的文件名：

**修改 `vite.config.ts`：**

```typescript
import { defineConfig } from 'vite';
import { version } from './package.json';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'ExperimentWidget',
      formats: ['iife'],
      fileName: () => `experiment-widget-sdk.v${version}.js`,  // 带版本号
    },
    // ...其他配置
  },
});
```

使用时：

```html
<!-- 指定版本，缓存更稳定 -->
<script
  src="https://experiment-widget-sdk.vercel.app/experiment-widget-sdk.v1.0.0.js"
  data-api-base="..."
  data-experiment-id="..."
  async>
</script>
```

---

## 🐛 常见问题

### 1. CORS 跨域问题

**问题：** 浏览器提示跨域错误

**解决：**
- 确保 `vercel.json` 中配置了 CORS 头
- 后端 API 也需要允许跨域请求

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
```

### 2. 插件未加载

**检查清单：**
- ✅ 确认 `src` 地址可访问（直接在浏览器打开）
- ✅ 检查浏览器控制台是否有错误
- ✅ 确认 `data-api-base` 和 `data-experiment-id` 已填写
- ✅ 检查后端 API 是否正常运行

### 3. API 请求失败

**问题：** Widget 显示 "Assignment failed"

**排查：**

```bash
# 测试 API 是否可访问
curl https://your-api.com/api/v1/experiments/exp_123/assign

# 检查返回格式是否正确
{
  "code": 0,
  "data": {
    "creative_id": "c1",
    "title": "Test"
  }
}
```

### 4. 缓存问题

**问题：** 更新代码后，用户仍看到旧版本

**解决：**

方法 1：使用版本号（推荐）
```html
<script src="https://experiment-widget-sdk.vercel.app/experiment-widget-sdk.v1.0.1.js" ...>
```

方法 2：添加查询参数
```html
<script src="https://experiment-widget-sdk.vercel.app/experiment-widget.js?v=20231213" ...>
```

方法 3：调整缓存策略
```json
{
  "headers": [
    {
      "source": "/experiment-widget.js",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=3600" }
      ]
    }
  ]
}
```

### 5. 样式冲突

**问题：** Widget 样式异常

**原因：** 虽然使用了 Shadow DOM，但某些全局样式可能影响

**解决：**
- 检查是否有全局 `* { }` 样式
- Widget 内部已完全隔离，不应受影响
- 如果仍有问题，检查 `src/styles.ts` 的样式重置

---

## 📊 监控和分析

### Vercel Analytics

在 Vercel 项目设置中启用 **Analytics**：

1. 点击 **"Analytics"** 标签
2. 查看插件的访问量、加载时间等

### 自定义监控

在 `src/index.ts` 中添加：

```typescript
// 上报加载成功
console.log('[ExperimentWidget] Loaded successfully', {
  version: '1.0.0',
  timestamp: Date.now(),
  config,
});

// 可以发送到你的监控服务
fetch('https://your-analytics.com/track', {
  method: 'POST',
  body: JSON.stringify({
    event: 'widget_loaded',
    version: '1.0.0',
    ...config,
  }),
});
```

---

## 🎯 最佳实践

### 1. 使用 CDN

Vercel 自带全球 CDN，无需额外配置。

### 2. 启用 GZIP/Brotli 压缩

Vercel 默认启用，无需配置。

### 3. 版本控制

```bash
# 发布新版本流程
npm version patch  # 1.0.0 -> 1.0.1
npm run build
git push --tags
vercel --prod
```

### 4. 测试环境

利用 Vercel 的预览部署：

```bash
# 在分支上开发
git checkout -b feature/new-ui
# 修改代码
git push origin feature/new-ui

# Vercel 会自动生成预览 URL
# 例如：https://experiment-widget-sdk-abc123.vercel.app
```

在预览环境测试完成后再合并到 main。

### 5. 错误监控

集成 Sentry 等错误监控服务：

```typescript
// src/index.ts
try {
  new ExperimentWidget(config);
} catch (error) {
  // 发送到错误监控服务
  if (window.Sentry) {
    Sentry.captureException(error);
  }
  console.error('[ExperimentWidget] Initialization failed', error);
}
```

---

## 📞 获取帮助

- **文档：** 查看项目 README.md
- **示例：** 参考 `example.html` 和 `index.html`
- **API 参考：** 查看 `docs/code_example.tsx`
- **设计文档：** 查看 `docs/design.md`

---

## ✅ 部署检查清单

完成以下步骤确保部署成功：

- [ ] 本地构建成功 (`npm run build`)
- [ ] 本地测试通过 (`example.html` 正常显示)
- [ ] 创建 `vercel.json` 配置文件
- [ ] 推送代码到 Git 仓库
- [ ] 在 Vercel 中导入项目或使用 CLI 部署
- [ ] 配置 CORS 头（允许跨域）
- [ ] 测试生产环境 URL 是否可访问
- [ ] 在测试页面中验证插件功能
- [ ] 检查曝光和点击埋点是否正常
- [ ] 配置自定义域名（可选）
- [ ] 设置版本号管理策略

---

## 🎉 完成！

现在你的 Experiment Widget SDK 已经成功部署到 Vercel，可以在任何网站中通过一行代码使用了！

**部署 URL 示例：**
```
https://experiment-widget-sdk.vercel.app/experiment-widget.js
```

**使用示例：**
```html
<script
  src="https://experiment-widget-sdk.vercel.app/experiment-widget.js"
  data-api-base="https://your-api.com/api/v1"
  data-experiment-id="exp_123"
  async>
</script>
```

祝使用愉快！🚀
