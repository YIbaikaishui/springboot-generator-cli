import { describe, it, expect } from 'vitest';

describe('commands', () => {
  it('should export all command functions', async () => {
    const commands = await import('./index.js');
    
    expect(typeof commands.generateCommand).toBe('function');
    expect(typeof commands.newCommand).toBe('function');
    expect(typeof commands.infoCommand).toBe('function');
  });
});
