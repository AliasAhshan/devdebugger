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

  const handleWindowError = (event: ErrorEvent) => {
    const payload: DevDebuggerErrorPayload = {
      type: "window_error",
      message: event.message,
      url: window.location.href,
      environmentInfo: navigator.userAgent,
      timestamp: new Date().toISOString(),
      stack: event.error?.stack,
      errorSource: event.filename,
      line: event.lineno,
      column: event.colno,
    };

    callback(payload);
  };

  const handlePromiseRejection = (event: PromiseRejectionEvent) => {
    const payload: DevDebuggerErrorPayload = {
      type: "unhandled_rejection",
      message:
        event.reason instanceof Error
          ? event.reason.message
          : String(event.reason),
      url: window.location.href,
      environmentInfo: navigator.userAgent,
      timestamp: new Date().toISOString(),
      stack: event.reason instanceof Error ? event.reason.stack : undefined,
    };

    callback(payload);
  };

  const handleConsoleError = (...args: unknown[]) => {
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

  if (config.captureRuntimeErrors) {
    window.addEventListener("error", handleWindowError);
  }

  if (config.capturePromiseErrors) {
    window.addEventListener("unhandledrejection", handlePromiseRejection);
  }

  if (config.captureConsoleErrors) {
    console.error = handleConsoleError;
  }

  return () => {
    if (config.captureRuntimeErrors) {
      window.removeEventListener("error", handleWindowError);
    }

    if (config.capturePromiseErrors) {
      window.removeEventListener("unhandledrejection", handlePromiseRejection);
    }

    if (config.captureConsoleErrors) {
      console.error = originalConsoleError;
    }
  };
}
