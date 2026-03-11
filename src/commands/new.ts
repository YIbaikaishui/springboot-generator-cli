import chalk from 'chalk';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs';
import { ensureDirectory, writeFile, logFileCreated } from '../utils/file.js';
import { packageToPath } from '../utils/naming.js';

interface NewProjectOptions {
  package: string;
  directory?: string;
}

export async function newCommand(
  name: string,
  options: NewProjectOptions
): Promise<void> {
  console.log(chalk.cyan(`Creating Spring Boot project: ${name}`));
  console.log();

  // Ask for additional options
  const answers = await inquirer.prompt([
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
      choices: ['17', '21', '11'],
      default: '17',
    },
    {
      type: 'list',
      name: 'springBootVersion',
      message: 'Spring Boot version:',
      choices: ['3.2.0', '3.1.0', '3.0.0', '2.7.0'],
      default: '3.2.0',
    },
    {
      type: 'checkbox',
      name: 'dependencies',
      message: 'Select dependencies:',
      choices: [
        { name: 'Spring Web', value: 'web', checked: true },
        { name: 'Spring Data JPA', value: 'jpa' },
        { name: 'Spring Data MongoDB', value: 'mongodb' },
        { name: 'Spring Data Redis', value: 'redis' },
        { name: 'Spring Security', value: 'security' },
        { name: 'Spring Validation', value: 'validation', checked: true },
        { name: 'Lombok', value: 'lombok', checked: true },
        { name: 'MapStruct', value: 'mapstruct' },
        { name: 'MySQL Driver', value: 'mysql' },
        { name: 'PostgreSQL Driver', value: 'postgresql' },
        { name: 'H2 Database', value: 'h2' },
        { name: 'OpenAPI/Swagger', value: 'openapi', checked: true },
      ],
    },
  ]);

  const packageName = options.package || 'com.example';
  const projectDir = options.directory 
    ? path.join(options.directory, name)
    : path.join(process.cwd(), name);

  // Check if directory exists
  if (fs.existsSync(projectDir)) {
    const { overwrite } = await inquirer.prompt([
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

  // Generate project structure
  console.log(chalk.gray('\nGenerating project structure...\n'));

  // Create directory structure
  const packagePath = packageToPath(packageName);
  const mainJavaPath = path.join(projectDir, 'src/main/java', packagePath);
  const mainResourcesPath = path.join(projectDir, 'src/main/resources');
  const testJavaPath = path.join(projectDir, 'src/test/java', packagePath);
  const testResourcesPath = path.join(projectDir, 'src/test/resources');

  ensureDirectory(mainJavaPath);
  ensureDirectory(mainResourcesPath);
  ensureDirectory(testJavaPath);
  ensureDirectory(testResourcesPath);

  // Generate files based on build tool
  if (answers.buildTool === 'Maven') {
    generatePomXml(projectDir, name, packageName, answers);
  } else {
    generateBuildGradle(projectDir, name, packageName, answers);
  }

  // Generate application.yml
  generateApplicationYml(mainResourcesPath, packageName, answers);

  // Generate main Application class
  generateApplicationClass(mainJavaPath, packageName, name);

  // Generate example controller
  generateExampleController(mainJavaPath, packageName);

  console.log(chalk.green('\n✓ Project created successfully!'));
  console.log();
  console.log(chalk.gray('Next steps:'));
  console.log(chalk.gray(`  cd ${name}`));
  if (answers.buildTool === 'Maven') {
    console.log(chalk.gray('  ./mvnw spring-boot:run'));
  } else {
    console.log(chalk.gray('  ./gradlew bootRun'));
  }
}

interface ProjectAnswers {
  buildTool: string;
  javaVersion: string;
  springBootVersion: string;
  dependencies: string[];
  name?: string;
}

function generatePomXml(
  projectDir: string,
  name: string,
  packageName: string,
  answers: ProjectAnswers
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
        <relativePath/>
    </parent>
    
    <groupId>${packageName}</groupId>
    <artifactId>${name}</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>${name}</name>
    <description>${name} project for Spring Boot</description>
    
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
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>`;

  const filePath = path.join(projectDir, 'pom.xml');
  writeFile(filePath, content);
  logFileCreated('pom.xml');
}

function buildMavenDependencies(dependencies: string[]): string {
  const deps: string[] = [];
  
  if (dependencies.includes('web')) {
    deps.push(`<dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>`);
  }
  if (dependencies.includes('jpa')) {
    deps.push(`<dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>`);
  }
  if (dependencies.includes('mongodb')) {
    deps.push(`<dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-mongodb</artifactId>
        </dependency>`);
  }
  if (dependencies.includes('redis')) {
    deps.push(`<dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>`);
  }
  if (dependencies.includes('security')) {
    deps.push(`<dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>`);
  }
  if (dependencies.includes('validation')) {
    deps.push(`<dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>`);
  }
  if (dependencies.includes('lombok')) {
    deps.push(`<dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>`);
  }
  if (dependencies.includes('mapstruct')) {
    deps.push(`<dependency>
            <groupId>org.mapstruct</groupId>
            <artifactId>mapstruct</artifactId>
            <version>1.5.5.Final</version>
        </dependency>`);
  }
  if (dependencies.includes('mysql')) {
    deps.push(`<dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>`);
  }
  if (dependencies.includes('postgresql')) {
    deps.push(`<dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>`);
  }
  if (dependencies.includes('h2')) {
    deps.push(`<dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>`);
  }
  if (dependencies.includes('openapi')) {
    deps.push(`<dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>2.3.0</version>
        </dependency>`);
  }
  
  // Test dependency
  deps.push(`<dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>`);
  
  return deps.join('\n        ');
}

function generateBuildGradle(
  projectDir: string,
  _name: string,
  packageName: string,
  answers: ProjectAnswers
): void {
  const { javaVersion, springBootVersion, dependencies } = answers;
  
  const depImpl = buildGradleDependencies(dependencies);
  
  const content = `plugins {
    id 'java'
    id 'org.springframework.boot' version '${springBootVersion}'
    id 'io.spring.dependency-management' version '1.1.4'
}

group = '${packageName}'
version = '0.0.1-SNAPSHOT'

java {
    sourceCompatibility = '${javaVersion}'
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
    ${depImpl}
}

tasks.named('test') {
    useJUnitPlatform()
}`;

  const filePath = path.join(projectDir, 'build.gradle');
  writeFile(filePath, content);
  logFileCreated('build.gradle');
}

function buildGradleDependencies(dependencies: string[]): string {
  const deps: string[] = [];
  
  if (dependencies.includes('web')) {
    deps.push("implementation 'org.springframework.boot:spring-boot-starter-web'");
  }
  if (dependencies.includes('jpa')) {
    deps.push("implementation 'org.springframework.boot:spring-boot-starter-data-jpa'");
  }
  if (dependencies.includes('mongodb')) {
    deps.push("implementation 'org.springframework.boot:spring-boot-starter-data-mongodb'");
  }
  if (dependencies.includes('redis')) {
    deps.push("implementation 'org.springframework.boot:spring-boot-starter-data-redis'");
  }
  if (dependencies.includes('security')) {
    deps.push("implementation 'org.springframework.boot:spring-boot-starter-security'");
  }
  if (dependencies.includes('validation')) {
    deps.push("implementation 'org.springframework.boot:spring-boot-starter-validation'");
  }
  if (dependencies.includes('lombok')) {
    deps.push("compileOnly 'org.projectlombok:lombok'");
    deps.push("annotationProcessor 'org.projectlombok:lombok'");
  }
  if (dependencies.includes('mapstruct')) {
    deps.push("implementation 'org.mapstruct:mapstruct:1.5.5.Final'");
    deps.push("annotationProcessor 'org.mapstruct:mapstruct-processor:1.5.5.Final'");
  }
  if (dependencies.includes('mysql')) {
    deps.push("runtimeOnly 'com.mysql:mysql-connector-j'");
  }
  if (dependencies.includes('postgresql')) {
    deps.push("runtimeOnly 'org.postgresql:postgresql'");
  }
  if (dependencies.includes('h2')) {
    deps.push("runtimeOnly 'com.h2database:h2'");
  }
  if (dependencies.includes('openapi')) {
    deps.push("implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.3.0'");
  }
  
  deps.push("testImplementation 'org.springframework.boot:spring-boot-starter-test'");
  
  return deps.join('\n    ');
}

function generateApplicationYml(
  resourcesPath: string,
  packageName: string,
  answers: ProjectAnswers
): void {
  const { name, dependencies } = answers;
  
  let dbConfig = '';
  if (dependencies.includes('h2')) {
    dbConfig = `
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password: 
  h2:
    console:
      enabled: true`;
  }
  
  const content = `spring:
  application:
    name: ${name}${dependencies.includes('jpa') ? `
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true${dbConfig}` : ''}

server:
  port: 8080

# Logging configuration
logging:
  level:
    ${packageName}: DEBUG
    org.springframework.web: INFO
`;

  const filePath = path.join(resourcesPath, 'application.yml');
  writeFile(filePath, content);
  logFileCreated('src/main/resources/application.yml');
}

function generateApplicationClass(
  javaPath: string,
  packageName: string,
  name: string
): void {
  const className = toPascalCase(name.replace(/-/g, ' ')) + 'Application';
  
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

  const filePath = path.join(javaPath, `${className}.java`);
  writeFile(filePath, content);
  logFileCreated(`src/main/java/${className}.java`);
}

function generateExampleController(javaPath: string, packageName: string): void {
  const controllerDir = path.join(javaPath, 'controller');
  ensureDirectory(controllerDir);
  
  const content = `package ${packageName}.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "message", "Application is running"
        ));
    }
}
`;

  const filePath = path.join(controllerDir, 'HealthController.java');
  writeFile(filePath, content);
  logFileCreated('src/main/java/controller/HealthController.java');
}

function toPascalCase(str: string): string {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}
