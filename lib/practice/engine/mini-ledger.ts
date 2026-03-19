import {
  getAccountById,
  practiceAccounts,
  type AccountType,
  type PracticeAccount,
} from './accounts';

export type MiniLedgerCompanyType = 'service' | 'retail';
export type MiniLedgerCapitalMode = 'beginning' | 'ending';

export interface MiniLedgerConfig {
  accountCount?: number;
  includeContraAccounts?: boolean;
  capitalMode?: MiniLedgerCapitalMode;
  companyType?: MiniLedgerCompanyType;
}

export interface MiniLedgerAccount extends PracticeAccount {
  balance: number;
  statementBalance: number;
}

export interface MiniLedgerTotals {
  grossAssets: number;
  contraAssets: number;
  netAssets: number;
  liabilities: number;
  beginningCapital: number;
  netIncome: number;
  dividends: number;
  endingCapital: number;
  revenue: number;
  expenses: number;
}

export interface MiniLedger {
  seed: number;
  companyType: MiniLedgerCompanyType;
  capitalMode: MiniLedgerCapitalMode;
  difficulty: Required<MiniLedgerConfig>;
  accounts: MiniLedgerAccount[];
  totals: MiniLedgerTotals;
}

const SERVICE_BASE_IDS = [
  'cash',
  'accounts-receivable',
  'supplies',
  'equipment',
  'accounts-payable',
  'common-stock',
  'retained-earnings',
  'service-revenue',
  'rent-expense',
];

const RETAIL_BASE_IDS = [
  'cash',
  'accounts-receivable',
  'merchandise-inventory',
  'accounts-payable',
  'common-stock',
  'retained-earnings',
  'sales-revenue',
  'cost-of-goods-sold',
];

const CONTRA_IDS = [
  'accumulated-depreciation-equipment',
  'allowance-for-doubtful-accounts',
  'sales-discounts',
  'sales-returns-and-allowances',
  'dividends',
];

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

function shuffled<T>(items: T[], rng: () => number) {
  const clone = [...items];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }
  return clone;
}

function splitTotal(total: number, count: number, rng: () => number) {
  if (count <= 0) {
    return [];
  }

  if (count === 1) {
    return [Math.max(1, total)];
  }

  const remaining = Math.max(total, count);
  const cuts = new Set<number>();
  while (cuts.size < count - 1) {
    cuts.add(randomInt(rng, 1, remaining - 1));
  }

  const points = [0, ...Array.from(cuts).sort((a, b) => a - b), remaining];
  return points.slice(1).map((point, index) => Math.max(1, point - points[index]));
}

function pickUnique(ids: string[], count: number, rng: () => number, exclude = new Set<string>()) {
  const pool = shuffled(
    ids.filter((id) => !exclude.has(id)),
    rng,
  );
  return pool.slice(0, count);
}

function accountSign(account: PracticeAccount) {
  if (account.accountType === 'expense') {
    return -1;
  }

  if (account.contraOf) {
    return -1;
  }

  if (account.accountType === 'equity' && account.normalBalance === 'debit') {
    return -1;
  }

  if (account.accountType === 'revenue' && account.normalBalance === 'debit') {
    return -1;
  }

  return 1;
}

function buildSelectedIds(
  companyType: MiniLedgerCompanyType,
  accountCount: number,
  includeContraAccounts: boolean,
  rng: () => number,
) {
  const baseIds = companyType === 'service' ? SERVICE_BASE_IDS : RETAIL_BASE_IDS;
  const excluded = new Set<string>();
  const selected = [...baseIds];

  if (includeContraAccounts) {
    const contraId = companyType === 'service' ? CONTRA_IDS[0] : CONTRA_IDS[2];
    selected.splice(3, 0, contraId);
    excluded.add(contraId);
  }

  const allEligibleIds = practiceAccounts
    .filter((account) => companyType === 'service' || account.retailApplicable)
    .map((account) => account.id)
    .filter((id) => !selected.includes(id));

  while (selected.length < accountCount && allEligibleIds.length > 0) {
    const nextIds = pickUnique(allEligibleIds, 1, rng, excluded);
    if (nextIds.length === 0) {
      break;
    }

    selected.push(nextIds[0]);
    excluded.add(nextIds[0]);
  }

  return selected;
}

