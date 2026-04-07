/**
 * 企业微信模板卡片 — 财务报表与查询卡片
 *
 * 基于企业微信「模板卡片消息」button_interaction 类型：
 * https://developer.work.weixin.qq.com/document/path/94888
 *
 * 本文件导出 4 种财务场景的卡片构建函数：
 *   A) 利润概览  buildProfitOverviewCard
 *   B) 费用分析  buildExpenseAnalysisCard
 *   C) 应收应付  buildReceivablesPayablesCard
 *   D) 所得税预估 buildIncomeTaxEstimateCard
 */

// ============================================================
// 企业微信模板卡片通用类型
// ============================================================

/** 模板卡片消息顶层结构 */
export interface WecomTemplateCardMessage {
  /** 固定为 "template_card" */
  msgtype: 'template_card';
  template_card: TemplateCard;
}

/** button_interaction 类型的模板卡片 */
export interface TemplateCard {
  /** 卡片类型，固定为 "button_interaction" */
  card_type: 'button_interaction';
  /** 卡片来源样式 */
  source: CardSource;
  /** 一级标题 */
  main_title: MainTitle;
  /** 关键数据区（最多 2 个） */
  emphasis_content?: EmphasisContent;
  /** 引用文字区域 */
  quote_area?: QuoteArea;
  /** 二级标题 + 文本内容区（最多 6 行） */
  sub_title_text?: string;
  /** 水平内容区（最多 6 行） */
  horizontal_content_list?: HorizontalContent[];
  /** 跳转指引区 */
  jump_list?: JumpItem[];
  /** 整体卡片点击跳转 url */
  card_action?: CardAction;
  /** 按钮列表（最多 6 个） */
  button_list: ButtonItem[];
  /** 按钮选择型（二选一时使用） */
  button_selection?: ButtonSelection;
  /** 卡片回调任务 id，用于更新卡片 */
  task_id?: string;
}

/** 卡片来源信息 */
export interface CardSource {
  /** 来源图片 url */
  icon_url?: string;
  /** 来源文字，推荐不超过 13 个字 */
  desc?: string;
  /** 来源描述颜色：0(默认) | 1(绿) | 2(红) | 3(黄) */
  desc_color?: 0 | 1 | 2 | 3;
}

/** 一级标题 */
export interface MainTitle {
  /** 标题文字，推荐不超过 26 个字 */
  title: string;
  /** 标题辅助信息，推荐不超过 26 个字 */
  desc?: string;
}

/** 关键数据 */
export interface EmphasisContent {
  /** 关键数据标题 */
  title: string;
  /** 关键数据描述 */
  desc?: string;
}

/** 引用区域 */
export interface QuoteArea {
  /** 引用类型：0(文本) | 1(链接) */
  type?: 0 | 1;
  /** 引用链接 */
  url?: string;
  /** 引用标题 */
  title?: string;
  /** 引用摘要 */
  quote_text?: string;
}

/** 水平内容（一行两列：keyname + value） */
export interface HorizontalContent {
  /** 二级标题，推荐不超过 5 个字 */
  keyname: string;
  /** 二级标题对应值 */
  value?: string;
  /** 链接类型：0(普通文本) | 1(url) | 2(下载附件) | 3(点击跳转成员详情) */
  type?: 0 | 1 | 2 | 3;
  /** 链接地址 (type=1 时有效) */
  url?: string;
  /** 附件 media_id (type=2 时有效) */
  media_id?: string;
  /** userid (type=3 时有效) */
  userid?: string;
}

/** 跳转指引 */
export interface JumpItem {
  /** 跳转链接类型：0(不是链接) | 1(url) | 2(小程序) */
  type?: 0 | 1 | 2;
  /** 跳转链接标题 */
  title: string;
  /** 跳转链接 url (type=1 时有效) */
  url?: string;
  /** 跳转小程序 appid (type=2 时有效) */
  appid?: string;
  /** 跳转小程序路径 (type=2 时有效) */
  pagepath?: string;
}

