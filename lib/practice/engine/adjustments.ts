export type AdjustmentScenarioKind = 'deferral' | 'accrual' | 'depreciation';
export type DeferralRecordingMethod = 'asset' | 'expense';
export type AccrualRecordingKind = 'revenue' | 'expense';
export type DepreciationMethod = 'straight-line' | 'variable-salvage';

export interface AdjustmentEntry {
  debitLabel: string;
  creditLabel: string;
  amount: number;
}

export interface AdjustmentScenarioBase {
  seed: number;
  kind: AdjustmentScenarioKind;
  title: string;
  stem: string;
  reportingDate: string;
  amount: number;
  entry: AdjustmentEntry;
}

export interface DeferralAdjustmentScenario extends AdjustmentScenarioBase {
  kind: 'deferral';
  method: DeferralRecordingMethod;
  accountLabel: string;
  assetAccountLabel: string;
  expenseAccountLabel: string;
  startDate: string;
  coverageMonths: number;
  elapsedMonths: number;
  originalAmount: number;
  adjustmentAmount: number;
  remainingAmount: number;
}

export interface AccrualAdjustmentScenario extends AdjustmentScenarioBase {
  kind: 'accrual';
  accrualKind: AccrualRecordingKind;
  accountLabel: string;
  incurredDate: string;
  daysAccrued: number;
}

export interface DepreciationAdjustmentScenario extends AdjustmentScenarioBase {
  kind: 'depreciation';
  method: DepreciationMethod;
  assetCategory: string;
  purchaseDate: string;
  usefulLifeMonths: number;
  salvageValue: number;
  depreciableBase: number;
  monthsUsed: number;
  monthlyDepreciation: number;
  depreciationExpense: number;
  accumulatedDepreciation: number;
  carryingAmount: number;
}

export type AdjustmentScenario =
  | DeferralAdjustmentScenario
  | AccrualAdjustmentScenario
  | DepreciationAdjustmentScenario;

export interface DeferralAdjustmentConfig {
  accountLabel?: string;
  amount?: number;
  coverageMonths?: number;
  initialRecordingMethod?: DeferralRecordingMethod;
  reportingDate?: string;
  startDate?: string;
}

export interface AccrualAdjustmentConfig {
  accountLabel?: string;
  amount?: number;
  accrualKind?: AccrualRecordingKind;
  incurredDate?: string;
  reportingDate?: string;
}

export interface DepreciationAdjustmentConfig {
  assetCategory?: string;
  cost?: number;
  salvageValue?: number;
  usefulLifeMonths?: number;
  method?: DepreciationMethod;
  purchaseDate?: string;
  reportingDate?: string;
}

export interface AdjustmentScenarioConfig {
  scenarioKind?: AdjustmentScenarioKind;
  deferral?: DeferralAdjustmentConfig;
  accrual?: AccrualAdjustmentConfig;
  depreciation?: DepreciationAdjustmentConfig;
}

const DEFAULT_DEFERRAL_LABELS = ['Insurance', 'Rent', 'Supplies', 'Software Subscription'] as const;
const DEFAULT_ACCRUAL_REVENUE_LABELS = ['Service Revenue', 'Consulting Revenue', 'Interest Revenue'] as const;
const DEFAULT_ACCRUAL_EXPENSE_LABELS = ['Wages Expense', 'Utilities Expense', 'Insurance Expense'] as const;
const DEFAULT_ASSET_CATEGORIES = ['Equipment', 'Office Furniture', 'Computers', 'Delivery Truck'] as const;
const DEFAULT_DEFERRAL_AMOUNTS = [600, 900, 1200, 1800, 2400] as const;
const DEFAULT_ACCRUAL_AMOUNTS = [240, 360, 480, 600, 720, 840] as const;
const DEFAULT_DEPRECIATION_COSTS = [2400, 3600, 4800, 7200, 9600] as const;
const DEFAULT_COVERAGE_MONTHS = [6, 9, 12] as const;
const DEFAULT_USEFUL_LIFE_MONTHS = [12, 24, 36, 60] as const;
const DEFAULT_SCENARIO_KINDS: AdjustmentScenarioKind[] = ['deferral', 'accrual', 'depreciation'];

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInt(rng: () => number, min: number, max: number) {
  const lower = Math.ceil(min);
  const upper = Math.floor(max);
  if (upper <= lower) {
    return lower;
  }

  return Math.floor(rng() * (upper - lower + 1)) + lower;
}

