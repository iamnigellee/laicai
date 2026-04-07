/**
 * 企业微信模板卡片 — 发票识别结果
 *
 * 用于 laicai AI 财务助手拍照入账场景。
 * 当用户发送增值税发票照片后，AI 完成 OCR 识别并返回结构化结果，
 * 通过模板卡片让用户确认或修改后入账。
 *
 * 参考：
 *   - 企业微信 API: https://developer.work.weixin.qq.com/document/path/94888
 *   - 交互设计: docs/wechat-work-interaction-design.md (场景 3、4)
 */

// ============================================================================
// 基础类型 — 企业微信 template_card 通用结构
// ============================================================================

/** 企业微信模板卡片消息顶层结构 */
export interface WxWorkTemplateCardMessage {
  /** 消息类型，固定为 "template_card" */
  msgtype: 'template_card';
  template_card: TemplateCard;
}

/** 模板卡片主体 */
export interface TemplateCard {
  /** 卡片类型: button_interaction 支持底部按钮交互 */
  card_type: 'button_interaction';
  /** 卡片来源信息（左上角 icon + 名称） */
  source: CardSource;
  /** 一级标题 */
  main_title: MainTitle;
  /** 关键数据区域（最多展示 2 个） */
  emphasis_content?: EmphasisContent;
  /** 引用区域 */
  quote_area?: QuoteArea;
  /** 二级标题 + 文本列表，用于展示字段 */
  sub_title_text?: string;
  /** 水平内容区域（左右对齐的键值对） */
  horizontal_content_list?: HorizontalContent[];
  /** 跳转指引 */
  jump_list?: JumpItem[];
  /** 卡片操作区域（底部按钮） */
  card_action?: CardAction;
  /** 按钮列表 */
  button_list: ButtonItem[];
  /** 任务 ID，用于更新卡片状态 */
  task_id: string;
}

/** 卡片来源 */
export interface CardSource {
  /** 来源图标 URL */
  icon_url?: string;
  /** 来源名称 */
  desc?: string;
  /** 来源描述颜色: 0=默认灰, 1=黑, 2=红, 3=绿 */
  desc_color?: 0 | 1 | 2 | 3;
}

/** 一级标题 */
export interface MainTitle {
  title: string;
  desc?: string;
}

/** 关键数据 */
export interface EmphasisContent {
  title: string;
  desc?: string;
}

/** 引用区域 */
export interface QuoteArea {
  type?: 0 | 1;
  url?: string;
  title?: string;
  quote_text?: string;
}

/** 水平键值对 */
export interface HorizontalContent {
  /** 链接类型: 0=文本, 1=URL, 2=附件, 3=@人 */
  type?: 0 | 1 | 2 | 3;
  /** 键名 */
  keyname: string;
  /** 值 */
  value?: string;
  /** 跳转 URL（type=1 时有效） */
  url?: string;
  /** 附件 media_id（type=2 时有效） */
  media_id?: string;
  /** @人的 userid（type=3 时有效） */
  userid?: string;
}

/** 跳转指引 */
export interface JumpItem {
  /** 0=文本跳转, 1=小程序跳转 */
  type?: 0 | 1;
  title: string;
  url?: string;
  appid?: string;
  pagepath?: string;
}

/** 卡片整体点击动作 */
export interface CardAction {
  type: 0 | 1 | 2;
  url?: string;
  appid?: string;
  pagepath?: string;
}

/** 底部按钮 */
export interface ButtonItem {
  /** 按钮显示文字 */
  text: string;
  /** 按钮样式: 1=主要(蓝色), 2=次要(灰色) */
  style: 1 | 2;
  /** 按钮回调 key，用于区分用户点了哪个 */
  key: string;
}

// ============================================================================
// 业务类型 — 发票识别
// ============================================================================

/** 发票类型 */
export type InvoiceType = '增值税专用发票' | '增值税普通发票';

/** 发票类型简称 */
export type InvoiceTypeShort = '专票' | '普票';

/** 发票识别结果 */
export interface InvoiceOcrResult {
  /** 发票类型 */
  invoiceType: InvoiceType;
  /** 发票号码 */
  invoiceNumber: string;
  /** 供应商名称 */
  supplierName: string;
  /** 开票日期 (YYYY-MM-DD) */
  date: string;
  /** 不含税金额 (分) */
  amountExclTax: number;
  /** 税率 (如 0.13 表示 13%) */
  taxRate: number;
  /** 税额 (分) */
  taxAmount: number;
  /** 价税合计 (分) */
  totalAmount: number;
  /** 是否可抵扣进项税 */
  deductible: boolean;
}

