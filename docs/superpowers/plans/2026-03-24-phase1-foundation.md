# Phase 1: 基础设施 + 数据库层 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建 monorepo 基础设施层，包括数据库 schema、Prisma client、Redis client、共享类型、Zod 校验和工具函数，为后续 API 层和各端应用提供稳固的基础。

**Architecture:** 创建 `packages/db`（Prisma + Redis）和 `packages/shared`（类型、校验、工具函数）两个包。`packages/db` 负责所有数据库交互，`packages/shared` 提供跨端共享的业务类型和 Zod 校验 schema。两个包均为纯 TypeScript 包，通过 workspace 协议被上层应用引用。

**Tech Stack:** Prisma ORM, ioredis, Zod, TypeScript, Vitest, pnpm workspace

**Spec:** `docs/superpowers/specs/2026-03-24-food-community-design.md`

---

## File Structure

### packages/shared/

```
packages/shared/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts                    # 统一导出
│   ├── types/
│   │   ├── index.ts
│   │   ├── user.ts                 # User 相关类型
│   │   ├── recipe.ts               # Recipe 相关类型
│   │   ├── post.ts                 # Post 相关类型
│   │   ├── interaction.ts          # Comment/Like/Favorite 类型
│   │   ├── message.ts              # Message/Notification 类型
│   │   └── common.ts               # 通用类型 (分页、API 响应等)
│   ├── constants/
│   │   ├── index.ts
│   │   └── enums.ts                # 业务枚举 (与 Prisma enum 对应)
│   ├── validators/
│   │   ├── index.ts
│   │   ├── auth.ts                 # 登录/注册校验
│   │   ├── user.ts                 # 用户资料校验
│   │   ├── recipe.ts               # 食谱校验
│   │   ├── post.ts                 # 帖子校验
│   │   ├── comment.ts              # 评论校验
│   │   └── common.ts               # 通用校验 (分页参数等)
│   └── utils/
│       ├── index.ts
│       └── format.ts               # 格式化工具函数
└── tests/
    ├── validators/
    │   ├── auth.test.ts
    │   ├── user.test.ts
    │   ├── recipe.test.ts
    │   ├── post.test.ts
    │   ├── comment.test.ts
    │   └── common.test.ts
    └── utils/
        └── format.test.ts
```

### packages/db/

```
packages/db/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── prisma/
│   └── schema.prisma
├── src/
│   ├── index.ts                    # 统一导出
│   ├── client.ts                   # Prisma client 单例
│   └── redis.ts                    # Redis client 封装
└── tests/
    ├── client.test.ts              # Prisma client 单例测试
    └── redis.test.ts               # Redis client 测试
```

### Config updates

```
packages/typescript-config/
└── library.json                    # 新增：非 React 纯 TS 库配置

turbo.json                          # 修改：添加 test 任务
package.json (root)                 # 修改：添加 test script
```

---

## Task 1: TypeScript 配置扩展

**Files:**

- Create: `packages/typescript-config/library.json`
- Modify: `turbo.json`
- Modify: `package.json` (root)

- [ ] **Step 1: 创建纯 TS 库的 tsconfig**

`packages/typescript-config/library.json`:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

- [ ] **Step 2: 在 turbo.json 添加 test 任务**

在 `turbo.json` 的 `tasks` 中添加：

```json
"test": {
  "dependsOn": ["^build"],
  "cache": false
}
```

同时修改 `build` 任务的 `outputs`，使其同时支持 Next.js 和纯 TS 库：

```json
"build": {
  "dependsOn": ["^build"],
  "inputs": ["$TURBO_DEFAULT$", ".env*"],
  "outputs": [".next/**", "!.next/cache/**", "dist/**"]
}
```

- [ ] **Step 3: 在 root package.json 添加 test script**

在 `scripts` 中添加：

```json
"test": "turbo run test"
```

- [ ] **Step 4: 提交**

```bash
git add packages/typescript-config/library.json turbo.json package.json
git commit -m "chore: add library tsconfig and test task to turbo"
```

---

## Task 2: 安装全局开发依赖

**Files:**

- Modify: `package.json` (root)

- [ ] **Step 1: 安装 Vitest 到 root**

```bash
cd /Users/dengxiang/selfProject/my-monorepo
pnpm add -Dw vitest
```

- [ ] **Step 2: 验证安装**

```bash
pnpm ls vitest
```

Expected: 显示 vitest 版本

- [ ] **Step 3: 提交**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add vitest to root devDependencies"
```

---

## Task 3: 创建 packages/shared 包骨架

**Files:**

- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/vitest.config.ts`
- Create: `packages/shared/src/index.ts`

- [ ] **Step 1: 创建 package.json**

`packages/shared/package.json`:

```json
{
  "name": "@repo/shared",
  "version": "0.0.0",
  "private": true,
  "exports": {
    ".": "./src/index.ts",
    "./types": "./src/types/index.ts",
    "./constants": "./src/constants/index.ts",
    "./validators": "./src/validators/index.ts",
    "./utils": "./src/utils/index.ts"
  },
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "check-types": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "zod": "^3.25.0"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@types/node": "^22.15.3",
    "eslint": "^9.39.1",
    "typescript": "workspace:*",
    "vitest": "^3.2.1"
  }
}
```

- [ ] **Step 2: 创建 tsconfig.json**

`packages/shared/tsconfig.json`:

```json
{
  "extends": "@repo/typescript-config/library.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 3: 创建 vitest.config.ts**

`packages/shared/vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
});
```

- [ ] **Step 4: 创建 src/index.ts 占位**

`packages/shared/src/index.ts`:

```typescript
export * from "./types";
export * from "./constants";
export * from "./validators";
export * from "./utils";
```

- [ ] **Step 5: 安装依赖**

```bash
cd /Users/dengxiang/selfProject/my-monorepo
pnpm install
```

- [ ] **Step 6: 提交**

```bash
git add packages/shared/
git commit -m "chore: scaffold packages/shared with zod and vitest"
```

---

## Task 4: 实现 shared/constants — 业务枚举

**Files:**

- Create: `packages/shared/src/constants/enums.ts`
- Create: `packages/shared/src/constants/index.ts`

- [ ] **Step 1: 创建枚举定义**

`packages/shared/src/constants/enums.ts`:

```typescript
export const UserRole = {
  USER: "USER",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = {
  ACTIVE: "ACTIVE",
  BANNED: "BANNED",
  DELETED: "DELETED",
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const ContentStatus = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED",
  DELETED: "DELETED",
} as const;
export type ContentStatus = (typeof ContentStatus)[keyof typeof ContentStatus];

export const Difficulty = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
} as const;
export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];

export const MediaType = {
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
} as const;
export type MediaType = (typeof MediaType)[keyof typeof MediaType];

export const NotificationType = {
  LIKE: "LIKE",
  COMMENT: "COMMENT",
  FOLLOW: "FOLLOW",
  SYSTEM: "SYSTEM",
} as const;
export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export const ReportTarget = {
  RECIPE: "RECIPE",
  POST: "POST",
  COMMENT: "COMMENT",
  USER: "USER",
} as const;
export type ReportTarget = (typeof ReportTarget)[keyof typeof ReportTarget];

export const ReportStatus = {
  PENDING: "PENDING",
  RESOLVED: "RESOLVED",
  DISMISSED: "DISMISSED",
} as const;
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];
```

- [ ] **Step 2: 创建 index.ts**

`packages/shared/src/constants/index.ts`:

```typescript
export * from "./enums";
```

- [ ] **Step 3: 提交**

```bash
git add packages/shared/src/constants/
git commit -m "feat(shared): add business enum constants"
```

---

## Task 5: 实现 shared/types — 业务类型定义

**Files:**

- Create: `packages/shared/src/types/common.ts`
- Create: `packages/shared/src/types/user.ts`
- Create: `packages/shared/src/types/recipe.ts`
- Create: `packages/shared/src/types/post.ts`
- Create: `packages/shared/src/types/interaction.ts`
- Create: `packages/shared/src/types/message.ts`
- Create: `packages/shared/src/types/index.ts`

- [ ] **Step 1: 创建通用类型**

`packages/shared/src/types/common.ts`:

```typescript
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

- [ ] **Step 2: 创建用户类型**

`packages/shared/src/types/user.ts`:

```typescript
import type { UserRole, UserStatus } from "../constants/enums";

export interface User {
  id: string;
  phone: string | null;
  email: string | null;
  nickname: string;
  avatar: string | null;
  bio: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

/** 公开的用户资料（不含敏感字段） */
export interface UserProfile {
  id: string;
  nickname: string;
  avatar: string | null;
  bio: string | null;
  followerCount: number;
  followingCount: number;
  recipeCount: number;
  postCount: number;
  isFollowing?: boolean;
}
```

- [ ] **Step 3: 创建食谱类型**

`packages/shared/src/types/recipe.ts`:

```typescript
import type { ContentStatus, Difficulty } from "../constants/enums";

export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  order: number;
}

export interface RecipeStep {
  id: string;
  content: string;
  image: string | null;
  order: number;
}

export interface Recipe {
  id: string;
  authorId: string;
  title: string;
  description: string | null;
  coverImage: string;
  difficulty: Difficulty;
  cookTime: number;
  servings: number;
  status: ContentStatus;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  ingredients: Ingredient[];
  steps: RecipeStep[];
}

/** 信息流中的食谱卡片 */
export interface RecipeCard {
  id: string;
  title: string;
  coverImage: string;
  difficulty: Difficulty;
  cookTime: number;
  authorNickname: string;
  authorAvatar: string | null;
  likeCount: number;
  isLiked?: boolean;
}
```

- [ ] **Step 4: 创建帖子类型**

`packages/shared/src/types/post.ts`:

```typescript
import type { ContentStatus, MediaType } from "../constants/enums";

export interface PostMedia {
  id: string;
  url: string;
  type: MediaType;
  order: number;
}

export interface Post {
  id: string;
  authorId: string;
  title: string | null;
  content: string;
  status: ContentStatus;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  media: PostMedia[];
}

/** 信息流中的帖子卡片 */
export interface PostCard {
  id: string;
  title: string | null;
  content: string;
  coverImage: string | null;
  authorNickname: string;
  authorAvatar: string | null;
  likeCount: number;
  isLiked?: boolean;
}
```

- [ ] **Step 5: 创建互动类型**

`packages/shared/src/types/interaction.ts`:

```typescript
import type { ContentStatus } from "../constants/enums";

export interface Comment {
  id: string;
  authorId: string;
  recipeId: string | null;
  postId: string | null;
  parentId: string | null;
  content: string;
  status: ContentStatus;
  createdAt: Date;
  authorNickname: string;
  authorAvatar: string | null;
  replies?: Comment[];
}

export interface Like {
  id: string;
  userId: string;
  recipeId: string | null;
  postId: string | null;
  createdAt: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  recipeId: string | null;
  postId: string | null;
  createdAt: Date;
}
```

- [ ] **Step 6: 创建消息/通知类型**

`packages/shared/src/types/message.ts`:

```typescript
import type { NotificationType } from "../constants/enums";

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

/** 私信会话摘要 */
export interface Conversation {
  partnerId: string;
  partnerNickname: string;
  partnerAvatar: string | null;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string | null;
  sourceType: string | null;
  sourceId: string | null;
  isRead: boolean;
  createdAt: Date;
}
```

