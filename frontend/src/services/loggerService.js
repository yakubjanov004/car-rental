import axios from 'axios';
import { BASE_ORIGIN } from './api/apiClient';

const LOG_ENDPOINT = `${BASE_ORIGIN}/api/logs/frontend/`;

class LoggerService {
  static async log(level, message, stackTrace = '', component = '') {
    try {
      await axios.post(LOG_ENDPOINT, {
        level,
        message,
        stackTrace,
        component,
        url: window.location.href,
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } catch (err) {
      // Prevent infinite loop if logging itself fails
      console.originalLog('Failed to send log to server:', err);
    }
  }

  static init() {
    // Keep original methods
    console.originalError = console.error;
    console.originalWarn = console.warn;
    console.originalLog = console.log;

    // Override console.error
    console.error = (...args) => {
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
      this.log('error', message, new Error().stack, 'Console');
      console.originalError(...args);
    };

    // Override console.warn
    console.warn = (...args) => {
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
      this.log('warning', message, '', 'Console');
      console.originalWarn(...args);
    };

    // Global Error Handler
    window.onerror = (message, source, lineno, colno, error) => {
      this.log('error', message, error?.stack || `At ${source}:${lineno}:${colno}`, 'Window');
    };

    // Global Promise Rejection Handler
    window.onunhandledrejection = (event) => {
      this.log('error', `Unhandled Rejection: ${event.reason}`, event.reason?.stack, 'Promise');
    };
  }
}

export default LoggerService;
