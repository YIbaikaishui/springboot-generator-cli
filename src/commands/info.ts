import chalk from 'chalk';
import { isSpringBootProject, parseBasePackage, exists, readFile } from '../utils/file.js';
import path from 'path';

export function infoCommand(): void {
  const cwd = process.cwd();
  
  console.log(chalk.cyan('Project Information'));
  console.log(chalk.gray('─'.repeat(40)));
  console.log();
  
  // Check if Spring Boot project
  const isSpring = isSpringBootProject(cwd);
  console.log(chalk.white('Spring Boot Project:'), isSpring ? chalk.green('Yes') : chalk.red('No'));
  
  // Get build tool
  if (exists(path.join(cwd, 'pom.xml'))) {
    console.log(chalk.white('Build Tool:'), 'Maven');
    
    const pomContent = readFile(path.join(cwd, 'pom.xml'));
    
    // Extract Spring Boot version
    const springBootMatch = pomContent.match(/<version>(\d+\.\d+\.\d+)<\/version>/);
    if (springBootMatch) {
      console.log(chalk.white('Spring Boot Version:'), springBootMatch[1]);
    }
    
    // Extract Java version
    const javaMatch = pomContent.match(/<java\.version>(\d+)<\/java\.version>/);
    if (javaMatch) {
      console.log(chalk.white('Java Version:'), javaMatch[1]);
    }
  } else if (exists(path.join(cwd, 'build.gradle'))) {
    console.log(chalk.white('Build Tool:'), 'Gradle');
    
    const gradleContent = readFile(path.join(cwd, 'build.gradle'));
    
    // Extract Spring Boot version
    const springBootMatch = gradleContent.match(/spring-boot.*?version\s*['"]([^'"]+)['"]/);
    if (springBootMatch) {
      console.log(chalk.white('Spring Boot Version:'), springBootMatch[1]);
    }
    
    // Extract Java version
    const javaMatch = gradleContent.match(/sourceCompatibility\s*=\s*['"]?(\d+)['"]?/);
    if (javaMatch) {
      console.log(chalk.white('Java Version:'), javaMatch[1]);
    }
  }
  
  // Get base package
  const basePackage = parseBasePackage(cwd);
  if (basePackage) {
    console.log(chalk.white('Base Package:'), basePackage);
  }
  
  // Check for common files
  console.log();
  console.log(chalk.white('Common Files:'));
  
  const files = [
    { name: 'application.yml', path: 'src/main/resources/application.yml' },
    { name: 'application.properties', path: 'src/main/resources/application.properties' },
    { name: 'application-dev.yml', path: 'src/main/resources/application-dev.yml' },
  ];
  
  for (const file of files) {
    const existsFile = exists(path.join(cwd, file.path));
    console.log(`  ${existsFile ? chalk.green('✓') : chalk.red('✗')} ${file.name}`);
  }
  
  console.log();
}
