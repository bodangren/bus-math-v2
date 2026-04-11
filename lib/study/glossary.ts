export interface GlossaryTerm {
  slug: string;
  term_en: string;
  term_zh: string;
  def_en: string;
  def_zh: string;
  units: number[];
  topics: string[];
  synonyms: string[];
  related: string[];
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    slug: 'accounting-equation',
    term_en: 'Accounting Equation',
    term_zh: '会计等式',
    def_en: 'The fundamental equation of accounting: Assets = Liabilities + Equity.',
    def_zh: '会计的基本等式：资产 = 负债 + 所有者权益。',
    units: [1],
    topics: ['foundations', 'financial-statements'],
    synonyms: ['balance-sheet-equation'],
    related: ['assets', 'liabilities', 'equity'],
  },
  {
    slug: 'assets',
    term_en: 'Assets',
    term_zh: '资产',
    def_en: 'Resources owned by a business that have future economic value.',
    def_zh: '企业拥有的具有未来经济价值的资源。',
    units: [1, 2, 3],
    topics: ['foundations', 'financial-statements'],
    synonyms: [],
    related: ['accounting-equation', 'liabilities', 'equity'],
  },
  {
    slug: 'liabilities',
    term_en: 'Liabilities',
    term_zh: '负债',
    def_en: 'Obligations of a business to pay others in the future.',
    def_zh: '企业未来向他人支付的义务。',
    units: [1, 2, 3],
    topics: ['foundations', 'financial-statements'],
    synonyms: [],
    related: ['accounting-equation', 'assets', 'equity'],
  },
  {
    slug: 'equity',
    term_en: 'Equity',
    term_zh: '所有者权益',
    def_en: 'The residual interest in the assets of a business after subtracting liabilities.',
    def_zh: '企业资产减去负债后的剩余权益。',
    units: [1, 2, 3],
    topics: ['foundations', 'financial-statements'],
    synonyms: ['owner\'s-equity', 'net-worth'],
    related: ['accounting-equation', 'assets', 'liabilities'],
  },
  {
    slug: 'break-even-point',
    term_en: 'Break-Even Point',
    term_zh: '盈亏平衡点',
    def_en: 'The level of sales where total revenue equals total costs, resulting in zero profit.',
    def_zh: '总收入等于总成本、利润为零的销售水平。',
    units: [5, 6],
    topics: ['cost-accounting', 'cvp-analysis'],
    synonyms: ['breakeven'],
    related: ['fixed-costs', 'variable-costs', 'contribution-margin'],
  },
  {
    slug: 'fixed-costs',
    term_en: 'Fixed Costs',
    term_zh: '固定成本',
    def_en: 'Costs that do not change with the level of production or sales.',
    def_zh: '不随生产或销售水平变化的成本。',
    units: [5, 6],
    topics: ['cost-accounting', 'cvp-analysis'],
    synonyms: ['overhead'],
    related: ['variable-costs', 'break-even-point'],
  },
  {
    slug: 'variable-costs',
    term_en: 'Variable Costs',
    term_zh: '可变成本',
    def_en: 'Costs that change directly with the level of production or sales.',
    def_zh: '随生产或销售水平直接变化的成本。',
    units: [5, 6],
    topics: ['cost-accounting', 'cvp-analysis'],
    synonyms: [],
    related: ['fixed-costs', 'break-even-point', 'contribution-margin'],
  },
  {
    slug: 'contribution-margin',
    term_en: 'Contribution Margin',
    term_zh: '边际贡献',
    def_en: 'Sales revenue minus variable costs, representing the amount available to cover fixed costs and contribute to profit.',
    def_zh: '销售收入减去可变成本，代表可用于覆盖固定成本和贡献利润的金额。',
    units: [5, 6],
    topics: ['cost-accounting', 'cvp-analysis'],
    synonyms: [],
    related: ['variable-costs', 'fixed-costs', 'break-even-point'],
  },
  {
    slug: 'depreciation',
    term_en: 'Depreciation',
    term_zh: '折旧',
    def_en: 'The allocation of the cost of a long-term asset over its useful life.',
    def_zh: '长期资产成本在其使用寿命内的分配。',
    units: [3, 4, 5],
    topics: ['financial-statements', 'cost-accounting'],
    synonyms: ['amortization'],
    related: ['straight-line-depreciation', 'double-declining-balance'],
  },
  {
    slug: 'straight-line-depreciation',
    term_en: 'Straight-Line Depreciation',
    term_zh: '直线折旧法',
    def_en: 'Depreciation method that allocates equal amounts of an asset\'s cost to each period of its useful life.',
    def_zh: '将资产成本等额分配到其使用寿命内每个期间的折旧方法。',
    units: [3, 4, 5],
    topics: ['financial-statements', 'cost-accounting'],
    synonyms: [],
    related: ['depreciation', 'double-declining-balance'],
  },
];

export function getGlossaryTermBySlug(slug: string): GlossaryTerm | undefined {
  return GLOSSARY.find(term => term.slug === slug);
}

export function getGlossaryTermsByUnit(unitNumber: number): GlossaryTerm[] {
  return GLOSSARY.filter(term => term.units.includes(unitNumber));
}

export function getGlossaryTermsByTopic(topic: string): GlossaryTerm[] {
  return GLOSSARY.filter(term => term.topics.includes(topic));
}

export function getAllGlossaryTopics(): string[] {
  const topics = new Set<string>();
  GLOSSARY.forEach(term => term.topics.forEach(topic => topics.add(topic)));
  return Array.from(topics).sort();
}

export function getAllGlossaryUnits(): number[] {
  const units = new Set<number>();
  GLOSSARY.forEach(term => term.units.forEach(unit => units.add(unit)));
  return Array.from(units).sort((a, b) => a - b);
}