function assignBalances(
  accounts: PracticeAccount[],
  totals: MiniLedgerTotals,
  rng: () => number,
) {
  const selectedByType = {
    asset: accounts.filter((account) => account.accountType === 'asset'),
    liability: accounts.filter((account) => account.accountType === 'liability'),
    equity: accounts.filter((account) => account.accountType === 'equity'),
    revenue: accounts.filter((account) => account.accountType === 'revenue'),
    expense: accounts.filter((account) => account.accountType === 'expense'),
  } satisfies Record<AccountType, PracticeAccount[]>;

  const contraAssets = selectedByType.asset.filter((account) => account.contraOf);
  const regularAssets = selectedByType.asset.filter((account) => !account.contraOf);
  const positiveEquity = selectedByType.equity.filter((account) => account.normalBalance === 'credit');
  const negativeEquity = selectedByType.equity.filter((account) => account.normalBalance === 'debit');
  const positiveRevenue = selectedByType.revenue.filter((account) => account.normalBalance === 'credit');
  const negativeRevenue = selectedByType.revenue.filter((account) => account.normalBalance === 'debit');

  const regularAssetBalances = splitTotal(totals.grossAssets, regularAssets.length, rng);
  const contraAssetBalances = splitTotal(totals.contraAssets, contraAssets.length, rng);
  const liabilityBalances = splitTotal(totals.liabilities, selectedByType.liability.length, rng);
  const equityPositiveBalances = splitTotal(totals.beginningCapital + totals.netIncome, positiveEquity.length, rng);
  const equityNegativeBalances = splitTotal(totals.dividends, negativeEquity.length, rng);
  const revenueBalances = splitTotal(totals.revenue, positiveRevenue.length, rng);
  const revenueContraBalances = splitTotal(0, negativeRevenue.length, rng);
  const expenseBalances = splitTotal(totals.expenses, selectedByType.expense.length, rng);

  const accountBalances = new Map<string, { balance: number; statementBalance: number }>();

  regularAssets.forEach((account, index) => {
    accountBalances.set(account.id, {
      balance: regularAssetBalances[index] ?? 0,
      statementBalance: regularAssetBalances[index] ?? 0,
    });
  });

  contraAssets.forEach((account, index) => {
    accountBalances.set(account.id, {
      balance: contraAssetBalances[index] ?? 0,
      statementBalance: -(contraAssetBalances[index] ?? 0),
    });
  });

  selectedByType.liability.forEach((account, index) => {
    accountBalances.set(account.id, {
      balance: liabilityBalances[index] ?? 0,
      statementBalance: liabilityBalances[index] ?? 0,
    });
  });

  positiveEquity.forEach((account, index) => {
    accountBalances.set(account.id, {
      balance: equityPositiveBalances[index] ?? 0,
      statementBalance: equityPositiveBalances[index] ?? 0,
    });
  });

  negativeEquity.forEach((account, index) => {
    accountBalances.set(account.id, {
      balance: equityNegativeBalances[index] ?? 0,
      statementBalance: -(equityNegativeBalances[index] ?? 0),
    });
  });

  positiveRevenue.forEach((account, index) => {
    accountBalances.set(account.id, {
      balance: revenueBalances[index] ?? 0,
      statementBalance: revenueBalances[index] ?? 0,
    });
  });

  negativeRevenue.forEach((account, index) => {
    accountBalances.set(account.id, {
      balance: revenueContraBalances[index] ?? 0,
      statementBalance: -(revenueContraBalances[index] ?? 0),
    });
  });

  selectedByType.expense.forEach((account, index) => {
    accountBalances.set(account.id, {
      balance: expenseBalances[index] ?? 0,
      statementBalance: -(expenseBalances[index] ?? 0),
    });
  });

  return accountBalances;
}

export function generateMiniLedger(seed: number, config: MiniLedgerConfig = {}): MiniLedger {
  const rng = mulberry32(seed);
  const companyType = config.companyType ?? (seed % 2 === 0 ? 'service' : 'retail');
  const capitalMode = config.capitalMode ?? 'ending';
  const minimumCount = companyType === 'service' ? SERVICE_BASE_IDS.length : RETAIL_BASE_IDS.length;
  const requestedCount = config.accountCount ?? minimumCount;
  const accountCount = Math.max(minimumCount, Math.min(requestedCount, practiceAccounts.length));
  const includeContraAccounts = config.includeContraAccounts ?? true;

  const selectedIds = buildSelectedIds(companyType, accountCount, includeContraAccounts, rng);
  const selectedAccounts = selectedIds.map((id) => getAccountById(id)).filter(Boolean) as PracticeAccount[];

  const liabilities = randomInt(rng, 500, 2800);
  const beginningCapital = randomInt(rng, 800, 4200);
  const netIncome = randomInt(rng, 250, 1800);
  const dividends = randomInt(rng, 100, Math.max(120, Math.floor((beginningCapital + netIncome) * 0.2)));
  const endingCapital = Math.max(1, beginningCapital + netIncome - dividends);
  const netAssets = liabilities + endingCapital;
  const contraAssets = includeContraAccounts && selectedAccounts.some((account) => account.accountType === 'asset' && account.contraOf)
    ? randomInt(rng, 1, Math.max(1, Math.floor(netAssets * 0.12)))
    : 0;
  const grossAssets = netAssets + contraAssets;
  const expenses = randomInt(rng, 300, 1800);
  const revenue = expenses + netIncome;

  const totals: MiniLedgerTotals = {
    grossAssets,
    contraAssets,
    netAssets,
    liabilities,
    beginningCapital,
    netIncome,
    dividends,
    endingCapital,
    revenue,
    expenses,
  };

  const accountBalanceMap = assignBalances(selectedAccounts, totals, rng);

  const accounts = selectedAccounts.map((account) => {
    const balanceData = accountBalanceMap.get(account.id) ?? { balance: 0, statementBalance: 0 };
    return {
      ...account,
      balance: balanceData.balance,
      statementBalance: balanceData.statementBalance,
    };
  });

  return {
    seed,
    companyType,
    capitalMode,
    difficulty: {
      accountCount,
      includeContraAccounts,
      capitalMode,
      companyType,
    },
    accounts,
    totals,
  };
}

export function summarizeMiniLedger(ledger: MiniLedger) {
  const totals = ledger.accounts.reduce(
    (acc, account) => {
      const sign = accountSign(account);

      if (account.accountType === 'asset') {
        acc.assets += account.statementBalance;
      } else if (account.accountType === 'liability') {
        acc.liabilities += account.statementBalance;
      } else if (account.accountType === 'equity') {
        acc.equity += account.statementBalance;
      } else if (account.accountType === 'revenue') {
        acc.revenue += account.statementBalance;
      } else if (account.accountType === 'expense') {
        acc.expenses += Math.abs(account.statementBalance) * sign;
      }

      return acc;
    },
    {
      assets: 0,
      liabilities: 0,
      equity: 0,
      revenue: 0,
      expenses: 0,
    },
  );

  return totals;
}
