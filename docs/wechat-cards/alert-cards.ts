/**
 * 企业微信模板卡片 — 预警与提醒类
 *
 * 适用于 laicai AI 财务助手主动推送的时效性财务事件：
 * - 应收到期提醒
 * - 发票认证提醒
 * - 税务申报提醒
 * - 异常预警
 *
 * 基于企业微信「template_card」消息类型，card_type 为 "button_interaction"。
 * @see https://developer.work.weixin.qq.com/document/path/94888
 */

// ---------------------------------------------------------------------------
// 通用类型定义
// ---------------------------------------------------------------------------

/** 企业微信模板卡片顶层消息结构 */
export interface WechatWorkTemplateCardMessage {
  /** 消息类型，固定 "template_card" */
  msgtype: 'template_card';
  template_card: ButtonInteractionCard;
}

/** button_interaction 卡片 */
export interface ButtonInteractionCard {
  /** 卡片类型，固定 "button_interaction" */
  card_type: 'button_interaction';
  /** 卡片来源信息 */
  source: CardSource;
  /** 一级标题 */
  main_title: MainTitle;
  /** 关键数据区（最多展示两组关键数据） */
  emphasis_content?: EmphasisContent;
  /** 引用文字区 */
  quote_area?: QuoteArea;
  /** 二级标题 + 文本内容区列表（最多 6 条） */
  sub_title_text?: string;
  /** 水平内容区列表（最多 6 条，每条最多 2 列） */
  horizontal_content_list?: HorizontalContent[];
  /** 跳转区域列表 */
  jump_list?: JumpItem[];
  /** 整体卡片点击跳转 */
  card_action?: CardAction;
  /** 按钮列表（最多 6 个） */
  button_list: ButtonItem[];
  /** 任务ID，用于回调去重 */
  task_id?: string;
}

/** 卡片来源 */
export interface CardSource {
  /** 来源图片 URL */
  icon_url?: string;
  /** 来源摘要 */
  desc?: string;
  /** 来源摘要颜色：0 灰色（默认）、1 黑色、2 红色、3 绿色 */
  desc_color?: 0 | 1 | 2 | 3;
}

/** 一级标题 */
export interface MainTitle {
  /** 标题文本 */
  title: string;
  /** 标题描述（灰色小字） */
  desc?: string;
}

/** 关键数据区 */
export interface EmphasisContent {
  /** 关键数据（大字） */
  title: string;
  /** 关键数据描述 */
  desc?: string;
}

/** 引用文字区 */
export interface QuoteArea {
  /** 引用类型：0 引用文字、1 引用链接 */
  type?: 0 | 1;
  /** 引用链接 URL */
  url?: string;
  /** 引用标题 */
  title?: string;
  /** 引用文字内容 */
  quote_text?: string;
}

/** 水平内容区 */
export interface HorizontalContent {
  /** 二级标题 */
  keyname: string;
  /** 二级标题内容 */
  value?: string;
  /** 链接类型：0 普通文本、1 跳转 URL、2 下载附件 */
  type?: 0 | 1 | 2;
  /** 跳转链接（type=1 时有效） */
  url?: string;
  /** 附件 media_id（type=2 时有效） */
  media_id?: string;
}

/** 跳转区域 */
export interface JumpItem {
  /** 跳转类型：0 不跳转、1 跳转 URL */
  type?: 0 | 1;
  /** 跳转标题 */
  title: string;
  /** 跳转 URL */
  url?: string;
}

/** 整体卡片跳转 */
export interface CardAction {
  /** 跳转类型：1 URL、2 小程序 */
  type: 1 | 2;
  /** 跳转 URL */
  url: string;
  /** 小程序 appid（type=2 时） */
  appid?: string;
  /** 小程序 pagepath（type=2 时） */
  pagepath?: string;
}

/** 按钮 */
export interface ButtonItem {
  /** 按钮类型：0 普通按钮，1 确认/强调按钮 */
  type?: 0 | 1;
  /** 按钮文字 */
  text: string;
  /** 按钮回调 key，用于接收事件回调 */
  key: string;
}

// ---------------------------------------------------------------------------
// A) 应收到期提醒
// ---------------------------------------------------------------------------

