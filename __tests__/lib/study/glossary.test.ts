import { describe, it, expect } from 'vitest';
import {
  GLOSSARY,
  getGlossaryTermBySlug,
  getGlossaryTermsByUnit,
  getGlossaryTermsByTopic,
  getAllGlossaryTopics,
  getAllGlossaryUnits,
} from '@/lib/study/glossary';

describe('glossary', () => {
  describe('data structure', () => {
    it('should have at least one glossary term', () => {
      expect(GLOSSARY.length).toBeGreaterThan(0);
    });

    it('should have all required fields for each term', () => {
      GLOSSARY.forEach(term => {
        expect(term).toHaveProperty('slug');
        expect(term).toHaveProperty('term_en');
        expect(term).toHaveProperty('term_zh');
        expect(term).toHaveProperty('def_en');
        expect(term).toHaveProperty('def_zh');
        expect(term).toHaveProperty('units');
        expect(term).toHaveProperty('topics');
        expect(term).toHaveProperty('synonyms');
        expect(term).toHaveProperty('related');
      });
    });

    it('should have unique slugs for all terms', () => {
      const slugs = GLOSSARY.map(t => t.slug);
      const uniqueSlugs = new Set(slugs);
      expect(slugs.length).toEqual(uniqueSlugs.size);
    });
  });

  describe('getGlossaryTermBySlug', () => {
    it('should return a term when given an existing slug', () => {
      const term = getGlossaryTermBySlug('accounting-equation');
      expect(term).toBeDefined();
      expect(term?.slug).toEqual('accounting-equation');
    });

    it('should return undefined when given a non-existent slug', () => {
      const term = getGlossaryTermBySlug('non-existent-term');
      expect(term).toBeUndefined();
    });
  });

  describe('getGlossaryTermsByUnit', () => {
    it('should return all terms for a given unit', () => {
      const terms = getGlossaryTermsByUnit(1);
      expect(terms.length).toBeGreaterThan(0);
      expect(terms.every(t => t.units.includes(1))).toBe(true);
    });

    it('should return an empty array for a unit with no terms', () => {
      const terms = getGlossaryTermsByUnit(99);
      expect(terms.length).toEqual(0);
    });
  });

  describe('getGlossaryTermsByTopic', () => {
    it('should return all terms for a given topic', () => {
      const terms = getGlossaryTermsByTopic('foundations');
      expect(terms.length).toBeGreaterThan(0);
      expect(terms.every(t => t.topics.includes('foundations'))).toBe(true);
    });

    it('should return an empty array for a topic with no terms', () => {
      const terms = getGlossaryTermsByTopic('non-existent-topic');
      expect(terms.length).toEqual(0);
    });
  });

  describe('getAllGlossaryTopics', () => {
    it('should return all unique topics sorted alphabetically', () => {
      const topics = getAllGlossaryTopics();
      expect(topics.length).toBeGreaterThan(0);
      expect([...topics].sort()).toEqual(topics);
    });
  });

  describe('getAllGlossaryUnits', () => {
    it('should return all unique units sorted numerically', () => {
      const units = getAllGlossaryUnits();
      expect(units.length).toBeGreaterThan(0);
      expect([...units].sort((a, b) => a - b)).toEqual(units);
    });
  });
});
