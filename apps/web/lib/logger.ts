/**
 * B.O.G.A Professional Frontend Logger
 * Memberikan visibilitas proses yang jelas & bergaya di konsol browser.
 */

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

class Logger {
  private isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

  private format(level: LogLevel, module: string, message: string) {
    const timestamp = new Date().toLocaleTimeString();
    const colors = {
      INFO: 'background: #2563eb; color: white; padding: 2px 4px; border-radius: 2px;',
      WARN: 'background: #d97706; color: white; padding: 2px 4px; border-radius: 2px;',
      ERROR: 'background: #dc2626; color: white; padding: 2px 4px; border-radius: 2px;',
      DEBUG: 'background: #4b5563; color: white; padding: 2px 4px; border-radius: 2px;',
    };

    return [
      `%c[BOGA-${level}]%c %c${timestamp}%c %c${module}%c: ${message}`,
      colors[level],
      '',
      'color: #6b7280; font-size: 10px;',
      '',
      'font-weight: bold; color: #1f2937;',
      '',
    ];
  }

  info(module: string, message: string, data?: any) {
    if (!this.isDev) return;
    const parts = this.format('INFO', module, message);
    if (data) {
      console.log(...parts, data);
    } else {
      console.log(...parts);
    }
  }

  warn(module: string, message: string, data?: any) {
    if (!this.isDev) return;
    const parts = this.format('WARN', module, message);
    console.warn(...parts, data || '');
  }

  error(module: string, message: string, data?: any) {
    // Error tetap muncul di prod untuk tracking dasar
    const parts = this.format('ERROR', module, message);
    console.error(...parts, data || '');
  }

  debug(module: string, message: string, data?: any) {
    if (!this.isDev) return;
    const parts = this.format('DEBUG', module, message);
    console.log(...parts, data || '');
  }
}

export const logger = new Logger();
