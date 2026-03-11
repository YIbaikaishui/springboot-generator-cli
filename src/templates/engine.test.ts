import { describe, it, expect } from 'vitest';
import { toJavaType, getJavaDefaultValue, JAVA_TYPE_MAP } from './engine.js';

describe('template engine utilities', () => {
  describe('toJavaType', () => {
    it('should convert string types', () => {
      expect(toJavaType('string')).toBe('String');
      expect(toJavaType('String')).toBe('String');
      expect(toJavaType('STRING')).toBe('String');
    });

    it('should convert numeric types', () => {
      expect(toJavaType('int')).toBe('Integer');
      expect(toJavaType('integer')).toBe('Integer');
      expect(toJavaType('long')).toBe('Long');
      expect(toJavaType('float')).toBe('Float');
      expect(toJavaType('double')).toBe('Double');
    });

    it('should convert boolean type', () => {
      expect(toJavaType('boolean')).toBe('Boolean');
    });

    it('should convert date types', () => {
      expect(toJavaType('date')).toBe('LocalDate');
      expect(toJavaType('datetime')).toBe('LocalDateTime');
      expect(toJavaType('timestamp')).toBe('LocalDateTime');
    });

    it('should convert decimal type', () => {
      expect(toJavaType('decimal')).toBe('BigDecimal');
      expect(toJavaType('bigdecimal')).toBe('BigDecimal');
    });

    it('should return original type for unknown types', () => {
      expect(toJavaType('CustomType')).toBe('CustomType');
    });
  });

  describe('getJavaDefaultValue', () => {
    it('should return empty string for String', () => {
      expect(getJavaDefaultValue('String')).toBe('""');
    });

    it('should return 0 for numeric types', () => {
      expect(getJavaDefaultValue('Integer')).toBe('0');
      expect(getJavaDefaultValue('Long')).toBe('0');
      expect(getJavaDefaultValue('Double')).toBe('0.0');
      expect(getJavaDefaultValue('Float')).toBe('0.0');
    });

    it('should return false for Boolean', () => {
      expect(getJavaDefaultValue('Boolean')).toBe('false');
    });

    it('should return LocalDate.now() for LocalDate', () => {
      expect(getJavaDefaultValue('LocalDate')).toBe('LocalDate.now()');
    });

    it('should return LocalDateTime.now() for LocalDateTime', () => {
      expect(getJavaDefaultValue('LocalDateTime')).toBe('LocalDateTime.now()');
    });

    it('should return null for unknown types', () => {
      expect(getJavaDefaultValue('CustomType')).toBe('null');
    });
  });

  describe('JAVA_TYPE_MAP', () => {
    it('should have all common types mapped', () => {
      expect(JAVA_TYPE_MAP['string']).toBe('String');
      expect(JAVA_TYPE_MAP['int']).toBe('Integer');
      expect(JAVA_TYPE_MAP['boolean']).toBe('Boolean');
      expect(JAVA_TYPE_MAP['date']).toBe('LocalDate');
    });
  });
});
