import { describe, expect, it } from 'vitest';
import { generateCommand } from './generate.js';
import { infoCommand } from './info.js';
import { newCommand } from './new.js';

describe('commands', () => {
  it('should export all command functions', async () => {
    const commands = await import('./index.js');

    expect(commands.generateCommand).toBe(generateCommand);
    expect(commands.newCommand).toBe(newCommand);
    expect(commands.infoCommand).toBe(infoCommand);
  });
});
