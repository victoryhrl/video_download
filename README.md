# 🎬 Universal Video Saver

一个全栈在线视频解析、异步下载与流式播放平台。

支持 YouTube、Bilibili、TikTok 等主流视频网站。粘贴链接 → 后台下载 → 浏览器内直接播放！

![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-5.0+-DC382D?logo=redis&logoColor=white)

---

## ✨ 功能特色

- 🔗 **万能链接解析** — 基于 `yt-dlp`，支持 [1000+ 网站](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md)
- ⚡ **异步任务队列** — 使用 BullMQ + Redis，长任务不阻塞，支持 5 路并行下载
- 📊 **实时进度反馈** — 前端每 1.5s 轮询，平滑进度条动画展示下载状态
- 🎥 **在线流式播放** — HTTP Range Request (206) 分段传输，边下边播无需等待
- 🌑 **暗黑拟态 UI** — Glassmorphism 毛玻璃风格，紫罗兰渐变，微交互动画

---

## 🏗️ 技术架构

```
┌──────────────────────────┐       ┌──────────────────────────┐
│      Frontend (5173)     │       │      Backend (3001)      │
│  React + Vite + Tailwind │◄─────►│  Express + TypeScript    │
│                          │  API  │                          │
│  - UrlInput 组件          │       │  POST /api/video/download│
│  - TaskProgress 进度条    │       │  GET  /api/video/task/:id│
│  - HTML5 Video 播放器     │       │  GET  /api/video/stream/ │
└──────────────────────────┘       └───────────┬──────────────┘
                                               │
                                   ┌───────────▼──────────────┐
                                   │    BullMQ Worker (x5)    │
                                   │    yt-dlp + ffmpeg       │
                                   │    Redis Queue           │
                                   └──────────────────────────┘
```

---

## 🚀 快速开始

### 前置依赖

| 工具 | 版本 | 说明 |
|------|------|------|
| Node.js | ≥ 18 | 运行时环境 |
| Redis | ≥ 5.0 | BullMQ 消息队列后端 |
| yt-dlp | 最新版 | 视频解析下载核心 |
| ffmpeg | 最新版 | 音视频合并处理 |

> **Windows 快速安装 yt-dlp 和 ffmpeg**：下载对应的 `.exe` 文件放入 `C:\Windows` 目录即可全局调用。

### 安装与运行

```bash
# 1. 克隆项目
git clone https://github.com/victoryhrl/video_download.git
cd video_download

# 2. 安装后端依赖
npm install

# 3. 安装前端依赖
cd frontend
npm install
cd ..

# 4. 确保 Redis 已启动
redis-server

# 5. 启动后端 (端口 3001)
npm run dev

# 6. 新开终端，启动前端 (端口 5173)
cd frontend
npm run dev
```

打开浏览器访问 **<http://localhost:5173>** 即可使用！

---

## 📁 项目结构

```
video_download/
├── src/                          # 后端源码
│   ├── index.ts                  # Express 入口
│   ├── routes/
│   │   └── video.routes.ts       # API 路由定义
│   ├── services/
│   │   └── ytdlp.service.ts      # yt-dlp 封装
│   └── jobs/
│       ├── download.queue.ts     # BullMQ 队列配置
│       └── download.worker.ts    # 下载工作进程
├── frontend/                     # 前端源码
│   ├── src/
│   │   ├── App.tsx               # 主应用组件
│   │   ├── components/
│   │   │   ├── UrlInput.tsx      # URL 输入组件
│   │   │   └── TaskProgress.tsx  # 进度条组件
│   │   └── services/
│   │       └── api.ts            # Axios API 封装
│   └── tailwind.config.js        # Tailwind 主题配置
├── downloads/                    # 下载的视频文件 (gitignored)
├── package.json
└── tsconfig.json
```

---

## 📡 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/video/download` | 提交视频 URL，返回 `taskId` |
| `GET` | `/api/video/task/:id` | 查询任务状态和下载进度 |
| `GET` | `/api/video/stream/:id` | 流式传输已下载的视频 |

**示例请求：**

```bash
# 提交下载任务
curl -X POST http://localhost:3001/api/video/download ^
  -H "Content-Type: application/json" ^
  -d "{\"url\":\"https://www.bilibili.com/video/BV15y4y1R71i\"}"

# 查询进度
curl http://localhost:3001/api/video/task/1
```

---

## ⚠️ 部署说明

> [!CAUTION]
> **本项目不适合部署在 Vercel、Netlify 等 Serverless 平台上！**

原因：

1. **yt-dlp / ffmpeg 二进制文件**：Serverless 环境无法安装和执行系统级别的可执行文件
2. **Redis 长连接**：BullMQ 需要与 Redis 保持长期持久连接，Serverless 函数执行完毕即销毁
3. **执行时间限制**：Vercel 免费版函数最长运行 10 秒，视频下载动辄几分钟
4. **无持久化文件系统**：下载的视频文件会在函数冷启动后丢失

### ✅ 推荐部署方式

| 方案 | 适用场景 | 成本 |
|------|---------|------|
| **本地运行** | 个人使用 | 免费 |
| **VPS 服务器** (阿里云/腾讯云/DigitalOcean) | 生产部署 | ¥50+/月 |
| **Docker Compose** | 团队/自动化部署 | 取决于宿主机 |

---

## 📝 License

MIT