function pick<T>(items: readonly T[], rng: () => number) {
  return items[randomInt(rng, 0, items.length - 1)];
}

function parseIsoDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ISO date: ${value}`);
  }
  return date;
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(baseDate: string, offset: number) {
  const date = parseIsoDate(baseDate);
  date.setUTCDate(date.getUTCDate() + offset);
  return toIsoDate(date);
}

function addMonths(baseDate: string, offset: number) {
  const date = parseIsoDate(baseDate);
  date.setUTCMonth(date.getUTCMonth() + offset);
  return toIsoDate(date);
}

function differenceInDays(startDate: string, endDate: string) {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / millisecondsPerDay) + 1);
}

function differenceInMonthsInclusive(startDate: string, endDate: string) {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  const monthDiff = (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + (end.getUTCMonth() - start.getUTCMonth()) + 1;
  return Math.max(1, monthDiff);
}

function formatAmount(amount: number) {
  return amount.toLocaleString('en-US');
}

function buildPrepaidLabels(accountLabel: string) {
  const baseLabel = accountLabel.trim();
  return {
    assetAccountLabel: `Prepaid ${baseLabel}`,
    expenseAccountLabel: `${baseLabel} Expense`,
  };
}

function buildAccrualCounterLabel(accountLabel: string) {
  const trimmed = accountLabel.trim();

  if (/revenue$/i.test(trimmed)) {
    return 'Accounts Receivable';
  }

  if (/expense$/i.test(trimmed)) {
    return trimmed.replace(/expense$/i, 'Payable').trim();
  }

  return `${trimmed} Payable`;
}

function buildDepreciationCreditLabel(assetCategory: string) {
  return `Accumulated Depreciation - ${assetCategory.trim()}`;
}

function buildScenarioPicker(seed: number, requestedKind?: AdjustmentScenarioKind) {
  if (requestedKind) {
    return requestedKind;
  }

  const rng = mulberry32(seed ^ 0x51ed2701);
  return pick(DEFAULT_SCENARIO_KINDS, rng);
}

function buildDeferralDefaults(seed: number, config: DeferralAdjustmentConfig = {}): Required<DeferralAdjustmentConfig> {
  const rng = mulberry32(seed ^ 0x1a2b3c4d);
  const accountLabel = config.accountLabel ?? pick(DEFAULT_DEFERRAL_LABELS, rng);
  const coverageMonths = config.coverageMonths ?? pick(DEFAULT_COVERAGE_MONTHS, rng);
  const initialRecordingMethod = config.initialRecordingMethod ?? (seed % 2 === 0 ? 'asset' : 'expense');
  const amount = config.amount ?? pick(DEFAULT_DEFERRAL_AMOUNTS, rng);
  const startDate = config.startDate ?? addMonths('2026-01-01', randomInt(rng, 0, 2));
  const elapsedMonths = config.reportingDate
    ? Math.min(coverageMonths, differenceInMonthsInclusive(startDate, config.reportingDate))
    : Math.min(coverageMonths, Math.max(1, randomInt(rng, 1, Math.max(1, coverageMonths - 1))));
  const reportingDate = config.reportingDate ?? addMonths(startDate, elapsedMonths - 1);

  return {
    accountLabel,
    amount,
    coverageMonths,
    initialRecordingMethod,
    reportingDate,
    startDate,
  };
}

function buildAccrualDefaults(seed: number, config: AccrualAdjustmentConfig = {}): Required<AccrualAdjustmentConfig> {
  const rng = mulberry32(seed ^ 0x9e3779b9);
  const accrualKind = config.accrualKind ?? (seed % 2 === 0 ? 'revenue' : 'expense');
  const accountLabel =
    config.accountLabel ??
    (accrualKind === 'revenue'
      ? pick(DEFAULT_ACCRUAL_REVENUE_LABELS, rng)
      : pick(DEFAULT_ACCRUAL_EXPENSE_LABELS, rng));
  const amount = config.amount ?? pick(DEFAULT_ACCRUAL_AMOUNTS, rng);
  const reportingDate = config.reportingDate ?? '2026-03-31';
  const incurredDate = config.incurredDate ?? addDays(reportingDate, -randomInt(rng, 1, 5));

  return {
    accountLabel,
    amount,
    accrualKind,
    incurredDate,
    reportingDate,
  };
}

function buildDepreciationDefaults(seed: number, config: DepreciationAdjustmentConfig = {}): Required<DepreciationAdjustmentConfig> {
  const rng = mulberry32(seed ^ 0x85ebca6b);
  const assetCategory = config.assetCategory ?? pick(DEFAULT_ASSET_CATEGORIES, rng);
  const cost = config.cost ?? pick(DEFAULT_DEPRECIATION_COSTS, rng);
  const usefulLifeMonths = config.usefulLifeMonths ?? pick(DEFAULT_USEFUL_LIFE_MONTHS, rng);
  const salvageValue = Math.min(
    cost - 1,
    config.salvageValue ?? Math.max(1, Math.round(cost * (0.1 + rng() * 0.15))),
  );
  const method = config.method ?? (seed % 2 === 0 ? 'straight-line' : 'variable-salvage');
  const purchaseDate = config.purchaseDate ?? addMonths('2026-01-01', randomInt(rng, 0, 2));
  const monthsUsed = config.reportingDate
    ? Math.min(usefulLifeMonths, differenceInMonthsInclusive(purchaseDate, config.reportingDate))
    : Math.min(usefulLifeMonths, randomInt(rng, 1, Math.max(1, usefulLifeMonths - 2)));
  const reportingDate = config.reportingDate ?? addMonths(purchaseDate, monthsUsed - 1);

  return {
    assetCategory,
    cost,
    salvageValue,
    usefulLifeMonths,
    method,
    purchaseDate,
    reportingDate,
  };
}

export function generateDeferralAdjustmentScenario(
  seed: number,
  config: DeferralAdjustmentConfig = {},
): DeferralAdjustmentScenario {
  const defaults = buildDeferralDefaults(seed, config);
  const { assetAccountLabel, expenseAccountLabel } = buildPrepaidLabels(defaults.accountLabel);
  const elapsedMonths = differenceInMonthsInclusive(defaults.startDate, defaults.reportingDate);
  const adjustmentAmount = Math.max(1, Math.round((defaults.amount * elapsedMonths) / defaults.coverageMonths));
  const remainingAmount = Math.max(0, defaults.amount - adjustmentAmount);
  const entry =
    defaults.initialRecordingMethod === 'asset'
      ? {
          debitLabel: expenseAccountLabel,
          creditLabel: assetAccountLabel,
          amount: adjustmentAmount,
        }
      : {
          debitLabel: assetAccountLabel,
          creditLabel: expenseAccountLabel,
          amount: remainingAmount,
        };

  return {
    seed,
    kind: 'deferral',
    title: `${defaults.initialRecordingMethod === 'asset' ? 'Adjust' : 'Correct'} prepaid ${defaults.accountLabel}`,
    stem:
      defaults.initialRecordingMethod === 'asset'
        ? `The business paid $${formatAmount(defaults.amount)} for ${defaults.accountLabel} in advance on ${defaults.startDate} and recorded it as an asset. Prepare the ${defaults.reportingDate} adjustment after ${elapsedMonths} of ${defaults.coverageMonths} months have passed.`
        : `The business paid $${formatAmount(defaults.amount)} for ${defaults.accountLabel} in advance on ${defaults.startDate} but recorded it as expense immediately. Prepare the ${defaults.reportingDate} correcting adjustment to reclassify the unexpired portion after ${elapsedMonths} of ${defaults.coverageMonths} months have passed.`,
    reportingDate: defaults.reportingDate,
    amount: defaults.initialRecordingMethod === 'asset' ? adjustmentAmount : remainingAmount,
    entry,
    method: defaults.initialRecordingMethod,
    accountLabel: defaults.accountLabel,
    assetAccountLabel,
    expenseAccountLabel,
    startDate: defaults.startDate,
    coverageMonths: defaults.coverageMonths,
    elapsedMonths,
    originalAmount: defaults.amount,
    adjustmentAmount,
    remainingAmount,
  };
}

export function generateAccrualAdjustmentScenario(
  seed: number,
  config: AccrualAdjustmentConfig = {},
): AccrualAdjustmentScenario {
  const defaults = buildAccrualDefaults(seed, config);
  const daysAccrued = differenceInDays(defaults.incurredDate, defaults.reportingDate);
  const entry =
    defaults.accrualKind === 'revenue'
      ? {
          debitLabel: 'Accounts Receivable',
          creditLabel: defaults.accountLabel,
          amount: defaults.amount,
        }
      : {
          debitLabel: defaults.accountLabel,
          creditLabel: buildAccrualCounterLabel(defaults.accountLabel),
          amount: defaults.amount,
        };

  return {
    seed,
    kind: 'accrual',
    title:
      defaults.accrualKind === 'revenue'
        ? `Record accrued ${defaults.accountLabel}`
        : `Record accrued ${defaults.accountLabel.replace(/ expense$/i, '').trim()}`,
    stem:
      defaults.accrualKind === 'revenue'
        ? `The business earned $${formatAmount(defaults.amount)} of ${defaults.accountLabel} on ${defaults.incurredDate}, but the customer had not yet been billed by ${defaults.reportingDate}.`
        : `The business incurred $${formatAmount(defaults.amount)} of ${defaults.accountLabel} on ${defaults.incurredDate}, but the payable was not yet recorded by ${defaults.reportingDate}.`,
    reportingDate: defaults.reportingDate,
    amount: defaults.amount,
    entry,
    accrualKind: defaults.accrualKind,
    accountLabel: defaults.accountLabel,
    incurredDate: defaults.incurredDate,
    daysAccrued,
  };
}

export function generateDepreciationAdjustmentScenario(
  seed: number,
  config: DepreciationAdjustmentConfig = {},
): DepreciationAdjustmentScenario {
  const defaults = buildDepreciationDefaults(seed, config);
  const monthsUsed = Math.min(
    defaults.usefulLifeMonths,
    differenceInMonthsInclusive(defaults.purchaseDate, defaults.reportingDate),
  );
  const depreciableBase = Math.max(1, defaults.cost - defaults.salvageValue);
  const monthlyDepreciation = depreciableBase / defaults.usefulLifeMonths;
  const depreciationExpense = Math.max(1, Math.round(monthlyDepreciation * monthsUsed));
  const accumulatedDepreciation = depreciationExpense;
  const carryingAmount = Math.max(0, defaults.cost - accumulatedDepreciation);

  return {
    seed,
    kind: 'depreciation',
    title: `Record depreciation for ${defaults.assetCategory}`,
    stem:
      defaults.method === 'straight-line'
        ? `The business purchased ${defaults.assetCategory} on ${defaults.purchaseDate} for $${formatAmount(defaults.cost)} with $${formatAmount(defaults.salvageValue)} salvage value. Prepare the ${defaults.reportingDate} straight-line depreciation adjustment.`
        : `The business purchased ${defaults.assetCategory} on ${defaults.purchaseDate} for $${formatAmount(defaults.cost)} and the asset has a variable salvage estimate of $${formatAmount(defaults.salvageValue)}. Prepare the ${defaults.reportingDate} depreciation adjustment.`,
    reportingDate: defaults.reportingDate,
    amount: depreciationExpense,
    entry: {
      debitLabel: 'Depreciation Expense',
      creditLabel: buildDepreciationCreditLabel(defaults.assetCategory),
      amount: depreciationExpense,
    },
    method: defaults.method,
    assetCategory: defaults.assetCategory,
    purchaseDate: defaults.purchaseDate,
    usefulLifeMonths: defaults.usefulLifeMonths,
    salvageValue: defaults.salvageValue,
    depreciableBase,
    monthsUsed,
    monthlyDepreciation,
    depreciationExpense,
    accumulatedDepreciation,
    carryingAmount,
  };
}

export function generateAdjustmentScenario(
  seed: number,
  config: AdjustmentScenarioConfig = {},
): AdjustmentScenario {
  const scenarioKind = buildScenarioPicker(seed, config.scenarioKind);

  if (scenarioKind === 'deferral') {
    return generateDeferralAdjustmentScenario(seed, config.deferral);
  }

  if (scenarioKind === 'accrual') {
    return generateAccrualAdjustmentScenario(seed, config.accrual);
  }

  return generateDepreciationAdjustmentScenario(seed, config.depreciation);
}
