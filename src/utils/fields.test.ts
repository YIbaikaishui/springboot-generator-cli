import { describe, expect, it } from 'vitest';
import { buildModuleFields, parseFieldDefinitions } from './fields.js';

describe('parseFieldDefinitions', () => {
  it('parses comma-separated field definitions into Java-aware fields', () => {
    expect(parseFieldDefinitions('name:string, price:decimal, active:boolean')).toEqual([
      expect.objectContaining({ name: 'name', type: 'String' }),
      expect.objectContaining({ name: 'price', type: 'BigDecimal' }),
      expect.objectContaining({ name: 'active', type: 'Boolean' }),
    ]);
  });

  it('rejects malformed field definitions', () => {
    expect(() => parseFieldDefinitions('name:string,email')).toThrow(
      "Invalid field definition 'email'"
    );
  });
});

describe('buildModuleFields', () => {
  it('adds id and audit fields around the custom business fields', () => {
    const fields = buildModuleFields(
      parseFieldDefinitions('name:string, price:decimal, active:boolean')
    );

    expect(fields.map((field) => field.name)).toEqual([
      'id',
      'name',
      'price',
      'active',
      'createdAt',
      'updatedAt',
    ]);
  });
});
