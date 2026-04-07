/**
 * 企业微信模板卡片 — 记账凭证确认
 *
 * 用于 AI 记账 Bot "laicai" 在企业微信中发送凭证确认卡片。
 * 基于企业微信 template_card 消息类型，card_type 为 button_interaction。
 *
 * 官方文档参考:
 *   https://developer.work.weixin.qq.com/document/path/96487
 *
 * 导出三个构建函数:
 *   - buildVoucherConfirmCard  — 单笔凭证确认卡片
 *   - buildVoucherModifiedCard — 修改后凭证卡片（高亮变更）
 *   - buildBatchVoucherCard    — 批量凭证确认卡片
 */

// ============================================================================
// 企业微信 template_card JSON 类型定义
// ============================================================================

/** 企业微信 template_card 消息顶层结构 */
export interface WechatTemplateCardMessage {
  /** 消息类型，固定为 "template_card" */
  msgtype: 'template_card';
  template_card: TemplateCard;
}

/** 模板卡片主体 */
export interface TemplateCard {
  /** 卡片类型: button_interaction 为按钮交互型 */
  card_type: 'button_interaction';
  /** 卡片来源，显示在卡片左上角 */
  source: CardSource;
  /** 主标题 */
  main_title: MainTitle;
  /** 关键数据区域（最多显示一组大字段） */
  emphasis_content?: EmphasisContent;
  /** 引用区域，用于显示引用文字 */
  quote_area?: QuoteArea;
  /** 二级标题+文本列表，用于展示多行结构化信息 */
  sub_title_text?: string;
  /** 水平内容区域，展示多列数据 */
  horizontal_content_list?: HorizontalContent[];
  /** 跳转指引区域 */
  jump_list?: JumpItem[];
  /** 整体卡片的跳转 url（点击卡片空白区域时跳转） */
  card_action: CardAction;
  /** 按钮列表 */
  button_list: ButtonItem[];
  /** 任务 ID，用于回调去重，每张卡片唯一 */
  task_id: string;
}

/** 卡片来源标识 */
export interface CardSource {
  /** 来源图标 URL */
  icon_url?: string;
  /** 来源名称，如 "laicai 智能记账" */
  desc: string;
  /** 来源描述颜色: 0 灰色(默认), 1 黑色, 2 红色, 3 绿色 */
  desc_color?: 0 | 1 | 2 | 3;
}

/** 主标题 */
export interface MainTitle {
  /** 标题文字 */
  title: string;
  /** 副标题文字 */
  desc?: string;
}

/** 关键数据（大字显示） */
export interface EmphasisContent {
  /** 关键数据标题 */
  title: string;
  /** 关键数据描述 */
  desc?: string;
}

/** 引用区域 */
export interface QuoteArea {
  /** 引用类型: 0 引用文本, 1 引用链接 */
  type?: 0 | 1;
  /** 引用来源的 URL */
  url?: string;
  /** 引用文字标题 */
  title?: string;
  /** 引用文字内容 */
  quote_text: string;
}

/** 水平内容（键值对列表） */
export interface HorizontalContent {
  /** 二级标题（键名） */
  keyname: string;
  /** 二级文本（键值） */
  value?: string;
  /** 值的类型: 0 普通文本(默认), 1 跳转URL, 2 下载附件 */
  type?: 0 | 1 | 2;
  /** 跳转链接(type=1 时) */
  url?: string;
}

/** 跳转指引 */
export interface JumpItem {
  /** 跳转类型: 0 不跳转, 1 跳转URL */
  type: 0 | 1;
  /** 跳转标题 */
  title: string;
  /** 跳转 URL */
  url?: string;
}

/** 卡片整体点击行为 */
export interface CardAction {
  /** 跳转类型: 1 跳转URL, 2 打开小程序 */
  type: 1 | 2;
  /** 跳转地址 */
  url: string;
  /** 小程序 appid（type=2 时必填） */
  appid?: string;
  /** 小程序 pagepath（type=2 时必填） */
  pagepath?: string;
}

/** 按钮 */
export interface ButtonItem {
  /** 按钮文字 */
  text: string;
  /** 按钮样式: 1 常规, 2 强调（蓝色）, 3 危险（红色） */
  style: 1 | 2 | 3;
  /** 按钮唯一标识，用于回调识别用户点击了哪个按钮 */
  key: string;
}

// ============================================================================
// 业务参数类型
// ============================================================================

/** AI 置信度等级 */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

/** 会计分录条目（一行借方或贷方） */
export interface JournalEntryLine {
  /** 科目名称，如 "管理费用 - 办公费" */
  accountName: string;
  /** 金额（正数），单位：元 */
  amount: number;
}

