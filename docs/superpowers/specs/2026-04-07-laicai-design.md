# laicai — AI Native 财务应用设计文档

## 1. 产品定位

laicai 是一款面向 **中小企业** 和 **专业财务人员** 的 AI Native 财务应用。通过企业微信 Bot + Web 端双入口，提供智能记账、发票识别、应收应付管理、银行对账、财务报表、税务合规和财务分析等全链路财务能力。

### 1.1 目标用户

| 角色 | 核心诉求 |
|------|---------|
| 中小企业主 | 低成本、高效率完成日常财务工作，减少对专职会计的依赖 |
| 企业会计 | 自动化重复工作（记账、对账），腾出时间做分析和决策 |
| 专业财务人员 | 审计辅助、税务筹划、合规检查，AI 作为专业助手 |

### 1.2 AI 角色模式

AI 在不同场景切换三种模式：

- **自动化引擎** — 记账、发票识别、银行对账等重复性工作，AI 主导执行，用户审核
- **副驾驶** — 应收应付、税务合规等需要人工判断的场景，AI 辅助建议
- **对话式顾问** — 报表查询、财务分析等，用自然语言与财务数据交互

### 1.3 产品形态

- **企业微信 Bot** — 对话式交互，随时随地处理财务事务
- **Web 端** — React 管理后台，可视化仪表盘、报表、配置

## 2. 技术架构

### 2.1 架构策略

**模块化单体 → 渐进拆分**：先用模块化单体快速上线（Phase 1），保持清晰模块边界。当某个模块成为性能瓶颈时（如 AI 推理、报表生成），将其拆为独立服务。

### 2.2 技术栈

| 层次 | 技术选型 | 说明 |
|------|---------|------|
| 语言 | TypeScript | 全栈统一，沿用 OpenClaw 模式 |
| 运行时 | Node.js | pnpm monorepo |
| 后端框架 | Hono / Express | 轻量高性能，OpenClaw 同款 |
| 前端 | React + Vite | Web 管理端 |
| 数据库 | PostgreSQL + pgvector | 业务数据 + 向量检索，RLS 多租户隔离 |
| 缓存 | Redis | 会话状态、热数据缓存 |
| 对象存储 | 阿里云 OSS / MinIO | 发票附件、导入文件 |
| AI 模型 | DeepSeek / 通义千问 / 文心一言 | 国内大模型 API，按任务路由 |
| 企业微信 | 企业微信 SDK | Bot 消息收发、回调 |
| 部署 | Docker + 云服务器 | 纯云端 SaaS |

### 2.3 系统分层

```
┌─────────────────────────────────────────────────────┐
│  入口层：企业微信 Bot Extension  |  Web 端 (React)    │
├─────────────────────────────────────────────────────┤
│  Gateway：认证 / 租户路由 / WebSocket / 限流          │
├─────────────────────────────────────────────────────┤
│  Agent Core：对话管理 / 意图识别 / 上下文引擎          │
├─────────────────────────────────────────────────────┤
│  Financial Skills（插件化）                           │
│  记账 | 发票 | 应收应付 | 对账 | 报表 | 税务 | 分析    │
├─────────────────────────────────────────────────────┤
│  多租户层：RLS 隔离 / RBAC / 用量计费 / 租户配置       │
├─────────────────────────────────────────────────────┤
│  存储层：PostgreSQL | Redis | OSS | 国内大模型 API     │
└─────────────────────────────────────────────────────┘
```

### 2.4 核心设计模式（沿用 OpenClaw）

- **Extension-Agnostic Core** — 核心代码不直接导入渠道插件，通过 Plugin SDK 接口通信
- **依赖注入** — `createDefaultDeps()` 模式，便于测试和替换
- **Result<T, E>** — 封闭式错误处理，不使用自由字符串错误
- **Event Bus** — Skills 间通过事件通信，不直接相互导入
- **Plugin SDK** — 每个 Skill 通过 SDK 注册 tool functions，AI 自动发现并调用

## 3. 数据模型

### 3.1 多租户隔离

