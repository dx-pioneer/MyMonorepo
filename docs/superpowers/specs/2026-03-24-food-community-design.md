# 美食内容社区平台 - 设计规格文档

## 概述

一个综合型美食内容社区平台，支持结构化食谱分享和自由图文/短视频内容发布。平台包含 Web 用户端、跨平台移动端、管理后台和 Node.js 服务端，所有代码统一管理在 Turborepo monorepo 中。

## 需求摘要

| 维度       | 决策                                   |
| ---------- | -------------------------------------- |
| 核心定位   | 综合型：食谱 + 图文种草                |
| 内容形式   | 图文 + 短视频（15秒~3分钟）            |
| 移动端方案 | React Native                           |
| 服务端框架 | Express                                |
| API 风格   | tRPC（Web/Admin） + REST（Mobile）     |
| 数据库     | PostgreSQL + Redis                     |
| 文件存储   | 阿里云 OSS（客户端直传）               |
| 即时通信   | Socket.IO                              |
| 社交功能   | 关注/粉丝、点赞/收藏/评论、私信、通知  |
| 管理后台   | 用户管理、内容审核、运营管理、数据分析 |
| 交付优先级 | 服务端优先                             |

## 第1部分：Monorepo 目录结构与包职责

### 目录结构

```
my-monorepo/
├── apps/
│   ├── web/                 # 用户端 Web (Next.js 16)
│   ├── admin/               # 管理后台 (Next.js 16)
│   ├── mobile/              # 移动端 (React Native)
│   └── server/              # 后端服务 (Express)
│
├── packages/
│   ├── api/                 # tRPC router 定义 + REST 类型
│   │   ├── src/
│   │   │   ├── routers/     # 按领域拆分 router
│   │   │   ├── trpc.ts      # tRPC 初始化 (context, middleware)
│   │   │   └── index.ts     # 合并导出 appRouter
│   │   └── package.json
│   │
│   ├── db/                  # 数据库层 (Prisma + Redis)
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   ├── client.ts    # Prisma client 单例
│   │   │   ├── redis.ts     # Redis client
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── shared/              # 跨端共享
│   │   ├── src/
│   │   │   ├── types/       # 通用业务类型
│   │   │   ├── constants/   # 枚举、配置常量
│   │   │   ├── utils/       # 纯函数工具
│   │   │   └── validators/  # Zod schema（前后端共用）
│   │   └── package.json
│   │
│   ├── ui/                  # Web 端 React 组件库（已有）
│   ├── eslint-config/       # ESLint 配置（已有）
│   └── typescript-config/   # TS 配置（已有）
│
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### 包职责划分

| 包             | 职责                               | 被谁引用           |
| -------------- | ---------------------------------- | ------------------ |
| `@repo/api`    | tRPC router 定义、请求/响应类型    | web, admin, server |
| `@repo/db`     | Prisma schema、数据库/Redis client | server, (api间接)  |
| `@repo/shared` | 业务类型、Zod校验、工具函数        | 所有端             |
| `@repo/ui`     | React UI 组件                      | web, admin         |

### 依赖方向（严格单向）

```
apps → packages/api → packages/db
apps → packages/shared
apps → packages/ui (仅 web/admin)
```

## 第2部分：数据模型

### Prisma Schema

```prisma
// ============ 用户体系 ============

model User {
  id            String   @id @default(cuid())
  phone         String?  @unique
  email         String?  @unique
  passwordHash  String
  nickname      String
  avatar        String?
  bio           String?
  role          UserRole @default(USER)
  status        UserStatus @default(ACTIVE)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  recipes          Recipe[]
  posts            Post[]
  comments         Comment[]
  likes            Like[]
  favorites        Favorite[]
  followers        Follow[]       @relation("following")
  following        Follow[]       @relation("follower")
  sentMessages     Message[]      @relation("sender")
  receivedMessages Message[]      @relation("receiver")
  notifications    Notification[]
  reports          Report[]
}

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
}

enum UserStatus {
  ACTIVE
  BANNED
  DELETED
}

