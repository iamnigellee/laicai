# laicai — AI 财务助手

## Problem Statement

中小企业的财务工作充斥着重复劳动：手工录凭证、逐笔对银行流水、翻税法查政策、拼 Excel 做报表。现有财务软件（金蝶、用友）功能强大但操作复杂、价格高昂，学习成本劝退非专业用户。企业要么花大价钱请专职会计做这些机械性工作，要么老板自己硬着头皮用 Excel 凑合。AI 大模型已经具备理解自然语言、处理结构化数据的能力，但没有人把它做成一个真正帮财务人员干活的工具。

## Evidence

- 中国中小企业 4800 万家，大量仍在用 Excel 或手工账本
- 金蝶/用友面向中大企业，中小企业版功能阉割但价格不低（年费数千元起）
- 企业微信月活超 1.8 亿，中小企业日常沟通已在企微上，但财务工作还是另开软件
- DeepSeek / 通义千问等国内大模型 API 成本已降至可商用水平
- Assumption — 需要通过种子用户访谈验证：企业主/会计是否愿意通过聊天方式处理财务

## Proposed Solution

laicai 是一个通过企业微信 Bot + Web 端帮中小企业做财务的 AI 助手。核心理念：**不是让用户学一个系统，而是 AI 直接帮用户把活干了。** 拍张发票照片，AI 识别入账；说一句"付了3000办公用品"，AI 生成凭证；问一句"上月利润多少"，AI 从数据里算出来告诉你。Web 端提供报表查看、审核确认等需要可视化的场景。AI 不是装饰，是干活的主力。

## Key Hypothesis

We believe 把 AI 大模型能力嵌入企业微信，让财务操作变成"说句话就办了"，will 大幅降低中小企业的财务管理门槛 for 没有专职会计的小企业和需要减轻重复劳动的会计人员。
We'll know we're right when 种子用户的月均记账操作中 >60% 通过企微 Bot 完成，且凭证准确率 >90%。

## What We're NOT Building

- 完整 ERP 系统 — laicai 是财务助手，不是进销存/HR/CRM 全家桶
- 银行直连/自动支付 — v1 不碰资金流，只做信息流（导入流水，不操作支付）
- 自研大模型 — 调用国内现成 API，不自己训模型
- 审计事务所级工具 — 面向企业内部财务，不做外部审计
- 移动端 App — 企业微信 Bot 就是移动端入口，不再做独立 App

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| 企微 Bot 记账准确率 | >90% 凭证科目正确 | 人工审核抽样 |
| 发票识别准确率 | >90% 关键字段正确 | OCR 结果 vs 人工比对 |
| 用户活跃度 | 种子用户周均 >5 次 Bot 交互 | 对话日志统计 |
| 银行对账匹配率 | >80% 自动匹配 | 匹配结果 vs 人工确认 |
| 报表查询响应时间 | <3 秒 | API 延迟监控 |

## Open Questions

- [ ] 企业微信 Bot 是否需要企业微信服务商资质？注册流程和审核周期？
- [ ] 发票 OCR 用国内现成 API（百度/腾讯 OCR）还是用大模型多模态能力？
- [ ] 科目表初始化：用国家标准科目模板，还是让 AI 根据企业类型推荐？
- [ ] 数据迁移：用户从 Excel/金蝶迁移历史数据的路径？
- [ ] 定价模型：免费试用 + 按月订阅？按使用量计费？

---

## Users & Context

**Primary User**
- **Who**: 10-50 人小企业的老板或兼职会计（不是专业财务背景），或 50-200 人企业的全职会计
- **Current behavior**: 用 Excel 记流水账，月底手工汇总；或用金蝶/用友但觉得太复杂，很多功能用不上
- **Trigger**: 月底要做账/报税、收到发票需要入账、老板问"这个月赚了多少"、银行对账单来了要核对
- **Success state**: 日常财务操作在企微里说几句话就搞定，月底报表自动生成，税务数据准备好直接报

**Job to Be Done**
When 收到一张发票或产生一笔收支, I want to 用最简单的方式记录并归类, so I can 月底不用加班对账，随时知道公司财务状况。

**Non-Users**
- 大企业（500+ 人）— 他们有专业财务团队和成熟 ERP
- 纯个人记账用户 — 用随手记就够了
- 需要审计合规报告的上市公司 — 监管要求超出 laicai 范围

---

## Solution Detail

### Core Capabilities (MoSCoW)

