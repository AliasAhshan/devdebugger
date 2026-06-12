import type {
  DevDebuggerConfig,
  DevDebuggerErrorPayload,
  DevDebuggerListenerCallback,
} from "./types";

export function setupErrorListeners(
  callback: DevDebuggerListenerCallback,
  config: DevDebuggerConfig,
) {
  const originalConsoleError = console.error;

  if (config.captureRuntimeErrors) {
    window.addEventListener("error", (event) => {
      const payload: DevDebuggerErrorPayload = {
        type: "window_error",
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
  }

  if (config.capturePromiseErrors) {
    window.addEventListener("unhandledrejection", (event) => {
      const payload: DevDebuggerErrorPayload = {
        type: "unhandled_rejection",
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
  }

  if (config.captureConsoleErrors) {
    console.error = (...args) => {
      const payload: DevDebuggerErrorPayload = {
        type: "console_error",
        message: args.map((arg) => String(arg)).join(" "),
        url: window.location.href,
        environmentInfo: navigator.userAgent,
        timestamp: new Date().toISOString(),
        stack: args.find((arg) => arg instanceof Error)?.stack,
      };
      callback(payload);
      return originalConsoleError.apply(console, args);
    };
  }
}
