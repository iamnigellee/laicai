/**
 * 银行对账 — 企业微信模板卡片消息构建器
 *
 * 使用企业微信 "template_card" 消息类型 (button_interaction)
 * 官方文档: https://developer.work.weixin.qq.com/document/path/94888
 *
 * 四种卡片场景:
 *   A) 对账结果概览 — reconciliation summary
 *   B) 逐笔确认匹配 — single match confirmation
 *   C) 未匹配建议入账 — unmatched transaction suggestion
 *   D) 对账完成 — reconciliation complete
 */

// ============================================================================
// 企业微信模板卡片类型定义
// ============================================================================

/** 卡片来源标识 */
export interface CardSource {
  /** 来源图片 URL */
  icon_url: string;
  /** 来源描述，建议不超过 13 个字 */
  desc: string;
  /** 来源描述颜色，目前只支持 0(默认) 1(企业微信绿) 2(红色) 3(黄色) */
  desc_color?: 0 | 1 | 2 | 3;
}

/** 一级标题 */
export interface MainTitle {
  /** 标题文本，建议不超过 26 个字 */
  title: string;
  /** 标题描述，建议不超过 30 个字 */
  desc?: string;
}

/** 关键数据 */
export interface EmphasisContent {
  /** 关键数据样式的数据内容，建议不超过 10 个字 */
  title: string;
  /** 关键数据样式的数据描述内容，建议不超过 15 个字 */
  desc?: string;
}

/** 二级标题 + 文本 */
export interface HorizontalContent {
  /** 二级标题类型: 0-普通文本 1-可跳转URL 2-下载附件 3-@人 */
  type?: 0 | 1 | 2 | 3;
  /** 二级标题 key，建议不超过 5 个字 */
  keyname: string;
  /** 二级标题 value */
  value?: string;
  /** 链接 URL (type=1 时有效) */
  url?: string;
  /** 附件的 media_id (type=2 时有效) */
  media_id?: string;
  /** 被 @ 的用户 ID (type=3 时有效) */
  userid?: string;
}

/** 跳转指引 */
export interface Jump {
  /** 跳转类型: 0-不跳转 1-跳转URL */
  type?: 0 | 1;
  /** 跳转链接标题，建议不超过 18 个字 */
  title: string;
  /** 跳转链接 URL */
  url?: string;
  /** 小程序 appid */
  appid?: string;
  /** 小程序 pagepath */
  pagepath?: string;
}

/** 按钮 */
export interface CardAction {
  /** 按钮类型: 0-不跳转 1-跳转URL */
  type?: 0 | 1;
  /** 按钮文案，建议不超过 10 个字 */
  text: string;
  /** 按钮跳转 URL */
  url?: string;
  /** 按钮 key 值，用于回调时区分按钮 */
  key: string;
}

/** 按钮列表容器 */
export interface ButtonList {
  /** 按钮数组，最多 6 个 */
  list: CardAction[];
}

/** 按钮选择型模板卡片 */
export interface ButtonInteractionCard {
  /** 卡片类型: button_interaction */
  card_type: 'button_interaction';
  /** 卡片来源样式 */
  source?: CardSource;
  /** 一级标题 */
  main_title: MainTitle;
  /** 关键数据样式 */
  emphasis_content?: EmphasisContent;
  /** 引用文献样式 (最多 6 条) */
  horizontal_content_list?: HorizontalContent[];
  /** 跳转指引样式 (最多 3 条) */
  jump_list?: Jump[];
  /** 按钮交互型卡片的按钮 */
  button_list: CardAction[];
  /** 任务 ID，同一个应用的任务 ID 不能重复 */
  task_id: string;
}

/** 企业微信模板卡片消息 */
export interface TemplateCardMessage {
  /** 消息类型，固定为 template_card */
  msgtype: 'template_card';
  /** 模板卡片内容 */
  template_card: ButtonInteractionCard;
}

// ============================================================================
// 业务参数类型
// ============================================================================

