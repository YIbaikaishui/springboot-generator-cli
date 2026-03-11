import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

/**
 * Ensure directory exists, create if not
 */
export function ensureDirectory(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Write file with directory creation
 */
export function writeFile(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  ensureDirectory(dir);
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Check if path exists
 */
export function exists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Read file content
 */
export function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Delete file or directory
 */
export function remove(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.rmSync(filePath, { recursive: true, force: true });
  }
}

/**
 * Copy directory recursively
 */
export function copyDir(src: string, dest: string): void {
  ensureDirectory(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Check if directory is a Spring Boot project
 */
export function isSpringBootProject(dir: string): boolean {
  const pomXml = path.join(dir, 'pom.xml');
  const buildGradle = path.join(dir, 'build.gradle');
  
  if (exists(pomXml)) {
    const content = readFile(pomXml);
    return content.includes('spring-boot');
  }
  
  if (exists(buildGradle)) {
    const content = readFile(buildGradle);
    return content.includes('spring-boot');
  }
  
  return false;
}

/**
 * Scan packages for Application class
 */
function scanPackages(
  basePath: string, 
  currentPackage: string, 
  packages: string[]
): void {
  const dirs = fs.readdirSync(basePath, { withFileTypes: true })
    .filter(d => d.isDirectory());
  
  for (const dir of dirs) {
    const dirPath = path.join(basePath, dir.name);
    const javaFiles = fs.readdirSync(dirPath)
      .filter(f => f.endsWith('.java'));
    
    if (javaFiles.some(f => f.includes('Application'))) {
      packages.push(currentPackage ? `${currentPackage}.${dir.name}` : dir.name);
    }
    
    scanPackages(
      dirPath, 
      currentPackage ? `${currentPackage}.${dir.name}` : dir.name,
      packages
    );
  }
}

/**
 * Parse package name from pom.xml or build.gradle
 */
export function parseBasePackage(dir: string): string | null {
  const mainJavaPath = path.join(dir, 'src/main/java');
  
  if (exists(mainJavaPath)) {
    const packages: string[] = [];
    scanPackages(mainJavaPath, '', packages);
    
    if (packages.length > 0) {
      return packages[0];
    }
  }
  
  return null;
}

/**
 * Log file creation
 */
export function logFileCreated(filePath: string): void {
  console.log(chalk.green('  CREATE'), filePath);
}

/**
 * Log file modification
 */
export function logFileModified(filePath: string): void {
  console.log(chalk.yellow('  UPDATE'), filePath);
}

/**
 * Log file deletion
 */
export function logFileDeleted(filePath: string): void {
  console.log(chalk.red('  DELETE'), filePath);
}