/** 单条应收款项 */
export interface ReceivableItem {
  /** 客户名称 */
  customerName: string;
  /** 应收金额（元） */
  amount: number;
  /** 到期日期 yyyy-MM-dd */
  dueDate: string;
  /** 距离到期天数（正数=还剩天数，负数=已逾期天数） */
  daysUntilDue: number;
}

/** 应收到期提醒参数 */
export interface ReceivableReminderParams {
  /** 即将到期项（daysUntilDue >= 0） */
  upcomingItems: ReceivableItem[];
  /** 已逾期项（daysUntilDue < 0） */
  overdueItems: ReceivableItem[];
  /** 应收总金额（元） */
  totalAmount: number;
  /** 租户名称 / 公司名称 */
  tenantName: string;
  /** 基准 URL，用于生成按钮跳转链接 */
  baseUrl: string;
  /** 卡片任务 ID（防重复，建议 UUID） */
  taskId: string;
}

/**
 * 生成应收到期提醒卡片
 *
 * 场景：每日定时扫描即将到期 / 已逾期的应收账款，主动推送给财务人员。
 */
export function buildReceivableReminderCard(
  params: ReceivableReminderParams,
): WechatWorkTemplateCardMessage {
  const {
    upcomingItems,
    overdueItems,
    totalAmount,
    tenantName,
    baseUrl,
    taskId,
  } = params;

  // 紧急程度描述色：有逾期为红色，仅即将到期为绿色
  const descColor: 0 | 1 | 2 | 3 = overdueItems.length > 0 ? 2 : 3;

  // 构建水平内容列表（最多 6 条，优先展示逾期项）
  const horizontalList: HorizontalContent[] = [];

  // 先展示逾期项
  for (const item of overdueItems.slice(0, 3)) {
    horizontalList.push({
      keyname: `${item.customerName}（逾期 ${Math.abs(item.daysUntilDue)} 天）`,
      value: `${formatCurrency(item.amount)}`,
      type: 0,
    });
  }

  // 再展示即将到期项
  const remainingSlots = 6 - horizontalList.length;
  for (const item of upcomingItems.slice(0, remainingSlots)) {
    horizontalList.push({
      keyname: `${item.customerName}（${item.daysUntilDue} 天后到期）`,
      value: `${formatCurrency(item.amount)}`,
      type: 0,
    });
  }

  // 逾期总额
  const overdueTotal = overdueItems.reduce((sum, i) => sum + i.amount, 0);

  // 引用区域汇总
  const quoteLines: string[] = [];
  if (overdueItems.length > 0) {
    quoteLines.push(
      `已逾期 ${overdueItems.length} 笔，合计 ${formatCurrency(overdueTotal)}`,
    );
  }
  quoteLines.push(
    `即将到期 ${upcomingItems.length} 笔，应收总额 ${formatCurrency(totalAmount)}`,
  );

  return {
    msgtype: 'template_card',
    template_card: {
      card_type: 'button_interaction',
      source: {
        icon_url: `${baseUrl}/static/icons/laicai-logo.png`,
        desc: overdueItems.length > 0 ? '紧急 - 有逾期应收' : '提醒 - 应收即将到期',
        desc_color: descColor,
      },
      main_title: {
        title: '应收到期提醒',
        desc: `${tenantName} | ${formatDate(new Date())}`,
      },
      emphasis_content: {
        title: formatCurrency(totalAmount),
        desc: '应收总额',
      },
      quote_area: {
        type: 0,
        quote_text: quoteLines.join('\n'),
      },
      horizontal_content_list: horizontalList,
      jump_list: [
        {
          type: 1,
          title: '打开应收管理',
          url: `${baseUrl}/receivables`,
        },
      ],
      card_action: {
        type: 1,
        url: `${baseUrl}/receivables`,
      },
      button_list: [
        {
          type: 1,
          text: '发送催收消息',
          key: `receivable_collect_${taskId}`,
        },
        {
          type: 0,
          text: '查看全部应收',
          key: `receivable_view_all_${taskId}`,
        },
        {
          type: 0,
          text: '账龄分析',
          key: `receivable_aging_${taskId}`,
        },
      ],
      task_id: taskId,
    },
  };
}

