# 使用示例

本文档提供各种场景下的使用示例。

---

## 📝 基础使用

### 最简单的例子

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome</h1>

  <!-- Experiment Widget SDK -->
  <script
    src="https://your-project.vercel.app/experiment-widget.js"
    data-api-base="https://api.example.com/api/v1"
    data-experiment-id="exp_123"
    async>
  </script>
</body>
</html>
```

---

## 🎯 不同场景

### 1. 个人博客

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>我的博客</title>
</head>
<body>
  <article>
    <h1>博客文章标题</h1>
    <p>文章内容...</p>
  </article>

  <!-- 在博客文章底部展示实验内容 -->
  <script
    src="https://your-project.vercel.app/experiment-widget.js"
    data-api-base="https://api.yourblog.com/api/v1"
    data-experiment-id="blog_experiment_001"
    data-user-key=""
    async>
  </script>
</body>
</html>
```

### 2. 电商网站

```html
<!DOCTYPE html>
<html>
<head>
  <title>商品详情页</title>
</head>
<body>
  <div class="product">
    <h1>商品名称</h1>
    <div class="price">¥999</div>
    <button>加入购物车</button>
  </div>

  <!-- 展示推荐商品或广告 -->
  <script
    src="https://your-shop.vercel.app/experiment-widget.js"
    data-api-base="https://api.yourshop.com/api/v1"
    data-experiment-id="product_recommendation"
    data-user-key="user_12345"
    async>
  </script>
</body>
</html>
```

### 3. SaaS 产品

```html
<!DOCTYPE html>
<html>
<head>
  <title>Dashboard</title>
</head>
<body>
  <div id="app">
    <!-- React/Vue 应用 -->
  </div>

  <!-- 在 SaaS 产品中展示功能推荐 -->
  <script
    src="https://your-saas.vercel.app/experiment-widget.js"
    data-api-base="https://api.yoursaas.com/api/v1"
    data-experiment-id="feature_promotion"
    data-user-key="<%= currentUser.id %>"
    async>
  </script>
</body>
</html>
```

### 4. 文档网站

```html
<!DOCTYPE html>
<html>
<head>
  <title>Documentation</title>
</head>
<body>
  <nav><!-- 导航 --></nav>
  <main>
    <h1>API Documentation</h1>
    <p>文档内容...</p>
  </main>

  <!-- 展示相关教程或付费课程 -->
  <script
    src="https://your-docs.vercel.app/experiment-widget.js"
    data-api-base="https://api.yourdocs.com/api/v1"
    data-experiment-id="course_promotion"
    async>
  </script>
</body>
</html>
```

---

## 🔧 动态配置

### 使用 JavaScript 动态插入

```html
<!DOCTYPE html>
<html>
<head>
  <title>Dynamic Widget</title>
</head>
<body>
  <h1>My App</h1>

  <script>
    // 动态判断是否加载 Widget
    const shouldShowWidget = true; // 根据业务逻辑判断
    const currentUser = { id: 'user_123', tier: 'premium' };

    if (shouldShowWidget) {
      const script = document.createElement('script');
      script.src = 'https://your-project.vercel.app/experiment-widget.js';
      script.async = true;

      // 动态设置参数
      script.dataset.apiBase = 'https://api.example.com/api/v1';
      script.dataset.experimentId = currentUser.tier === 'premium'
        ? 'exp_premium_001'
        : 'exp_free_001';
      script.dataset.userKey = currentUser.id;

      document.body.appendChild(script);
    }
  </script>
</body>
</html>
```

### 根据页面路径加载不同实验

```html
<!DOCTYPE html>
<html>
<head>
  <title>Multi-page App</title>
</head>
<body>
  <div id="app"></div>

  <script>
    const experimentMap = {
      '/products': 'exp_product_page',
      '/checkout': 'exp_checkout_page',
      '/': 'exp_home_page',
    };

    const currentPath = window.location.pathname;
    const experimentId = experimentMap[currentPath] || 'exp_default';

    const script = document.createElement('script');
    script.src = 'https://your-project.vercel.app/experiment-widget.js';
    script.async = true;
    script.dataset.apiBase = 'https://api.example.com/api/v1';
    script.dataset.experimentId = experimentId;
    document.body.appendChild(script);
  </script>
</body>
</html>
```

---

## 🎨 与现代框架集成

### React

```jsx
// App.jsx
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
      // 清理：移除脚本和 Widget
      const widgetRoot = document.getElementById('exp-widget-root');
      if (widgetRoot) {
        widgetRoot.remove();
      }
      script.remove();
    };
  }, []);

  return (
    <div className="App">
      <h1>My React App</h1>
      {/* 你的应用内容 */}
    </div>
  );
}

export default App;
```

### Vue 3

```vue
<!-- App.vue -->
<template>
  <div id="app">
    <h1>My Vue App</h1>
    <!-- 你的应用内容 -->
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';

let scriptElement = null;

onMounted(() => {
  scriptElement = document.createElement('script');
  scriptElement.src = 'https://your-project.vercel.app/experiment-widget.js';
  scriptElement.async = true;
  scriptElement.dataset.apiBase = 'https://api.example.com/api/v1';
  scriptElement.dataset.experimentId = 'exp_vue_app';
  scriptElement.dataset.userKey = 'user_123';

  document.body.appendChild(scriptElement);
});

onUnmounted(() => {
  // 清理
  const widgetRoot = document.getElementById('exp-widget-root');
  if (widgetRoot) {
    widgetRoot.remove();
  }
  if (scriptElement) {
    scriptElement.remove();
  }
});
</script>
```

### Next.js

