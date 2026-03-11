import { describe, it, expect } from 'vitest';

describe('generators', () => {
  it('should export all generator functions', async () => {
    const generators = await import('./index.js');
    
    expect(typeof generators.generateController).toBe('function');
    expect(typeof generators.generateService).toBe('function');
    expect(typeof generators.generateRepository).toBe('function');
    expect(typeof generators.generateEntity).toBe('function');
    expect(typeof generators.generateDto).toBe('function');
    expect(typeof generators.generateModule).toBe('function');
  });
});