// ---------------------------------------------------------------------------
// B) 发票认证提醒
// ---------------------------------------------------------------------------

/** 单条待认证发票 */
export interface UncertifiedInvoice {
  /** 供应商名称 */
  supplierName: string;
  /** 发票金额（含税，元） */
  amount: number;
  /** 税额（元） */
  taxAmount: number;
  /** 发票代码 */
  invoiceCode: string;
  /** 发票号码 */
  invoiceNumber: string;
}

/** 发票认证提醒参数 */
export interface InvoiceCertificationParams {
  /** 待认证发票列表 */
  invoices: UncertifiedInvoice[];
  /** 可抵扣税额合计（元） */
  totalDeductibleAmount: number;
  /** 认证截止日期 yyyy-MM-dd */
  deadline: string;
  /** 距离截止日还剩天数 */
  daysRemaining: number;
  /** 租户名称 */
  tenantName: string;
  /** 基准 URL */
  baseUrl: string;
  /** 卡片任务 ID */
  taskId: string;
}

/**
 * 生成发票认证截止日提醒卡片
 *
 * 场景：每月认证期限前（一般次月 15 日前），提醒财务人员及时认证进项发票。
 */
export function buildInvoiceCertificationCard(
  params: InvoiceCertificationParams,
): WechatWorkTemplateCardMessage {
  const {
    invoices,
    totalDeductibleAmount,
    deadline,
    daysRemaining,
    tenantName,
    baseUrl,
    taskId,
  } = params;

  // 紧急程度：<= 3 天红色，<= 7 天黑色，其余绿色
  const descColor: 0 | 1 | 2 | 3 =
    daysRemaining <= 3 ? 2 : daysRemaining <= 7 ? 1 : 3;

  // 发票列表（最多展示 6 条）
  const horizontalList: HorizontalContent[] = invoices
    .slice(0, 6)
    .map((inv) => ({
      keyname: inv.supplierName,
      value: `${formatCurrency(inv.amount)}（税额 ${formatCurrency(inv.taxAmount)}）`,
      type: 0 as const,
    }));

  const urgencyText =
    daysRemaining <= 3
      ? `紧急 - 仅剩 ${daysRemaining} 天`
      : `提醒 - 还剩 ${daysRemaining} 天`;

  return {
    msgtype: 'template_card',
    template_card: {
      card_type: 'button_interaction',
      source: {
        icon_url: `${baseUrl}/static/icons/laicai-logo.png`,
        desc: urgencyText,
        desc_color: descColor,
      },
      main_title: {
        title: '发票认证提醒',
        desc: `${tenantName} | 截止日期 ${deadline}`,
      },
      emphasis_content: {
        title: formatCurrency(totalDeductibleAmount),
        desc: '待抵扣税额',
      },
      quote_area: {
        type: 0,
        quote_text: `共 ${invoices.length} 张发票未认证，合计可抵扣税额 ${formatCurrency(totalDeductibleAmount)}。\n请在 ${deadline} 前完成认证，逾期将无法抵扣。`,
      },
      horizontal_content_list: horizontalList,
      jump_list: [
        {
          type: 1,
          title: '打开发票管理',
          url: `${baseUrl}/invoices?status=uncertified`,
        },
      ],
      card_action: {
        type: 1,
        url: `${baseUrl}/invoices?status=uncertified`,
      },
      button_list: [
        {
          type: 1,
          text: '查看发票详情',
          key: `invoice_cert_detail_${taskId}`,
        },
        {
          type: 0,
          text: '标记已认证',
          key: `invoice_cert_mark_${taskId}`,
        },
      ],
      task_id: taskId,
    },
  };
}

// ---------------------------------------------------------------------------
// C) 税务申报提醒
// ---------------------------------------------------------------------------

/** 税种申报状态 */
export interface TaxFilingItem {
  /** 税种名称，如 "增值税"、"企业所得税" 等 */
  taxName: string;
  /** 申报期类型 */
  period: '月报' | '季报' | '年报';
  /** 数据就绪状态 */
  dataReady: boolean;
  /** 状态备注，如 "需补录 3 张发票" */
  remark?: string;
}