// ============ 关注关系 ============

model Follow {
  id          String   @id @default(cuid())
  followerId  String
  followingId String
  createdAt   DateTime @default(now())

  follower    User @relation("follower", fields: [followerId], references: [id])
  following   User @relation("following", fields: [followingId], references: [id])

  @@unique([followerId, followingId])
}

// ============ 内容：食谱 ============

model Recipe {
  id          String        @id @default(cuid())
  authorId    String
  title       String
  description String?
  coverImage  String
  difficulty  Difficulty    @default(MEDIUM)
  cookTime    Int
  servings    Int           @default(1)
  status      ContentStatus @default(DRAFT)
  viewCount   Int           @default(0)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  author      User            @relation(fields: [authorId], references: [id])
  ingredients Ingredient[]
  steps       RecipeStep[]
  tags        TagsOnContent[]
  comments    Comment[]
  likes       Like[]
  favorites   Favorite[]
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}

model Ingredient {
  id       String @id @default(cuid())
  recipeId String
  name     String
  amount   String
  order    Int

  recipe   Recipe @relation(fields: [recipeId], references: [id], onDelete: Cascade)
}

model RecipeStep {
  id       String  @id @default(cuid())
  recipeId String
  content  String
  image    String?
  order    Int

  recipe   Recipe @relation(fields: [recipeId], references: [id], onDelete: Cascade)
}

// ============ 内容：图文/视频帖子 ============

model Post {
  id        String        @id @default(cuid())
  authorId  String
  content   String
  status    ContentStatus @default(DRAFT)
  viewCount Int           @default(0)
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  author    User            @relation(fields: [authorId], references: [id])
  media     PostMedia[]
  tags      TagsOnContent[]
  comments  Comment[]
  likes     Like[]
  favorites Favorite[]
}

model PostMedia {
  id     String    @id @default(cuid())
  postId String
  url    String
  type   MediaType
  order  Int

  post   Post @relation(fields: [postId], references: [id], onDelete: Cascade)
}

enum MediaType {
  IMAGE
  VIDEO
}

enum ContentStatus {
  DRAFT
  PENDING_REVIEW
  PUBLISHED
  REJECTED
  DELETED
}

// ============ 标签系统 ============

model Tag {
  id        String   @id @default(cuid())
  name      String   @unique
  category  String?
  hot       Boolean  @default(false)
  createdAt DateTime @default(now())

  contents  TagsOnContent[]
}

model TagsOnContent {
  id       String  @id @default(cuid())
  tagId    String
  recipeId String?
  postId   String?

  tag      Tag     @relation(fields: [tagId], references: [id])
  recipe   Recipe? @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  post     Post?   @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([tagId, recipeId])
  @@unique([tagId, postId])
}

// ============ 互动 ============

model Comment {
  id        String        @id @default(cuid())
  authorId  String
  recipeId  String?
  postId    String?
  parentId  String?
  content   String
  status    ContentStatus @default(PUBLISHED)
  createdAt DateTime      @default(now())

  author    User      @relation(fields: [authorId], references: [id])
  recipe    Recipe?   @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  post      Post?     @relation(fields: [postId], references: [id], onDelete: Cascade)
  parent    Comment?  @relation("replies", fields: [parentId], references: [id])
  replies   Comment[] @relation("replies")
}

model Like {
  id        String   @id @default(cuid())
  userId    String
  recipeId  String?
  postId    String?
  createdAt DateTime @default(now())

  user      User    @relation(fields: [userId], references: [id])
  recipe    Recipe? @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  post      Post?   @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, recipeId])
  @@unique([userId, postId])
}

model Favorite {
  id        String   @id @default(cuid())
  userId    String
  recipeId  String?
  postId    String?
  createdAt DateTime @default(now())

  user      User    @relation(fields: [userId], references: [id])
  recipe    Recipe? @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  post      Post?   @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, recipeId])
  @@unique([userId, postId])
}

// ============ 私信 ============