/** 凭证分录行 */
export interface JournalEntryLine {
  /** 借/贷方向 */
  direction: '借' | '贷';
  /** 科目名称 */
  accountName: string;
  /** 金额 (分) */
  amount: number;
}

/** 建议凭证 */
export interface SuggestedJournalEntry {
  /** 摘要 */
  summary: string;
  /** 分录行 */
  lines: JournalEntryLine[];
}

/** 批量处理中单张发票状态 */
export type BatchInvoiceStatus = 'recognized' | 'needs_review' | 'failed';

/** 批量处理中单张发票 */
export interface BatchInvoiceItem {
  /** 序号 (从 1 开始) */
  index: number;
  /** 处理状态 */
  status: BatchInvoiceStatus;
  /** 供应商名称 (识别成功时) */
  supplierName?: string;
  /** 价税合计 (分, 识别成功时) */
  totalAmount?: number;
  /** 发票类型简称 */
  invoiceTypeShort?: InvoiceTypeShort;
  /** 可抵扣税额 (分) */
  deductibleTax?: number;
  /** 状态说明 (如失败原因、需确认内容) */
  statusMessage?: string;
}

/** 批量处理摘要 */
export interface BatchProcessingSummary {
  /** 总张数 */
  totalCount: number;
  /** 处理明细 */
  items: BatchInvoiceItem[];
  /** 合计金额 (分) */
  totalAmount: number;
  /** 合计可抵扣税额 (分) */
  totalDeductibleTax: number;
  /** 成功数 */
  recognizedCount: number;
  /** 待确认数 */
  needsReviewCount: number;
  /** 失败数 */
  failedCount: number;
}

/** 重复发票已有记录 */
export interface ExistingInvoiceRecord {
  /** 已有发票号码 */
  invoiceNumber: string;
  /** 已入账凭证号 */
  voucherNumber: string;
  /** 入账日期 */
  bookedDate: string;
  /** 供应商 */
  supplierName: string;
  /** 金额 (分) */
  totalAmount: number;
  /** 操作人 */
  operator: string;
}

// ============================================================================
// 工具函数
// ============================================================================

/** 金额格式化: 分 → 带千分位的元 (如 1000044 → "10,000.44") */
function formatAmount(cents: number): string {
  const yuan = (cents / 100).toFixed(2);
  const [intPart, decPart] = yuan.split('.');
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${formatted}.${decPart}`;
}

/** 税率格式化: 0.13 → "13%" */
function formatTaxRate(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

/** 发票类型 → 简称 */
function invoiceTypeShort(type: InvoiceType): InvoiceTypeShort {
  return type === '增值税专用发票' ? '专票' : '普票';
}

/** 生成唯一 task_id */
function generateTaskId(prefix: string): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${ts}_${rand}`;
}

/** 批量状态图标 */
function statusIcon(status: BatchInvoiceStatus): string {
  switch (status) {
    case 'recognized':
      return '✅';
    case 'needs_review':
      return '⚠️';
    case 'failed':
      return '❌';
  }
}

// ============================================================================
// 卡片构建参数
// ============================================================================

/** 构建单张发票识别卡片的参数 */
export interface SingleInvoiceCardParams {
  /** OCR 识别结果 */
  invoice: InvoiceOcrResult;
  /** AI 建议的凭证分录 */
  journalEntry: SuggestedJournalEntry;
  /** 可选: 自定义 task_id，不传则自动生成 */
  taskId?: string;
}

/** 构建批量处理卡片的参数 */
export interface BatchProcessingCardParams {
  /** 批量处理摘要 */
  summary: BatchProcessingSummary;
  /** 可选: 自定义 task_id */
  taskId?: string;
}

/** 构建重复发票警告卡片的参数 */
export interface DuplicateWarningCardParams {
  /** 当前识别到的发票号码 */
  invoiceNumber: string;
  /** 当前识别到的供应商 */
  currentSupplier: string;
  /** 当前识别到的金额 (分) */
  currentAmount: number;
  /** 已存在的记录 */
  existingRecord: ExistingInvoiceRecord;
  /** 可选: 自定义 task_id */
  taskId?: string;
}

// ============================================================================
// 卡片来源配置 (统一品牌)
// ============================================================================

/** laicai 卡片统一来源标识 */
const CARD_SOURCE: CardSource = {
  icon_url: 'https://laicai.app/logo-48.png',
  desc: 'laicai 智能财务',
  desc_color: 0,
};

// ============================================================================
// A) 单张发票识别结果卡片
// ============================================================================

/**
 * 构建单张发票识别结果的模板卡片
 *
 * 场景: 用户发送一张增值税发票照片，AI 完成 OCR 后返回识别结果
 * 和建议凭证分录，用户可确认入账、修改科目或取消。
 *
 * 回调 key:
 *   - confirm_booking   → 确认入账
 *   - modify_account    → 修改科目
 *   - cancel_booking    → 取消
 */