/** 单笔凭证确认卡片参数 */
export interface VoucherConfirmParams {
  /** 租户 ID，用于构建 Web 端跳转链接 */
  tenantId: string;
  /** 凭证编号，如 "2026-04-0012" */
  voucherNumber: string;
  /** 记账日期，如 "2026-04-07" */
  date: string;
  /** 摘要/备注 */
  description: string;
  /** 借方分录列表（可能有多条，如含税凭证拆分进项税） */
  debitEntries: JournalEntryLine[];
  /** 贷方分录列表 */
  creditEntries: JournalEntryLine[];
  /** AI 置信度 */
  confidence: ConfidenceLevel;
  /** 唯一任务 ID，用于回调去重 */
  taskId: string;
  /** Web 端凭证详情页基础 URL（可选） */
  webBaseUrl?: string;
}

/** 变更标记：哪些字段被修改了 */
export interface VoucherDiff {
  /** 日期是否变更 */
  dateChanged?: boolean;
  /** 摘要是否变更 */
  descriptionChanged?: boolean;
  /** 借方变更索引列表（从 0 开始） */
  debitChangedIndices?: number[];
  /** 贷方变更索引列表（从 0 开始） */
  creditChangedIndices?: number[];
}

/** 修改后凭证卡片参数 */
export interface VoucherModifiedParams extends VoucherConfirmParams {
  /** 变更标记 */
  diff: VoucherDiff;
}

/** 批量凭证中的单笔摘要 */
export interface BatchVoucherItem {
  /** 序号（从 1 开始） */
  index: number;
  /** 摘要描述 */
  description: string;
  /** 借方合计金额 */
  debitTotal: number;
  /** 贷方主科目名称（简要） */
  creditAccountName: string;
}

/** 批量凭证卡片参数 */
export interface BatchVoucherParams {
  /** 租户 ID */
  tenantId: string;
  /** 凭证列表 */
  vouchers: BatchVoucherItem[];
  /** 总金额 */
  totalAmount: number;
  /** AI 置信度（整体） */
  confidence: ConfidenceLevel;
  /** 唯一任务 ID */
  taskId: string;
  /** Web 端基础 URL（可选） */
  webBaseUrl?: string;
}

// ============================================================================
// 辅助函数
// ============================================================================

/** 格式化金额为中文会计格式: ¥1,234.56 */
function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** 置信度等级映射为中文标签 + 颜色 */
function confidenceLabel(level: ConfidenceLevel): {
  text: string;
  /** 企业微信 desc_color: 3=绿色(高), 0=灰色(中), 2=红色(低) */
  color: 0 | 2 | 3;
} {
  switch (level) {
    case 'high':
      return { text: 'AI 置信度: 高', color: 3 };
    case 'medium':
      return { text: 'AI 置信度: 中', color: 0 };
    case 'low':
      return { text: 'AI 置信度: 低', color: 2 };
  }
}

/**
 * 将分录列表格式化为可读文本
 * 例: "借: 管理费用 - 办公费 ¥3,000.00"
 */
function formatEntries(
  side: '借' | '贷',
  entries: JournalEntryLine[],
): string {
  return entries
    .map((e) => `${side}: ${e.accountName}  ${formatCurrency(e.amount)}`)
    .join('\n');
}

/**
 * 将分录列表格式化为可读文本（带变更高亮标记）
 * 被修改的行末尾追加 " [已修改]"
 */
function formatEntriesWithDiff(
  side: '借' | '贷',
  entries: JournalEntryLine[],
  changedIndices?: number[],
): string {
  const changed = new Set(changedIndices ?? []);
  return entries
    .map((e, i) => {
      const line = `${side}: ${e.accountName}  ${formatCurrency(e.amount)}`;
      return changed.has(i) ? `${line}  [已修改]` : line;
    })
    .join('\n');
}

/** 构建 Web 端凭证详情链接 */
function buildWebUrl(
  webBaseUrl: string | undefined,
  tenantId: string,
  voucherNumber: string,
): string {
  const base = webBaseUrl ?? 'https://app.laicai.com';
  return `${base}/t/${tenantId}/voucher/${encodeURIComponent(voucherNumber)}`;
}

// ============================================================================
// 构建函数
// ============================================================================

/**
 * 构建单笔凭证确认卡片
 *
 * 场景: 用户发送 "付了3000块买办公用品"，AI 解析后返回此卡片供确认。
 *
 * @param params - 凭证信息
 * @returns 企业微信 template_card 消息 JSON
 */
