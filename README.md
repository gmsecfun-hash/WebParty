<div align="center">

# 🎨 WebParty

### 让每个网页都变成你的联机游乐场

**Turn Every Webpage Into Your Multiplayer Playground**

[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/yourusername/webparty/pulls)
[![Chrome](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)](https://github.com/yourusername/webparty)

[English](#english) | [中文](#中文)

</div>

---

<a name="中文"></a>

## 📖 目录

- [项目简介](#项目简介)
- [核心特性](#核心特性)
- [技术架构](#技术架构)
- [快速开始](#快速开始)
- [服务器部署](#服务器部署)
- [前端安装](#前端安装)
- [开发指南](#开发指南)
- [性能优化](#性能优化)
- [常见问题](#常见问题)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

---

## 🎯 项目简介

**WebParty** 是一款基于 Chrome 浏览器的多人实时互动贴纸插件。用户可以在任意网页上放置贴纸和文字建言，与访问同一 URL 的其他用户实时共享，打破赛博孤岛，让每个网页都变成你的联机游乐场！

**想象一下：**
- 🍅 在新闻网站上扔番茄表达态度
- 💬 在技术博客上留下"前方有干货"的建言
- 🔥 在产品页面上贴火焰标记热点功能
- 👀 实时看到其他用户在同一页面上的互动

---

## ✨ 核心特性

### 🎨 丰富的表达方式
- **贴纸模式**：拖拽贴纸到网页任意位置（🍅🐶🤡👍❤️🔥）
- **建言模式**：组合文字评论（"前方 + 有干货"）
- **智能定位**：基于 DOM 元素的相对定位，滚动时自动跟随

### 🌐 实时多人互动
- **WebSocket 同步**：多人实时看到彼此的互动
- **房间机制**：基于 URL 自动分组
- **历史记录**：刷新页面后贴纸依然存在

### 🎵 沉浸式体验
- **音效反馈**：每个贴纸都有独特音效（Web Audio API 合成）
- **Pop-up 动画**：新贴纸弹入效果
- **零流量设计**：Emoji 本地化，纯文本传输

### ⚡ 极致性能
- **轻量级后端**：2核2G 即可运行
- **带宽友好**：单条消息 < 300 字节
- **样式隔离**：Shadow DOM 零污染

---

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Chrome Extension                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Content Script (Shadow DOM)                          │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │  │
│  │  │  React   │  │ Tailwind │  │ Web Audio API    │   │  │
│  │  │  + TS    │  │   CSS    │  │   (Sound FX)     │   │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ WebSocket + REST API
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Node.js Backend                            │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │   Express    │  │   Socket.io  │  │     SQLite     │  │
│  │   REST API   │  │  Real-time   │  │   (Database)   │  │
│  └──────────────┘  └──────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈

**前端（Chrome Extension）**
- React 19 + TypeScript 6
- Vite 8 + @crxjs/vite-plugin
- Tailwind CSS 4
- Socket.io-client
- Web Audio API（音效合成）

**后端（Server）**
- Node.js
- Express 5
- Socket.io 4
- SQLite (better-sqlite3)

---

## 🚀 快速开始

### 前置要求

- Node.js v18+
- npm 或 yarn
- Chrome 浏览器

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/webparty.git
cd webparty
```

### 2. 安装依赖

**前端：**
```bash
cd client
npm install
```

**后端：**
```bash
cd server
npm install
```

### 3. 配置地址

编辑 `client/src/utils/api.ts` 和 `client/src/utils/socket.ts`：

```typescript
const API_BASE_URL = 'http://your-server-ip:3001/api'
const SOCKET_URL = 'http://your-server-ip:3001'
```

### 4. 构建运行

**前端：**
```bash
cd client
npm run build
```

**后端：**
```bash
cd server
npm run build
npm start
```

---

## 🖥️ 服务器部署

### 环境要求
- Ubuntu 20.04+ / CentOS 7+
- Node.js v18+
- 2核 CPU，2GB 内存

### 1. 安装 PM2

```bash
sudo npm install -g pm2
```

### 2. 上传并配置

```bash
# 上传代码到服务器
scp -r server user@your-server:/var/www/webparty/

# SSH 登录
ssh user@your-server

# 安装依赖
cd /var/www/webparty/server
npm install --production
npm run build
```

### 3. 创建 PM2 配置

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'webparty-server',
    script: './dist/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    max_memory_restart: '500M',
    autorestart: true
  }]
}
```

### 4. 启动服务

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. 配置防火墙

```bash
# Ubuntu (ufw)
sudo ufw allow 3001
sudo ufw allow 80
sudo ufw allow 443

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
```

### 6. Nginx 反向代理（推荐）

创建 `/etc/nginx/sites-available/webparty`：

```nginx
upstream webparty_backend {
    server 127.0.0.1:3001;
    keepalive 64;
}

server {
    listen 80;
    server_name yourdomain.com;

    client_max_body_size 1M;

    location /api/ {
        proxy_pass http://webparty_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://webparty_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }

    location /health {
        proxy_pass http://webparty_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/webparty /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. HTTPS 配置（推荐）

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### 8. 验证部署

访问：`http://yourdomain.com/health`

应返回：
```json
{"status":"ok","timestamp":1712345678901}
```

---

## 🔌 前端安装

### 方式一：开发者模式（当前推荐）

1. **下载最新版本**
   - 下载 `webparty_extension_v1.0.zip`
   - 解压到本地目录

2. **加载扩展**
   - 打开 Chrome 浏览器
   - 访问 `chrome://extensions/`
   - 开启右上角的"**开发者模式**"
   - 点击"**加载已解压的扩展程序**"
   - 选择解压后的文件夹

3. **开始使用**
   - 打开任意网页
   - 右下角会出现 WebParty 面板
   - 开始贴贴纸！

### 方式二：Chrome Web Store（即将上线）

敬请期待...

---

## 🛠️ 开发指南

### 项目结构

```
webparty/
├── client/                 # 前端 Chrome 插件
│   ├── src/
│   │   ├── components/    # React 组件
│   │   ├── content/       # Content Script
│   │   ├── utils/         # 工具函数
│   │   └── types/         # TypeScript 类型
│   ├── dist/              # 构建产物
│   ├── package.json
│   └── manifest.json      # Chrome 扩展配置
├── server/                 # 后端服务
│   ├── src/
│   │   ├── database/      # 数据库配置
│   │   ├── routes/        # API 路由
│   │   └── index.ts       # 入口文件
│   ├── dist/              # 编译产物
│   └── package.json
├── docs/                   # GitHub Pages 落地页
└── README.md
```

### 本地开发

**前端：**
```bash
cd client
npm run dev
```

**后端：**
```bash
cd server
npm run dev
```

### 构建生产版本

**前端：**
```bash
cd client
npm run build
```

**后端：**
```bash
cd server
npm run build
```

---

## ⚡ 性能优化

### 静态资源本地化
- ✅ 所有贴纸使用 Emoji（零流量）
- ✅ 音效使用 Web Audio API 合成（零下载）
- ✅ 无外部资源依赖

### WebSocket 优化
- ✅ 纯文本 JSON 传输
- ✅ 单条消息 < 300 字节
- ✅ 连接复用与心跳检测

### 数据库优化
- ✅ SQLite 索引优化
- ✅ FIFO 贴纸上限（150个）
- ✅ 定期数据清理

### 前端优化
- ✅ Shadow DOM 样式隔离
- ✅ React 代码分割
- ✅ 贴纸渲染上限 + FIFO 移除

---

## ❓ 常见问题

### 1. 无法连接到服务器？

**检查清单：**
- [ ] 后端服务是否运行：`pm2 status`
- [ ] 端口是否开放：`sudo ufw status`
- [ ] 防火墙配置是否正确
- [ ] 前端配置的地址是否正确

### 2. WebSocket 连接失败？

**Nginx 配置检查：**
```nginx
location /socket.io/ {
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### 3. 贴纸无法保存？

**检查：**
- SQLite 数据库权限
- 数据目录是否存在
- 后端日志：`pm2 logs webparty-server`

### 4. 音效无法播放？

- 检查是否开启静音模式（🔊按钮）
- 首次交互后才会启用音频（浏览器限制）

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 使用 TypeScript
- 遵循 ESLint 规则
- 提交前运行测试

---

## 📄 许可证

本项目采用 ISC 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

<div align="center">

## 🌟 Star History

如果这个项目对你有帮助，请给个 ⭐️ Star 支持一下！

**Made with ❤️ by WebParty Team**

</div>

---

<a name="english"></a>

## 📖 Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start-1)
- [Server Deployment](#server-deployment)
- [Extension Installation](#extension-installation)
- [Development](#development)
- [Performance](#performance)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Introduction

**WebParty** is a Chrome extension for real-time multiplayer sticker interaction. Users can place stickers and text comments on any webpage and share them in real-time with other users visiting the same URL.

**Imagine:**
- 🍅 Throwing tomatoes on news sites to express opinions
- 💬 Leaving "Quality Content Ahead" comments on tech blogs
- 🔥 Marking hot features on product pages with flames
- 👀 Seeing other users' interactions in real-time

---

## ✨ Features

### 🎨 Rich Expression
- **Sticker Mode**: Drag & drop stickers anywhere (🍅🐶🤡👍❤️🔥)
- **Comment Mode**: Combine text phrases ("Ahead + Quality Content")
- **Smart Positioning**: DOM-relative positioning, follows on scroll

### 🌐 Real-time Multiplayer
- **WebSocket Sync**: See others' interactions in real-time
- **Room Mechanism**: Auto-grouping by URL
- **History Records**: Stickers persist after page refresh

### 🎵 Immersive Experience
- **Sound Effects**: Unique sounds for each sticker (Web Audio API)
- **Pop-up Animation**: New sticker entrance effects
- **Zero Bandwidth**: Localized emoji, text-only transmission

### ⚡ Ultimate Performance
- **Lightweight Backend**: Runs on 2-core 2GB server
- **Bandwidth Friendly**: Single message < 300 bytes
- **Style Isolation**: Shadow DOM zero pollution

---

## 🏗️ Tech Stack

**Frontend (Chrome Extension)**
- React 19 + TypeScript 6
- Vite 8 + @crxjs/vite-plugin
- Tailwind CSS 4
- Socket.io-client
- Web Audio API

**Backend (Server)**
- Node.js
- Express 5
- Socket.io 4
- SQLite (better-sqlite3)

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm or yarn
- Chrome browser

### 1. Clone Project

```bash
git clone https://github.com/yourusername/webparty.git
cd webparty
```

### 2. Install Dependencies

**Frontend:**
```bash
cd client
npm install
```

**Backend:**
```bash
cd server
npm install
```

### 3. Configure Address

Edit `client/src/utils/api.ts` and `client/src/utils/socket.ts`:

```typescript
const API_BASE_URL = 'http://your-server-ip:3001/api'
const SOCKET_URL = 'http://your-server-ip:3001'
```

### 4. Build & Run

**Frontend:**
```bash
cd client
npm run build
```

**Backend:**
```bash
cd server
npm run build
npm start
```

---

## 🖥️ Server Deployment

See detailed [Server Deployment](#服务器部署) section in Chinese above.

Key steps:
1. Install PM2
2. Upload code
3. Configure Nginx
4. Setup HTTPS
5. Configure firewall

---

## 🔌 Extension Installation

### Developer Mode (Recommended)

1. Download `webparty_extension_v1.0.zip`
2. Unzip to local directory
3. Open Chrome and visit `chrome://extensions/`
4. Enable "Developer mode" (top right)
5. Click "Load unpacked"
6. Select the unzipped folder

---

## 🛠️ Development

See [Development Guide](#开发指南) in Chinese above.

---

## ⚡ Performance

See [Performance Optimization](#性能优化) in Chinese above.

Key highlights:
- ✅ Zero-bandwidth static resources (Emoji)
- ✅ Text-only WebSocket (< 300 bytes/message)
- ✅ FIFO sticker limit (150 max)
- ✅ Shadow DOM isolation

---

## ❓ FAQ

See [Common Issues](#常见问题) in Chinese above.

---

## 🤝 Contributing

Contributions are welcome! See [Contributing Guide](#贡献指南) in Chinese above.

---

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ by WebParty Team**

[⬆ Back to Top](#webparty)

</div>