/** 对账结果概览参数 */
export interface ReconciliationSummaryParams {
  /** 银行名称 */
  bankName: string;
  /** 银行账号后4位 */
  last4: string;
  /** 对账任务 ID，用于生成唯一 task_id */
  taskId: string;
  /** 导入交易总笔数 */
  totalTransactions: number;
  /** 收入总额 */
  totalIncome: number;
  /** 支出总额 */
  totalExpense: number;
  /** 银行余额 */
  bankBalance: number;
  /** 已匹配笔数 */
  matchedCount: number;
  /** 待确认笔数 */
  pendingCount: number;
  /** 未匹配笔数 */
  unmatchedCount: number;
  /** Web 端查看完整报告的 URL */
  reportUrl: string;
}

/** 匹配置信度 */
export type MatchConfidence = 'high' | 'medium' | 'low';

/** 逐笔确认参数 */
export interface SingleMatchParams {
  /** 对账任务 ID */
  taskId: string;
  /** 当前交易在列表中的序号 (1-based) */
  index: number;
  /** 待确认总笔数 */
  total: number;
  /** 银行交易日期 (YYYY-MM-DD) */
  bankDate: string;
  /** 银行交易金额 (正数=收入, 负数=支出) */
  bankAmount: number;
  /** 银行交易摘要 */
  bankDescription: string;
  /** 银行交易对方户名 */
  bankCounterparty?: string;
  /** 建议匹配的凭证编号 */
  voucherNo: string;
  /** 建议匹配的凭证摘要 */
  voucherSummary: string;
  /** 建议匹配的凭证金额 */
  voucherAmount: number;
  /** 匹配置信度 */
  confidence: MatchConfidence;
}

/** 未匹配建议入账参数 */
export interface UnmatchedSuggestionParams {
  /** 对账任务 ID */
  taskId: string;
  /** 当前交易在列表中的序号 (1-based) */
  index: number;
  /** 未匹配总笔数 */
  total: number;
  /** 银行交易日期 (YYYY-MM-DD) */
  bankDate: string;
  /** 银行交易金额 (正数=收入, 负数=支出) */
  bankAmount: number;
  /** 银行交易摘要 */
  bankDescription: string;
  /** 银行交易对方户名 */
  bankCounterparty?: string;
  /** AI 建议的借方科目 */
  suggestedDebitAccount: string;
  /** AI 建议的贷方科目 */
  suggestedCreditAccount: string;
  /** AI 建议的凭证摘要 */
  suggestedSummary: string;
}

/** 对账完成参数 */
export interface ReconciliationCompleteParams {
  /** 对账任务 ID */
  taskId: string;
  /** 银行名称 */
  bankName: string;
  /** 银行账号后4位 */
  last4: string;
  /** 最终匹配率 (0-100) */
  matchRate: number;
  /** 新建凭证数 */
  newVouchersCreated: number;
  /** 余额是否一致 */
  balanceMatched: boolean;
  /** 银行余额 */
  bankBalance: number;
  /** 账面余额 */
  bookBalance: number;
  /** 余额差异 (bankBalance - bookBalance) */
  balanceDiff: number;
  /** 余额调节表 Web URL */
  reconciliationUrl: string;
  /** 导出报告 URL */
  exportUrl: string;
}

// ============================================================================
// 工具函数
// ============================================================================

/** 格式化金额为中文展示 (¥1,234.56) */
function formatAmount(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = amount < 0 ? '-' : '';
  return `${sign}¥${formatted}`;
}

/** 置信度中文映射 */
const CONFIDENCE_LABEL: Record<MatchConfidence, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

/** 置信度颜色映射 (0=默认灰 1=绿 2=红 3=黄) */
const CONFIDENCE_COLOR: Record<MatchConfidence, 0 | 1 | 2 | 3> = {
  high: 1,   // 绿色
  medium: 3, // 黄色
  low: 2,    // 红色
};

/** laicai 卡片统一来源标识 */
const LAICAI_SOURCE: CardSource = {
  icon_url: 'https://laicai.app/icons/logo-64.png',
  desc: 'laicai 智能财务',
  desc_color: 0,
};

// ============================================================================
// A) 对账结果概览
// ============================================================================

/**
 * 构建对账结果概览卡片
 *
 * 展示银行对账汇总: 导入笔数、收支、余额、匹配/待确认/未匹配
 */
