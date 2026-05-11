import chalk from 'chalk';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs';
import {
  ensureDirectory,
  writeFile,
  logFileCreated,
} from '../utils/file.js';
import { packageToPath, toPascalCase } from '../utils/naming.js';
import type { GeneratorStyle } from '../types/index.js';

const DEFAULT_SPRING_BOOT_VERSION = '3.5.13';
const PREVIOUS_SPRING_BOOT_VERSION = '3.4.12';
const LTS_SPRING_BOOT_VERSION = '3.3.13';
const DEFAULT_SPRINGDOC_VERSION = '2.8.17';

interface NewProjectOptions {
  package: string;
  directory?: string;
  style?: GeneratorStyle;
}

interface ProjectAnswers {
  buildTool: string;
  javaVersion: string;
  springBootVersion: string;
  dependencies: string[];
}

export async function newCommand(
  name: string,
  options: NewProjectOptions,
): Promise<void> {
  const style = normalizeStyle(options.style);

  console.log(chalk.cyan(`Creating Spring Boot project: ${name}`));
  console.log(chalk.gray(`Style: ${style}`));
  console.log();

  const answers = await inquirer.prompt<ProjectAnswers>([
    {
      type: 'list',
      name: 'buildTool',
      message: 'Build tool:',
      choices: ['Maven', 'Gradle'],
      default: 'Maven',
    },
    {
      type: 'list',
      name: 'javaVersion',
      message: 'Java version:',
      choices: ['21', '17'],
      default: '21',
    },
    {
      type: 'list',
      name: 'springBootVersion',
      message: 'Spring Boot version:',
      choices: [
        DEFAULT_SPRING_BOOT_VERSION,
        PREVIOUS_SPRING_BOOT_VERSION,
        LTS_SPRING_BOOT_VERSION,
      ],
      default: DEFAULT_SPRING_BOOT_VERSION,
    },
    {
      type: 'checkbox',
      name: 'dependencies',
      message: 'Select dependencies:',
      choices: [
        { name: 'Spring Web', value: 'web', checked: true },
        { name: 'Spring Data JPA', value: 'jpa', checked: true },
        { name: 'Spring Data MongoDB', value: 'mongodb' },
        { name: 'Spring Data Redis', value: 'redis' },
        { name: 'Spring Security', value: 'security' },
        { name: 'Spring Validation', value: 'validation', checked: true },
        { name: 'Lombok', value: 'lombok', checked: true },
        { name: 'MapStruct', value: 'mapstruct' },
        { name: 'MySQL Driver', value: 'mysql' },
        { name: 'PostgreSQL Driver', value: 'postgresql' },
        { name: 'H2 Database', value: 'h2', checked: true },
        { name: 'OpenAPI/Swagger', value: 'openapi' },
      ],
    },
  ]);

  const packageName = options.package || 'com.example';
  const projectDir = options.directory
    ? path.join(options.directory, name)
    : path.join(process.cwd(), name);

  if (fs.existsSync(projectDir)) {
    const { overwrite } = await inquirer.prompt<{ overwrite: boolean }>([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `Directory '${name}' already exists. Overwrite?`,
        default: false,
      },
    ]);
    if (!overwrite) {
      process.exit(0);
    }
  }

  ensureDirectory(projectDir);

  console.log(chalk.gray('\nGenerating project structure...\n'));

  const packagePath = packageToPath(packageName);
  const mainJavaPath = path.join(projectDir, 'src/main/java', packagePath);
  const mainResourcesPath = path.join(projectDir, 'src/main/resources');
  const testJavaPath = path.join(projectDir, 'src/test/java', packagePath);
  const testResourcesPath = path.join(projectDir, 'src/test/resources');

  ensureDirectory(mainJavaPath);
  ensureDirectory(mainResourcesPath);
  ensureDirectory(testJavaPath);
  ensureDirectory(testResourcesPath);

  if (answers.buildTool === 'Maven') {
    generatePomXml(projectDir, name, packageName, answers);
  } else {
    generateBuildGradle(projectDir, name, packageName, answers);
  }

  generateApplicationYml(mainResourcesPath, name, packageName, answers);
  generateApplicationClass(mainJavaPath, packageName, name);
  generateHealthController(mainJavaPath, packageName, style);

  console.log(chalk.green('\n✓ Project created successfully!'));
  console.log();
  console.log(chalk.gray('Next steps:'));
  console.log(chalk.gray(`  cd ${name}`));
  if (answers.buildTool === 'Maven') {
    console.log(chalk.gray('  mvn spring-boot:run'));
  } else {
    console.log(chalk.gray('  gradle bootRun'));
  }
}