export function buildSingleInvoiceCard(
  params: SingleInvoiceCardParams,
): WxWorkTemplateCardMessage {
  const { invoice, journalEntry, taskId } = params;

  // 构建分录文本，用于引用区域展示
  const entryLines = journalEntry.lines
    .map(
      (line) => `${line.direction}：${line.accountName}  ¥${formatAmount(line.amount)}`,
    )
    .join('\n');

  const quoteText = `${journalEntry.summary}\n${entryLines}`;

  return {
    msgtype: 'template_card',
    template_card: {
      card_type: 'button_interaction',
      source: CARD_SOURCE,
      main_title: {
        title: '发票识别结果',
        desc: `${invoiceTypeShort(invoice.invoiceType)} | ${invoice.invoiceNumber}`,
      },
      // 关键数据: 价税合计
      emphasis_content: {
        title: `¥${formatAmount(invoice.totalAmount)}`,
        desc: '价税合计',
      },
      // 发票详细字段
      horizontal_content_list: [
        {
          keyname: '发票类型',
          value: invoice.invoiceType,
        },
        {
          keyname: '发票号码',
          value: invoice.invoiceNumber,
        },
        {
          keyname: '供应商',
          value: invoice.supplierName,
        },
        {
          keyname: '开票日期',
          value: invoice.date,
        },
        {
          keyname: '不含税金额',
          value: `¥${formatAmount(invoice.amountExclTax)}`,
        },
        {
          keyname: '税率',
          value: formatTaxRate(invoice.taxRate),
        },
        {
          keyname: '税额',
          value: `¥${formatAmount(invoice.taxAmount)}`,
        },
        {
          keyname: '抵扣状态',
          value: invoice.deductible ? '可抵扣进项' : '不可抵扣',
        },
      ],
      // 引用区域展示建议凭证
      quote_area: {
        title: '建议凭证',
        quote_text: quoteText,
      },
      card_action: {
        type: 0,
      },
      button_list: [
        {
          text: '确认入账',
          style: 1,
          key: 'confirm_booking',
        },
        {
          text: '修改科目',
          style: 2,
          key: 'modify_account',
        },
        {
          text: '取消',
          style: 2,
          key: 'cancel_booking',
        },
      ],
      task_id: taskId ?? generateTaskId('inv_single'),
    },
  };
}

// ============================================================================
// B) 批量发票处理进度卡片
// ============================================================================

/**
 * 构建批量发票处理进度的模板卡片
 *
 * 场景: 用户连续发送多张发票照片，AI 批量识别后展示处理结果汇总，
 * 包括每张发票状态和合计金额、可抵扣税额。
 *
 * 回调 key:
 *   - confirm_all       → 确认全部
 *   - view_details      → 查看明细
 *   - handle_exceptions → 处理异常项
 */
export function buildBatchProcessingCard(
  params: BatchProcessingCardParams,
): WxWorkTemplateCardMessage {
  const { summary, taskId } = params;

  // 构建每张发票的状态列表
  const itemLines = summary.items
    .map((item) => {
      const icon = statusIcon(item.status);
      switch (item.status) {
        case 'recognized':
          return (
            `${icon} ${item.index}/${summary.totalCount} ` +
            `${item.supplierName} ¥${formatAmount(item.totalAmount ?? 0)}` +
            `（${item.invoiceTypeShort ?? ''}` +
            `${item.deductibleTax ? `，进项 ¥${formatAmount(item.deductibleTax)}` : ''}）`
          );
        case 'needs_review':
          return (
            `${icon} ${item.index}/${summary.totalCount} ` +
            `${item.statusMessage ?? '需人工确认'}`
          );
        case 'failed':
          return (
            `${icon} ${item.index}/${summary.totalCount} ` +
            `${item.statusMessage ?? '识别失败'}`
          );
      }
    })
    .join('\n');

  // 处理结果摘要文本
  const resultParts: string[] = [];
  if (summary.recognizedCount > 0) {
    resultParts.push(`已生成 ${summary.recognizedCount} 张凭证`);
  }
  if (summary.needsReviewCount > 0) {
    resultParts.push(`${summary.needsReviewCount} 张待确认`);
  }
  if (summary.failedCount > 0) {
    resultParts.push(`${summary.failedCount} 张识别失败`);
  }
  const resultText = resultParts.join('，');

  return {
    msgtype: 'template_card',
    template_card: {
      card_type: 'button_interaction',
      source: CARD_SOURCE,
      main_title: {
        title: '批量发票处理结果',
        desc: `共 ${summary.totalCount} 张发票`,
      },
      emphasis_content: {
        title: `¥${formatAmount(summary.totalAmount)}`,
        desc: '合计金额',
      },
      // 引用区域展示逐条状态
      quote_area: {
        title: `正在识别 ${summary.totalCount} 张发票...`,
        quote_text: itemLines,
      },
      horizontal_content_list: [
        {
          keyname: '合计金额',
          value: `¥${formatAmount(summary.totalAmount)}`,
        },
        {
          keyname: '可抵扣进项税',
          value: `¥${formatAmount(summary.totalDeductibleTax)}`,
        },
        {
          keyname: '处理结果',
          value: resultText,
        },
      ],
      card_action: {
        type: 0,
      },
      button_list: [
        {
          text: '确认全部',
          style: 1,
          key: 'confirm_all',
        },
        {
          text: '查看明细',
          style: 2,
          key: 'view_details',
        },
        {
          text: '处理异常项',
          style: 2,
          key: 'handle_exceptions',
        },
      ],
      task_id: taskId ?? generateTaskId('inv_batch'),
    },
  };
}

