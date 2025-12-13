# 快速开始指南

5 分钟部署你的第一个 Experiment Widget SDK！

---

## 📦 方式一：使用 Vercel CLI（最快）

### 1. 安装 & 登录

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录（首次使用）
vercel login
```

### 2. 部署

```bash
# 在项目根目录执行
vercel --prod
```

按提示操作：
- Project name: `experiment-widget-sdk`（回车）
- 其他选项：默认（回车）

✅ **完成！** 你会得到一个 URL：`https://experiment-widget-sdk-xxx.vercel.app`

---

## 🌐 方式二：通过 GitHub + Vercel 网页端

### 1. 推送到 GitHub

```bash
# 初始化 Git（如果还没有）
git init
git add .
git commit -m "Initial commit"

# 推送到 GitHub（替换为你的仓库地址）
git remote add origin https://github.com/YOUR_USERNAME/experiment-widget-sdk.git
git push -u origin main
```

### 2. 导入到 Vercel

1. 访问 [vercel.com/new](https://vercel.com/new)
2. 选择 GitHub 仓库 `experiment-widget-sdk`
3. 点击 **Deploy**

✅ **完成！** 等待 30-60 秒即可。

---

## 🚀 使用部署好的插件

复制以下代码到任何网页：

```html
<!-- 替换为你的实际 URL -->
<script
  src="https://YOUR_PROJECT.vercel.app/experiment-widget.js"
  data-api-base="http://localhost:4000/api/v1"
  data-experiment-id="exp_123"
  async>
</script>
```

### 完整示例

创建一个 `test.html`：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>测试页面</title>
</head>
<body>
  <h1>我的网站</h1>
  <p>这是一个测试页面</p>

  <!-- Experiment Widget SDK -->
  <script
    src="https://YOUR_PROJECT.vercel.app/experiment-widget.js"
    data-api-base="http://localhost:4000/api/v1"
    data-experiment-id="exp_123"
    async>
  </script>
</body>
</html>
```

用浏览器打开，你会在右下角看到插件！

---

## 🔧 本地开发

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问：http://localhost:5173

### 构建生产版本

```bash
npm run build
```

产物：`dist/experiment-widget.js`

---

## 📝 参数配置

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| `src` | ✅ | 插件 CDN 地址 | `https://xxx.vercel.app/experiment-widget.js` |
| `data-api-base` | ✅ | 后端 API 地址 | `https://api.example.com/api/v1` |
| `data-experiment-id` | ✅ | 实验 ID | `exp_123` |
| `data-user-key` | ❌ | 用户标识 | `user_456` |

---

## 🐛 常见问题

### 插件没有显示？

1. 打开浏览器控制台（F12）
2. 检查是否有错误提示
3. 确认 `data-api-base` 和 `data-experiment-id` 已填写
4. 检查后端 API 是否可访问

### CORS 跨域错误？

确保 `vercel.json` 中配置了 CORS：

```json
{
  "headers": [
    {
      "source": "/experiment-widget.js",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
```

### 如何更新部署？

```bash
# 修改代码后
git add .
git commit -m "Update code"
git push

# Vercel 会自动重新部署
# 或手动部署：
vercel --prod
```

---

## 📚 更多文档

- [完整部署指南](./DEPLOYMENT.md)
- [设计文档](./design.md)
- [代码示例](./code_example.tsx)
- [项目 README](../README.md)

---

## ✅ 快速检查清单

- [ ] 安装了 Node.js 和 npm
- [ ] 运行 `npm install`
- [ ] 运行 `npm run build` 成功
- [ ] 部署到 Vercel（CLI 或网页端）
- [ ] 获得部署 URL
- [ ] 在测试页面中使用插件
- [ ] 看到右下角的浮窗

完成！🎉

---

**需要帮助？** 查看 [完整部署文档](./DEPLOYMENT.md)
