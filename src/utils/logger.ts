/**
 * Enhanced logging utility for cvphoto.app
 * Provides structured logging with different levels and better error tracking
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: any;
  error?: Error;
}

class Logger {
  private isDevelopment: boolean;
  private logLevel: LogLevel;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  private formatMessage(entry: LogEntry): string {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    const levelName = levelNames[entry.level];
    const context = entry.context ? `[${entry.context}]` : '';
    
    return `${entry.timestamp} ${levelName} ${context} ${entry.message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: string,
    data?: any,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      data,
      error,
    };
  }

  debug(message: string, context?: string, data?: any): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context, data);
    
    if (this.isDevelopment) {
      console.log(this.formatMessage(entry), data || '');
    }
  }

  info(message: string, context?: string, data?: any): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    const entry = this.createLogEntry(LogLevel.INFO, message, context, data);
    
    console.log(this.formatMessage(entry), data || '');
  }

  warn(message: string, context?: string, data?: any): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    const entry = this.createLogEntry(LogLevel.WARN, message, context, data);
    
    console.warn(this.formatMessage(entry), data || '');
  }

  error(message: string, error?: Error, context?: string, data?: any): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, data, error);
    
    console.error(this.formatMessage(entry), {
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
      data,
    });

    // In production, you might want to send errors to a monitoring service
    if (!this.isDevelopment && error) {
      this.sendToMonitoring(entry);
    }
  }

  private sendToMonitoring(entry: LogEntry): void {
    // Placeholder for error monitoring service integration
    // You could integrate with services like Sentry, LogRocket, etc.
    // For now, we'll just ensure the error is properly logged
  }

  // Specialized logging methods for common use cases
  apiCall(method: string, url: string, status?: number, duration?: number): void {
    this.info(
      `API ${method} ${url}`,
      'API',
      { status, duration: duration ? `${duration}ms` : undefined }
    );
  }

  apiError(method: string, url: string, error: Error, status?: number): void {
    this.error(
      `API ${method} ${url} failed`,
      error,
      'API',
      { status }
    );
  }

  userAction(action: string, userId?: string, data?: any): void {
    this.info(
      `User action: ${action}`,
      'USER',
      { userId, ...data }
    );
  }

  paymentEvent(event: string, amount?: number, userId?: string, data?: any): void {
    this.info(
      `Payment event: ${event}`,
      'PAYMENT',
      { amount, userId, ...data }
    );
  }

  aiProcessing(model: string, operation: string, duration?: number, data?: any): void {
    this.info(
      `AI ${operation} with ${model}`,
      'AI',
      { duration: duration ? `${duration}ms` : undefined, ...data }
    );
  }

  uploadEvent(event: string, fileCount?: number, totalSize?: number, data?: any): void {
    this.info(
      `Upload event: ${event}`,
      'UPLOAD',
      { fileCount, totalSize: totalSize ? `${totalSize} bytes` : undefined, ...data }
    );
  }
}

// Create singleton instance
export const logger = new Logger();

// Convenience functions for backward compatibility
export const log = {
  debug: (message: string, context?: string, data?: any) => logger.debug(message, context, data),
  info: (message: string, context?: string, data?: any) => logger.info(message, context, data),
  warn: (message: string, context?: string, data?: any) => logger.warn(message, context, data),
  error: (message: string, error?: Error, context?: string, data?: any) => logger.error(message, error, context, data),
  
  // Specialized methods
  api: logger.apiCall.bind(logger),
  apiError: logger.apiError.bind(logger),
  user: logger.userAction.bind(logger),
  payment: logger.paymentEvent.bind(logger),
  ai: logger.aiProcessing.bind(logger),
  upload: logger.uploadEvent.bind(logger),
};

export default logger;
