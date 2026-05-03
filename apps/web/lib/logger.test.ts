import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from './logger';

describe('Frontend Logger TDD', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should log INFO messages with stylized output', () => {
    logger.info('TestModule', 'Hello World');
    // Cek argumen pertama yang berisi string gabungan dengan placeholder %c
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('[BOGA-INFO]'),
      expect.stringContaining('color: white'), // styles
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything()
    );
    
    // Pastikan pesan aslinya ada di dalam string pertama
    const firstArg = (console.log as any).mock.calls[0][0];
    expect(firstArg).toContain('TestModule');
    expect(firstArg).toContain('Hello World');
  });

  it('should log ERROR messages even in production-like scenarios', () => {
    logger.error('TestModule', 'Fatal Error');
    expect(console.error).toHaveBeenCalled();
  });
});
