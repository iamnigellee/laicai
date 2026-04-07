/**
 * 企业微信模板卡片 — 税务相关卡片
 *
 * 适用场景：
 *   A) 增值税计算结果
 *   B) 进项税筹划提醒
 *   C) 申报数据准备
 *   D) 发票-凭证-税务一致性检查
 *
 * 使用企业微信 "template_card" 消息类型，card_type = "button_interaction"
 * 文档参考：https://developer.work.weixin.qq.com/document/path/94888
 */

// ============================================================================
// 基础类型定义 — 企业微信模板卡片
// ============================================================================

/** 卡片消息顶层结构 */
export interface WxWorkTemplateCardMessage {
  /** 固定为 "template_card" */
  msgtype: 'template_card';
  template_card: ButtonInteractionCard;
}

/** 按钮交互型模板卡片 */
export interface ButtonInteractionCard {
  /** 固定为 "button_interaction" */
  card_type: 'button_interaction';
  /** 卡片来源，展示在卡片左上角 */
  source: CardSource;
  /** 一级标题 + 可选描述 */
  main_title: MainTitle;
  /** 引用文字区域（灰色底色块） */
  quote_area?: QuoteArea;
  /** 左图右文内容区 */
  horizontal_content_list?: HorizontalContent[];
  /** 按钮列表（最多 6 个） */
  button_list: CardButton[];
  /** 卡片唯一标识，用于回调去重 */
  task_id: string;
}

/** 卡片来源样式 */
export interface CardSource {
  /** 来源图标 URL */
  icon_url?: string;
  /** 来源名称，如 "来财AI" */
  desc?: string;
  /** 来源名称颜色：0=默认灰 1=黑 2=红 3=绿 */
  desc_color?: 0 | 1 | 2 | 3;
}

/** 一级标题 */
export interface MainTitle {
  /** 标题文字 */
  title: string;
  /** 副标题 */
  desc?: string;
}

/** 引用文字区 */
export interface QuoteArea {
  /** 引用类型：0=引用文字 1=引用链接 */
  type?: 0 | 1;
  /** 引用链接 URL */
  url?: string;
  /** 引用标题 */
  title?: string;
  /** 引用内容 */
  quote_text?: string;
}

/** 左图右文水平内容 */
export interface HorizontalContent {
  /** 二级标题（字段名） */
  keyname: string;
  /** 内容值 */
  value?: string;
  /** 链接类型：0=普通文本 1=跳转URL 2=下载附件 3=@某人 */
  type?: 0 | 1 | 2 | 3;
  /** 链接跳转 URL（type=1 时生效） */
  url?: string;
  /** 附件 media_id（type=2 时生效） */
  media_id?: string;
  /** @人 userid（type=3 时生效） */
  userid?: string;
}

/** 按钮定义 */
export interface CardButton {
  /** 按钮文案 */
  text: string;
  /** 按钮样式：1=主要（蓝色） 2=次要（灰色） */
  style?: 1 | 2;
  /** 按钮回调 key，服务端通过此 key 判断用户点了哪个按钮 */
  key: string;
}

// ============================================================================
// 业务数据类型 — 税务卡片入参
// ============================================================================

/** A) 增值税计算结果入参 */
export interface VatCalculationData {
  /** 税期，如 "2026年4月" */
  month: string;
  /** 租户 ID */
  tenantId: string;
  /** 销项税额（分） */
  outputVat: number;
  /** 已认证进项税额（分） */
  inputVat: number;
  /** 上期留抵税额（分） */
  previousCarryForward: number;
  /** 应交增值税（分）= 销项 - 进项 - 留抵 */
  vatPayable: number;
  /** 税负率（百分比，如 1.86 表示 1.86%） */
  taxBurdenRate: number;
  /** 行业参考税负率下限 */
  industryRateLow: number;
  /** 行业参考税负率上限 */
  industryRateHigh: number;
  /** 未认证发票数量 */
  uncertifiedInvoiceCount: number;
  /** 未认证发票对应的可抵扣税额（分），为 0 表示没有 */
  uncertifiedTaxAmount: number;
}