export function buildReconciliationSummaryCard(
  params: ReconciliationSummaryParams,
): TemplateCardMessage {
  const {
    bankName,
    last4,
    taskId,
    totalTransactions,
    totalIncome,
    totalExpense,
    bankBalance,
    matchedCount,
    pendingCount,
    unmatchedCount,
    reportUrl,
  } = params;

  // 匹配率 (排除待确认的)
  const matchRate =
    totalTransactions > 0
      ? Math.round((matchedCount / totalTransactions) * 100)
      : 0;

  return {
    msgtype: 'template_card',
    template_card: {
      card_type: 'button_interaction',
      source: LAICAI_SOURCE,
      main_title: {
        title: `银行对账结果 — ${bankName} ****${last4}`,
        desc: `共导入 ${totalTransactions} 笔交易`,
      },
      emphasis_content: {
        title: `${matchRate}%`,
        desc: '匹配率',
      },
      horizontal_content_list: [
        {
          keyname: '收入合计',
          value: formatAmount(totalIncome),
        },
        {
          keyname: '支出合计',
          value: formatAmount(totalExpense),
        },
        {
          keyname: '银行余额',
          value: formatAmount(bankBalance),
        },
        {
          keyname: '已匹配',
          value: `${matchedCount} 笔`,
        },
        {
          keyname: '待确认',
          value: `${pendingCount} 笔`,
        },
        {
          keyname: '未匹配',
          value: `${unmatchedCount} 笔`,
        },
      ],
      jump_list: [
        {
          type: 1,
          title: '查看完整报告',
          url: reportUrl,
        },
      ],
      button_list: [
        {
          text: '处理待确认',
          key: `reconcile_pending_${taskId}`,
        },
        {
          text: '处理未匹配',
          key: `reconcile_unmatched_${taskId}`,
        },
        {
          type: 1,
          text: '查看完整报告',
          url: reportUrl,
          key: `reconcile_report_${taskId}`,
        },
      ],
      task_id: `reconcile_summary_${taskId}`,
    },
  };
}

// ============================================================================
// B) 逐笔确认匹配
// ============================================================================

/**
 * 构建逐笔匹配确认卡片
 *
 * 展示银行流水 + 建议匹配的凭证 + 置信度，让用户确认
 */
export function buildSingleMatchCard(
  params: SingleMatchParams,
): TemplateCardMessage {
  const {
    taskId,
    index,
    total,
    bankDate,
    bankAmount,
    bankDescription,
    bankCounterparty,
    voucherNo,
    voucherSummary,
    voucherAmount,
    confidence,
  } = params;

  // 构建水平内容列表 (银行交易信息 + 建议匹配凭证)
  const horizontalList: HorizontalContent[] = [
    { keyname: '交易日期', value: bankDate },
    { keyname: '交易金额', value: formatAmount(bankAmount) },
    { keyname: '交易摘要', value: bankDescription },
  ];

  // 对方户名可选
  if (bankCounterparty) {
    horizontalList.push({ keyname: '对方户名', value: bankCounterparty });
  }

  // 分隔: 建议匹配凭证
  horizontalList.push(
    { keyname: '匹配凭证', value: voucherNo },
    { keyname: '凭证摘要', value: voucherSummary },
    { keyname: '凭证金额', value: formatAmount(voucherAmount) },
  );

  return {
    msgtype: 'template_card',
    template_card: {
      card_type: 'button_interaction',
      source: {
        ...LAICAI_SOURCE,
        desc: `匹配置信度: ${CONFIDENCE_LABEL[confidence]}`,
        desc_color: CONFIDENCE_COLOR[confidence],
      },
      main_title: {
        title: `逐笔确认 (${index}/${total})`,
        desc: `AI 建议匹配 — 置信度: ${CONFIDENCE_LABEL[confidence]}`,
      },
      horizontal_content_list: horizontalList,
      button_list: [
        {
          text: '确认匹配',
          key: `match_confirm_${taskId}_${index}`,
        },
        {
          text: '不是这笔',
          key: `match_reject_${taskId}_${index}`,
        },
        {
          text: '下一条',
          key: `match_skip_${taskId}_${index}`,
        },
      ],
      task_id: `match_confirm_${taskId}_${index}`,
    },
  };
}

// ============================================================================
// C) 未匹配交易 — 建议新凭证
// ============================================================================

/**
 * 构建未匹配交易建议卡片
 *
 * 展示无法匹配的银行流水，AI 建议新建凭证的科目和摘要
 */
