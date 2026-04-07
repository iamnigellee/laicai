# CLAUDE.md — laicai 项目约定

## 项目概述

laicai 是面向中小企业和专业财务人员的 AI Native 财务助手。企业微信 Bot + Web 端双入口，AI 帮用户干实际的财务工作（记账、发票识别、对账、报表、税务）。

## 技术栈

- **语言**: TypeScript (全栈)
- **运行时**: Node.js, pnpm monorepo
- **后端**: Hono
- **前端**: React + Vite
- **数据库**: PostgreSQL + pgvector (RLS 多租户)
- **缓存**: Redis
- **AI**: 国内大模型 API (DeepSeek / 通义千问)
- **测试**: Vitest
- **渠道**: 企业微信 SDK

## 目录结构

```
packages/core/       — DI, Result<T,E>, Event Bus
packages/gateway/    — API Gateway, 认证, WebSocket
packages/agent/      — AI 引擎, 模型路由, Prompt, RAG
packages/database/   — PostgreSQL, 迁移, RLS
packages/shared/     — 共享类型, 工具函数
skills/              — Financial Skills (插件化)
extensions/          — 渠道适配器 (wechat-work, web)
apps/web/            — React 管理端
knowledge/           — RAG 知识源文件
migrations/          — 数据库迁移
```

## 架构原则

- **Extension-Agnostic Core**: 核心代码不直接导入渠道插件，通过 Plugin SDK 接口通信
- **依赖注入**: `createDefaultDeps()` 模式
- **Result<T, E>**: 封闭式错误处理，不用 throw + catch
- **Event Bus**: Skills 间通过事件通信，不直接相互导入
- **Plugin SDK**: Skill 通过 SDK 注册 tool functions，AI 自动发现调用

## 代码规范

- 文件保持在 ~500 LOC 以内，超过就拆分
- 每个 Skill 独立目录: `index.ts` + `api.ts` + `*.test.ts`
- 所有业务表必须有 `tenant_id` 字段
- 使用 RLS 做租户隔离，应用层不手动 WHERE tenant_id
- 测试与源文件同目录 (`foo.ts` 旁边放 `foo.test.ts`)
- 提交信息用英文，格式: `type: description` (feat/fix/docs/refactor/test)

## 多租户

- 每次请求通过 Gateway 设置 `SET app.current_tenant`
- PostgreSQL RLS 自动过滤
- OSS 文件按 `{tenant_id}/` 前缀隔离
- AI 对话上下文按租户隔离

## AI 集成

- 通过 `packages/agent/` 统一调用，不在 Skill 里直接调模型 API
- 模型路由: 简单任务 → 轻量模型，复杂分析 → 重量模型
- 所有 AI 生成内容必须有人工确认机制
- Token 用量追踪到每条消息

## 常用命令

```bash
pnpm dev              # 启动开发环境
pnpm test             # 运行测试
pnpm build            # 构建
pnpm db:migrate       # 数据库迁移
docker compose up -d  # 启动 PG + Redis + MinIO
```

## 关键文档

- 设计文档: `docs/superpowers/specs/2026-04-07-laicai-design.md`
- PRD: `.claude/PRPs/prds/laicai.prd.md`