- [ ] **Step 7: 创建 index.ts**

`packages/shared/src/types/index.ts`:

```typescript
export type * from "./common";
export type * from "./user";
export type * from "./recipe";
export type * from "./post";
export type * from "./interaction";
export type * from "./message";
```

- [ ] **Step 8: 提交**

```bash
git add packages/shared/src/types/
git commit -m "feat(shared): add business type definitions"
```

---

## Task 6: 实现 shared/validators — 通用校验

**Files:**

- Create: `packages/shared/src/validators/common.ts`
- Create: `packages/shared/tests/validators/common.test.ts`

- [ ] **Step 1: 编写 common 校验的失败测试**

`packages/shared/tests/validators/common.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { paginationSchema, idSchema } from "../../src/validators/common";

describe("paginationSchema", () => {
  it("should accept valid pagination params", () => {
    const result = paginationSchema.safeParse({ page: 1, pageSize: 20 });
    expect(result.success).toBe(true);
  });

  it("should use defaults when omitted", () => {
    const result = paginationSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it("should reject page < 1", () => {
    const result = paginationSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("should reject pageSize > 100", () => {
    const result = paginationSchema.safeParse({ pageSize: 200 });
    expect(result.success).toBe(false);
  });
});

describe("idSchema", () => {
  it("should accept non-empty string", () => {
    const result = idSchema.safeParse("clx123abc");
    expect(result.success).toBe(true);
  });

  it("should reject empty string", () => {
    const result = idSchema.safeParse("");
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd /Users/dengxiang/selfProject/my-monorepo/packages/shared
pnpm vitest run tests/validators/common.test.ts
```

Expected: FAIL — 模块不存在

- [ ] **Step 3: 实现 common 校验**

`packages/shared/src/validators/common.ts`:

```typescript
import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationInput = z.infer<typeof paginationSchema>;

export const idSchema = z.string().min(1, "ID 不能为空");
export type IdInput = z.infer<typeof idSchema>;
```

- [ ] **Step 4: 运行测试确认通过**

```bash
cd /Users/dengxiang/selfProject/my-monorepo/packages/shared
pnpm vitest run tests/validators/common.test.ts
```

Expected: PASS（4 tests）

- [ ] **Step 5: 提交**

```bash
git add packages/shared/src/validators/common.ts packages/shared/tests/validators/common.test.ts
git commit -m "feat(shared): add common validators (pagination, id)"
```

---

## Task 7: 实现 shared/validators — 认证校验

**Files:**

- Create: `packages/shared/src/validators/auth.ts`
- Create: `packages/shared/tests/validators/auth.test.ts`

- [ ] **Step 1: 编写失败测试**

`packages/shared/tests/validators/auth.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  loginByEmailSchema,
  loginBySmsSchema,
  registerSchema,
  sendSmsCodeSchema,
} from "../../src/validators/auth";

describe("registerSchema", () => {
  it("should accept valid registration with email", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "Abc123456",
      nickname: "美食家",
    });
    expect(result.success).toBe(true);
  });

  it("should accept valid registration with phone", () => {
    const result = registerSchema.safeParse({
      phone: "13800138000",
      password: "Abc123456",
      nickname: "美食家",
    });
    expect(result.success).toBe(true);
  });

  it("should reject when both phone and email are missing", () => {
    const result = registerSchema.safeParse({
      password: "Abc123456",
      nickname: "美食家",
    });
    expect(result.success).toBe(false);
  });

  it("should reject password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "Abc1234",
      nickname: "美食家",
    });
    expect(result.success).toBe(false);
  });

  it("should reject nickname longer than 20 characters", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "Abc123456",
      nickname: "a".repeat(21),
    });
    expect(result.success).toBe(false);
  });
});

describe("loginByEmailSchema", () => {
  it("should accept valid email login", () => {
    const result = loginByEmailSchema.safeParse({
      email: "test@example.com",
      password: "Abc123456",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = loginByEmailSchema.safeParse({
      email: "not-an-email",
      password: "Abc123456",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginBySmsSchema", () => {
  it("should accept valid sms login", () => {
    const result = loginBySmsSchema.safeParse({
      phone: "13800138000",
      code: "123456",
    });
    expect(result.success).toBe(true);
  });

  it("should reject code not 6 digits", () => {
    const result = loginBySmsSchema.safeParse({
      phone: "13800138000",
      code: "12345",
    });
    expect(result.success).toBe(false);
  });
});

describe("sendSmsCodeSchema", () => {
  it("should accept valid phone number", () => {
    const result = sendSmsCodeSchema.safeParse({
      phone: "13800138000",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid phone format", () => {
    const result = sendSmsCodeSchema.safeParse({
      phone: "1234567",
    });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd /Users/dengxiang/selfProject/my-monorepo/packages/shared
pnpm vitest run tests/validators/auth.test.ts
```

Expected: FAIL

- [ ] **Step 3: 实现认证校验**

`packages/shared/src/validators/auth.ts`:

```typescript
import { z } from "zod";

const phoneSchema = z.string().regex(/^1[3-9]\d{9}$/, "手机号格式不正确");
const emailSchema = z.string().email("邮箱格式不正确");
const passwordSchema = z
  .string()
  .min(8, "密码不少于8位")
  .max(64, "密码不超过64位");
const nicknameSchema = z
  .string()
  .min(1, "昵称不能为空")
  .max(20, "昵称不超过20个字符");
const smsCodeSchema = z.string().regex(/^\d{6}$/, "验证码为6位数字");

export const registerSchema = z
  .object({
    phone: phoneSchema.optional(),
    email: emailSchema.optional(),
    password: passwordSchema,
    nickname: nicknameSchema,
  })
  .refine((data) => data.phone || data.email, {
    message: "手机号和邮箱至少填一个",
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginByEmailSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
export type LoginByEmailInput = z.infer<typeof loginByEmailSchema>;

export const loginBySmsSchema = z.object({
  phone: phoneSchema,
  code: smsCodeSchema,
});
export type LoginBySmsInput = z.infer<typeof loginBySmsSchema>;

export const sendSmsCodeSchema = z.object({
  phone: phoneSchema,
});
export type SendSmsCodeInput = z.infer<typeof sendSmsCodeSchema>;
```