/** B) 进项税筹划提醒入参 */
export interface InputTaxPlanningData {
  /** 税期 */
  month: string;
  /** 租户 ID */
  tenantId: string;
  /** 当前应交增值税（分） */
  currentVatPayable: number;
  /** 优化建议列表 */
  suggestions: TaxPlanSuggestion[];
  /** 最优应交金额（分） */
  optimizedPayable: number;
  /** 总可节省金额（分） */
  totalSavings: number;
}

/** 单条筹划建议 */
export interface TaxPlanSuggestion {
  /** 建议编号 */
  index: number;
  /** 建议描述 */
  description: string;
  /** 该建议可节省金额（分） */
  savingsAmount: number;
}

/** C) 申报数据准备入参 */
export interface TaxFilingData {
  /** 税期 */
  month: string;
  /** 租户 ID */
  tenantId: string;
  /** 应税销售额（分） */
  taxableSales: number;
  /** 销项税额（分） */
  outputVat: number;
  /** 已认证抵扣进项税（分） */
  inputVat: number;
  /** 进项税转出（分） */
  inputVatTransferOut: number;
  /** 上期留抵（分） */
  previousCarryForward: number;
  /** 应交增值税（分） */
  vatPayable: number;
  /** 已预缴（分） */
  prepaid: number;
  /** 应补（退）税（分） */
  netPayable: number;
  /** 交叉校验结果 */
  validations: TaxValidationItem[];
}

/** 校验项 */
export interface TaxValidationItem {
  /** 校验描述 */
  label: string;
  /** 是否通过 */
  passed: boolean;
  /** 差异描述（不通过时显示） */
  discrepancy?: string;
}

/** D) 一致性检查入参 */
export interface ConsistencyCheckData {
  /** 税期 */
  month: string;
  /** 租户 ID */
  tenantId: string;
  /** 检查范围：发票数 */
  invoiceCount: number;
  /** 检查范围：凭证数 */
  voucherCount: number;
  /** 通过项数 */
  passedCount: number;
  /** 异常项列表 */
  anomalies: ConsistencyAnomaly[];
}

/** 单条异常 */
export interface ConsistencyAnomaly {
  /** 异常编号 */
  index: number;
  /** 异常类型分类 */
  category: string;
  /** 异常描述 */
  description: string;
  /** 涉及金额（分） */
  amount: number;
  /** 建议修正方式 */
  suggestedFix: string;
}

// ============================================================================
// 工具函数
// ============================================================================

/** 金额分转元，格式化为中文财务显示 */
function formatCny(amountInCents: number): string {
  const yuan = amountInCents / 100;
  return `¥${yuan.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** 百分比格式化 */
function formatRate(rate: number): string {
  return `${rate.toFixed(2)}%`;
}

/** 生成唯一 task_id（卡片去重用） */
function generateTaskId(prefix: string, tenantId: string): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${tenantId}_${ts}_${rand}`;
}

/** 默认卡片来源 */
const DEFAULT_SOURCE: CardSource = {
  icon_url: 'https://laicai.app/icon/logo-64.png',
  desc: '来财AI',
  desc_color: 0,
};

// ============================================================================
// A) 增值税计算结果卡片
// ============================================================================

/**
 * 构建增值税计算结果模板卡片
 *
 * 展示销项/进项/留抵/应交金额，税负率及行业对比，
 * 未认证发票警告（如有），底部三个操作按钮。
 *
 * @param data - 增值税计算结果数据
 * @returns 企业微信模板卡片消息
 */