```jsx
// pages/_app.js
import { useEffect } from 'react';
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />

      {/* Next.js Script 组件 */}
      <Script
        src="https://your-project.vercel.app/experiment-widget.js"
        strategy="afterInteractive"
        data-api-base="https://api.example.com/api/v1"
        data-experiment-id="exp_nextjs_app"
        data-user-key="user_123"
      />
    </>
  );
}

export default MyApp;
```

---

## 🌐 多语言支持

### 根据语言加载不同实验

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>多语言网站</title>
</head>
<body>
  <h1>欢迎</h1>

  <script>
    const userLang = navigator.language || 'en';
    const experimentMap = {
      'zh-CN': 'exp_chinese',
      'en': 'exp_english',
      'ja': 'exp_japanese',
    };

    const experimentId = experimentMap[userLang] || experimentMap['en'];

    const script = document.createElement('script');
    script.src = 'https://your-project.vercel.app/experiment-widget.js';
    script.async = true;
    script.dataset.apiBase = 'https://api.example.com/api/v1';
    script.dataset.experimentId = experimentId;
    document.body.appendChild(script);
  </script>
</body>
</html>
```

---

## 📊 A/B 测试场景

### 根据用户分组加载不同实验

```html
<!DOCTYPE html>
<html>
<head>
  <title>A/B Testing</title>
</head>
<body>
  <h1>Welcome</h1>

  <script>
    // 简单的 A/B 分组逻辑（基于用户 ID 哈希）
    function getUserGroup(userId) {
      const hash = userId.split('').reduce((acc, char) => {
        return acc + char.charCodeAt(0);
      }, 0);
      return hash % 2 === 0 ? 'A' : 'B';
    }

    const userId = 'user_123';
    const group = getUserGroup(userId);
    const experimentId = group === 'A' ? 'exp_variant_a' : 'exp_variant_b';

    const script = document.createElement('script');
    script.src = 'https://your-project.vercel.app/experiment-widget.js';
    script.async = true;
    script.dataset.apiBase = 'https://api.example.com/api/v1';
    script.dataset.experimentId = experimentId;
    script.dataset.userKey = userId;
    document.body.appendChild(script);

    // 记录用户分组
    console.log(`User ${userId} assigned to group ${group}`);
  </script>
</body>
</html>
```

---

## 🔒 私有部署（需要鉴权）

### 添加自定义请求头

如果你的 API 需要鉴权，可以修改 `src/api.ts`：

```typescript
// src/api.ts
export class ApiClient {
  private baseUrl: string;
  private authToken: string | null;

  constructor(baseUrl: string, authToken?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.authToken = authToken || null;
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers,
    });
    return response.json();
  }

  // ... 其他方法类似
}
```

然后在使用时传入 token：

```html
<script>
  // 从 cookie 或 localStorage 获取 token
  const authToken = localStorage.getItem('auth_token');

  const script = document.createElement('script');
  script.src = 'https://your-project.vercel.app/experiment-widget.js';
  script.async = true;
  script.dataset.apiBase = 'https://api.example.com/api/v1';
  script.dataset.experimentId = 'exp_123';
  script.dataset.authToken = authToken; // 自定义参数

  document.body.appendChild(script);
</script>
```

---

## 📱 响应式适配

Widget 默认在右下角显示，但可以通过修改 `src/styles.ts` 适配移动端：

```typescript
// src/styles.ts
export const widgetStyles = `
  .exp-widget-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999999;
    /* ... */
  }

  /* 移动端适配 */
  @media (max-width: 768px) {
    .exp-widget-container {
      bottom: 10px;
      right: 10px;
    }

    .exp-widget-panel {
      width: calc(100vw - 40px);
      max-width: 320px;
    }

    .exp-widget-badge {
      width: 40px;
      height: 40px;
      font-size: 20px;
    }
  }
`;
```

---

## 🎯 性能优化

### 延迟加载

```html
<script>
  // 页面加载完成后再加载 Widget
  window.addEventListener('load', () => {
    setTimeout(() => {
      const script = document.createElement('script');
      script.src = 'https://your-project.vercel.app/experiment-widget.js';
      script.async = true;
      script.dataset.apiBase = 'https://api.example.com/api/v1';
      script.dataset.experimentId = 'exp_123';
      document.body.appendChild(script);
    }, 2000); // 延迟 2 秒
  });
</script>
```

### 条件加载

```html
<script>
  // 只在特定页面加载
  if (window.location.pathname === '/products') {
    const script = document.createElement('script');
    script.src = 'https://your-project.vercel.app/experiment-widget.js';
    script.async = true;
    script.dataset.apiBase = 'https://api.example.com/api/v1';
    script.dataset.experimentId = 'exp_products';
    document.body.appendChild(script);
  }
</script>
```

---

## 🐛 调试模式

### 启用详细日志

修改 `src/index.ts` 添加调试模式：

```typescript
// src/index.ts
const debug = currentScript.dataset.debug === 'true';

if (debug) {
  console.log('[ExperimentWidget] Config:', config);
  console.log('[ExperimentWidget] Initializing...');
}

// ... 在各个关键位置添加日志
```

使用：

```html
<script
  src="https://your-project.vercel.app/experiment-widget.js"
  data-api-base="https://api.example.com/api/v1"
  data-experiment-id="exp_123"
  data-debug="true"
  async>
</script>
```

---

## 📚 更多资源

- [部署文档](./DEPLOYMENT.md)
- [快速开始](./QUICK_START.md)
- [设计文档](./design.md)
- [代码示例](./code_example.tsx)

---

需要更多帮助？查看项目的 [README.md](../README.md)