/** 整体卡片点击跳转 */
export interface CardAction {
  /** 跳转类型：1(url) | 2(小程序) */
  type: 1 | 2;
  /** 跳转 url */
  url?: string;
  /** 小程序 appid */
  appid?: string;
  /** 小程序路径 */
  pagepath?: string;
}

/** 按钮 */
export interface ButtonItem {
  /** 按钮文案，推荐不超过 10 个字 */
  text: string;
  /** 按钮样式：1(强调/主按钮) | 2(常规/次按钮) */
  style?: 1 | 2;
  /** 按钮 key，回调时透传 */
  key: string;
}

/** 按钮选择型 */
export interface ButtonSelection {
  /** question_key */
  question_key: string;
  /** 下拉选项列表 */
  option_list: { id: string; text: string }[];
  /** 默认选中项 id */
  selected_id?: string;
}

// ============================================================
// A) 利润概览卡片
// ============================================================

/** 利润概览卡片入参 */
export interface ProfitOverviewData {
  /** 报告期间，如 "2026年3月" */
  period: string;
  /** 营业收入（元） */
  revenue: number;
  /** 营业成本（元） */
  cogs: number;
  /** 毛利润（元） */
  grossProfit: number;
  /** 毛利率（百分比，如 42.5） */
  grossMarginPct: number;
  /** 期间费用明细 */
  periodExpenses: {
    /** 销售费用 */
    selling: number;
    /** 管理费用 */
    admin: number;
    /** 财务费用 */
    financial: number;
    /** 研发费用（可选） */
    rnd?: number;
  };
  /** 净利润（元） */
  netProfit: number;
  /** 环比变化百分比（正数为增长） */
  momChangePct: number;
  /** 同比变化百分比（正数为增长） */
  yoyChangePct: number;
  /** Web 端完整利润表链接 */
  detailUrl: string;
  /** 回调任务 id */
  taskId: string;
}

/** 格式化金额为万元显示 */
function formatWan(amount: number): string {
  if (Math.abs(amount) >= 10_000) {
    return `¥${(amount / 10_000).toFixed(2)}万`;
  }
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
}

/** 生成环比/同比变化文字（带方向箭头） */
function changeText(label: string, pct: number): string {
  const arrow = pct > 0 ? '↑' : pct < 0 ? '↓' : '→';
  const sign = pct > 0 ? '+' : '';
  return `${label} ${sign}${pct.toFixed(1)}% ${arrow}`;
}

/**
 * 构建「利润概览」模板卡片
 *
 * 展示要素：
 * - 净利润作为核心关键数据
 * - 收入、成本、毛利（含毛利率）、各项费用分列
 * - 环比 + 同比变化
 * - 按钮：查看完整利润表 / 费用明细 / 趋势分析
 */
export function buildProfitOverviewCard(
  data: ProfitOverviewData,
): WecomTemplateCardMessage {
  const { periodExpenses } = data;
  const totalExpenses =
    periodExpenses.selling +
    periodExpenses.admin +
    periodExpenses.financial +
    (periodExpenses.rnd ?? 0);

  // 构建变化描述
  const momText = changeText('环比', data.momChangePct);
  const yoyText = changeText('同比', data.yoyChangePct);

  return {
    msgtype: 'template_card',
    template_card: {
      card_type: 'button_interaction',
      source: {
        icon_url: '', // 企业应用头像，部署时填入实际 url
        desc: 'laicai 财务助手',
        desc_color: 0,
      },
      main_title: {
        title: `${data.period} 利润概览`,
        desc: `${momText}  |  ${yoyText}`,
      },
      // 净利润作为关键数据高亮
      emphasis_content: {
        title: formatWan(data.netProfit),
        desc: '净利润',
      },
      horizontal_content_list: [
        { keyname: '营业收入', value: formatWan(data.revenue) },
        { keyname: '营业成本', value: formatWan(data.cogs) },
        {
          keyname: '毛利润',
          value: `${formatWan(data.grossProfit)}（${data.grossMarginPct.toFixed(1)}%）`,
        },
        { keyname: '销售费用', value: formatWan(periodExpenses.selling) },
        { keyname: '管理费用', value: formatWan(periodExpenses.admin) },
        {
          keyname: '费用合计',
          value: formatWan(totalExpenses),
        },
      ],
      card_action: {
        type: 1,
        url: data.detailUrl,
      },
      task_id: data.taskId,
      button_list: [
        { text: '查看完整利润表', style: 1, key: 'profit_full_report' },
        { text: '费用明细', style: 2, key: 'profit_expense_detail' },
        { text: '趋势分析', style: 2, key: 'profit_trend_analysis' },
      ],
    },
  };
}