- [ ] **Step 4: 运行测试确认通过**

```bash
cd /Users/dengxiang/selfProject/my-monorepo/packages/shared
pnpm vitest run tests/validators/auth.test.ts
```

Expected: PASS（8 tests）

- [ ] **Step 5: 提交**

```bash
git add packages/shared/src/validators/auth.ts packages/shared/tests/validators/auth.test.ts
git commit -m "feat(shared): add auth validators (register, login, sms)"
```

---

## Task 8: 实现 shared/validators — 用户资料校验

**Files:**

- Create: `packages/shared/src/validators/user.ts`
- Create: `packages/shared/tests/validators/user.test.ts`

- [ ] **Step 1: 编写失败测试**

`packages/shared/tests/validators/user.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { updateProfileSchema } from "../../src/validators/user";

describe("updateProfileSchema", () => {
  it("should accept valid profile update", () => {
    const result = updateProfileSchema.safeParse({
      nickname: "新昵称",
      bio: "美食爱好者",
    });
    expect(result.success).toBe(true);
  });

  it("should accept partial update", () => {
    const result = updateProfileSchema.safeParse({
      nickname: "新昵称",
    });
    expect(result.success).toBe(true);
  });

  it("should reject bio longer than 200 characters", () => {
    const result = updateProfileSchema.safeParse({
      bio: "a".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty object", () => {
    const result = updateProfileSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd /Users/dengxiang/selfProject/my-monorepo/packages/shared
pnpm vitest run tests/validators/user.test.ts
```

Expected: FAIL

- [ ] **Step 3: 实现用户校验**

`packages/shared/src/validators/user.ts`:

```typescript
import { z } from "zod";

export const updateProfileSchema = z
  .object({
    nickname: z
      .string()
      .min(1, "昵称不能为空")
      .max(20, "昵称不超过20个字符")
      .optional(),
    avatar: z.string().url("头像必须为有效URL").optional(),
    bio: z.string().max(200, "简介不超过200个字符").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "至少修改一个字段",
  });
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
```

- [ ] **Step 4: 运行测试确认通过**

```bash
cd /Users/dengxiang/selfProject/my-monorepo/packages/shared
pnpm vitest run tests/validators/user.test.ts
```

Expected: PASS（4 tests）

- [ ] **Step 5: 提交**

```bash
git add packages/shared/src/validators/user.ts packages/shared/tests/validators/user.test.ts
git commit -m "feat(shared): add user profile validators"
```

---

## Task 9: 实现 shared/validators — 食谱校验

**Files:**

- Create: `packages/shared/src/validators/recipe.ts`
- Create: `packages/shared/tests/validators/recipe.test.ts`

- [ ] **Step 1: 编写失败测试**

`packages/shared/tests/validators/recipe.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  createRecipeSchema,
  ingredientSchema,
  recipeStepSchema,
} from "../../src/validators/recipe";

describe("ingredientSchema", () => {
  it("should accept valid ingredient", () => {
    const result = ingredientSchema.safeParse({
      name: "鸡蛋",
      amount: "2个",
      order: 1,
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty name", () => {
    const result = ingredientSchema.safeParse({
      name: "",
      amount: "2个",
      order: 1,
    });
    expect(result.success).toBe(false);
  });
});

describe("recipeStepSchema", () => {
  it("should accept step with image", () => {
    const result = recipeStepSchema.safeParse({
      content: "打散鸡蛋",
      image: "https://oss.example.com/step1.jpg",
      order: 1,
    });
    expect(result.success).toBe(true);
  });

  it("should accept step without image", () => {
    const result = recipeStepSchema.safeParse({
      content: "打散鸡蛋",
      order: 1,
    });
    expect(result.success).toBe(true);
  });
});

describe("createRecipeSchema", () => {
  const validRecipe = {
    title: "番茄炒蛋",
    description: "经典家常菜",
    coverImage: "https://oss.example.com/cover.jpg",
    difficulty: "EASY" as const,
    cookTime: 15,
    servings: 2,
    ingredients: [{ name: "鸡蛋", amount: "3个", order: 1 }],
    steps: [{ content: "打散鸡蛋", order: 1 }],
    tagIds: [],
  };

  it("should accept valid recipe", () => {
    const result = createRecipeSchema.safeParse(validRecipe);
    expect(result.success).toBe(true);
  });

  it("should reject empty title", () => {
    const result = createRecipeSchema.safeParse({
      ...validRecipe,
      title: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty ingredients", () => {
    const result = createRecipeSchema.safeParse({
      ...validRecipe,
      ingredients: [],
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty steps", () => {
    const result = createRecipeSchema.safeParse({
      ...validRecipe,
      steps: [],
    });
    expect(result.success).toBe(false);
  });

  it("should reject cookTime <= 0", () => {
    const result = createRecipeSchema.safeParse({
      ...validRecipe,
      cookTime: 0,
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid difficulty", () => {
    const result = createRecipeSchema.safeParse({
      ...validRecipe,
      difficulty: "IMPOSSIBLE",
    });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd /Users/dengxiang/selfProject/my-monorepo/packages/shared
pnpm vitest run tests/validators/recipe.test.ts
```

Expected: FAIL

- [ ] **Step 3: 实现食谱校验**

`packages/shared/src/validators/recipe.ts`:

```typescript
import { z } from "zod";
import { Difficulty } from "../constants/enums";

export const ingredientSchema = z.object({
  name: z.string().min(1, "食材名不能为空").max(50),
  amount: z.string().min(1, "用量不能为空").max(50),
  order: z.number().int().min(0),
});
export type IngredientInput = z.infer<typeof ingredientSchema>;

export const recipeStepSchema = z.object({
  content: z.string().min(1, "步骤内容不能为空").max(500),
  image: z.string().url().optional(),
  order: z.number().int().min(0),
});
export type RecipeStepInput = z.infer<typeof recipeStepSchema>;

export const createRecipeSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(100, "标题不超过100个字符"),
  description: z.string().max(500).optional(),
  coverImage: z.string().url("封面图必须为有效URL"),
  difficulty: z.nativeEnum(Difficulty),
  cookTime: z.number().int().min(1, "烹饪时间至少1分钟"),
  servings: z.number().int().min(1).default(1),
  ingredients: z.array(ingredientSchema).min(1, "至少添加一种食材"),
  steps: z.array(recipeStepSchema).min(1, "至少添加一个步骤"),
  tagIds: z.array(z.string()).default([]),
});
export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
```

- [ ] **Step 4: 运行测试确认通过**

```bash
cd /Users/dengxiang/selfProject/my-monorepo/packages/shared
pnpm vitest run tests/validators/recipe.test.ts
```

Expected: PASS（8 tests）

- [ ] **Step 5: 提交**

```bash
git add packages/shared/src/validators/recipe.ts packages/shared/tests/validators/recipe.test.ts
git commit -m "feat(shared): add recipe validators"
```

---

## Task 10: 实现 shared/validators — 帖子与评论校验

**Files:**

- Create: `packages/shared/src/validators/post.ts`
- Create: `packages/shared/src/validators/comment.ts`
- Create: `packages/shared/tests/validators/post.test.ts`
- Create: `packages/shared/tests/validators/comment.test.ts`

- [ ] **Step 1: 编写帖子校验失败测试**

`packages/shared/tests/validators/post.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { createPostSchema } from "../../src/validators/post";

describe("createPostSchema", () => {
  it("should accept valid post with images", () => {
    const result = createPostSchema.safeParse({
      content: "今天发现一家超棒的小店",
      media: [
        { url: "https://oss.example.com/1.jpg", type: "IMAGE", order: 0 },
      ],
      tagIds: [],
    });
    expect(result.success).toBe(true);
  });

  it("should accept post with optional title", () => {
    const result = createPostSchema.safeParse({
      title: "探店日记",
      content: "推荐一家火锅店",
      media: [],
      tagIds: [],
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty content", () => {
    const result = createPostSchema.safeParse({
      content: "",
      media: [],
      tagIds: [],
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid media type", () => {
    const result = createPostSchema.safeParse({
      content: "test",
      media: [{ url: "https://oss.example.com/1.jpg", type: "GIF", order: 0 }],
      tagIds: [],
    });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: 编写评论校验失败测试**

`packages/shared/tests/validators/comment.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { createCommentSchema } from "../../src/validators/comment";

