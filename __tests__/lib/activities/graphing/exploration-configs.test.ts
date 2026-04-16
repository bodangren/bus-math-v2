import { describe, it, expect } from 'vitest';
import {
  CVP_CONFIG,
  SUPPLY_DEMAND_CONFIG,
  DEPRECIATION_CONFIG,
  getExplorationConfig,
  getAllExplorationConfigs,
  EXPLORATION_CONFIGS,
} from '@/lib/activities/graphing/exploration-configs';

describe('Exploration Configs', () => {
  describe('CVP_CONFIG', () => {
    it('has required fields', () => {
      expect(CVP_CONFIG.id).toBe('cvp');
      expect(CVP_CONFIG.title).toBe('Cost-Volume-Profit Explorer');
      expect(CVP_CONFIG.exploreQuestion).toBeTruthy();
      expect(CVP_CONFIG.explorationPrompts.length).toBeGreaterThan(0);
      expect(CVP_CONFIG.equations.length).toBe(2);
      expect(CVP_CONFIG.sliders.length).toBe(3);
      expect(CVP_CONFIG.domain).toBeDefined();
      expect(CVP_CONFIG.range).toBeDefined();
      expect(CVP_CONFIG.variant).toBe('compare_lines');
    });

    it('slider defaults are within min/max range', () => {
      for (const slider of CVP_CONFIG.sliders) {
        expect(slider.default).toBeGreaterThanOrEqual(slider.min);
        expect(slider.default).toBeLessThanOrEqual(slider.max);
      }
    });

    it('has second equation for compare_lines variant', () => {
      expect(CVP_CONFIG.secondEquation).toBeTruthy();
      expect(CVP_CONFIG.secondEquationLabel).toBeTruthy();
    });
  });

  describe('SUPPLY_DEMAND_CONFIG', () => {
    it('has required fields', () => {
      expect(SUPPLY_DEMAND_CONFIG.id).toBe('supply-demand');
      expect(SUPPLY_DEMAND_CONFIG.title).toBe('Supply & Demand Explorer');
      expect(SUPPLY_DEMAND_CONFIG.exploreQuestion).toBeTruthy();
      expect(SUPPLY_DEMAND_CONFIG.explorationPrompts.length).toBeGreaterThan(0);
      expect(SUPPLY_DEMAND_CONFIG.equations.length).toBe(2);
      expect(SUPPLY_DEMAND_CONFIG.sliders.length).toBe(4);
      expect(SUPPLY_DEMAND_CONFIG.domain).toBeDefined();
      expect(SUPPLY_DEMAND_CONFIG.range).toBeDefined();
      expect(SUPPLY_DEMAND_CONFIG.variant).toBe('compare_lines');
    });

    it('slider defaults are within min/max range', () => {
      for (const slider of SUPPLY_DEMAND_CONFIG.sliders) {
        expect(slider.default).toBeGreaterThanOrEqual(slider.min);
        expect(slider.default).toBeLessThanOrEqual(slider.max);
      }
    });
  });

  describe('DEPRECIATION_CONFIG', () => {
    it('has required fields', () => {
      expect(DEPRECIATION_CONFIG.id).toBe('depreciation');
      expect(DEPRECIATION_CONFIG.title).toBe('Depreciation Explorer');
      expect(DEPRECIATION_CONFIG.exploreQuestion).toBeTruthy();
      expect(DEPRECIATION_CONFIG.explorationPrompts.length).toBeGreaterThan(0);
      expect(DEPRECIATION_CONFIG.equations.length).toBe(2);
      expect(DEPRECIATION_CONFIG.sliders.length).toBe(3);
      expect(DEPRECIATION_CONFIG.domain).toBeDefined();
      expect(DEPRECIATION_CONFIG.range).toBeDefined();
      expect(DEPRECIATION_CONFIG.variant).toBe('multi_curve');
    });

    it('slider defaults are within min/max range', () => {
      for (const slider of DEPRECIATION_CONFIG.sliders) {
        expect(slider.default).toBeGreaterThanOrEqual(slider.min);
        expect(slider.default).toBeLessThanOrEqual(slider.max);
      }
    });
  });

  describe('getExplorationConfig', () => {
    it('returns correct config by id', () => {
      expect(getExplorationConfig('cvp')).toBe(CVP_CONFIG);
      expect(getExplorationConfig('supply-demand')).toBe(SUPPLY_DEMAND_CONFIG);
      expect(getExplorationConfig('depreciation')).toBe(DEPRECIATION_CONFIG);
    });

    it('returns undefined for unknown id', () => {
      expect(getExplorationConfig('unknown')).toBeUndefined();
      expect(getExplorationConfig('')).toBeUndefined();
      expect(getExplorationConfig('CVP')).toBeUndefined();
    });
  });

  describe('getAllExplorationConfigs', () => {
    it('returns all configs', () => {
      const configs = getAllExplorationConfigs();
      expect(configs.length).toBe(3);
      expect(configs).toContain(CVP_CONFIG);
      expect(configs).toContain(SUPPLY_DEMAND_CONFIG);
      expect(configs).toContain(DEPRECIATION_CONFIG);
    });
  });

  describe('EXPLORATION_CONFIGS', () => {
    it('has all three configs keyed by id', () => {
      expect(EXPLORATION_CONFIGS['cvp']).toBe(CVP_CONFIG);
      expect(EXPLORATION_CONFIGS['supply-demand']).toBe(SUPPLY_DEMAND_CONFIG);
      expect(EXPLORATION_CONFIGS['depreciation']).toBe(DEPRECIATION_CONFIG);
    });
  });
});