// ============================================================================
// C) 重复发票警告卡片
// ============================================================================

/**
 * 构建重复发票警告的模板卡片
 *
 * 场景: AI 识别到发票号码已存在于系统中，提醒用户可能重复入账，
 * 展示已有记录的详情，让用户决定是否继续入账。
 *
 * 回调 key:
 *   - force_booking     → 仍然入账
 *   - skip_invoice      → 跳过
 *   - view_existing     → 查看已有记录
 */
export function buildDuplicateWarningCard(
  params: DuplicateWarningCardParams,
): WxWorkTemplateCardMessage {
  const { invoiceNumber, currentSupplier, currentAmount, existingRecord, taskId } =
    params;

  return {
    msgtype: 'template_card',
    template_card: {
      card_type: 'button_interaction',
      source: {
        ...CARD_SOURCE,
        // 红色标识警告
        desc_color: 2,
        desc: '⚠ 重复发票警告',
      },
      main_title: {
        title: '发票号码重复',
        desc: `发票 ${invoiceNumber} 已存在入账记录`,
      },
      emphasis_content: {
        title: invoiceNumber,
        desc: '重复发票号码',
      },
      sub_title_text:
        `当前识别: ${currentSupplier} ¥${formatAmount(currentAmount)}\n` +
        `该发票号码已于 ${existingRecord.bookedDate} 入账，请确认是否重复。`,
      horizontal_content_list: [
        {
          keyname: '已有凭证号',
          value: existingRecord.voucherNumber,
        },
        {
          keyname: '入账日期',
          value: existingRecord.bookedDate,
        },
        {
          keyname: '供应商',
          value: existingRecord.supplierName,
        },
        {
          keyname: '已入账金额',
          value: `¥${formatAmount(existingRecord.totalAmount)}`,
        },
        {
          keyname: '操作人',
          value: existingRecord.operator,
        },
      ],
      card_action: {
        type: 0,
      },
      button_list: [
        {
          text: '仍然入账',
          style: 2,
          key: 'force_booking',
        },
        {
          text: '跳过',
          style: 1,
          key: 'skip_invoice',
        },
        {
          text: '查看已有记录',
          style: 2,
          key: 'view_existing',
        },
      ],
      task_id: taskId ?? generateTaskId('inv_dup'),
    },
  };
}

// ============================================================================
// 回调处理类型 — 配合 Gateway 解析用户按钮点击
// ============================================================================

/** 企业微信按钮回调事件 */
export interface ButtonCallbackEvent {
  /** 触发用户的 userid */
  userid: string;
  /** 企业 corpid */
  corpid: string;
  /** 对应卡片的 task_id */
  task_id: string;
  /** 用户点击的按钮 key */
  button_key: string;
}

/** 所有发票卡片的回调 key 联合类型 */
export type InvoiceCardCallbackKey =
  // 单张发票
  | 'confirm_booking'
  | 'modify_account'
  | 'cancel_booking'
  // 批量处理
  | 'confirm_all'
  | 'view_details'
  | 'handle_exceptions'
  // 重复警告
  | 'force_booking'
  | 'skip_invoice'
  | 'view_existing';

/**
 * 判断回调 key 是否为发票卡片回调
 *
 * 用于 Gateway 层路由回调事件到发票处理 Skill。
 */
export function isInvoiceCardCallback(key: string): key is InvoiceCardCallbackKey {
  const validKeys: Set<string> = new Set([
    'confirm_booking',
    'modify_account',
    'cancel_booking',
    'confirm_all',
    'view_details',
    'handle_exceptions',
    'force_booking',
    'skip_invoice',
    'view_existing',
  ]);
  return validKeys.has(key);
}
