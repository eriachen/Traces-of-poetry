
# 诗迹

一个现代化的古诗词学习与教学辅助平台，通过文学地图可视化、班级协作、智能测评等功能，让古诗词学习更加生动有趣。

## 功能特性

### 🗺️ 文学地图
- 省级地图气泡展示诗词分布
- 朝代筛选功能
- 诗人创作路线追踪
- 交友诗关联连线

### 👥 用户系统
- 学生/教师角色区分
- 注册/登录认证
- 个人学习档案
- 学习进度追踪

### 👨‍🏫 班级管理
- 教师创建班级
- 学生通过邀请码加入
- 班级成员管理
- 班级数据隔离

### 📝 学习测评
- 填空默写
- 错题本功能

### 📖 深度阅读
- 诗词详情展示
- 研究文章创作
- 个人批注

## 技术栈

### 前端
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- 高德地图 API

### 后端
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT 认证

## 快速开始

### 前置要求
- Node.js 18+
- PostgreSQL 14+
- 高德地图 API Key

### 1. 克隆项目
```bash
cd poetry-teaching-platform
```

### 2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填入你的数据库连接和 API Key
```

### 3. 安装依赖
```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 4. 设置数据库
```bash
cd backend

# 生成 Prisma Client
npm run db:generate

# 推送数据库 schema
npm run db:push

# 初始化种子数据
npm run db:seed
```

### 5. 启动开发服务器
```bash
# 启动后端 (终端1)
cd backend
npm run dev

# 启动前端 (终端2)
cd frontend
npm run dev
```

前端将在 http://localhost:3000 启动，后端 API 在 http://localhost:3001

## 项目结构
```
poetry-teaching-platform/
├── backend/                 # 后端项目
│   ├── src/
│   │   ├── routes/         # API 路由
│   │   └── server.ts       # 服务器入口
│   ├── prisma/
│   │   ├── schema.prisma   # 数据库 schema
│   │   └── seed.ts         # 种子数据
│   └── package.json
├── frontend/               # 前端项目
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── pages/          # 页面组件
│   │   ├── contexts/       # React Context
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## 开发优先级

### P0 - MVP 功能
- ✅ 用户注册/登录 + 角色区分
- ✅ 内置诗词数据库
- ✅ 文学地图省份气泡展示
- ✅ 诗词详情卡片
- ✅ 朝代筛选
- ✅ 教师创建班级 + 学生加入班级

### P1 - 核心功能
- ⏳ 个人批注 + 感悟记录
- ⏳ 手动录入诗词
- ⏳ 同一作者创作路线
- ⏳ 填空/全篇默写练习
- ⏳ 学习进度状态标记

### P2 - 增强功能
- 交友诗关联连线
- 意象标签 + 意象聚合页
- 教师发布测验 + 学情报告
- 仿写提交与班级墙

### P3 - 高级功能
- 诗人关系图谱
- 手写识别默写
- 鉴赏作文辅助框架
- PDF 导出学情报告

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