function normalizeStyle(style?: GeneratorStyle): GeneratorStyle {
  return style === 'layered' ? 'layered' : 'ddd-modulith';
}

function generatePomXml(
  projectDir: string,
  name: string,
  packageName: string,
  answers: ProjectAnswers,
): void {
  const { javaVersion, springBootVersion, dependencies } = answers;
  const dependencyXml = buildMavenDependencies(dependencies);

  const content = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>${springBootVersion}</version>
    <relativePath />
  </parent>

  <groupId>${packageName}</groupId>
  <artifactId>${name}</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <name>${name}</name>
  <description>${name} generated by SpringBoot Generator CLI</description>

  <properties>
    <java.version>${javaVersion}</java.version>
  </properties>

  <dependencies>
${dependencyXml}
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
</project>
`;

  writeFile(path.join(projectDir, 'pom.xml'), content);
  logFileCreated('pom.xml');
}

function buildMavenDependencies(dependencies: string[]): string {
  const deps: string[] = [];

  if (dependencies.includes('web')) {
    deps.push(mavenDependency('org.springframework.boot', 'spring-boot-starter-web'));
  }
  if (dependencies.includes('jpa')) {
    deps.push(mavenDependency('org.springframework.boot', 'spring-boot-starter-data-jpa'));
  }
  if (dependencies.includes('mongodb')) {
    deps.push(mavenDependency('org.springframework.boot', 'spring-boot-starter-data-mongodb'));
  }
  if (dependencies.includes('redis')) {
    deps.push(mavenDependency('org.springframework.boot', 'spring-boot-starter-data-redis'));
  }
  if (dependencies.includes('security')) {
    deps.push(mavenDependency('org.springframework.boot', 'spring-boot-starter-security'));
  }
  if (dependencies.includes('validation')) {
    deps.push(mavenDependency('org.springframework.boot', 'spring-boot-starter-validation'));
  }
  if (dependencies.includes('lombok')) {
    deps.push(`    <dependency>
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
      <optional>true</optional>
    </dependency>`);
  }
  if (dependencies.includes('mapstruct')) {
    deps.push(`    <dependency>
      <groupId>org.mapstruct</groupId>
      <artifactId>mapstruct</artifactId>
      <version>1.6.3</version>
    </dependency>`);
  }
  if (dependencies.includes('mysql')) {
    deps.push(runtimeMavenDependency('com.mysql', 'mysql-connector-j'));
  }
  if (dependencies.includes('postgresql')) {
    deps.push(runtimeMavenDependency('org.postgresql', 'postgresql'));
  }
  if (dependencies.includes('h2')) {
    deps.push(runtimeMavenDependency('com.h2database', 'h2'));
  }
  if (dependencies.includes('openapi')) {
    deps.push(`    <dependency>
      <groupId>org.springdoc</groupId>
      <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
      <version>${DEFAULT_SPRINGDOC_VERSION}</version>
    </dependency>`);
  }

  deps.push(`    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
      <scope>test</scope>
    </dependency>`);

  return deps.join('\n');
}

function mavenDependency(groupId: string, artifactId: string): string {
  return `    <dependency>
      <groupId>${groupId}</groupId>
      <artifactId>${artifactId}</artifactId>
    </dependency>`;
}

function runtimeMavenDependency(groupId: string, artifactId: string): string {
  return `    <dependency>
      <groupId>${groupId}</groupId>
      <artifactId>${artifactId}</artifactId>
      <scope>runtime</scope>
    </dependency>`;
}

function generateBuildGradle(
  projectDir: string,
  _name: string,
  packageName: string,
  answers: ProjectAnswers,
): void {
  const { javaVersion, springBootVersion, dependencies } = answers;
  const dependencyBlock = buildGradleDependencies(dependencies);

  const content = `plugins {
  id 'java'
  id 'org.springframework.boot' version '${springBootVersion}'
}

group = '${packageName}'
version = '0.0.1-SNAPSHOT'

java {
  toolchain {
    languageVersion = JavaLanguageVersion.of(${javaVersion})
  }
}

configurations {
  compileOnly {
    extendsFrom annotationProcessor
  }
}

repositories {
  mavenCentral()
}

dependencies {
${dependencyBlock}
}

tasks.named('test') {
  useJUnitPlatform()
}
`;

  writeFile(path.join(projectDir, 'build.gradle'), content);
  logFileCreated('build.gradle');
}

function buildGradleDependencies(dependencies: string[]): string {
  const deps: string[] = [];

  if (dependencies.includes('web')) {
    deps.push(`  implementation 'org.springframework.boot:spring-boot-starter-web'`);
  }
  if (dependencies.includes('jpa')) {
    deps.push(`  implementation 'org.springframework.boot:spring-boot-starter-data-jpa'`);
  }
  if (dependencies.includes('mongodb')) {
    deps.push(`  implementation 'org.springframework.boot:spring-boot-starter-data-mongodb'`);
  }
  if (dependencies.includes('redis')) {
    deps.push(`  implementation 'org.springframework.boot:spring-boot-starter-data-redis'`);
  }
  if (dependencies.includes('security')) {
    deps.push(`  implementation 'org.springframework.boot:spring-boot-starter-security'`);
  }
  if (dependencies.includes('validation')) {
    deps.push(`  implementation 'org.springframework.boot:spring-boot-starter-validation'`);
  }
  if (dependencies.includes('lombok')) {
    deps.push(`  compileOnly 'org.projectlombok:lombok'`);
    deps.push(`  annotationProcessor 'org.projectlombok:lombok'`);
  }
  if (dependencies.includes('mapstruct')) {
    deps.push(`  implementation 'org.mapstruct:mapstruct:1.6.3'`);
    deps.push(`  annotationProcessor 'org.mapstruct:mapstruct-processor:1.6.3'`);
  }
  if (dependencies.includes('mysql')) {
    deps.push(`  runtimeOnly 'com.mysql:mysql-connector-j'`);
  }
  if (dependencies.includes('postgresql')) {
    deps.push(`  runtimeOnly 'org.postgresql:postgresql'`);
  }
  if (dependencies.includes('h2')) {
    deps.push(`  runtimeOnly 'com.h2database:h2'`);
  }
  if (dependencies.includes('openapi')) {
    deps.push(
      `  implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:${DEFAULT_SPRINGDOC_VERSION}'`,
    );
  }

  deps.push(`  testImplementation 'org.springframework.boot:spring-boot-starter-test'`);

  return deps.join('\n');
}