| Priority | Capability | Rationale |
|----------|------------|-----------|
| Must | 企微 Bot 自然语言记账 | 核心价值：说句话就记账 |
| Must | 发票拍照 OCR + 自动入账 | 最高频的痛点场景 |
| Must | 科目表管理 + 凭证查看 | 基础财务数据结构 |
| Must | 多租户隔离 | SaaS 必需，数据安全底线 |
| Must | Web 端凭证审核 + 报表查看 | Bot 不适合复杂可视化 |
| Should | 银行流水导入 + AI 对账 | 月底对账是第二大痛点 |
| Should | 三大财务报表自动生成 | 月底出报表是刚需 |
| Should | 自然语言查询财务数据 | "上月营收多少"直接答 |
| Could | 应收应付管理 + 到期提醒 | 有用但不是 MVP 必需 |
| Could | 税务计算 + 申报数据准备 | 后期增值 |
| Could | 财务分析 + 异常预警 | 进阶功能 |
| Won't | 银行直连支付 | v1 不碰资金流 |
| Won't | 进销存/库存管理 | 不做 ERP |
| Won't | 多币种/跨境业务 | 聚焦国内中小企业 |

### MVP Scope

最小可用版本 = **企微 Bot 记账 + 发票 OCR + Web 端查看审核 + 多租户**。用户能通过企微发消息记账、拍发票自动入账、Web 端看凭证和简单报表。验证核心假设：用户是否愿意用聊天方式做财务。

### User Flow

```
用户在企微发 "付了3000办公用品"
  → AI 解析：借 管理费用-办公费 3000 / 贷 银行存款 3000
  → Bot 回复确认卡片（科目、金额、日期）
  → 用户点"确认" → 凭证入库
  → 或点"修改" → 多轮对话调整

用户拍发票照片发到企微
  → OCR 提取：供应商、金额、税额、日期
  → AI 推荐科目分类
  → Bot 回复凭证预览
  → 用户确认 → 入账 + 发票归档

用户问 "上个月利润多少"
  → AI 从凭证数据实时计算
  → Bot 回复数字 + 简要分析
  → 用户可追问 "跟上上个月比呢"
```

---

## Technical Approach

**Feasibility**: HIGH

基于 OpenClaw 已验证的插件化架构模式，技术栈成熟（TypeScript + PostgreSQL + 国内大模型 API），无需突破性技术创新。

**Architecture Notes**
- TypeScript pnpm monorepo，借鉴 OpenClaw 的 Extension-Agnostic Core + Plugin SDK 模式
- PostgreSQL + pgvector + RLS 多租户隔离
- 国内大模型 API（DeepSeek / 通义千问）做意图理解和凭证生成
- 企业微信 SDK 做 Bot 消息收发
- 模块化单体起步，按需拆分

**Technical Risks**

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| AI 记账科目分类不准 | M | 提供确认机制 + 从用户修正中学习；先用预设科目模板降低自由度 |
| 企业微信 API 限制/审核 | M | 早期申请服务商资质；准备降级方案（Web 端为主） |
| 大模型 API 延迟/成本 | L | 模型路由按复杂度分级；简单分类用轻量模型；缓存高频 prompt |
| 财务数据准确性要求极高 | H | 所有 AI 生成的凭证必须人工确认；双重校验金额；审计日志 |
| 多租户数据泄露 | L | PostgreSQL RLS 数据库层隔离；全链路 tenant_id 校验；安全审计 |

---

## Implementation Phases

| # | Phase | Description | Status | Parallel | Depends | PRP Plan |
|---|-------|-------------|--------|----------|---------|----------|
| 1 | 项目脚手架 | Monorepo 初始化、数据库、Docker 环境、CI | pending | - | - | - |
| 2 | 核心框架 | DI 容器、Result 类型、Event Bus、Plugin SDK | pending | - | 1 | - |
| 3 | 多租户基础 | 认证、RLS、RBAC、Gateway | pending | - | 2 | - |
| 4 | 智能记账 Skill | 自然语言 → 凭证，科目管理 | pending | with 5 | 3 | - |
| 5 | AI 引擎 | 模型路由、Prompt 管理、对话上下文 | pending | with 4 | 3 | - |
| 6 | 企微 Bot | 企业微信 Extension，消息收发、回调 | pending | - | 4, 5 | - |
| 7 | 发票 OCR Skill | 拍照识别、自动入账 | pending | with 8 | 6 | - |
| 8 | Web 端 MVP | 凭证列表、审核、基础报表 | pending | with 7 | 3 | - |
| 9 | 银行对账 Skill | 流水导入、AI 匹配、余额调节 | pending | - | 4, 8 | - |
| 10 | 报表与查询 | 三大报表、自然语言查询 | pending | - | 9 | - |

### Phase Details

**Phase 1: 项目脚手架**
- **Goal**: 开发环境 ready，团队能立刻开始写业务代码
- **Scope**: pnpm workspace、tsconfig、Docker Compose（PG + Redis + MinIO）、GitHub Actions CI、ESLint/Prettier
- **Success signal**: `pnpm dev` 启动本地环境，数据库迁移可运行

**Phase 2: 核心框架**
- **Goal**: 建立 OpenClaw 风格的基础设施
- **Scope**: DI 容器（createDefaultDeps）、Result<T,E> 类型、Event Bus、Plugin SDK barrel exports
- **Success signal**: 能注册一个 hello-world Skill 并通过 SDK 调用