model Message {
  id         String   @id @default(cuid())
  senderId   String
  receiverId String
  content    String
  isRead     Boolean  @default(false)
  createdAt  DateTime @default(now())

  sender     User @relation("sender", fields: [senderId], references: [id])
  receiver   User @relation("receiver", fields: [receiverId], references: [id])

  @@index([senderId, receiverId])
}

// ============ 通知 ============

model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  content   String?
  sourceId  String?
  isRead    Boolean          @default(false)
  createdAt DateTime         @default(now())

  user      User @relation(fields: [userId], references: [id])
}

enum NotificationType {
  LIKE
  COMMENT
  FOLLOW
  SYSTEM
}

// ============ 举报 ============

model Report {
  id         String       @id @default(cuid())
  reporterId String
  targetType ReportTarget
  targetId   String
  reason     String
  status     ReportStatus @default(PENDING)
  createdAt  DateTime     @default(now())

  reporter   User @relation(fields: [reporterId], references: [id])
}

enum ReportTarget {
  RECIPE
  POST
  COMMENT
  USER
}

enum ReportStatus {
  PENDING
  RESOLVED
  DISMISSED
}

// ============ 运营 ============

model Banner {
  id        String    @id @default(cuid())
  title     String
  image     String
  link      String?
  position  String    @default("home")
  order     Int       @default(0)
  isActive  Boolean   @default(true)
  startAt   DateTime?
  endAt     DateTime?
  createdAt DateTime  @default(now())
}
```

### Redis 用途规划

| Key 模式            | 用途           | 过期策略     |
| ------------------- | -------------- | ------------ |
| `session:{id}`      | 用户会话       | 7天          |
| `user:{id}:profile` | 用户信息缓存   | 30分钟       |
| `recipe:{id}:views` | 浏览量计数器   | 定时同步到PG |
| `post:{id}:views`   | 浏览量计数器   | 定时同步到PG |
| `feed:{userId}`     | 个人信息流缓存 | 10分钟       |
| `trending:recipes`  | 热门食谱排行   | 5分钟        |
| `trending:posts`    | 热门帖子排行   | 5分钟        |
| `online:{userId}`   | 在线状态       | 5分钟续期    |
| `rate:{ip}:{path}`  | API 限流       | 按窗口       |

## 第3部分：API 架构与服务层

### tRPC Router 拆分

```
packages/api/src/
├── trpc.ts              # createTRPCContext, middleware (auth, rateLimit)
├── index.ts             # appRouter 合并导出
└── routers/
    ├── auth.ts          # 注册、登录、刷新token、登出
    ├── user.ts          # 个人资料、关注/取关、粉丝列表
    ├── recipe.ts        # 食谱CRUD、食材/步骤管理
    ├── post.ts          # 帖子CRUD、媒体管理
    ├── comment.ts       # 评论CRUD、嵌套回复
    ├── interaction.ts   # 点赞、收藏、浏览量
    ├── message.ts       # 私信列表、发送、已读标记
    ├── notification.ts  # 通知列表、已读、清除
    ├── feed.ts          # 首页信息流、推荐、搜索
    ├── upload.ts        # OSS 签名URL获取
    ├── tag.ts           # 标签查询、热门标签
    └── admin/
        ├── user.ts      # 用户管理、封禁
        ├── content.ts   # 内容审核、上下架
        ├── report.ts    # 举报处理
        ├── banner.ts    # Banner/推荐位管理
        ├── tag.ts       # 标签管理
        └── stats.ts     # 数据统计、看板