所有业务表包含 `tenant_id` 字段，通过 PostgreSQL Row Level Security (RLS) 实现数据库层面的自动隔离：

```sql
-- 每次请求设置租户上下文
SET app.current_tenant = '<tenant_id>';

-- RLS 策略示例
CREATE POLICY tenant_isolation ON journal_entries
  USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

### 3.2 核心表结构

**租户与权限：**

| 表名 | 核心字段 | 说明 |
|------|---------|------|
| tenants | id, name, plan, settings (jsonb), status | 租户信息 |
| users | id, tenant_id, name, role, wechat_work_id, email | 用户，关联企业微信 |
| roles | id, name, permissions (jsonb) | admin / accountant / viewer |

**核心财务：**

| 表名 | 核心字段 | 说明 |
|------|---------|------|
| accounts | id, tenant_id, code, name, type, parent_id, level | 科目表（树形） |
| journal_entries | id, tenant_id, date, number, description, status, ai_generated | 记账凭证 |
| journal_lines | id, entry_id, account_id, debit, credit, memo | 借贷分录 |

**业务单据：**

| 表名 | 核心字段 | 说明 |
|------|---------|------|
| invoices | id, tenant_id, type, counterparty, amount, tax_amount, status, due_date, ocr_data | 应收/应付发票 |
| bank_transactions | id, tenant_id, bank_account, amount, date, matched_entry_id, match_confidence | 银行流水 |
| attachments | id, tenant_id, entity_type, entity_id, oss_key, file_type, ocr_text | 附件/发票图片 |

**AI 与对话：**

| 表名 | 核心字段 | 说明 |
|------|---------|------|
| conversations | id, tenant_id, user_id, channel, context (jsonb), status | 对话会话 |
| messages | id, conversation_id, role, content, tool_calls (jsonb), model_used, tokens_used | 消息记录 |
| knowledge_chunks | id, tenant_id, source, content, embedding (vector), category | RAG 知识块 |

## 4. AI 引擎

### 4.1 三层架构

**Layer 1 — 对话管理：**
- 意图识别：自然语言 → 路由到对应 Skill
- 上下文引擎：多轮对话状态、租户上下文注入、会话历史压缩
- 渠道适配：企业微信消息格式 ↔ 内部格式转换

**Layer 2 — AI Core：**
- 模型路由：按任务复杂度选择模型（简单分类 → DeepSeek-V3，复杂分析 → 通义 qwen-max，代码/公式 → DeepSeek-Coder）
- Prompt 管理：财务领域 system prompt 模板，租户可自定义覆盖，版本化管理
- Tool Calling：AI 通过 function calling 调用 Skills 注册的工具函数

**Layer 3 — RAG 知识库：**
- 公共知识：中国会计准则 (CAS)、税法法规、最新政策更新、行业财务指标基准
- 租户私有知识：企业内部财务制度、历史凭证模式学习、自定义科目说明
- 存储：pgvector 向量检索，embedding 通过国内模型生成

### 4.2 Financial Skills

8 个独立插件，每个包含 `index.ts` + `api.ts` + `*.test.ts`：

| Skill | AI 模式 | 核心能力 |
|-------|---------|---------|
| 智能记账 | 自动化引擎 | 自然语言 → 会计分录，自动匹配科目 |
| 发票识别 | 自动化引擎 | OCR 提取 → 匹配科目 → 生成待审凭证 |
| 应收应付 | 副驾驶 | 账龄分析、催收提醒、到期预警、坏账评估 |
| 银行对账 | 自动化引擎 | 导入流水 → AI 匹配凭证 → 余额调节表 |
| 报表生成 | 对话式顾问 | 三大报表、自然语言查询、趋势分析 |
| 税务合规 | 副驾驶 | 增值税/所得税计算、申报数据、合规扫描 |
| 财务分析 | 对话式顾问 | 比率分析、异常检测、现金流预测、经营建议 |
| AI 对话 | 对话式顾问 | 自由问答、操作指导、跨 Skill 编排、兜底 |

### 4.3 Skill 接口规范

```typescript
// 每个 Skill 实现 FinancialSkill 接口
interface FinancialSkill {
  name: string;
  description: string;
  requiredPermissions: Permission[];
  tools: ToolDefinition[];          // AI function calling 工具
  handleIntent(ctx: SkillContext): Promise<Result<SkillResponse, SkillError>>;
}