export function buildVatCalculationCard(data: VatCalculationData): WxWorkTemplateCardMessage {
  // 税负率状态判断
  const rateInRange = data.taxBurdenRate >= data.industryRateLow
    && data.taxBurdenRate <= data.industryRateHigh;
  const rateLabel = rateInRange ? '✅ 正常' : '⚠️ 偏离行业区间';

  // 引用区：未认证发票警告
  const quoteArea: QuoteArea | undefined = data.uncertifiedInvoiceCount > 0
    ? {
      type: 0,
      title: '⚠️ 未认证发票提醒',
      quote_text: `${data.uncertifiedInvoiceCount} 张专票未认证，`
        + `税额 ${formatCny(data.uncertifiedTaxAmount)}。`
        + `认证后应交可降至 ${formatCny(data.vatPayable - data.uncertifiedTaxAmount)}，`
        + `少交 ${formatCny(data.uncertifiedTaxAmount)}。`,
    }
    : undefined;

  // 水平内容区：核心税额字段
  const horizontalContentList: HorizontalContent[] = [
    { keyname: '销项税额', value: formatCny(data.outputVat) },
    { keyname: '已认证进项税额', value: formatCny(data.inputVat) },
    { keyname: '上期留抵', value: formatCny(data.previousCarryForward) },
    { keyname: '应交增值税', value: formatCny(data.vatPayable) },
    {
      keyname: '税负率',
      value: `${formatRate(data.taxBurdenRate)}`
        + `（行业 ${formatRate(data.industryRateLow)}-${formatRate(data.industryRateHigh)} ${rateLabel}）`,
    },
  ];

  return {
    msgtype: 'template_card',
    template_card: {
      card_type: 'button_interaction',
      source: DEFAULT_SOURCE,
      main_title: {
        title: `增值税计算 — ${data.month}`,
        desc: `应交增值税 ${formatCny(data.vatPayable)}`,
      },
      quote_area: quoteArea,
      horizontal_content_list: horizontalContentList,
      button_list: [
        { text: '查看销项明细', style: 1, key: `vat_output_detail_${data.tenantId}` },
        { text: '查看进项明细', style: 2, key: `vat_input_detail_${data.tenantId}` },
        { text: '未认证发票', style: 2, key: `vat_uncertified_${data.tenantId}` },
      ],
      task_id: generateTaskId('vat_calc', data.tenantId),
    },
  };
}

// ============================================================================
// B) 进项税筹划提醒卡片
// ============================================================================

/**
 * 构建进项税筹划提醒模板卡片
 *
 * 提醒式/建议式卡片，展示当前应交金额、优化建议列表、
 * 潜在节省金额，底部三个操作按钮。
 *
 * @param data - 进项税筹划数据
 * @returns 企业微信模板卡片消息
 */
export function buildInputTaxPlanningCard(data: InputTaxPlanningData): WxWorkTemplateCardMessage {
  // 将建议列表拼接为引用区文字
  const suggestionsText = data.suggestions
    .map((s) => `${circledNumber(s.index)} ${s.description}\n   → 可节省 ${formatCny(s.savingsAmount)}`)
    .join('\n\n');

  return {
    msgtype: 'template_card',
    template_card: {
      card_type: 'button_interaction',
      source: {
        ...DEFAULT_SOURCE,
        desc_color: 3, // 绿色，表示"建议/提醒"
      },
      main_title: {
        title: `💡 增值税筹划提醒 — ${data.month}`,
        desc: '申报前优化建议，可降低应交税额',
      },
      quote_area: {
        type: 0,
        title: '优化方案',
        quote_text: suggestionsText
          + `\n\n最优应交：${formatCny(data.optimizedPayable)}`
          + `（比当前少交 ${formatCny(data.totalSavings)}）`,
      },
      horizontal_content_list: [
        { keyname: '当前应交增值税', value: formatCny(data.currentVatPayable) },
        { keyname: '优化后应交', value: formatCny(data.optimizedPayable) },
        { keyname: '可节省金额', value: formatCny(data.totalSavings) },
      ],
      button_list: [
        { text: '帮我处理', style: 1, key: `tax_plan_process_${data.tenantId}` },
        { text: '查看详情', style: 2, key: `tax_plan_detail_${data.tenantId}` },
        { text: '先不管', style: 2, key: `tax_plan_dismiss_${data.tenantId}` },
      ],
      task_id: generateTaskId('tax_plan', data.tenantId),
    },
  };
}

// ============================================================================
// C) 申报数据准备卡片
// ============================================================================

/**
 * 构建税务申报数据准备模板卡片
 *
 * 汇总销项/进项/应交分列，交叉校验状态，
 * 底部提供导出和明细查看按钮。
 *
 * @param data - 申报数据
 * @returns 企业微信模板卡片消息
 */