```

### Express REST API（供移动端）

```
apps/server/src/
├── app.ts               # Express 初始化、中间件
├── routes/
│   ├── auth.ts          # POST /auth/login, /auth/register, /auth/refresh
│   ├── users.ts         # GET/PUT /users/:id, /users/:id/followers
│   ├── recipes.ts       # CRUD /recipes, /recipes/:id/steps
│   ├── posts.ts         # CRUD /posts, /posts/:id/media
│   ├── comments.ts      # CRUD /comments
│   ├── interactions.ts  # POST /like, /favorite
│   ├── messages.ts      # GET/POST /messages
│   ├── notifications.ts # GET /notifications
│   ├── feed.ts          # GET /feed, /search
│   └── upload.ts        # POST /upload/sign
├── middleware/
│   ├── auth.ts          # JWT 验证
│   ├── rateLimit.ts     # Redis 限流
│   ├── validate.ts      # Zod 校验（复用 @repo/shared）
│   └── errorHandler.ts  # 统一错误处理
├── services/            # 业务逻辑层（tRPC 和 REST 共享）
│   ├── authService.ts
│   ├── userService.ts
│   ├── recipeService.ts
│   ├── postService.ts
│   ├── commentService.ts
│   ├── interactionService.ts
│   ├── messageService.ts
│   ├── notificationService.ts
│   ├── feedService.ts
│   └── uploadService.ts
├── socket/              # Socket.IO
│   ├── index.ts         # 初始化、认证中间件
│   ├── chat.ts          # 私信实时推送
│   └── notification.ts  # 通知实时推送
└── jobs/                # 定时任务
    ├── syncViewCounts.ts
    └── cleanExpiredBanners.ts
```

### Service 层共享（核心设计）

tRPC router 和 REST route 都调用同一套 Service 层，避免业务逻辑重复：

```
┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│  tRPC Router │  │ REST Routes  │  │  Socket.IO   │
│  (web/admin) │  │  (mobile)    │  │  (realtime)  │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └────────┬────────┴────────┬────────┘
                │                 │
         ┌──────▼──────┐  ┌──────▼──────┐
         │  Services   │  │  Validators │
         │ (业务逻辑)   │  │ (Zod共享)   │
         └──────┬──────┘  └─────────────┘
                │
         ┌──────▼──────┐
         │  @repo/db   │
         │ Prisma+Redis│
         └─────────────┘
```

### 认证方案

- JWT 双 Token：Access Token（15分钟）+ Refresh Token（7天，存Redis）
- 登录方式：手机号+验证码、邮箱+密码
- Admin 端通过 role 字段做权限校验，tRPC middleware 中拦截

### 信息流策略

- 拉模式（Pull）：用户请求时实时聚合关注者内容，按时间+热度混合排序
- Redis 缓存已计算的 feed，10分钟过期
- 热门推荐：基于浏览量+点赞+收藏的加权评分，Redis sorted set 存储

### 文件上传流程

```
客户端 → 请求签名URL (server) → 获取OSS直传凭证
客户端 → 直传文件到OSS → 返回文件URL
客户端 → 提交内容表单（含URL） → server 保存到数据库
```

## 第4部分：前端架构

### Web 用户端（Next.js 16）

```
apps/web/src/
├── app/
│   ├── layout.tsx              # 根布局
│   ├── page.tsx                # 首页信息流
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── recipe/
│   │   ├── [id]/page.tsx       # 食谱详情（SSR + SEO）
│   │   └── create/page.tsx
│   ├── post/
│   │   ├── [id]/page.tsx
│   │   └── create/page.tsx
│   ├── user/
│   │   ├── [id]/page.tsx       # 用户主页
│   │   └── settings/page.tsx
│   ├── search/page.tsx
│   ├── messages/page.tsx
│   └── notifications/page.tsx
├── components/
│   ├── feed/                   # 信息流卡片、瀑布流
│   ├── recipe/                 # 食材编辑器、步骤编辑器
│   ├── post/                   # 图片上传、视频播放器
│   ├── comment/                # 嵌套回复
│   ├── chat/                   # 聊天气泡
│   └── common/                 # 无限滚动、图片懒加载
├── lib/
│   ├── trpc.ts                 # tRPC client
│   ├── oss.ts                  # OSS 直传封装
│   └── socket.ts               # Socket.IO client
└── hooks/
    ├── useAuth.ts
    ├── useInfiniteScroll.ts
    └── useSocket.ts