// ============================================================
// B) 费用分析卡片
// ============================================================

/** 费用分类项 */
export interface ExpenseCategory {
  /** 费用类别名称 */
  name: string;
  /** 金额（元） */
  amount: number;
  /** 变化百分比（正数为增加） */
  changePct: number;
}

/** 费用分析卡片入参 */
export interface ExpenseAnalysisData {
  /** 报告期间 */
  period: string;
  /** 费用分类列表（按金额降序，取 top 3-5） */
  categories: ExpenseCategory[];
  /** AI 洞察/建议文字 */
  aiInsight: string;
  /** Web 端费用分析链接 */
  detailUrl: string;
  /** 回调任务 id */
  taskId: string;
}

/**
 * 构建「费用分析」模板卡片
 *
 * 展示要素：
 * - Top 费用分类及变化百分比
 * - 增幅最大的类别前加 ⚠️ 标记
 * - AI 建议摘要
 * - 按钮：查看全部费用 / 按部门分析
 */
export function buildExpenseAnalysisCard(
  data: ExpenseAnalysisData,
): WecomTemplateCardMessage {
  // 找出增幅最大的分类
  const maxIncrease = data.categories.reduce(
    (max, cat) => (cat.changePct > max.changePct ? cat : max),
    data.categories[0],
  );

  // 构建水平内容列表（每行显示费用类别 + 金额与变化）
  const horizontalList: HorizontalContent[] = data.categories.map((cat) => {
    const arrow = cat.changePct > 0 ? '↑' : cat.changePct < 0 ? '↓' : '→';
    const sign = cat.changePct > 0 ? '+' : '';
    const prefix = cat === maxIncrease && cat.changePct > 0 ? '⚠️ ' : '';
    return {
      keyname: `${prefix}${cat.name}`,
      value: `${formatWan(cat.amount)}  ${sign}${cat.changePct.toFixed(1)}%${arrow}`,
    };
  });

  return {
    msgtype: 'template_card',
    template_card: {
      card_type: 'button_interaction',
      source: {
        icon_url: '',
        desc: 'laicai 财务助手',
        desc_color: 0,
      },
      main_title: {
        title: `${data.period} 费用变化`,
        desc: `AI 识别到 ${data.categories.length} 个主要费用变动`,
      },
      horizontal_content_list: horizontalList,
      // AI 洞察放在引用区域
      quote_area: {
        type: 0,
        title: '💡 AI 建议',
        quote_text: data.aiInsight,
      },
      card_action: {
        type: 1,
        url: data.detailUrl,
      },
      task_id: data.taskId,
      button_list: [
        { text: '查看全部费用', style: 1, key: 'expense_full_list' },
        { text: '按部门分析', style: 2, key: 'expense_by_department' },
      ],
    },
  };
}

// ============================================================
// C) 应收应付概览卡片
// ============================================================

/** 账龄分布 */
export interface AgingBuckets {
  /** 30 天以内（元） */
  within30: number;
  /** 31-60 天（元） */
  days31to60: number;
  /** 61-90 天（元） */
  days61to90: number;
  /** 91-180 天（元） */
  days91to180: number;
  /** 180 天以上（元） */
  over180: number;
}

