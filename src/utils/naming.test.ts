import { describe, it, expect } from 'vitest';
import {
  toPascalCase,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  packageToPath,
  pathToPackage,
  pluralize,
  singularize,
} from './naming.js';

describe('naming utilities', () => {
  describe('toPascalCase', () => {
    it('should convert kebab-case to PascalCase', () => {
      expect(toPascalCase('user-profile')).toBe('UserProfile');
    });

    it('should convert snake_case to PascalCase', () => {
      expect(toPascalCase('user_profile')).toBe('UserProfile');
    });

    it('should handle single word', () => {
      expect(toPascalCase('user')).toBe('User');
    });

    it('should handle already PascalCase', () => {
      expect(toPascalCase('UserProfile')).toBe('UserProfile');
    });

    it('should handle empty string', () => {
      expect(toPascalCase('')).toBe('');
    });
  });

  describe('toCamelCase', () => {
    it('should convert PascalCase to camelCase', () => {
      expect(toCamelCase('UserProfile')).toBe('userProfile');
    });

    it('should convert kebab-case to camelCase', () => {
      expect(toCamelCase('user-profile')).toBe('userProfile');
    });

    it('should handle single word', () => {
      expect(toCamelCase('user')).toBe('user');
    });
  });

  describe('toKebabCase', () => {
    it('should convert PascalCase to kebab-case', () => {
      expect(toKebabCase('UserProfile')).toBe('user-profile');
    });

    it('should convert camelCase to kebab-case', () => {
      expect(toKebabCase('userProfile')).toBe('user-profile');
    });

    it('should handle single word', () => {
      expect(toKebabCase('user')).toBe('user');
    });
  });

  describe('toSnakeCase', () => {
    it('should convert PascalCase to snake_case', () => {
      expect(toSnakeCase('UserProfile')).toBe('user_profile');
    });

    it('should convert camelCase to snake_case', () => {
      expect(toSnakeCase('userProfile')).toBe('user_profile');
    });

    it('should handle single word', () => {
      expect(toSnakeCase('user')).toBe('user');
    });
  });

  describe('packageToPath', () => {
    it('should convert package name to path', () => {
      expect(packageToPath('com.example.demo')).toBe('com/example/demo');
    });

    it('should handle single segment', () => {
      expect(packageToPath('com')).toBe('com');
    });

    it('should handle empty string', () => {
      expect(packageToPath('')).toBe('');
    });
  });

  describe('pathToPackage', () => {
    it('should convert path to package name', () => {
      expect(pathToPackage('com/example/demo')).toBe('com.example.demo');
    });

    it('should handle single segment', () => {
      expect(pathToPackage('com')).toBe('com');
    });
  });

  describe('pluralize', () => {
    it('should add s to regular words', () => {
      expect(pluralize('user')).toBe('users');
    });

    it('should handle words ending in y', () => {
      expect(pluralize('category')).toBe('categories');
    });

    it('should handle words ending in s', () => {
      expect(pluralize('class')).toBe('classes');
    });

    it('should handle words ending in x', () => {
      expect(pluralize('box')).toBe('boxes');
    });

    it('should handle words ending in ch', () => {
      expect(pluralize('match')).toBe('matches');
    });

    it('should handle words ending in sh', () => {
      expect(pluralize('dish')).toBe('dishes');
    });
  });

  describe('singularize', () => {
    it('should remove s from plural words', () => {
      expect(singularize('users')).toBe('user');
    });

    it('should handle words ending in ies', () => {
      expect(singularize('categories')).toBe('category');
    });

    it('should handle words ending in es', () => {
      expect(singularize('classes')).toBe('class');
    });
  });
});