export function buildVoucherConfirmCard(
  params: VoucherConfirmParams,
): WechatTemplateCardMessage {
  const {
    tenantId,
    voucherNumber,
    date,
    description,
    debitEntries,
    creditEntries,
    confidence,
    taskId,
    webBaseUrl,
  } = params;

  const conf = confidenceLabel(confidence);
  const webUrl = buildWebUrl(webBaseUrl, tenantId, voucherNumber);

  // 拼接分录文本，显示在引用区域
  const entriesText = [
    formatEntries('借', debitEntries),
    formatEntries('贷', creditEntries),
  ].join('\n');

  return {
    msgtype: 'template_card',
    template_card: {
      card_type: 'button_interaction',
      source: {
        desc: 'laicai 智能记账',
        desc_color: 0,
      },
      main_title: {
        title: `记账凭证 #${voucherNumber}`,
        desc: conf.text,
      },
      /* 水平内容: 日期、摘要、AI 置信度 */
      horizontal_content_list: [
        {
          keyname: '日期',
          value: date,
        },
        {
          keyname: '摘要',
          value: description,
        },
        {
          keyname: '置信度',
          value: conf.text,
        },
      ],
      /* 引用区域: 借贷分录明细 */
      quote_area: {
        type: 0,
        title: '会计分录',
        quote_text: entriesText,
      },
      /* 跳转: Web 端查看详情 */
      jump_list: [
        {
          type: 1,
          title: '在 Web 端查看',
          url: webUrl,
        },
      ],
      /* 整体卡片点击跳转到 Web 端 */
      card_action: {
        type: 1,
        url: webUrl,
      },
      /* 三个操作按钮 */
      button_list: [
        {
          text: '确认入账',
          style: 2, // 强调（蓝色）
          key: `confirm:${taskId}`,
        },
        {
          text: '修改',
          style: 1, // 常规
          key: `modify:${taskId}`,
        },
        {
          text: '取消',
          style: 3, // 危险（红色）
          key: `cancel:${taskId}`,
        },
      ],
      task_id: taskId,
    },
  };
}

/**
 * 构建修改后凭证确认卡片
 *
 * 场景: 用户说 "改一下，是现金付的"，AI 修改贷方科目后返回此卡片。
 * 被修改的行会标注 "[已修改]"，以便用户一眼看出变更内容。
 *
 * @param params - 修改后凭证信息（含 diff 标记）
 * @returns 企业微信 template_card 消息 JSON
 */
export function buildVoucherModifiedCard(
  params: VoucherModifiedParams,
): WechatTemplateCardMessage {
  const {
    tenantId,
    voucherNumber,
    date,
    description,
    debitEntries,
    creditEntries,
    confidence,
    taskId,
    webBaseUrl,
    diff,
  } = params;

  const conf = confidenceLabel(confidence);
  const webUrl = buildWebUrl(webBaseUrl, tenantId, voucherNumber);

  // 拼接分录文本，变更行带 "[已修改]" 后缀
  const entriesText = [
    formatEntriesWithDiff('借', debitEntries, diff.debitChangedIndices),
    formatEntriesWithDiff('贷', creditEntries, diff.creditChangedIndices),
  ].join('\n');

  // 水平内容列表，变更字段追加 "[已修改]" 标记
  const horizontalList: HorizontalContent[] = [
    {
      keyname: '日期',
      value: diff.dateChanged ? `${date}  [已修改]` : date,
    },
    {
      keyname: '摘要',
      value: diff.descriptionChanged
        ? `${description}  [已修改]`
        : description,
    },
    {
      keyname: '置信度',
      value: conf.text,
    },
  ];

  return {
    msgtype: 'template_card',
    template_card: {
      card_type: 'button_interaction',
      source: {
        desc: 'laicai 智能记账',
        desc_color: 0,
      },
      main_title: {
        title: `记账凭证 #${voucherNumber}（已修改）`,
        desc: conf.text,
      },
      horizontal_content_list: horizontalList,
      quote_area: {
        type: 0,
        title: '会计分录（变更已标注）',
        quote_text: entriesText,
      },
      jump_list: [
        {
          type: 1,
          title: '在 Web 端查看',
          url: webUrl,
        },
      ],
      card_action: {
        type: 1,
        url: webUrl,
      },
      /* 修改后: "确认入账" + "继续修改" + "取消" */
      button_list: [
        {
          text: '确认入账',
          style: 2,
          key: `confirm:${taskId}`,
        },
        {
          text: '继续修改',
          style: 1,
          key: `modify:${taskId}`,
        },
        {
          text: '取消',
          style: 3,
          key: `cancel:${taskId}`,
        },
      ],
      task_id: taskId,
    },
  };
}

