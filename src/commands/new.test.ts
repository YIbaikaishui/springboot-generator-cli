import fs from 'fs';
import os from 'os';
import path from 'path';
import inquirer from 'inquirer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { newCommand } from './new.js';

describe('newCommand', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'springboot-generate-new-'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('creates a DDD/Modulith-ready project by default', async () => {
    vi.spyOn(inquirer, 'prompt').mockResolvedValueOnce({
      buildTool: 'Maven',
      javaVersion: '21',
      springBootVersion: '3.5.13',
      dependencies: ['web', 'jpa', 'validation', 'lombok', 'h2'],
    });

    await newCommand('demo-app', {
      package: 'com.example.demo',
      directory: tempDir,
      style: 'ddd-modulith',
    });

    const projectRoot = path.join(tempDir, 'demo-app');
    const pomXml = fs.readFileSync(path.join(projectRoot, 'pom.xml'), 'utf-8');
    expect(pomXml).toContain('<version>3.5.13</version>');
    expect(pomXml).toContain('<java.version>21</java.version>');

    const healthController = path.join(
      projectRoot,
      'src/main/java/com/example/demo/common/api/HealthController.java',
    );
    expect(fs.existsSync(healthController)).toBe(true);
    expect(
      fs.existsSync(
        path.join(
          projectRoot,
          'src/main/java/com/example/demo/controller/HealthController.java',
        ),
      ),
    ).toBe(false);
  });

  it('keeps the legacy layered scaffold available as an opt-in style', async () => {
    vi.spyOn(inquirer, 'prompt').mockResolvedValueOnce({
      buildTool: 'Maven',
      javaVersion: '21',
      springBootVersion: '3.5.13',
      dependencies: ['web', 'validation', 'lombok'],
    });

    await newCommand('demo-layered', {
      package: 'com.example.demo',
      directory: tempDir,
      style: 'layered',
    });

    const projectRoot = path.join(tempDir, 'demo-layered');
    expect(
      fs.existsSync(
        path.join(
          projectRoot,
          'src/main/java/com/example/demo/controller/HealthController.java',
        ),
      ),
    ).toBe(true);
  });
});