**Phase 3: 多租户基础**
- **Goal**: 任何后续功能自动具备多租户能力
- **Scope**: JWT 认证、PostgreSQL RLS 策略、RBAC（admin/accountant/viewer）、Gateway 路由 + 限流
- **Success signal**: 两个租户的数据完全隔离，API 请求自动过滤 tenant_id

**Phase 4: 智能记账 Skill**
- **Goal**: 核心价值验证 — 说句话就能记账
- **Scope**: 科目表 CRUD、自然语言 → 会计分录、凭证确认/修改流程
- **Success signal**: "付了3000办公用品" → 正确生成借贷凭证

**Phase 5: AI 引擎**
- **Goal**: 为所有 Skill 提供统一的 AI 调用能力
- **Scope**: 模型路由（DeepSeek/通义）、Prompt 模板管理、对话上下文管理、token 用量追踪
- **Success signal**: Skill 通过统一接口调用 AI，自动选择合适模型

**Phase 6: 企微 Bot**
- **Goal**: 用户通过企业微信使用 laicai
- **Scope**: 企业微信 SDK 集成、消息收发、回调验证、确认卡片交互
- **Success signal**: 企微发消息 → Bot 回复凭证确认卡片 → 用户确认入账

**Phase 7: 发票 OCR Skill**
- **Goal**: 拍照就能入账
- **Scope**: 发票图片 OCR（调用百度/腾讯 OCR API 或大模型多模态）、关键字段提取、科目推荐、待审凭证生成
- **Success signal**: 拍一张增值税发票 → 自动提取金额/税额/供应商 → 生成凭证

**Phase 8: Web 端 MVP**
- **Goal**: 提供 Bot 无法胜任的可视化操作
- **Scope**: React + Vite、凭证列表/详情、批量审核、科目表管理、基础仪表盘
- **Success signal**: 会计能在 Web 端查看和审核所有 AI 生成的凭证

**Phase 9: 银行对账 Skill**
- **Goal**: 解决月底对账痛点
- **Scope**: CSV 银行流水导入、AI 智能匹配已有凭证、差异标记、余额调节表
- **Success signal**: 导入银行流水后 >80% 自动匹配到凭证

**Phase 10: 报表与查询**
- **Goal**: 让用户随时了解公司财务状况
- **Scope**: 利润表/资产负债表/现金流量表自动生成、自然语言查询（"上月营收多少"）
- **Success signal**: 问 Bot "上月利润" → 3 秒内返回准确数字 + 简要分析

### Parallelism Notes

Phase 4（记账 Skill）和 Phase 5（AI 引擎）可以并行，因为 Skill 可以先 mock AI 接口开发业务逻辑，AI 引擎可以独立构建模型路由。Phase 7（发票 OCR）和 Phase 8（Web 端）可以并行，因为它们依赖不同的底层模块。

---

## Decisions Log

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| 技术栈 | TypeScript + Node.js | Python + FastAPI | 沿用 OpenClaw 模式，前后端统一语言 |
| 架构 | 模块化单体 → 渐进拆分 | 微服务 / 纯单体 | 0→1 阶段平衡开发速度和可扩展性 |
| 数据库 | PostgreSQL + pgvector | MySQL + 独立向量库 | RLS 多租户、内置向量搜索、生态成熟 |
| AI 模型 | 国内大模型 API | 海外 API / 自部署 | 合规、低延迟、成本可控 |
| 移动端 | 企微 Bot（不做独立 App） | React Native App | 用户已在企微，零安装成本 |
| 发票 OCR | 先用第三方 OCR API | 自建 OCR | 快速验证，不造轮子 |
| 多租户隔离 | PostgreSQL RLS | Schema 隔离 / 独立数据库 | 运维简单，性能足够 |

---

## Research Summary

**Market Context**
- 中国中小企业财务软件市场被金蝶/用友主导，但产品偏重大中企业，中小企业使用门槛高
- AI 记账赛道在国内尚处早期，票易通等工具聚焦发票管理，尚无将大模型深度整合到全链路财务的产品
- 海外 Vic.ai / Truewind 等验证了 AI 财务助手的 PMF，但国内市场特性不同（增值税发票、中国会计准则、企微生态）
- 企业微信是中小企业首选的沟通工具，Bot 生态已有基础设施

**Technical Context**
- OpenClaw 架构已验证了 Plugin SDK + Extension 模式在多渠道 AI Agent 场景的可行性
- PostgreSQL RLS 是经过验证的多租户方案，pgvector 免去独立向量数据库的运维成本
- 国内大模型 API（DeepSeek-V3、通义 qwen-max）在结构化信息提取和自然语言理解上表现已达商用水平
- 企业微信 SDK 成熟，Bot 开发文档完善

---

*Generated: 2026-04-07*
*Status: DRAFT - needs validation*
*Design Spec: docs/superpowers/specs/2026-04-07-laicai-design.md*