/** 应收应付概览卡片入参 */
export interface ReceivablesPayablesData {
  /** 应收账款总额（元） */
  totalReceivable: number;
  /** 应付账款总额（元） */
  totalPayable: number;
  /** 应收账龄分布 */
  receivableAging: AgingBuckets;
  /** 应付账龄分布 */
  payableAging: AgingBuckets;
  /** 高风险应收项数量（逾期 > 90 天） */
  highRiskCount: number;
  /** Web 端应收应付分析链接 */
  detailUrl: string;
  /** 回调任务 id */
  taskId: string;
}

/**
 * 构建「应收应付概览」模板卡片
 *
 * 展示要素：
 * - 应收、应付总额
 * - 应收账龄分布（30/60/90/180 天）
 * - 高风险项数量
 * - 按钮：应收明细 / 应付明细 / 账龄分析
 */
export function buildReceivablesPayablesCard(
  data: ReceivablesPayablesData,
): WecomTemplateCardMessage {
  const { receivableAging } = data;

  // 计算逾期金额（> 90 天部分）
  const overdueAmount = receivableAging.days91to180 + receivableAging.over180;

  // 高风险提示颜色
  const sourceColor: 0 | 1 | 2 | 3 = data.highRiskCount > 0 ? 2 : 1;

  return {
    msgtype: 'template_card',
    template_card: {
      card_type: 'button_interaction',
      source: {
        icon_url: '',
        desc: data.highRiskCount > 0
          ? `⚠️ ${data.highRiskCount} 笔高风险应收`
          : '应收应付状况良好',
        desc_color: sourceColor,
      },
      main_title: {
        title: '应收应付概览',
        desc: `净敞口 ${formatWan(data.totalReceivable - data.totalPayable)}`,
      },
      emphasis_content: {
        title: formatWan(data.totalReceivable),
        desc: '应收账款总额',
      },
      horizontal_content_list: [
        { keyname: '应付总额', value: formatWan(data.totalPayable) },
        { keyname: '30天内', value: formatWan(receivableAging.within30) },
        { keyname: '31-60天', value: formatWan(receivableAging.days31to60) },
        { keyname: '61-90天', value: formatWan(receivableAging.days61to90) },
        { keyname: '90天以上', value: formatWan(overdueAmount) },
        {
          keyname: '高风险项',
          value: data.highRiskCount > 0
            ? `${data.highRiskCount} 笔（${formatWan(overdueAmount)}）`
            : '无',
        },
      ],
      card_action: {
        type: 1,
        url: data.detailUrl,
      },
      task_id: data.taskId,
      button_list: [
        { text: '应收明细', style: 1, key: 'ar_detail' },
        { text: '应付明细', style: 2, key: 'ap_detail' },
        { text: '账龄分析', style: 2, key: 'aging_analysis' },
      ],
    },
  };
}

// ============================================================
// D) 所得税预估卡片
// ============================================================

/** 所得税预估卡片入参 */
export interface IncomeTaxEstimateData {
  /** 报告期间（季度），如 "2026年Q1" */
  period: string;
  /** 本季利润总额（元） */
  quarterlyProfit: number;
  /** 纳税调整后应纳税所得额（元） */
  taxableIncome: number;
  /** 适用税率（百分比，如 25） */
  applicableRatePct: number;
  /** 应纳所得税额（元） */
  taxAmount: number;
  /** 已预缴金额（元） */
  prepaidAmount: number;
  /** 应补（退）金额（元，正数为应补） */
  balanceDue: number;
  /** 是否享受小微企业优惠税率 */
  isSmallBusiness: boolean;
  /** 小微企业实际优惠税率（如 5），仅 isSmallBusiness=true 时有意义 */
  preferentialRatePct?: number;
  /** Web 端利润明细链接 */
  detailUrl: string;
  /** 回调任务 id */
  taskId: string;
}