function generateApplicationYml(
  resourcesPath: string,
  projectName: string,
  packageName: string,
  answers: ProjectAnswers,
): void {
  const { dependencies } = answers;

  const h2Config = dependencies.includes('h2')
    ? `
  datasource:
    url: jdbc:h2:mem:demo
    driver-class-name: org.h2.Driver
    username: sa
    password:
  h2:
    console:
      enabled: true`
    : '';

  const jpaConfig = dependencies.includes('jpa')
    ? `
  jpa:
    hibernate:
      ddl-auto: update
    open-in-view: false
    show-sql: true
    properties:
      hibernate:
        format_sql: true${h2Config}`
    : '';

  const content = `spring:
  application:
    name: ${projectName}${jpaConfig}

server:
  port: 8080

logging:
  level:
    ${packageName}: DEBUG
    org.springframework.web: INFO
`;

  writeFile(path.join(resourcesPath, 'application.yml'), content);
  logFileCreated('src/main/resources/application.yml');
}

function generateApplicationClass(
  javaPath: string,
  packageName: string,
  name: string,
): void {
  const className = `${toPascalCase(name)}Application`;

  const content = `package ${packageName};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ${className} {

  public static void main(String[] args) {
    SpringApplication.run(${className}.class, args);
  }
}
`;

  writeFile(path.join(javaPath, `${className}.java`), content);
  logFileCreated(`src/main/java/${packageToPath(packageName)}/${className}.java`);
}

function generateHealthController(
  javaPath: string,
  packageName: string,
  style: GeneratorStyle,
): void {
  const packageSuffix = style === 'ddd-modulith' ? 'common.api' : 'controller';
  const outputDir = path.join(javaPath, ...packageSuffix.split('.'));

  ensureDirectory(outputDir);

  const content = `package ${packageName}.${packageSuffix};

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

  @GetMapping
  public ResponseEntity<Map<String, String>> health() {
    return ResponseEntity.ok(Map.of(
      "status", "UP",
      "message", "Application is running"
    ));
  }
}
`;

  writeFile(path.join(outputDir, 'HealthController.java'), content);
  logFileCreated(
    `src/main/java/${packageToPath(packageName)}/${packageSuffix.replace(/\./g, '/')}/HealthController.java`,
  );
}
