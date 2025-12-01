import * as vscode from 'vscode';

/**
 * Log levels for output channel
 */
export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3
}

/**
 * Service for managing extension output channel with log levels
 */
export class OutputChannelService {
  private static instance: OutputChannelService;
  private outputChannel: vscode.OutputChannel;
  private logLevel: LogLevel = LogLevel.Info;

  private constructor() {
    this.outputChannel = vscode.window.createOutputChannel('ArgoCD');
  }

  /**
   * Get singleton instance
   */
  static getInstance(): OutputChannelService {
    if (!OutputChannelService.instance) {
      OutputChannelService.instance = new OutputChannelService();
    }
    return OutputChannelService.instance;
  }

  /**
   * Set log level from configuration
   */
  setLogLevel(level: string): void {
    switch (level.toLowerCase()) {
      case 'debug':
        this.logLevel = LogLevel.Debug;
        break;
      case 'info':
        this.logLevel = LogLevel.Info;
        break;
      case 'warn':
        this.logLevel = LogLevel.Warn;
        break;
      case 'error':
        this.logLevel = LogLevel.Error;
        break;
      default:
        this.logLevel = LogLevel.Info;
    }
    this.info(`Log level set to: ${level.toUpperCase()}`);
  }

  /**
   * Get current log level as string
   */
  getCurrentLogLevel(): string {
    switch (this.logLevel) {
      case LogLevel.Debug:
        return 'debug';
      case LogLevel.Info:
        return 'info';
      case LogLevel.Warn:
        return 'warn';
      case LogLevel.Error:
        return 'error';
      default:
        return 'info';
    }
  }

  /**
   * Show the output channel
   */
  show(): void {
    this.outputChannel.show();
  }

  /**
   * Log debug message
   */
  debug(message: string): void {
    if (this.logLevel <= LogLevel.Debug) {
      this.log('DEBUG', message);
    }
  }

  /**
   * Log info message
   */
  info(message: string): void {
    if (this.logLevel <= LogLevel.Info) {
      this.log('INFO', message);
    }
  }

  /**
   * Log warning message
   */
  warn(message: string): void {
    if (this.logLevel <= LogLevel.Warn) {
      this.log('WARN', message);
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error): void {
    if (this.logLevel <= LogLevel.Error) {
      this.log('ERROR', message);
      if (error) {
        this.outputChannel.appendLine(`  ${error.message}`);
        if (error.stack) {
          this.outputChannel.appendLine(`  ${error.stack}`);
        }
      }
    }
  }

  /**
   * Log command execution
   */
  logCommand(command: string): void {
    this.debug(`Executing command: ${command}`);
  }

  /**
   * Log command output
   */
  logCommandOutput(output: string): void {
    this.debug(`Command output: ${output.substring(0, 500)}${output.length > 500 ? '...' : ''}`);
  }

  /**
   * Internal log method
   */
  private log(level: string, message: string): void {
    const timestamp = new Date().toISOString();
    this.outputChannel.appendLine(`[${timestamp}] [${level}] ${message}`);
  }

  /**
   * Clear output channel
   */
  clear(): void {
    this.outputChannel.clear();
  }

  /**
   * Dispose output channel
   */
  dispose(): void {
    this.outputChannel.dispose();
  }
}