describe("createCommentSchema", () => {
  it("should accept comment on recipe", () => {
    const result = createCommentSchema.safeParse({
      recipeId: "clx123",
      content: "做得太好了！",
    });
    expect(result.success).toBe(true);
  });

  it("should accept comment on post", () => {
    const result = createCommentSchema.safeParse({
      postId: "clx456",
      content: "种草了！",
    });
    expect(result.success).toBe(true);
  });

  it("should accept reply to comment", () => {
    const result = createCommentSchema.safeParse({
      recipeId: "clx123",
      parentId: "clx789",
      content: "谢谢！",
    });
    expect(result.success).toBe(true);
  });

  it("should reject when both recipeId and postId present", () => {
    const result = createCommentSchema.safeParse({
      recipeId: "clx123",
      postId: "clx456",
      content: "test",
    });
    expect(result.success).toBe(false);
  });

  it("should reject when neither recipeId nor postId present", () => {
    const result = createCommentSchema.safeParse({
      content: "test",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty content", () => {
    const result = createCommentSchema.safeParse({
      recipeId: "clx123",
      content: "",
    });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 3: 运行测试确认全部失败**

```bash
cd /Users/dengxiang/selfProject/my-monorepo/packages/shared
pnpm vitest run tests/validators/post.test.ts tests/validators/comment.test.ts
```

Expected: FAIL

- [ ] **Step 4: 实现帖子校验**

`packages/shared/src/validators/post.ts`:

```typescript
import { z } from "zod";
import { MediaType } from "../constants/enums";

const postMediaSchema = z.object({
  url: z.string().url("媒体URL格式不正确"),
  type: z.nativeEnum(MediaType),
  order: z.number().int().min(0),
});

export const createPostSchema = z.object({
  title: z.string().max(100, "标题不超过100个字符").optional(),
  content: z.string().min(1, "内容不能为空").max(5000, "内容不超过5000个字符"),
  media: z.array(postMediaSchema).default([]),
  tagIds: z.array(z.string()).default([]),
});
export type CreatePostInput = z.infer<typeof createPostSchema>;
```

- [ ] **Step 5: 实现评论校验**

`packages/shared/src/validators/comment.ts`:

```typescript
import { z } from "zod";

export const createCommentSchema = z
  .object({
    recipeId: z.string().min(1).optional(),
    postId: z.string().min(1).optional(),
    parentId: z.string().min(1).optional(),
    content: z
      .string()
      .min(1, "评论内容不能为空")
      .max(500, "评论不超过500个字符"),
  })
  .refine(
    (data) =>
      (data.recipeId && !data.postId) || (!data.recipeId && data.postId),
    { message: "必须指定且仅指定 recipeId 或 postId 中的一个" },
  );
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
```

- [ ] **Step 6: 运行测试确认通过**

```bash
cd /Users/dengxiang/selfProject/my-monorepo/packages/shared
pnpm vitest run tests/validators/post.test.ts tests/validators/comment.test.ts
```

Expected: PASS（10 tests）

- [ ] **Step 7: 提交**

```bash
git add packages/shared/src/validators/post.ts packages/shared/src/validators/comment.ts packages/shared/tests/validators/
git commit -m "feat(shared): add post and comment validators"
```

---

## Task 11: 实现 shared/validators — 导出 + shared/utils

**Files:**

- Create: `packages/shared/src/validators/index.ts`
- Create: `packages/shared/src/utils/format.ts`
- Create: `packages/shared/src/utils/index.ts`
- Create: `packages/shared/tests/utils/format.test.ts`

- [ ] **Step 1: 创建 validators/index.ts**

`packages/shared/src/validators/index.ts`:

```typescript
export * from "./common";
export * from "./auth";
export * from "./user";
export * from "./recipe";
export * from "./post";
export * from "./comment";
```

- [ ] **Step 2: 编写工具函数失败测试**

`packages/shared/tests/utils/format.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { truncateText, formatCount } from "../../src/utils/format";

describe("truncateText", () => {
  it("should return text as-is if shorter than limit", () => {
    expect(truncateText("hello", 10)).toBe("hello");
  });

  it("should truncate and add ellipsis", () => {
    expect(truncateText("hello world", 5)).toBe("hello...");
  });

  it("should handle empty string", () => {
    expect(truncateText("", 10)).toBe("");
  });
});

describe("formatCount", () => {
  it("should return number as-is if < 10000", () => {
    expect(formatCount(999)).toBe("999");
  });

  it("should format as 万 if >= 10000", () => {
    expect(formatCount(12345)).toBe("1.2万");
  });

  it("should format large numbers", () => {
    expect(formatCount(100000)).toBe("10万");
  });

  it("should handle zero", () => {
    expect(formatCount(0)).toBe("0");
  });
});
```

- [ ] **Step 3: 运行测试确认失败**

```bash
cd /Users/dengxiang/selfProject/my-monorepo/packages/shared
pnpm vitest run tests/utils/format.test.ts
```

Expected: FAIL

- [ ] **Step 4: 实现工具函数**

`packages/shared/src/utils/format.ts`:

```typescript
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function formatCount(count: number): string {
  if (count < 10000) return String(count);
  const wan = count / 10000;
  return wan % 1 === 0 ? `${wan}万` : `${wan.toFixed(1)}万`;
}
```

`packages/shared/src/utils/index.ts`:

```typescript
export * from "./format";
```

- [ ] **Step 5: 运行测试确认通过**

```bash
cd /Users/dengxiang/selfProject/my-monorepo/packages/shared
pnpm vitest run tests/utils/format.test.ts
```

Expected: PASS（7 tests）

- [ ] **Step 6: 运行全部 shared 测试**

```bash
cd /Users/dengxiang/selfProject/my-monorepo/packages/shared
pnpm vitest run
```

Expected: PASS（所有测试）

- [ ] **Step 7: 类型检查**

```bash
cd /Users/dengxiang/selfProject/my-monorepo/packages/shared
pnpm check-types
```

Expected: 无错误

- [ ] **Step 8: 提交**

```bash
git add packages/shared/
git commit -m "feat(shared): complete validators index and utils"
```

---

## Task 12: 创建 packages/db 包骨架

**Files:**

- Create: `packages/db/package.json`
- Create: `packages/db/tsconfig.json`

- [ ] **Step 1: 创建 package.json**

`packages/db/package.json`:

```json
{
  "name": "@repo/db",
  "version": "0.0.0",
  "private": true,
  "exports": {
    ".": "./src/index.ts",
    "./client": "./src/client.ts",
    "./redis": "./src/redis.ts"
  },
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "lint": "eslint . --max-warnings 0",
    "check-types": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@prisma/client": "^6.9.0",
    "ioredis": "^5.6.1"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@types/node": "^22.15.3",
    "eslint": "^9.39.1",
    "prisma": "^6.9.0",
    "typescript": "workspace:*",
    "vitest": "^3.2.1"
  }
}
```

- [ ] **Step 2: 创建 tsconfig.json**

`packages/db/tsconfig.json`:

```json
{
  "extends": "@repo/typescript-config/library.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 3: 创建 vitest.config.ts**

`packages/db/vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
});
```

- [ ] **Step 4: 安装依赖**

```bash
cd /Users/dengxiang/selfProject/my-monorepo
pnpm install
```

- [ ] **Step 5: 提交**

```bash
git add packages/db/package.json packages/db/tsconfig.json packages/db/vitest.config.ts pnpm-lock.yaml
git commit -m "chore: scaffold packages/db with prisma and ioredis"
```

---

## Task 13: 创建 Prisma Schema

**Files:**

- Create: `packages/db/prisma/schema.prisma`

- [ ] **Step 1: 创建完整的 Prisma schema**

`packages/db/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============ 用户体系 ============

model User {
  id            String     @id @default(cuid())
  phone         String?    @unique
  email         String?    @unique
  passwordHash  String
  nickname      String
  avatar        String?
  bio           String?
  role          UserRole   @default(USER)
  status        UserStatus @default(ACTIVE)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

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

  follower  User @relation("follower", fields: [followerId], references: [id])
  following User @relation("following", fields: [followingId], references: [id])

  @@unique([followerId, followingId])
  @@index([followingId])
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

  @@index([authorId])
  @@index([status])
  @@index([createdAt(sort: Desc)])
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

  recipe Recipe @relation(fields: [recipeId], references: [id], onDelete: Cascade)
}

model RecipeStep {
  id       String  @id @default(cuid())
  recipeId String
  content  String
  image    String?
  order    Int

  recipe Recipe @relation(fields: [recipeId], references: [id], onDelete: Cascade)
}

// ============ 内容：帖子 ============

model Post {
  id        String        @id @default(cuid())
  authorId  String
  title     String?
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

  @@index([authorId])
  @@index([status])
  @@index([createdAt(sort: Desc)])
}

model PostMedia {
  id     String    @id @default(cuid())
  postId String
  url    String
  type   MediaType
  order  Int

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
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

  contents TagsOnContent[]
}

model TagsOnContent {
  id       String  @id @default(cuid())
  tagId    String
  recipeId String?
  postId   String?

  tag    Tag     @relation(fields: [tagId], references: [id])
  recipe Recipe? @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  post   Post?   @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([tagId])
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

  author  User      @relation(fields: [authorId], references: [id])
  recipe  Recipe?   @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  post    Post?     @relation(fields: [postId], references: [id], onDelete: Cascade)
  parent  Comment?  @relation("replies", fields: [parentId], references: [id])
  replies Comment[] @relation("replies")

  @@index([recipeId])
  @@index([postId])
  @@index([parentId])
}

model Like {
  id        String   @id @default(cuid())
  userId    String
  recipeId  String?
  postId    String?
  createdAt DateTime @default(now())

  user   User    @relation(fields: [userId], references: [id])
  recipe Recipe? @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  post   Post?   @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model Favorite {
  id        String   @id @default(cuid())
  userId    String
  recipeId  String?
  postId    String?
  createdAt DateTime @default(now())

  user   User    @relation(fields: [userId], references: [id])
  recipe Recipe? @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  post   Post?   @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([userId])
}

// ============ 私信 ============

model Message {
  id         String   @id @default(cuid())
  senderId   String
  receiverId String
  content    String
  isRead     Boolean  @default(false)
  createdAt  DateTime @default(now())

  sender   User @relation("sender", fields: [senderId], references: [id])
  receiver User @relation("receiver", fields: [receiverId], references: [id])

  @@index([senderId, receiverId])
  @@index([receiverId, senderId])
}

// ============ 通知 ============

model Notification {
  id         String           @id @default(cuid())
  userId     String
  type       NotificationType
  title      String
  content    String?
  sourceType String?
  sourceId   String?
  isRead     Boolean          @default(false)
  createdAt  DateTime         @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId, isRead])
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

  reporter User @relation(fields: [reporterId], references: [id])

  @@index([status])
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

- [ ] **Step 2: 生成 Prisma client**

```bash
cd /Users/dengxiang/selfProject/my-monorepo/packages/db
pnpm db:generate
```

Expected: 成功生成 Prisma client

- [ ] **Step 3: 提交**

```bash
git add packages/db/prisma/
git commit -m "feat(db): add complete Prisma schema with all models and indexes"
```

---

## Task 14: 实现 Prisma client 单例和 Redis client

**Files:**

- Create: `packages/db/src/client.ts`
- Create: `packages/db/src/redis.ts`
- Create: `packages/db/src/index.ts`
- Create: `packages/db/tests/client.test.ts`
- Create: `packages/db/tests/redis.test.ts`

- [ ] **Step 1: 编写 Prisma client 单例测试**

`packages/db/tests/client.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { prisma } from "../src/client";

describe("prisma client", () => {
  it("should export a PrismaClient instance", () => {
    expect(prisma).toBeDefined();
    expect(typeof prisma.$connect).toBe("function");
    expect(typeof prisma.$disconnect).toBe("function");
  });

  it("should return the same instance (singleton)", async () => {
    const { prisma: prisma2 } = await import("../src/client");
    expect(prisma).toBe(prisma2);
  });
});
```

- [ ] **Step 2: 编写 Redis client 测试**

`packages/db/tests/redis.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { createRedisClient } from "../src/redis";

describe("createRedisClient", () => {
  it("should create a Redis instance", () => {
    const client = createRedisClient();
    expect(client).toBeDefined();
    expect(typeof client.get).toBe("function");
    expect(typeof client.set).toBe("function");
    client.disconnect();
  });

  it("should create a Redis instance with custom options", () => {
    const client = createRedisClient({ db: 1 });
    expect(client).toBeDefined();
    expect(typeof client.get).toBe("function");
    client.disconnect();
  });
});
```

- [ ] **Step 3: 运行测试确认失败**

```bash
cd /Users/dengxiang/selfProject/my-monorepo/packages/db
pnpm vitest run
```

Expected: FAIL

- [ ] **Step 4: 实现 Prisma client 单例**

`packages/db/src/client.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 5: 实现 Redis client**

`packages/db/src/redis.ts`:

```typescript
import Redis, { type RedisOptions } from "ioredis";

const defaultOptions: RedisOptions = {
  host: process.env.REDIS_HOST ?? "127.0.0.1",
  port: Number(process.env.REDIS_PORT ?? 6379),
  password: process.env.REDIS_PASSWORD ?? undefined,
  db: Number(process.env.REDIS_DB ?? 0),
  maxRetriesPerRequest: 3,
  lazyConnect: true,
};

export function createRedisClient(options?: Partial<RedisOptions>): Redis {
  return new Redis({ ...defaultOptions, ...options });
}

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
```

- [ ] **Step 6: 创建 index.ts**

`packages/db/src/index.ts`:

```typescript
export { prisma } from "./client";
export { redis, createRedisClient } from "./redis";
```

- [ ] **Step 7: 运行测试确认通过**

```bash
cd /Users/dengxiang/selfProject/my-monorepo/packages/db
pnpm vitest run
```

Expected: PASS（4 tests）

- [ ] **Step 8: 提交**

```bash
git add packages/db/src/ packages/db/tests/
git commit -m "feat(db): implement Prisma singleton and Redis client"
```

---

## Task 15: 添加自定义迁移（CHECK 约束和部分索引）

**Files:**

- Create: `packages/db/prisma/migrations/00000000000000_add_constraints/migration.sql`

注意：此 SQL 文件为参考文档，不会被 Prisma 迁移系统自动识别。使用方式：在有数据库环境后，首次运行 `prisma migrate dev` 生成初始迁移文件，然后将这些 SQL 语句追加到生成的 `migration.sql` 文件末尾，再重新运行迁移。

- [ ] **Step 1: 创建约束 SQL 参考文件**

`packages/db/prisma/custom_constraints.sql`:

```sql
-- ============================================================
-- 多态关联 CHECK 约束（recipeId/postId 二选一）
-- 在首次 prisma migrate 后手动执行或添加到迁移文件中
-- ============================================================

-- TagsOnContent: 必须关联 recipe 或 post，不能同时为空或同时非空
ALTER TABLE "TagsOnContent" ADD CONSTRAINT "tagoncontent_target_check"
  CHECK (("recipeId" IS NOT NULL AND "postId" IS NULL) OR ("recipeId" IS NULL AND "postId" IS NOT NULL));

-- Comment: 必须关联 recipe 或 post
ALTER TABLE "Comment" ADD CONSTRAINT "comment_target_check"
  CHECK (("recipeId" IS NOT NULL AND "postId" IS NULL) OR ("recipeId" IS NULL AND "postId" IS NOT NULL));

-- Like: 必须关联 recipe 或 post
ALTER TABLE "Like" ADD CONSTRAINT "like_target_check"
  CHECK (("recipeId" IS NOT NULL AND "postId" IS NULL) OR ("recipeId" IS NULL AND "postId" IS NOT NULL));

-- Favorite: 必须关联 recipe 或 post
ALTER TABLE "Favorite" ADD CONSTRAINT "favorite_target_check"
  CHECK (("recipeId" IS NOT NULL AND "postId" IS NULL) OR ("recipeId" IS NULL AND "postId" IS NOT NULL));

-- ============================================================
-- 部分唯一索引（替代 Prisma 的 @@unique，正确处理 NULL）
-- ============================================================

-- TagsOnContent
CREATE UNIQUE INDEX "tagoncontent_tag_recipe" ON "TagsOnContent"("tagId", "recipeId") WHERE "recipeId" IS NOT NULL;
CREATE UNIQUE INDEX "tagoncontent_tag_post" ON "TagsOnContent"("tagId", "postId") WHERE "postId" IS NOT NULL;

-- Like
CREATE UNIQUE INDEX "like_user_recipe" ON "Like"("userId", "recipeId") WHERE "recipeId" IS NOT NULL;
CREATE UNIQUE INDEX "like_user_post" ON "Like"("userId", "postId") WHERE "postId" IS NOT NULL;
CREATE INDEX "like_recipe_idx" ON "Like"("recipeId") WHERE "recipeId" IS NOT NULL;
CREATE INDEX "like_post_idx" ON "Like"("postId") WHERE "postId" IS NOT NULL;

-- Favorite
CREATE UNIQUE INDEX "fav_user_recipe" ON "Favorite"("userId", "recipeId") WHERE "recipeId" IS NOT NULL;
CREATE UNIQUE INDEX "fav_user_post" ON "Favorite"("userId", "postId") WHERE "postId" IS NOT NULL;
CREATE INDEX "fav_recipe_idx" ON "Favorite"("recipeId") WHERE "recipeId" IS NOT NULL;
CREATE INDEX "fav_post_idx" ON "Favorite"("postId") WHERE "postId" IS NOT NULL;
```

- [ ] **Step 2: 提交**

```bash
git add packages/db/prisma/custom_constraints.sql
git commit -m "feat(db): add CHECK constraints and partial indexes SQL"
```

---

## Task 16: 创建 .env.example 和环境变量文档

**Files:**

- Create: `packages/db/.env.example`
- Modify: `.gitignore` (确保 .env 被忽略)

- [ ] **Step 1: 创建 .env.example**

`packages/db/.env.example`:

```env
# PostgreSQL 连接字符串
DATABASE_URL="postgresql://user:password@localhost:5432/food_community?schema=public"

# Redis 配置
REDIS_HOST="127.0.0.1"
REDIS_PORT=6379
REDIS_PASSWORD=""
REDIS_DB=0
```

- [ ] **Step 2: 确认 .gitignore 包含 .env**

检查根目录 `.gitignore` 是否已包含 `.env*` 相关规则。如果没有，添加：

```
.env
.env.local
.env*.local
```

- [ ] **Step 3: 提交**

```bash
git add packages/db/.env.example .gitignore
git commit -m "chore(db): add .env.example for database configuration"
```

---

## Task 17: 全量验证

**Files:** 无新文件

- [ ] **Step 1: 安装所有依赖**

```bash
cd /Users/dengxiang/selfProject/my-monorepo
pnpm install
```

- [ ] **Step 2: 运行全量 lint**

```bash
pnpm lint
```

Expected: 无错误

- [ ] **Step 3: 运行全量类型检查**

```bash
pnpm check-types
```

Expected: 无错误

- [ ] **Step 4: 运行全量测试**

```bash
pnpm test
```

Expected: 所有 shared 和 db 测试通过

- [ ] **Step 5: 确认构建**

```bash
pnpm build
```

Expected: 构建成功

- [ ] **Step 6: 完成确认**

Phase 1 基础设施层完成。`packages/shared` 和 `packages/db` 可以被后续的 API 层和各端应用引用。