/** 税务申报提醒参数 */
export interface TaxFilingReminderParams {
  /** 申报截止日期 yyyy-MM-dd */
  deadline: string;
  /** 距离截止日天数 */
  daysRemaining: number;
  /** 申报所属期，如 "2026年3月" */
  taxPeriod: string;
  /** 待申报税种列表 */
  filingItems: TaxFilingItem[];
  /** 租户名称 */
  tenantName: string;
  /** 基准 URL */
  baseUrl: string;
  /** 卡片任务 ID */
  taskId: string;
}

/**
 * 生成税务申报提醒卡片
 *
 * 场景：每月/季申报期限前，提醒财务人员准备并完成纳税申报。
 */
export function buildTaxFilingReminderCard(
  params: TaxFilingReminderParams,
): WechatWorkTemplateCardMessage {
  const {
    deadline,
    daysRemaining,
    taxPeriod,
    filingItems,
    tenantName,
    baseUrl,
    taskId,
  } = params;

  const descColor: 0 | 1 | 2 | 3 =
    daysRemaining <= 3 ? 2 : daysRemaining <= 7 ? 1 : 3;

  // 统计就绪 / 未就绪
  const readyCount = filingItems.filter((i) => i.dataReady).length;
  const notReadyCount = filingItems.length - readyCount;

  // 水平内容：每个税种一行
  const horizontalList: HorizontalContent[] = filingItems
    .slice(0, 6)
    .map((item) => ({
      keyname: `${item.taxName}（${item.period}）`,
      value: item.dataReady
        ? '数据就绪'
        : item.remark ?? '数据未就绪',
      type: 0 as const,
    }));

  const urgencyLabel =
    daysRemaining <= 3
      ? `紧急 - 仅剩 ${daysRemaining} 天`
      : `提醒 - 还剩 ${daysRemaining} 天`;

  return {
    msgtype: 'template_card',
    template_card: {
      card_type: 'button_interaction',
      source: {
        icon_url: `${baseUrl}/static/icons/laicai-logo.png`,
        desc: urgencyLabel,
        desc_color: descColor,
      },
      main_title: {
        title: '税务申报提醒',
        desc: `${tenantName} | ${taxPeriod} | 截止 ${deadline}`,
      },
      emphasis_content: {
        title: `${filingItems.length} 项`,
        desc: '待申报税种',
      },
      quote_area: {
        type: 0,
        quote_text:
          notReadyCount > 0
            ? `${readyCount} 项数据已就绪，${notReadyCount} 项仍需准备。\n请尽快补齐数据，确保按时完成申报。`
            : `全部 ${readyCount} 项数据已就绪，可随时提交申报。`,
      },
      horizontal_content_list: horizontalList,
      jump_list: [
        {
          type: 1,
          title: '打开申报中心',
          url: `${baseUrl}/tax-filing?period=${taxPeriod}`,
        },
      ],
      card_action: {
        type: 1,
        url: `${baseUrl}/tax-filing`,
      },
      button_list: [
        {
          type: 1,
          text: '准备申报数据',
          key: `tax_prepare_${taskId}`,
        },
        {
          type: 0,
          text: '查看待办事项',
          key: `tax_todo_${taskId}`,
        },
      ],
      task_id: taskId,
    },
  };
}

// ---------------------------------------------------------------------------
// D) 异常预警
// ---------------------------------------------------------------------------

/** 异常严重程度 */
export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';

/** 异常类型 */
export type AnomalyType =
  | 'expense_spike'        // 费用异常飙升
  | 'duplicate_transaction' // 疑似重复交易
  | 'missing_invoice'      // 缺失发票
  | 'balance_mismatch'     // 余额不符
  | 'unusual_payee'        // 异常收款方
  | 'budget_overrun'       // 预算超支
  | 'other';               // 其他

/** 异常预警参数 */
export interface AnomalyAlertParams {
  /** 异常类型 */
  anomalyType: AnomalyType;
  /** 严重程度 */
  severity: AnomalySeverity;
  /** 异常标题（简短描述） */
  title: string;
  /** 异常详细描述 */
  description: string;
  /** 涉及金额（元），可选 */
  amount?: number;
  /** 发生时间 yyyy-MM-dd HH:mm */
  detectedAt: string;
  /** 关联单据编号，可选 */
  relatedDocNumber?: string;
  /** 租户名称 */
  tenantName: string;
  /** 基准 URL */
  baseUrl: string;
  /** 卡片任务 ID */
  taskId: string;
}

