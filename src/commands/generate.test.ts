import { describe, expect, it } from 'vitest';
import { validateDddModuleOptions } from './generate.js';

describe('validateDddModuleOptions', () => {
  it('allows the supported default DDD module configuration', () => {
    expect(
      validateDddModuleOptions('module', {
        style: 'ddd-modulith',
        rest: true,
        jpa: true,
      })
    ).toBeNull();
  });

  it('rejects disabling REST generation for DDD modules', () => {
    expect(
      validateDddModuleOptions('module', {
        style: 'ddd-modulith',
        rest: false,
        jpa: true,
      })
    ).toContain('--no-rest');
  });

  it('rejects disabling JPA generation for DDD modules', () => {
    expect(
      validateDddModuleOptions('module', {
        style: 'ddd-modulith',
        rest: true,
        jpa: false,
      })
    ).toContain('--no-jpa');
  });
});
