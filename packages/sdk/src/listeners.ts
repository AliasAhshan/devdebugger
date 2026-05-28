import type {
  DevDebuggerErrorPayload,
  DevDebuggerListenerCallback,
} from './types';

export function setupErrorListeners(callback: DevDebuggerListenerCallback) {
  let originalConsoleError = console.error;

  window.addEventListener('error', (event) => {
    const payload: DevDebuggerErrorPayload = {
      type: 'window_error',
      message: event.message,
      url: window.location.href,
      environmentInfo: navigator.userAgent,
      timestamp: new Date().toISOString(),
      stack: event.error?.stack,
      errorSource: event?.filename,
      line: event?.lineno,
      column: event?.colno,
    };
    callback(payload);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const payload: DevDebuggerErrorPayload = {
      type: 'unhandled_rejection',
      message: event.reason.message
        ? event.reason.message
        : event.reason.toString(),
      url: window.location.href,
      environmentInfo: navigator.userAgent,
      timestamp: new Date().toISOString(),
      stack: event.reason?.stack,
    };
    callback(payload);
  });

  console.error = (...args) => {
    const payload: DevDebuggerErrorPayload = {
      type: 'console_error',
      message: args.map((arg) => String(arg)).join(' '),
      url: window.location.href,
      environmentInfo: navigator.userAgent,
      timestamp: new Date().toISOString(),
      stack: args.find((arg) => arg instanceof Error)?.stack,
    };
    callback(payload);
    return originalConsoleError.apply(console, args);
  };
}
