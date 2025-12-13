好，我直接给你一份**可交给 Claude / GPT / 任何 LLM 继续实现的「设计文档」**。
这是偏 **工程设计文档（Engineering Design Doc）**，不是教学文，Claude 很容易顺着往下写代码。

你可以**原样复制**使用。

---

# Experiment Widget SDK（实验 / 广告曝光插件）设计文档

## 1. 背景与目标

### 背景

希望实现一个**极简、可分发、可嵌入**的前端实验 / 广告展示插件，用于：

* 在任意网站（包括个人网站）嵌入一个可收起的小浮窗
* 展示实验内容（广告 / 项目卡片 / 创意）
* 自动采集 **曝光（impression）** 与 **点击（click）** 数据
* 支持 A/B 实验与后续分析

插件面向「零前端接入成本」用户，**无需 import / 初始化 / 写 JS**。

---

### 目标

* 用户只需复制 **一段 `<script>`**
* 插件自动执行、自渲染 UI、自行打点
* 所有默认行为内置，仅从 `data-*` 读取必要参数
* 输出单文件 `exp-widget.min.js`，可通过 CDN 分发

---

### 非目标（当前阶段）

* 鉴权 / 登录
* 复杂定向（地域、人群）
* 真实广告结算
* 多 SDK 版本兼容

---

## 2. 使用方式（User-facing API）

### 嵌入方式（唯一）

```html
<script
  src="https://cdn.example.com/exp-widget.min.js"
  data-api-base="https://api.example.com"
  data-experiment-id="exp_123"
  async>
</script>
```

### 参数说明

| 参数                   | 来源         | 是否必填 | 说明                 |
| -------------------- | ---------- | ---- | ------------------ |
| `src`                | `<script>` | 是    | CDN 上托管的 widget 文件 |
| `data-api-base`      | `dataset`  | 是    | 后端 API 基地址         |
| `data-experiment-id` | `dataset`  | 是    | 实验 ID              |
| `async`              | HTML       | 推荐   | 不阻塞页面渲染            |

---

## 3. 技术选型

### 前端（Widget）

* TypeScript
* Vite（build）
* 输出格式：`iife`（自执行）
* 单文件产物：`exp-widget.min.js`

### 样式隔离

* **Shadow DOM（推荐）**
* 所有 CSS 注入 shadowRoot，避免污染宿主页面

### 通信

* `fetch` / `navigator.sendBeacon`
* CORS 由后端开放

---

## 4. 架构概览

```
┌────────────────────────────┐
│ Host Web Page              │
│                            │
│  <script src=widget.js>    │
│            ↓               │
│  exp-widget.min.js         │
│    ├─ read data-*          │
│    ├─ create Shadow DOM    │
│    ├─ render UI            │
│    ├─ fetch ads            │
│    ├─ track impression     │
│    └─ track click          │
│                            │
└──────────────┬─────────────┘
               │
               ▼
        Backend API
        /v1/widget/*
```

---

## 5. Widget 生命周期

### 1️⃣ 加载

* 浏览器加载 `exp-widget.min.js`
* 立即执行（IIFE）

### 2️⃣ 初始化

* 读取 `document.currentScript.dataset`
* 校验必要参数
* 若已存在实例 → 直接 return（防重复加载）

### 3️⃣ UI 创建

* 创建 root container
* attachShadow({ mode: "open" })
* 注入 CSS + HTML

### 4️⃣ 数据拉取

* 请求实验内容（ads / creatives）
* 渲染到 UI

### 5️⃣ 埋点

* 曝光：IntersectionObserver
* 点击：click handler + sendBeacon

---

## 6. UI 设计（默认）

### 展示形态

* **右下角浮窗**
* 默认收起，仅显示圆形 badge
* 点击展开卡片面板

### 展开态

* 宽度：约 320px
* 圆角卡片（16px）
* 图片（16:9）
* 标题（最多两行）
* CTA（按钮或整卡可点）

### 收起态

* 圆形按钮（48px）
* 固定在 viewport 右下角
* 不影响页面交互

---

## 7. 数据模型（前端视角）

### 拉取广告接口返回示例

```json
{
  "request_id": "req_abc123",
  "ads": [
    {
      "creative_id": "c1",
      "variant_id": "vA",
      "title": "AI 创意生成平台",
      "description": "一键生成多尺寸广告素材",
      "image_url": "https://...",
      "click_url": "https://example.com"
    }
  ]
}
```

---

## 8. 埋点设计

### 通用字段

| 字段              | 说明                       |
| --------------- | ------------------------ |
| `anon_id`       | 匿名用户 ID（localStorage 生成） |
| `experiment_id` | 实验 ID                    |
| `variant_id`    | 实验变体                     |
| `creative_id`   | 素材 ID                    |
| `request_id`    | 本次请求 ID                  |
| `ts`            | 时间戳                      |
| `page_url`      | 当前页面 URL                 |

---

### 曝光（Impression）

触发条件：

* 元素进入 viewport
* 可见比例 ≥ 50%
* 持续 ≥ 500ms
* 同一 `creative_id` 仅上报一次

实现方式：

* IntersectionObserver + timer
* 去重 Map

事件示例：

```json
{
  "event": "impression",
  "creative_id": "c1",
  "variant_id": "vA"
}
```

---

### 点击（Click）

触发条件：

* 用户点击广告卡片或 CTA

实现方式：

* click handler
* 优先使用 `navigator.sendBeacon`
* fallback `fetch(keepalive=true)`

事件示例：

```json
{
  "event": "click",
  "creative_id": "c1",
  "variant_id": "vA"
}
```

---

## 9. 后端接口（约定）

### 获取实验内容

```
GET /v1/widget/experiments/{experiment_id}
```

### 上报事件

```
POST /v1/widget/events
```

> Widget 不依赖鉴权，仅基于 experiment_id 区分

---

## 10. 构建与发布

### 构建

```bash
npm run build
```

输出：

```
dist/exp-widget.min.js
```

### 托管方式（推荐）

* Vercel / Cloudflare Pages
* 静态站点
* CDN 自动加速

访问示例：

```
https://exp-widget.vercel.app/exp-widget.min.js
```

---

## 11. 版本与缓存策略

* 文件名版本化：

  ```
  exp-widget.v1.0.0.min.js
  ```
* 或 query version：

  ```
  exp-widget.min.js?v=100
  ```

---

## 12. 安全与隐私（基础）

* 不采集指纹
* anon_id 随机生成
* 不在前端暴露 IP
* click_url 可做 allowlist 校验（后端）

---

## 13. 后续可扩展方向

* A/B 流量分配（hash anon_id）
* 多广告轮播
* Dashboard 可视化
* Widget 样式主题切换
* 灰度发布 / 多版本 SDK

---

## 14. 设计总结（一句话）

> Experiment Widget SDK 是一个通过 CDN 分发的、零配置嵌入的前端实验 SDK，
> 负责 UI 渲染、曝光与点击采集，
> 将复杂实验逻辑最小化封装在一个自执行 JavaScript 文件中。
