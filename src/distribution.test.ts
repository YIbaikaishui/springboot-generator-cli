import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const repoRoot = process.cwd();

describe('distribution metadata', () => {
  it('includes public npm metadata for the GitHub repository', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf-8')
    ) as {
      repository?: { type?: string; url?: string };
      homepage?: string;
      bugs?: { url?: string };
      publishConfig?: { access?: string };
    };

    expect(packageJson.repository).toEqual({
      type: 'git',
      url: 'git+https://github.com/YIbaikaishui/springboot-generator-cli.git',
    });
    expect(packageJson.homepage).toBe(
      'https://github.com/YIbaikaishui/springboot-generator-cli#readme'
    );
    expect(packageJson.bugs).toEqual({
      url: 'https://github.com/YIbaikaishui/springboot-generator-cli/issues',
    });
    expect(packageJson.publishConfig).toEqual({ access: 'public' });
  });

  it('ships a skill package with aligned names and install commands', () => {
    const readme = fs.readFileSync(path.join(repoRoot, 'README.md'), 'utf-8');
    const readmeZh = fs.readFileSync(path.join(repoRoot, 'README_zh.md'), 'utf-8');
    const skill = fs.readFileSync(
      path.join(repoRoot, 'skills/springboot-generator/SKILL.md'),
      'utf-8'
    );
    const usage = fs.readFileSync(
      path.join(repoRoot, 'skills/springboot-generator/references/usage.md'),
      'utf-8'
    );
    const openaiYaml = fs.readFileSync(
      path.join(repoRoot, 'skills/springboot-generator/agents/openai.yaml'),
      'utf-8'
    );
    const openaiConfig = parse(openaiYaml) as {
      interface?: { display_name?: string; default_prompt?: string };
    };

    const installCommand =
      'npx skills add https://github.com/YIbaikaishui/springboot-generator-cli --skill springboot-generator';

    expect(readme).toContain(installCommand);
    expect(readme).toContain('npx springboot-generator-cli@latest');
    expect(readmeZh).toContain(installCommand);
    expect(skill).toContain('name: springboot-generator');
    expect(skill).toContain('ddd-modulith');
    expect(skill).toContain('--fields');
    expect(usage).toContain('npx springboot-generator-cli@latest');
    expect(usage).toContain('node dist/cli.js');
    expect(openaiConfig.interface?.display_name).toBe('SpringBoot Generator');
    expect(openaiConfig.interface?.default_prompt).toContain('Use $springboot-generator');
  });
});
