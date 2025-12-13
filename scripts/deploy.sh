#!/bin/bash

# Experiment Widget SDK 一键部署脚本

set -e

echo "🚀 开始部署 Experiment Widget SDK 到 Vercel..."
echo ""

# 检查是否安装了 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装 Node.js"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ 检测到 Node.js $(node -v)"

# 检查是否安装了 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未安装 npm"
    exit 1
fi

echo "✅ 检测到 npm $(npm -v)"

# 安装依赖
echo ""
echo "📦 安装依赖..."
npm install

# 构建项目
echo ""
echo "🔨 构建项目..."
npm run build

if [ ! -f "dist/experiment-widget.js" ]; then
    echo "❌ 构建失败: dist/experiment-widget.js 不存在"
    exit 1
fi

echo "✅ 构建成功!"

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo ""
    echo "📥 未检测到 Vercel CLI，正在安装..."
    npm install -g vercel
fi

echo ""
echo "✅ 检测到 Vercel CLI $(vercel -v)"

# 部署到 Vercel
echo ""
echo "🌐 开始部署到 Vercel..."
echo ""

vercel --prod

echo ""
echo "🎉 部署完成!"
echo ""
echo "📝 下一步:"
echo "1. 复制上方显示的 URL"
echo "2. 在你的网页中添加以下代码:"
echo ""
echo "<script"
echo "  src=\"YOUR_VERCEL_URL/experiment-widget.js\""
echo "  data-api-base=\"https://api.example.com/api/v1\""
echo "  data-experiment-id=\"exp_123\""
echo "  async>"
echo "</script>"
echo ""
echo "📚 查看完整文档: docs/DEPLOYMENT.md"
echo ""