```

**关键策略：**

- 食谱/帖子详情页用 Server Components（首屏性能 + SEO）
- 信息流、评论、聊天等交互区域用 Client Components
- 图片瀑布流布局，视频懒加载

### Admin 管理后台（Next.js 16）

```
apps/admin/src/
├── app/
│   ├── layout.tsx              # 左侧菜单 + 顶栏布局
│   ├── page.tsx                # 数据概览看板
│   ├── (auth)/login/page.tsx
│   ├── users/
│   │   ├── page.tsx            # 用户列表
│   │   └── [id]/page.tsx
│   ├── content/
│   │   ├── recipes/page.tsx    # 食谱审核
│   │   ├── posts/page.tsx      # 帖子审核
│   │   └── [id]/page.tsx
│   ├── reports/page.tsx
│   ├── operations/
│   │   ├── banners/page.tsx
│   │   ├── tags/page.tsx
│   │   └── topics/page.tsx
│   └── stats/
│       ├── overview/page.tsx   # DAU、新增用户、内容量
│       ├── content/page.tsx
│       └── users/page.tsx
├── components/
│   ├── layout/                 # Sidebar、Header
│   ├── tables/                 # 数据表格（分页、筛选）
│   ├── charts/                 # 图表（Recharts）
│   ├── forms/
│   └── modals/
└── lib/
    └── trpc.ts
```

**关键策略：**

- tRPC 调用 admin/\* 路由，middleware 校验角色
- Recharts 渲染数据看板
- 统一表格组件：分页、搜索、批量操作

### Mobile 移动端（React Native）

```
apps/mobile/
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   ├── home/               # 双列瀑布流
│   │   ├── recipe/
│   │   ├── post/
│   │   ├── search/
│   │   ├── user/
│   │   ├── messages/
│   │   └── notifications/
│   ├── components/
│   │   ├── feed/
│   │   ├── media/              # 图片浏览器、视频播放器
│   │   ├── comment/            # 底部弹出sheet
│   │   └── common/
│   ├── navigation/
│   │   ├── index.tsx
│   │   ├── TabNavigator.tsx    # 首页/发现/发布/消息/我的
│   │   └── StackNavigator.tsx
│   ├── api/
│   │   ├── client.ts           # Axios（拦截器、token刷新）
│   │   ├── auth.ts
│   │   ├── recipes.ts
│   │   ├── posts.ts
│   │   └── ...
│   ├── stores/                 # Zustand
│   │   ├── authStore.ts
│   │   └── socketStore.ts
│   └── utils/
│       ├── oss.ts
│       └── socket.ts
├── app.json
└── package.json
```

**关键策略：**

- REST API（Express），Axios 统一拦截
- React Navigation，底部5个Tab
- Zustand 轻量状态管理
- react-native-video / react-native-image-picker

### 跨端共享策略

| 共享内容  | 共享方式                  | 使用端     |
| --------- | ------------------------- | ---------- |
| 业务类型  | `@repo/shared/types`      | 全部       |
| Zod 校验  | `@repo/shared/validators` | 全部       |
| 常量/枚举 | `@repo/shared/constants`  | 全部       |
| tRPC 类型 | `@repo/api` 自动推导      | web, admin |
| UI 组件   | `@repo/ui`                | web, admin |

Mobile 端不引用 `@repo/ui`（React DOM 组件无法在 RN 中使用），但共享 `@repo/shared`。

## 第5部分：实时通信、错误处理与安全

### Socket.IO 架构

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│   Web    │  │  Mobile  │  │  Admin   │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     └──────┬──────┴──────┬──────┘
      ┌─────▼─────────────▼─────┐
      │     Socket.IO Server    │
      │  (Express 内嵌, 同端口)   │
      ├─────────────────────────┤
      │  /chat    → 私信实时推送  │
      │  /notify  → 通知实时推送  │
      └─────────────────────────┘
```

**连接认证：** Socket 连接时通过 `auth.token` 传入 JWT，middleware 校验后将 userId 绑定到 socket。

**事件设计：**

