import ejs from 'ejs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import type { TemplateData } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Template directory path (relative to compiled dist)
const TEMPLATE_DIR = path.join(__dirname, '../../templates');

/**
 * Render a template with given data
 */
export async function renderTemplate(
  templateName: string,
  data: TemplateData
): Promise<string> {
  const templatePath = path.join(TEMPLATE_DIR, `${templateName}.ejs`);
  const options = {
    async: true,
    rmWhitespace: false,
  };
  
  return ejs.renderFile(templatePath, data, options);
}

/**
 * Get template path for a given type
 */
export function getTemplatePath(type: string): string {
  return path.join(TEMPLATE_DIR, `${type}.ejs`);
}

/**
 * Check if template exists
 */
export function templateExists(templateName: string): boolean {
  const templatePath = path.join(TEMPLATE_DIR, `${templateName}.ejs`);
  return fs.existsSync(templatePath);
}

/**
 * Built-in Java type mappings
 */
export const JAVA_TYPE_MAP: Record<string, string> = {
  string: 'String',
  int: 'Integer',
  integer: 'Integer',
  long: 'Long',
  float: 'Float',
  double: 'Double',
  boolean: 'Boolean',
  date: 'LocalDate',
  datetime: 'LocalDateTime',
  timestamp: 'LocalDateTime',
  decimal: 'BigDecimal',
  bigdecimal: 'BigDecimal',
  uuid: 'UUID',
  byte: 'Byte',
  short: 'Short',
  char: 'Character',
};

/**
 * Convert string to Java type
 */
export function toJavaType(type: string): string {
  const normalized = type.toLowerCase();
  return JAVA_TYPE_MAP[normalized] || type;
}

/**
 * Get default value for Java type
 */
export function getJavaDefaultValue(type: string): string {
  const javaType = toJavaType(type);
  switch (javaType) {
    case 'String':
      return '""';
    case 'Integer':
    case 'int':
    case 'Long':
    case 'long':
    case 'Short':
    case 'short':
    case 'Byte':
    case 'byte':
      return '0';
    case 'Double':
    case 'double':
    case 'Float':
    case 'float':
      return '0.0';
    case 'Boolean':
    case 'boolean':
      return 'false';
    case 'LocalDate':
      return 'LocalDate.now()';
    case 'LocalDateTime':
      return 'LocalDateTime.now()';
    default:
      return 'null';
  }
}