/** 严重程度 → 描述色映射 */
const SEVERITY_COLOR_MAP: Record<AnomalySeverity, 0 | 1 | 2 | 3> = {
  low: 3,       // 绿色
  medium: 1,    // 黑色
  high: 2,      // 红色
  critical: 2,  // 红色
};

/** 严重程度 → 中文标签 */
const SEVERITY_LABEL_MAP: Record<AnomalySeverity, string> = {
  low: '低',
  medium: '中',
  high: '高',
  critical: '严重',
};

/** 异常类型 → 中文标签 */
const ANOMALY_TYPE_LABEL_MAP: Record<AnomalyType, string> = {
  expense_spike: '费用异常飙升',
  duplicate_transaction: '疑似重复交易',
  missing_invoice: '缺失发票',
  balance_mismatch: '余额不符',
  unusual_payee: '异常收款方',
  budget_overrun: '预算超支',
  other: '其他异常',
};

/**
 * 生成异常预警卡片
 *
 * 场景：AI 在日常自动检查中发现财务数据异常，主动推送预警。
 */
export function buildAnomalyAlertCard(
  params: AnomalyAlertParams,
): WechatWorkTemplateCardMessage {
  const {
    anomalyType,
    severity,
    title,
    description,
    amount,
    detectedAt,
    relatedDocNumber,
    tenantName,
    baseUrl,
    taskId,
  } = params;

  const descColor = SEVERITY_COLOR_MAP[severity];
  const severityLabel = SEVERITY_LABEL_MAP[severity];
  const typeLabel = ANOMALY_TYPE_LABEL_MAP[anomalyType];

  // 水平内容区
  const horizontalList: HorizontalContent[] = [
    {
      keyname: '异常类型',
      value: typeLabel,
      type: 0,
    },
    {
      keyname: '严重程度',
      value: severityLabel,
      type: 0,
    },
    {
      keyname: '发现时间',
      value: detectedAt,
      type: 0,
    },
  ];

  if (amount !== undefined) {
    horizontalList.push({
      keyname: '涉及金额',
      value: formatCurrency(amount),
      type: 0,
    });
  }

  if (relatedDocNumber) {
    horizontalList.push({
      keyname: '关联单据',
      value: relatedDocNumber,
      type: 1,
      url: `${baseUrl}/documents/${relatedDocNumber}`,
    });
  }

  return {
    msgtype: 'template_card',
    template_card: {
      card_type: 'button_interaction',
      source: {
        icon_url: `${baseUrl}/static/icons/laicai-logo.png`,
        desc: `${severity === 'critical' ? '严重预警' : '异常预警'} - ${severityLabel}`,
        desc_color: descColor,
      },
      main_title: {
        title: `异常预警：${title}`,
        desc: tenantName,
      },
      emphasis_content: amount !== undefined
        ? {
            title: formatCurrency(amount),
            desc: '涉及金额',
          }
        : undefined,
      quote_area: {
        type: 0,
        quote_text: description,
      },
      horizontal_content_list: horizontalList,
      jump_list: [
        {
          type: 1,
          title: '打开异常中心',
          url: `${baseUrl}/anomalies`,
        },
      ],
      card_action: {
        type: 1,
        url: `${baseUrl}/anomalies/${taskId}`,
      },
      button_list: [
        {
          type: 1,
          text: '查看详情',
          key: `anomaly_detail_${taskId}`,
        },
        {
          type: 0,
          text: '忽略',
          key: `anomaly_ignore_${taskId}`,
        },
        {
          type: 0,
          text: '标记已处理',
          key: `anomaly_resolve_${taskId}`,
        },
      ],
      task_id: taskId,
    },
  };
}

// ---------------------------------------------------------------------------
// 工具函数
// ---------------------------------------------------------------------------

/**
 * 格式化货币金额为人民币字符串
 *
 * @example formatCurrency(50000) => "¥50,000.00"
 */
function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * 格式化日期为 yyyy-MM-dd
 */
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