/**
 * 构建「所得税预估」模板卡片
 *
 * 展示要素：
 * - 本季利润、应纳税所得额、适用税率
 * - 应纳税额、已预缴、应补（退）
 * - 小微企业优惠标识
 * - 按钮：查看利润明细 / 模拟收入变化
 */
export function buildIncomeTaxEstimateCard(
  data: IncomeTaxEstimateData,
): WecomTemplateCardMessage {
  // 税率展示文字
  const rateDisplay = data.isSmallBusiness
    ? `${data.preferentialRatePct ?? data.applicableRatePct}%（小微优惠）`
    : `${data.applicableRatePct}%`;

  // 应补/退文字
  const balanceLabel = data.balanceDue >= 0 ? '应补税额' : '应退税额';
  const balanceValue = formatWan(Math.abs(data.balanceDue));

  // 来源描述颜色：绿色=应退/持平，黄色=应补
  const sourceColor: 0 | 1 | 2 | 3 = data.balanceDue > 0 ? 3 : 1;

  return {
    msgtype: 'template_card',
    template_card: {
      card_type: 'button_interaction',
      source: {
        icon_url: '',
        desc: data.isSmallBusiness
          ? '🏷️ 享受小微企业优惠'
          : 'laicai 税务估算',
        desc_color: sourceColor,
      },
      main_title: {
        title: `${data.period} 所得税预估`,
        desc: `适用税率 ${rateDisplay}`,
      },
      emphasis_content: {
        title: formatWan(data.taxAmount),
        desc: '预估应纳税额',
      },
      horizontal_content_list: [
        { keyname: '本季利润', value: formatWan(data.quarterlyProfit) },
        { keyname: '应税所得', value: formatWan(data.taxableIncome) },
        { keyname: '适用税率', value: rateDisplay },
        { keyname: '已预缴', value: formatWan(data.prepaidAmount) },
        { keyname: balanceLabel, value: balanceValue },
      ],
      // 提示引用区：小微企业政策说明
      ...(data.isSmallBusiness
        ? {
            quote_area: {
              type: 0 as const,
              title: '📋 优惠政策',
              quote_text: `符合小型微利企业条件，应纳税所得额 ${formatWan(data.taxableIncome)} 适用 ${data.preferentialRatePct ?? data.applicableRatePct}% 优惠税率`,
            },
          }
        : {}),
      card_action: {
        type: 1,
        url: data.detailUrl,
      },
      task_id: data.taskId,
      button_list: [
        { text: '查看利润明细', style: 1, key: 'tax_profit_detail' },
        { text: '模拟收入变化', style: 2, key: 'tax_simulate_revenue' },
      ],
    },
  };
}

// ============================================================
// 按钮回调 key 常量（供 Gateway 路由使用）
// ============================================================

/** 所有卡片按钮的回调 key 枚举 */
export const CARD_BUTTON_KEYS = {
  // 利润概览
  PROFIT_FULL_REPORT: 'profit_full_report',
  PROFIT_EXPENSE_DETAIL: 'profit_expense_detail',
  PROFIT_TREND_ANALYSIS: 'profit_trend_analysis',
  // 费用分析
  EXPENSE_FULL_LIST: 'expense_full_list',
  EXPENSE_BY_DEPARTMENT: 'expense_by_department',
  // 应收应付
  AR_DETAIL: 'ar_detail',
  AP_DETAIL: 'ap_detail',
  AGING_ANALYSIS: 'aging_analysis',
  // 所得税预估
  TAX_PROFIT_DETAIL: 'tax_profit_detail',
  TAX_SIMULATE_REVENUE: 'tax_simulate_revenue',
} as const;

/** 按钮回调 key 联合类型 */
export type CardButtonKey =
  (typeof CARD_BUTTON_KEYS)[keyof typeof CARD_BUTTON_KEYS];
