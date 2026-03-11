/**
 * Convert string to PascalCase
 * Example: user-profile -> UserProfile
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/[-_](.)/g, (_, char: string) => char.toUpperCase())
    .replace(/^(.)/, (_, char: string) => char.toUpperCase());
}

/**
 * Convert string to camelCase
 * Example: User-Profile -> userProfile
 */
export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Convert string to kebab-case
 * Example: UserProfile -> user-profile
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Convert string to snake_case
 * Example: UserProfile -> user_profile
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}

/**
 * Convert package name to directory path
 * Example: com.example.demo -> com/example/demo
 */
export function packageToPath(packageName: string): string {
  return packageName.replace(/\./g, '/');
}

/**
 * Convert directory path to package name
 * Example: com/example/demo -> com.example.demo
 */
export function pathToPackage(path: string): string {
  return path.replace(/\//g, '.');
}

/**
 * Pluralize a word (simple implementation)
 */
export function pluralize(word: string): string {
  if (word.endsWith('y')) {
    return word.slice(0, -1) + 'ies';
  }
  if (word.endsWith('s') || word.endsWith('x') || word.endsWith('z') || 
      word.endsWith('ch') || word.endsWith('sh')) {
    return word + 'es';
  }
  return word + 's';
}

/**
 * Singularize a word (simple implementation)
 */
export function singularize(word: string): string {
  if (word.endsWith('ies')) {
    return word.slice(0, -3) + 'y';
  }
  if (word.endsWith('es')) {
    return word.slice(0, -2);
  }
  if (word.endsWith('s')) {
    return word.slice(0, -1);
  }
  return word;
}
