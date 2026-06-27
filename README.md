# PixVision Page

**像素视觉前端** — 数字艺术创作与分享平台

[![Vue](https://img.shields.io/badge/Vue-3.5-brightgreen)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-purple)](https://vite.dev/)
[![GSAP](https://img.shields.io/badge/GSAP-3.14-orange)](https://greensock.com/gsap/)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue)]()

---

## 项目简介

PixVision Page 是像素视觉数字艺术平台的 Vue 3 前端应用，提供作品浏览、用户互动、创作者中心、后台管理等功能。项目采用前后端分离架构，配合 Java 后端（PixVisionServer）和 Python 辅助服务（PixVisionPyServer）协同运行。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5 | 核心框架（Composition API / `<script setup>`） |
| Vite | 7.3 | 构建工具与开发服务器 |
| Vue Router | 5.0 | 路由管理 |
| Pinia | 3.0 | 状态管理 |
| GSAP | 3.14 | 动画引擎（含 ScrollTrigger） |
| Swiper | 12.1 | 轮播组件 |
| Sass | 1.98 | CSS 预处理器 |

## 核心功能

- **首页展示**：瀑布流作品浏览、无限滚动加载、GSAP 滚动动画
- **作品详情**：图片查看、评论互动、点赞收藏、系列合集
- **用户系统**：登录注册、个人主页、资料编辑、浏览历史
- **创作者中心**：作品发布与管理、系列创建、数据概览
- **消息系统**：私信聊天、系统通知、WebSocket 实时推送
- **搜索功能**：作品搜索、用户搜索、标签筛选
- **后台管理**：用户管理、作品审核、评论管理、数据统计

## 快速开始

### 环境要求

- Node.js `^20.19.0` 或 `>=22.12.0`
- 包管理器：pnpm（推荐）

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

默认启动在 `http://localhost:8080`，API 请求自动代理到后端服务。

### 构建生产版本

```bash
pnpm build
```

### 预览构建产物

```bash
pnpm preview
```

默认运行在 `http://localhost:3000`。

## 项目结构

```
PixVisionPage/
├── src/
│   ├── api/                 # HTTP 请求层（纯 fetch 调用）
│   ├── assets/              # 静态资源（CSS、字体、图片）
│   ├── components/          # 公共组件
│   ├── composables/         # 组合式函数（业务逻辑）
│   ├── config/              # 配置（API 地址集中管理）
│   ├── router/              # 路由定义
│   ├── stores/              # Pinia 状态管理
│   ├── utils/               # 工具函数
│   ├── views/               # 页面视图
│   │   ├── HomePage.vue     # 首页
│   │   ├── WorkDetail.vue   # 作品详情
│   │   ├── Profile.vue      # 用户主页
│   │   ├── CreatorCenter.vue # 创作者中心
│   │   ├── Messages.vue     # 消息中心
│   │   ├── Admin.vue        # 后台管理
│   │   └── ...
│   ├── App.vue              # 根组件
│   └── main.js              # 应用入口
├── public/                  # 公共静态资源
├── doc/                     # 项目文档
├── index.html               # HTML 入口
├── vite.config.js           # Vite 配置
└── package.json
```

## 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | HomePage | 首页，瀑布流作品展示 |
| `/work/:id` | WorkDetail | 作品详情页 |
| `/user/:id` | Profile | 用户主页 |
| `/creator` | CreatorCenter | 创作者中心 |
| `/messages` | Messages | 消息中心 |
| `/search` | SearchPage | 搜索页 |
| `/admin` | Admin | 后台管理 |
| `/login` | loginView | 登录注册 |

## 相关项目

| 项目 | 说明 | 仓库 |
|------|------|------|
| **PixVisionServer** | Java 后端服务（Spring Boot） | [Gitee](https://gitee.com/endergaster_geek/PixVisionServer) |
| **PixVisionPyServer** | Python 辅助服务（FastAPI） | [Gitee](https://gitee.com/endergaster_geek/PixVisionPyServer) |

## 作者

- PlayerEG — gaster@vip.playereg.top
- 贡献者：blue_sky_ks

## 许可证

本项目基于 MIT 许可证开源。
