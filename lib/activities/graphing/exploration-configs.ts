export interface ExplorationSlider {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
}

export interface ExplorationConfig {
  id: string;
  title: string;
  exploreQuestion: string;
  explorationPrompts: string[];
  equations: string[];
  sliders: ExplorationSlider[];
  domain: [number, number];
  range: [number, number];
  secondEquation?: string;
  secondEquationLabel?: string;
  variant: 'compare_lines' | 'multi_curve';
}

export const CVP_CONFIG: ExplorationConfig = {
  id: 'cvp',
  title: 'Cost-Volume-Profit Explorer',
  exploreQuestion: 'How do costs and prices affect the break-even point?',
  explorationPrompts: [
    'Drag the Fixed Cost slider up. What happens to the break-even point?',
    'Increase the Selling Price. How does the profit region change?',
    'Set Variable Cost per Unit higher than Selling Price. What happens?',
  ],
  equations: ['y = fixedCost + variableCostPerUnit * x', 'y = sellingPricePerUnit * x'],
  sliders: [
    { id: 'fixedCost', label: 'Fixed Cost ($)', min: 0, max: 50000, step: 1000, default: 10000 },
    { id: 'variableCostPerUnit', label: 'Variable Cost/Unit ($)', min: 0, max: 100, step: 1, default: 25 },
    { id: 'sellingPricePerUnit', label: 'Selling Price/Unit ($)', min: 0, max: 200, step: 1, default: 50 },
  ],
  domain: [0, 100],
  range: [0, 25000],
  secondEquation: 'y = 50 * x',
  secondEquationLabel: 'Total Revenue = Selling Price × Units',
  variant: 'compare_lines',
};

export const SUPPLY_DEMAND_CONFIG: ExplorationConfig = {
  id: 'supply-demand',
  title: 'Supply & Demand Explorer',
  exploreQuestion: 'How do supply and demand curves determine market equilibrium?',
  explorationPrompts: [
    'Find the equilibrium point where supply meets demand.',
    'Increase the supply slope. What happens to the equilibrium price?',
    'Shift demand up. How does the equilibrium quantity change?',
  ],
  equations: ['y = supplyIntercept + supplySlope * x', 'y = demandIntercept - demandSlope * x'],
  sliders: [
    { id: 'supplyIntercept', label: 'Supply Base ($)', min: 0, max: 50, step: 1, default: 5 },
    { id: 'supplySlope', label: 'Supply Slope', min: 0.1, max: 5, step: 0.1, default: 1 },
    { id: 'demandIntercept', label: 'Demand Base ($)', min: 10, max: 100, step: 1, default: 50 },
    { id: 'demandSlope', label: 'Demand Slope', min: 0.1, max: 5, step: 0.1, default: 1 },
  ],
  domain: [0, 50],
  range: [0, 60],
  secondEquation: 'y = 50 - x',
  secondEquationLabel: 'Demand = Demand Base - Demand Slope × Quantity',
  variant: 'compare_lines',
};

export const DEPRECIATION_CONFIG: ExplorationConfig = {
  id: 'depreciation',
  title: 'Depreciation Explorer',
  exploreQuestion: 'How do different depreciation methods affect asset value over time?',
  explorationPrompts: [
    'Compare straight-line and declining balance curves.',
    'Increase the asset cost. How does the book value curve change?',
    'Set salvage value to zero. What happens?',
  ],
  equations: [
    'y = assetCost - (assetCost - salvageValue) / usefulLife * x',
    'y = assetCost * (1 - 2 / usefulLife) ^ x',
  ],
  sliders: [
    { id: 'assetCost', label: 'Asset Cost ($)', min: 1000, max: 100000, step: 1000, default: 50000 },
    { id: 'salvageValue', label: 'Salvage Value ($)', min: 0, max: 50000, step: 1000, default: 5000 },
    { id: 'usefulLife', label: 'Useful Life (years)', min: 1, max: 20, step: 1, default: 5 },
  ],
  domain: [0, 20],
  range: [0, 60000],
  secondEquation: 'y = 50000 * (1 - 0.4) ^ x',
  secondEquationLabel: 'Declining Balance = Cost × (1 - 2/Life)^Years',
  variant: 'multi_curve',
};

export const EXPLORATION_CONFIGS: Record<string, ExplorationConfig> = {
  [CVP_CONFIG.id]: CVP_CONFIG,
  [SUPPLY_DEMAND_CONFIG.id]: SUPPLY_DEMAND_CONFIG,
  [DEPRECIATION_CONFIG.id]: DEPRECIATION_CONFIG,
};

export function getExplorationConfig(id: string): ExplorationConfig | undefined {
  return EXPLORATION_CONFIGS[id];
}

export function getAllExplorationConfigs(): ExplorationConfig[] {
  return Object.values(EXPLORATION_CONFIGS);
}