export function buildTaxFilingCard(data: TaxFilingData): WxWorkTemplateCardMessage {
  // 交叉校验汇总
  const allPassed = data.validations.every((v) => v.passed);
  const failedItems = data.validations.filter((v) => !v.passed);

  // 校验结果文本
  let validationText: string;
  if (allPassed) {
    validationText = '✅ 全部校验通过，销项/进项/凭证金额一致。';
  } else {
    const lines = failedItems.map(
      (v) => `⚠️ ${v.label}：${v.discrepancy ?? '存在差异'}`,
    );
    validationText = lines.join('\n');
  }

  return {
    msgtype: 'template_card',
    template_card: {
      card_type: 'button_interaction',
      source: DEFAULT_SOURCE,
      main_title: {
        title: `申报数据准备 — ${data.month}`,
        desc: allPassed
          ? '数据校验通过，可用于电子税务局填报'
          : '⚠️ 存在数据差异，请先处理',
      },
      quote_area: {
        type: 0,
        title: '交叉校验',
        quote_text: validationText,
      },
      horizontal_content_list: [
        { keyname: '应税销售额', value: formatCny(data.taxableSales) },
        { keyname: '销项税额', value: formatCny(data.outputVat) },
        { keyname: '认证抵扣进项税', value: formatCny(data.inputVat) },
        { keyname: '进项税转出', value: formatCny(data.inputVatTransferOut) },
        { keyname: '上期留抵', value: formatCny(data.previousCarryForward) },
        { keyname: '应交增值税', value: formatCny(data.vatPayable) },
        { keyname: '已预缴', value: formatCny(data.prepaid) },
        { keyname: '应补（退）税', value: formatCny(data.netPayable) },
      ],
      button_list: [
        { text: '导出Excel', style: 1, key: `filing_export_${data.tenantId}` },
        { text: '查看进项明细', style: 2, key: `filing_input_detail_${data.tenantId}` },
        { text: '查看销项明细', style: 2, key: `filing_output_detail_${data.tenantId}` },
      ],
      task_id: generateTaskId('tax_filing', data.tenantId),
    },
  };
}

// ============================================================================
// D) 发票-凭证-税务一致性检查卡片
// ============================================================================

/**
 * 构建一致性检查结果模板卡片
 *
 * 展示通过/异常计数，异常明细列表（类别+建议修正），
 * 底部按钮对应各异常项的快速处理入口。
 *
 * @param data - 一致性检查结果数据
 * @returns 企业微信模板卡片消息
 */
export function buildConsistencyCheckCard(data: ConsistencyCheckData): WxWorkTemplateCardMessage {
  const totalChecked = data.passedCount + data.anomalies.length;
  const hasAnomalies = data.anomalies.length > 0;

  // 异常明细拼接为引用区文字
  const anomalyLines = data.anomalies.map((a) =>
    `${circledNumber(a.index)} [${a.category}]\n`
    + `   ${a.description}（${formatCny(a.amount)}）\n`
    + `   → 建议：${a.suggestedFix}`,
  );

  const quoteText = hasAnomalies
    ? anomalyLines.join('\n\n')
    : '✅ 全部通过，未发现异常。';

  // 按钮：异常数 <= 2 时为具体处理按钮 + "全部查看"
  //       异常数 > 2 时前两项 + "全部查看"
  const buttons: CardButton[] = [];
  if (hasAnomalies) {
    // 取前两条异常作为快捷按钮
    const quickItems = data.anomalies.slice(0, 2);
    quickItems.forEach((a) => {
      buttons.push({
        text: `处理第${circledNumber(a.index)}项`,
        style: 1,
        key: `consistency_fix_${a.index}_${data.tenantId}`,
      });
    });
    buttons.push({
      text: '全部查看',
      style: 2,
      key: `consistency_view_all_${data.tenantId}`,
    });
  } else {
    // 无异常时仅提供查看按钮
    buttons.push({
      text: '查看完整报告',
      style: 2,
      key: `consistency_view_all_${data.tenantId}`,
    });
  }

  return {
    msgtype: 'template_card',
    template_card: {
      card_type: 'button_interaction',
      source: {
        ...DEFAULT_SOURCE,
        desc_color: hasAnomalies ? 2 : 3, // 红色=有异常，绿色=全部通过
      },
      main_title: {
        title: `一致性检查 — ${data.month}`,
        desc: `检查 ${data.invoiceCount} 张发票 / ${data.voucherCount} 笔凭证`
          + ` — 通过 ${data.passedCount}/${totalChecked}`
          + (hasAnomalies ? `，异常 ${data.anomalies.length} 项` : ''),
      },
      quote_area: {
        type: 0,
        title: hasAnomalies ? '⚠️ 异常明细' : '检查结果',
        quote_text: quoteText,
      },
      horizontal_content_list: [
        { keyname: '检查发票数', value: `${data.invoiceCount} 张` },
        { keyname: '检查凭证数', value: `${data.voucherCount} 笔` },
        { keyname: '通过', value: `${data.passedCount} 项` },
        { keyname: '异常', value: `${data.anomalies.length} 项` },
      ],
      button_list: buttons,
      task_id: generateTaskId('consistency', data.tenantId),
    },
  };
}

