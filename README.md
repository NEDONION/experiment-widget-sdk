# Experiment Widget SDK

一个轻量级、零依赖的实验/广告曝光插件，支持自动埋点和 A/B 测试。

## 特性

- **零配置接入**：仅需一行 `<script>` 标签
- **轻量级**：压缩后仅 3.38 KB (gzip)
- **样式隔离**：使用 Shadow DOM，不污染宿主页面
- **自动埋点**：自动收集曝光和点击数据
- **TypeScript**：完整的类型支持

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

# 部署
vercel --prod
```

📚 **详细步骤**：[部署文档](./docs/DEPLOYMENT.md) | [快速开始](./docs/QUICK_START.md)

### 2. 嵌入插件

在你的网页中添加以下代码：

```html
<script
  src="https://your-project.vercel.app/experiment-widget.js"
  data-api-base="https://api.example.com/api/v1"
  data-experiment-id="exp_123"
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

## 构建

### 开发模式

```bash
npm install
npm run dev
```

访问 `http://localhost:5173` 查看效果。

### 生产构建

```bash
npm run build
```

构建产物输出到 `dist/experiment-widget.js`。

## API 接口约定

插件需要后端提供以下接口：

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

## 埋点说明

### 曝光（Impression）

- 触发条件：元素进入可视区域 ≥ 50%，持续 ≥ 500ms
- 去重策略：同一 `creative_id` 仅上报一次
- 实现方式：IntersectionObserver

### 点击（Click）

- 触发条件：用户点击广告卡片
- 上报方式：优先使用 `navigator.sendBeacon`，降级为 `fetch` with `keepalive`

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
├── docs/               # 文档
│   ├── design.md       # 设计文档
│   └── code_example.tsx # 原始代码示例
├── vite.config.ts      # Vite 配置
├── tsconfig.json       # TypeScript 配置
└── package.json
```

### 技术栈

- **TypeScript**：类型安全
- **Vite**：快速构建，IIFE 格式输出
- **Shadow DOM**：样式隔离
- **IntersectionObserver**：高性能曝光监测
- **Navigator.sendBeacon**：可靠的数据上报

## 与原有方案的对比

### 原有方案（侵入式）

```tsx
// 需要在客户端代码中导入
import ExperimentWidget from './components/ExperimentWidget';

function App() {
  return (
    <div>
      {/* 需要修改客户端代码结构 */}
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
<!-- 仅需一行 script 标签 -->
<script
  src="https://cdn.example.com/experiment-widget.js"
  data-api-base="https://api.example.com/api/v1"
  data-experiment-id="exp_123"
  async>
</script>
```

**优点：**
- ✅ 零侵入：无需修改客户端代码
- ✅ 独立部署：通过 CDN 分发
- ✅ 零依赖：不依赖客户端框架
- ✅ 样式隔离：Shadow DOM 防止样式冲突
- ✅ 即时更新：更新插件无需重新构建客户端

## 部署

### CDN 部署（推荐）

1. 将 `dist/experiment-widget.js` 上传到 CDN
2. 使用 CDN 地址作为 `src` 属性

```html
<script
  src="https://cdn.example.com/experiment-widget.js"
  data-api-base="https://api.example.com/api/v1"
  data-experiment-id="exp_123"
  async>
</script>
```

### Vercel / Cloudflare Pages 部署

```bash
# 构建
npm run build

# 部署（以 Vercel 为例）
vercel --prod
```

访问地址：`https://your-project.vercel.app/experiment-widget.js`

## License

ISC
# experiment-widget-sdk