/**
 * 构建批量凭证确认卡片
 *
 * 场景: 用户发送 "今天收了客户A货款5万，付了供应商B材料费3万，员工小王报销差旅费2000"，
 * AI 识别出多笔交易后返回此卡片，用户可以 "全部确认" 或 "逐条修改"。
 *
 * @param params - 批量凭证信息
 * @returns 企业微信 template_card 消息 JSON
 */
export function buildBatchVoucherCard(
  params: BatchVoucherParams,
): WechatTemplateCardMessage {
  const {
    tenantId,
    vouchers,
    totalAmount,
    confidence,
    taskId,
    webBaseUrl,
  } = params;

  const conf = confidenceLabel(confidence);
  const base = webBaseUrl ?? 'https://app.laicai.com';
  const batchUrl = `${base}/t/${tenantId}/voucher/batch/${encodeURIComponent(taskId)}`;

  // 将每笔凭证摘要拼成引用文本
  const voucherListText = vouchers
    .map(
      (v) =>
        `${v.index}. ${v.description}\n   借方合计: ${formatCurrency(v.debitTotal)} / 贷方: ${v.creditAccountName}`,
    )
    .join('\n\n');

  return {
    msgtype: 'template_card',
    template_card: {
      card_type: 'button_interaction',
      source: {
        desc: 'laicai 智能记账',
        desc_color: 0,
      },
      main_title: {
        title: `识别到 ${vouchers.length} 笔交易`,
        desc: conf.text,
      },
      /* 关键数据: 总金额突出显示 */
      emphasis_content: {
        title: formatCurrency(totalAmount),
        desc: '交易总额',
      },
      horizontal_content_list: [
        {
          keyname: '交易笔数',
          value: `${vouchers.length} 笔`,
        },
        {
          keyname: '置信度',
          value: conf.text,
        },
      ],
      /* 引用区域: 逐笔摘要列表 */
      quote_area: {
        type: 0,
        title: '凭证明细',
        quote_text: voucherListText,
      },
      jump_list: [
        {
          type: 1,
          title: '在 Web 端查看全部',
          url: batchUrl,
        },
      ],
      card_action: {
        type: 1,
        url: batchUrl,
      },
      /* 两个操作按钮: 全部确认 / 逐条修改 */
      button_list: [
        {
          text: '全部确认',
          style: 2,
          key: `batch_confirm_all:${taskId}`,
        },
        {
          text: '逐条修改',
          style: 1,
          key: `batch_modify_each:${taskId}`,
        },
      ],
      task_id: taskId,
    },
  };
}

// ============================================================================
// 使用示例（仅供参考，不会被导出）
// ============================================================================

/* eslint-disable @typescript-eslint/no-unused-vars */

// 示例 1: 单笔凭证确认
const _singleExample = buildVoucherConfirmCard({
  tenantId: 'tenant_abc123',
  voucherNumber: '2026-04-0012',
  date: '2026-04-07',
  description: '购买办公用品',
  debitEntries: [{ accountName: '管理费用 - 办公费', amount: 3000 }],
  creditEntries: [{ accountName: '银行存款', amount: 3000 }],
  confidence: 'high',
  taskId: 'task_voucher_20260407_001',
});

// 示例 2: 修改后凭证（用户说 "改一下，是现金付的"）
const _modifiedExample = buildVoucherModifiedCard({
  tenantId: 'tenant_abc123',
  voucherNumber: '2026-04-0012',
  date: '2026-04-07',
  description: '购买办公用品',
  debitEntries: [{ accountName: '管理费用 - 办公费', amount: 3000 }],
  creditEntries: [{ accountName: '库存现金', amount: 3000 }],
  confidence: 'high',
  taskId: 'task_voucher_20260407_001_v2',
  diff: {
    creditChangedIndices: [0], // 贷方第一行从 "银行存款" 改为 "库存现金"
  },
});

// 示例 3: 批量凭证
const _batchExample = buildBatchVoucherCard({
  tenantId: 'tenant_abc123',
  vouchers: [
    {
      index: 1,
      description: '收客户A货款',
      debitTotal: 50000,
      creditAccountName: '应收账款 - 客户A',
    },
    {
      index: 2,
      description: '付供应商B材料费',
      debitTotal: 30000,
      creditAccountName: '银行存款',
    },
    {
      index: 3,
      description: '员工小王差旅报销',
      debitTotal: 2000,
      creditAccountName: '库存现金',
    },
  ],
  totalAmount: 82000,
  confidence: 'high',
  taskId: 'task_batch_20260407_001',
});