// ============================================================================
// 辅助：带圈数字 ①②③...
// ============================================================================

/** 数字转带圈数字符号（1-20），超出范围回退为 (n) 格式 */
function circledNumber(n: number): string {
  const circled = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳';
  if (n >= 1 && n <= 20) {
    return circled[n - 1];
  }
  return `(${n})`;
}

// ============================================================================
// 使用示例（开发/调试用，不会在生产环境执行）
// ============================================================================

/* eslint-disable @typescript-eslint/no-unused-vars */

/** A) 增值税计算示例 */
const _exampleVatCalc = buildVatCalculationCard({
  month: '2026年4月',
  tenantId: 'tenant_001',
  outputVat: 3_120_000,       // ¥31,200.00
  inputVat: 2_674_044,        // ¥26,740.44
  previousCarryForward: 0,
  vatPayable: 445_956,        // ¥4,459.56
  taxBurdenRate: 1.86,
  industryRateLow: 1.5,
  industryRateHigh: 3.0,
  uncertifiedInvoiceCount: 1,
  uncertifiedTaxAmount: 104_000, // ¥1,040.00
});

/** B) 进项税筹划提醒示例 */
const _exampleTaxPlanning = buildInputTaxPlanningCard({
  month: '2026年4月',
  tenantId: 'tenant_001',
  currentVatPayable: 445_956,
  suggestions: [
    {
      index: 1,
      description: '认证剩余 1 张专票（深圳ZZ电子）',
      savingsAmount: 104_000,
    },
    {
      index: 2,
      description: '2 张上月专票尚未入账（苏州WW材料、广州VV物流）',
      savingsAmount: 83_000,
    },
  ],
  optimizedPayable: 258_956,
  totalSavings: 187_000,
});

/** C) 申报数据准备示例 */
const _exampleFiling = buildTaxFilingCard({
  month: '2026年4月',
  tenantId: 'tenant_001',
  taxableSales: 24_000_000,
  outputVat: 3_120_000,
  inputVat: 2_674_044,
  inputVatTransferOut: 0,
  previousCarryForward: 0,
  vatPayable: 445_956,
  prepaid: 0,
  netPayable: 445_956,
  validations: [
    { label: '销项 = 销售发票税额合计', passed: true },
    { label: '进项 = 已认证发票税额合计', passed: true },
    { label: '凭证金额 = 发票金额', passed: true },
  ],
});

/** D) 一致性检查示例 */
const _exampleConsistency = buildConsistencyCheckCard({
  month: '2026年4月',
  tenantId: 'tenant_001',
  invoiceCount: 48,
  voucherCount: 52,
  passedCount: 45,
  anomalies: [
    {
      index: 1,
      category: '凭证有但发票缺失',
      description: '04-08 管理费用-差旅费',
      amount: 200_000,
      suggestedFix: '补充发票或附报销单',
    },
    {
      index: 2,
      category: '发票金额与凭证不一致',
      description: '04-12 上海YY贸易 发票¥5,200 vs 凭证¥5,000',
      amount: 20_000,
      suggestedFix: '核实金额并修正凭证',
    },
    {
      index: 3,
      category: '已入账但未认证专票',
      description: '04-15 深圳ZZ电子 税额¥1,040',
      amount: 800_000,
      suggestedFix: '尽快认证，否则不能抵扣',
    },
  ],
});