// 通过 Plugin SDK 注册
pluginSDK.registerSkill('accounting', accountingSkill);
```

## 5. Monorepo 目录结构

```
laicai/
├── package.json              # pnpm workspace root
├── pnpm-workspace.yaml
├── tsconfig.json
├── docker-compose.yml        # PG + Redis + MinIO 本地开发
│
├── packages/
│   ├── core/                 # 核心框架（DI, Result, Event Bus）
│   ├── gateway/              # API Gateway + WebSocket + 认证
│   ├── agent/                # AI 引擎（模型路由, Prompt, RAG）
│   ├── database/             # PostgreSQL + pgvector + 迁移
│   └── shared/               # 共享类型 + 工具函数
│
├── skills/                   # Financial Skills（插件化）
│   ├── accounting/           # 智能记账
│   ├── invoice/              # 发票识别
│   ├── receivable-payable/   # 应收应付
│   ├── bank-reconcile/       # 银行对账
│   ├── reporting/            # 报表生成
│   ├── tax-compliance/       # 税务合规
│   ├── analytics/            # 财务分析
│   └── chat/                 # AI 对话兜底
│
├── extensions/               # 渠道适配器
│   ├── wechat-work/          # 企业微信 Bot
│   └── web/                  # Web API 适配
│
├── apps/
│   └── web/                  # React + Vite 管理端
│
├── knowledge/                # RAG 知识源文件
│   ├── cas/                  # 中国会计准则
│   ├── tax-law/              # 税法法规
│   └── templates/            # 科目模板 / 报表模板
│
├── migrations/               # 数据库迁移文件
├── scripts/                  # 开发/部署脚本
└── docs/                     # 文档
```

## 6. 多租户与安全

### 6.1 租户隔离

- 数据库层：PostgreSQL RLS，所有查询自动过滤 tenant_id
- 应用层：Gateway 解析 JWT → 设置 `app.current_tenant`
- 存储层：OSS 按 `tenant_id/` 前缀组织文件

### 6.2 权限模型 (RBAC)

| 角色 | 权限 |
|------|------|
| admin | 全部操作 + 租户设置 + 用户管理 |
| accountant | 记账、发票、对账、报表、税务（读写） |
| viewer | 报表、分析（只读） |

### 6.3 安全要求

- JWT + Refresh Token 认证
- 企业微信 OAuth 单点登录
- 所有 API 请求经过 Gateway 限流
- 敏感数据（银行账号等）加密存储
- AI 对话内容按租户隔离，不跨租户泄露
- 操作审计日志

## 7. 用量计费

| 计费维度 | 说明 |
|---------|------|
| AI 调用次数 | 按 token 消耗计费 |
| 存储用量 | 附件、知识库存储 |
| 用户数 | 按活跃用户数阶梯定价 |
| 功能模块 | 基础版/专业版/企业版功能差异 |

## 8. 测试策略

- 每个 Skill 包含 `*.test.ts` 单元测试
- `packages/` 核心模块完整单元测试
- 集成测试：Skill 调用链路端到端验证
- E2E 测试：企业微信消息 → 凭证生成完整流程
- 测试框架：Vitest（沿用 OpenClaw）

## 9. 部署方案

- Docker Compose 本地开发
- 生产环境：Docker 容器部署到阿里云 ECS / 腾讯云 CVM
- PostgreSQL：阿里云 RDS / 腾讯云 TDSQL
- Redis：云托管 Redis
- OSS：阿里云 OSS
- CI/CD：GitHub Actions → Docker Build → 部署

## 10. 成功标准

- 用户通过企业微信发送 "付了3000元办公用品" 能在 5 秒内生成正确的会计分录
- 发票拍照上传后自动识别并生成待审凭证，准确率 > 90%
- 银行对账自动匹配率 > 80%
- 自然语言查询报表响应时间 < 3 秒
- 多租户数据完全隔离，零泄露