export function buildUnmatchedSuggestionCard(
  params: UnmatchedSuggestionParams,
): TemplateCardMessage {
  const {
    taskId,
    index,
    total,
    bankDate,
    bankAmount,
    bankDescription,
    bankCounterparty,
    suggestedDebitAccount,
    suggestedCreditAccount,
    suggestedSummary,
  } = params;

  const horizontalList: HorizontalContent[] = [
    { keyname: '交易日期', value: bankDate },
    { keyname: '交易金额', value: formatAmount(bankAmount) },
    { keyname: '交易摘要', value: bankDescription },
  ];

  if (bankCounterparty) {
    horizontalList.push({ keyname: '对方户名', value: bankCounterparty });
  }

  // AI 建议的凭证分录
  horizontalList.push(
    { keyname: '借方科目', value: suggestedDebitAccount },
    { keyname: '贷方科目', value: suggestedCreditAccount },
    { keyname: '凭证摘要', value: suggestedSummary },
  );

  return {
    msgtype: 'template_card',
    template_card: {
      card_type: 'button_interaction',
      source: LAICAI_SOURCE,
      main_title: {
        title: `未匹配交易 (${index}/${total})`,
        desc: 'AI 建议新建以下凭证',
      },
      emphasis_content: {
        title: formatAmount(bankAmount),
        desc: bankAmount >= 0 ? '收入' : '支出',
      },
      horizontal_content_list: horizontalList,
      button_list: [
        {
          text: '确认入账',
          key: `unmatched_confirm_${taskId}_${index}`,
        },
        {
          text: '修改',
          key: `unmatched_edit_${taskId}_${index}`,
        },
        {
          text: '跳过',
          key: `unmatched_skip_${taskId}_${index}`,
        },
      ],
      task_id: `unmatched_suggest_${taskId}_${index}`,
    },
  };
}

// ============================================================================
// D) 对账完成
// ============================================================================

/**
 * 构建对账完成卡片
 *
 * 展示最终匹配率、新建凭证数、余额一致性，提供查看/导出按钮
 */
export function buildReconciliationCompleteCard(
  params: ReconciliationCompleteParams,
): TemplateCardMessage {
  const {
    taskId,
    bankName,
    last4,
    matchRate,
    newVouchersCreated,
    balanceMatched,
    bankBalance,
    bookBalance,
    balanceDiff,
    reconciliationUrl,
    exportUrl,
  } = params;

  const balanceStatus = balanceMatched ? '一致' : '不一致';
  const balanceColor: 0 | 1 | 2 | 3 = balanceMatched ? 1 : 2;

  return {
    msgtype: 'template_card',
    template_card: {
      card_type: 'button_interaction',
      source: {
        ...LAICAI_SOURCE,
        desc: balanceMatched ? '余额一致' : '余额存在差异',
        desc_color: balanceColor,
      },
      main_title: {
        title: `对账完成 — ${bankName} ****${last4}`,
        desc: balanceMatched
          ? '银行余额与账面余额一致'
          : `余额差异 ${formatAmount(balanceDiff)}`,
      },
      emphasis_content: {
        title: `${matchRate}%`,
        desc: '最终匹配率',
      },
      horizontal_content_list: [
        {
          keyname: '新建凭证',
          value: `${newVouchersCreated} 笔`,
        },
        {
          keyname: '银行余额',
          value: formatAmount(bankBalance),
        },
        {
          keyname: '账面余额',
          value: formatAmount(bookBalance),
        },
        {
          keyname: '余额状态',
          value: balanceStatus,
        },
        ...(balanceMatched
          ? []
          : [
              {
                keyname: '余额差异',
                value: formatAmount(balanceDiff),
              } satisfies HorizontalContent,
            ]),
      ],
      jump_list: [
        {
          type: 1 as const,
          title: '在网页端查看余额调节表',
          url: reconciliationUrl,
        },
      ],
      button_list: [
        {
          type: 1,
          text: '查看余额调节表',
          url: reconciliationUrl,
          key: `complete_view_${taskId}`,
        },
        {
          type: 1,
          text: '导出报告',
          url: exportUrl,
          key: `complete_export_${taskId}`,
        },
      ],
      task_id: `reconcile_complete_${taskId}`,
    },
  };
}
