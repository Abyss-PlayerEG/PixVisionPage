@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "PROJECT_DIR=%SCRIPT_DIR%.."

cd /d "%PROJECT_DIR%"

echo ==========================================
echo   PixVisionPage Build Script (Windows)
echo ==========================================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js 未安装，请先安装 Node.js (^20.19.0 ^| ^>=22.12.0^)
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [INFO] Node.js 版本: %NODE_VERSION%

REM 检查 pnpm
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARN] pnpm 未安装，正在安装...
    call npm install -g pnpm
)

for /f "tokens=*" %%i in ('pnpm -v') do set PNPM_VERSION=%%i
echo [INFO] pnpm 版本: %PNPM_VERSION%
echo.

REM 安装依赖
echo [STEP] 安装依赖...
call pnpm install
if %errorlevel% neq 0 (
    echo [ERROR] 依赖安装失败
    exit /b 1
)
echo.

REM 执行构建
echo [STEP] 开始构建...
call pnpm build
if %errorlevel% neq 0 (
    echo [ERROR] 构建失败
    exit /b 1
)
echo.

REM 打包 zip
echo [STEP] 打包 dist -^> pix-vision-pages.zip...
if exist "pix-vision-pages.zip" del /f /q "pix-vision-pages.zip"
cd dist
powershell -Command "Compress-Archive -Path '.\*' -DestinationPath '..\pix-vision-pages.zip' -Force"
cd ..
if %errorlevel% neq 0 (
    echo [ERROR] 打包失败
    exit /b 1
)
echo.

echo ==========================================
echo   构建完成！
echo   产物目录: dist\
echo   压缩包:   pix-vision-pages.zip
echo ==========================================

endlocal
