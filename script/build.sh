#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "=========================================="
echo "  PixVisionPage Build Script (Mac/Linux)"
echo "=========================================="
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js 未安装，请先安装 Node.js (^20.19.0 || >=22.12.0)"
    exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//')
echo "[INFO] Node.js 版本: $NODE_VERSION"

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "[WARN] pnpm 未安装，正在安装..."
    npm install -g pnpm
fi

PNPM_VERSION=$(pnpm -v)
echo "[INFO] pnpm 版本: $PNPM_VERSION"
echo ""

# 安装依赖
echo "[STEP] 安装依赖..."
pnpm install
echo ""

# 执行构建
echo "[STEP] 开始构建..."
pnpm build
echo ""

# 打包 zip
echo "[STEP] 打包 dist → pix-vision-pages.zip..."
cd "$PROJECT_DIR/dist"
rm -f "$PROJECT_DIR/pix-vision-pages.zip"
zip -r "$PROJECT_DIR/pix-vision-pages.zip" .
cd "$PROJECT_DIR"
echo ""

echo "=========================================="
echo "  构建完成！"
echo "  产物目录: dist/"
echo "  压缩包:   pix-vision-pages.zip"
echo "=========================================="
