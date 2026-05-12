import { toJavaType } from '../templates/engine.js';
import type { FieldDefinition } from '../types/index.js';
import { toCamelCase, toPascalCase } from './naming.js';

const RESERVED_FIELD_NAMES = new Set(['id', 'createdAt', 'updatedAt']);
const JAVA_IMPORTS: Record<string, string> = {
  BigDecimal: 'java.math.BigDecimal',
  LocalDate: 'java.time.LocalDate',
  LocalDateTime: 'java.time.LocalDateTime',
  UUID: 'java.util.UUID',
};

export function parseFieldDefinitions(spec: string): FieldDefinition[] {
  const definitions = spec
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (definitions.length === 0) {
    throw new Error('At least one field definition is required');
  }

  const seen = new Set<string>();

  return definitions.map((definition) => {
    const [rawName, rawType, extra] = definition.split(':').map((part) => part.trim());

    if (!rawName || !rawType || extra) {
      throw new Error(`Invalid field definition '${definition}'. Use name:type.`);
    }

    const normalizedName = toCamelCase(rawName);
    if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(normalizedName)) {
      throw new Error(`Invalid field name '${rawName}'. Use letters and numbers only.`);
    }
    if (RESERVED_FIELD_NAMES.has(normalizedName)) {
      throw new Error(`Field name '${normalizedName}' is reserved.`);
    }
    if (seen.has(normalizedName)) {
      throw new Error(`Duplicate field name '${normalizedName}'.`);
    }
    seen.add(normalizedName);

    return createField(normalizedName, rawType, {
      isBusiness: true,
      isEmail: normalizedName === 'email',
    });
  });
}

export function buildDefaultBusinessFields(): FieldDefinition[] {
  return [
    createField('name', 'String', { isBusiness: true }),
    createField('email', 'String', { isBusiness: true, isEmail: true }),
  ];
}

export function buildModuleFields(
  businessFields: FieldDefinition[] = buildDefaultBusinessFields()
): FieldDefinition[] {
  return [
    createField('id', 'Long', { isId: true }),
    ...businessFields.map((field) =>
      createField(field.name, field.type, {
        isBusiness: true,
        isEmail: field.isEmail,
      })
    ),
    createField('createdAt', 'LocalDateTime', { isAudit: true }),
    createField('updatedAt', 'LocalDateTime', { isAudit: true }),
  ];
}

export function collectJavaImports(fields: FieldDefinition[]): string[] {
  return Array.from(
    new Set(fields.map((field) => field.importPath).filter(Boolean) as string[])
  ).sort((left, right) => left.localeCompare(right));
}

function createField(
  name: string,
  type: string,
  overrides: Partial<FieldDefinition> = {}
): FieldDefinition {
  const normalizedName = toCamelCase(name);
  const javaType = toJavaType(type);
  const capitalizedName = toPascalCase(normalizedName);

  return {
    name: normalizedName,
    type: javaType,
    capitalizedName,
    getterName: `get${capitalizedName}`,
    setterName: `set${capitalizedName}`,
    isString: javaType === 'String',
    importPath: JAVA_IMPORTS[javaType],
    ...overrides,
  };
}
