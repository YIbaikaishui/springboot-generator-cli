import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';
import inquirer from 'inquirer';
import { newCommand } from '../dist/commands/new.js';
import { generateModule } from '../dist/generators/module.js';

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'springboot-generator-smoke-'));
const projectRoot = path.join(tempDir, 'smoke-demo');
const originalPrompt = inquirer.prompt;
const originalCwd = process.cwd();

try {
  inquirer.prompt = async (questions) => {
    const firstQuestion = Array.isArray(questions) ? questions[0] : questions;
    if (firstQuestion?.name === 'overwrite') {
      return { overwrite: true };
    }

    return {
      buildTool: 'Maven',
      javaVersion: '21',
      springBootVersion: '3.5.13',
      dependencies: ['web', 'jpa', 'validation', 'lombok', 'h2'],
    };
  };

  await newCommand('smoke-demo', {
    package: 'com.example.demo',
    directory: tempDir,
    style: 'ddd-modulith',
  });

  process.chdir(projectRoot);

  await generateModule({
    name: 'User',
    packageName: 'com.example.demo',
    directory: 'src/main/java',
    style: 'ddd-modulith',
    jpa: true,
    lombok: true,
  });

  const env = buildJava21Env();
  const { command, args } = getMavenInvocation();
  execFileSync(command, args, {
    cwd: projectRoot,
    stdio: 'inherit',
    env,
  });
} finally {
  inquirer.prompt = originalPrompt;
  process.chdir(originalCwd);
  fs.rmSync(tempDir, { recursive: true, force: true });
}

function buildJava21Env() {
  const javaHome = process.env.SMOKE_JAVA_HOME || process.env.JAVA_HOME;

  if (!javaHome) {
    return process.env;
  }

  const javaBin = path.join(javaHome, 'bin');
  const pathKey = process.platform === 'win32' ? 'Path' : 'PATH';
  const currentPath = process.env[pathKey] || '';

  return {
    ...process.env,
    JAVA_HOME: javaHome,
    PATH: `${javaBin}${path.delimiter}${currentPath}`,
    [pathKey]: `${javaBin}${path.delimiter}${currentPath}`,
  };
}

function getMavenInvocation() {
  if (process.platform === 'win32') {
    return {
      command: 'cmd.exe',
      args: ['/c', 'mvn', '-q', '-DskipTests', 'compile'],
    };
  }

  return {
    command: 'mvn',
    args: ['-q', '-DskipTests', 'compile'],
  };
}