| Namespace | 事件                | 方向 | 说明       |
| --------- | ------------------- | ---- | ---------- |
| `/chat`   | `message:send`      | C→S  | 发送私信   |
| `/chat`   | `message:new`       | S→C  | 接收新私信 |
| `/chat`   | `message:read`      | C→S  | 标记已读   |
| `/chat`   | `typing`            | 双向 | 正在输入   |
| `/notify` | `notification:new`  | S→C  | 新通知推送 |
| `/notify` | `notification:read` | C→S  | 标记已读   |

**离线处理：** 消息/通知写入数据库，用户上线后拉取未读列表。

### 错误处理

**统一错误格式：**

```typescript
interface AppError {
  code: string; // "AUTH_INVALID_TOKEN", "CONTENT_NOT_FOUND"
  message: string; // 用户友好的中文提示
  statusCode: number;
  details?: unknown; // Zod 校验错误等
}
```

**分层处理：**

| 层级              | 职责                      | 示例           |
| ----------------- | ------------------------- | -------------- |
| Zod 校验层        | 请求参数校验，400         | 手机号格式错误 |
| Auth 中间件       | 认证授权，401/403         | Token 过期     |
| Service 层        | 业务逻辑错误，400/404/409 | 内容不存在     |
| 全局 errorHandler | 兜底未知错误，500         | 数据库连接失败 |

### 安全措施

| 安全领域   | 措施                                                            |
| ---------- | --------------------------------------------------------------- |
| 认证       | JWT + Refresh Token 双 Token，Refresh Token 存 Redis 可主动吊销 |
| 密码       | bcrypt 加盐哈希，成本因子 12                                    |
| API 限流   | Redis 滑动窗口，按 IP + 用户维度                                |
| 输入校验   | 所有入口 Zod 校验，前后端共用                                   |
| XSS 防护   | sanitize-html，React 默认转义                                   |
| SQL 注入   | Prisma 参数化查询                                               |
| 文件上传   | OSS 签名 URL 限制类型和大小（图片5MB、视频100MB）               |
| CORS       | 白名单域名                                                      |
| 敏感数据   | .env.local，不入仓库                                            |
| Admin 权限 | tRPC middleware 校验 role                                       |

### 测试策略

| 层级         | 工具                     | 覆盖范围                         |
| ------------ | ------------------------ | -------------------------------- |
| 单元测试     | Vitest                   | Service 层、工具函数、Zod schema |
| API 集成测试 | Vitest + Supertest       | REST 路由、tRPC 路由             |
| 组件测试     | Vitest + Testing Library | UI 组件渲染、交互                |
| E2E 测试     | Playwright               | Web 端关键用户流程               |

### 部署架构

```
┌─────────────────────────────────┐
│           Nginx 反向代理         │
├────────┬────────┬───────────────┤
│  Web   │ Admin  │    Server     │
│ :3000  │ :3001  │ :4000         │
│Next.js │Next.js │ Express       │
│        │        │ +Socket.IO    │
└────────┴────────┴───────┬───────┘
                          │
              ┌───────────┼───────────┐
              │           │           │
        ┌─────▼───┐ ┌────▼────┐ ┌───▼────┐
        │PostgreSQL│ │  Redis  │ │阿里云OSS│
        │  :5432   │ │  :6379  │ │  CDN   │
        └─────────┘ └─────────┘ └────────┘
```

## 技术栈总览

| 类别     | 技术                                           |
| -------- | ---------------------------------------------- |
| 语言     | TypeScript                                     |
| 前端框架 | Next.js 16, React 19, React Native             |
| 后端框架 | Express                                        |
| API      | tRPC + REST                                    |
| ORM      | Prisma                                         |
| 数据库   | PostgreSQL + Redis                             |
| 实时通信 | Socket.IO                                      |
| 状态管理 | Zustand (Mobile)                               |
| 文件存储 | 阿里云 OSS                                     |
| 校验     | Zod                                            |
| 测试     | Vitest, Supertest, Testing Library, Playwright |
| 图表     | Recharts                                       |
| 构建     | Turborepo + pnpm                               |
| CI/CD    | GitHub Actions                                 |
