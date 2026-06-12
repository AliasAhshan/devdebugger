export type DevDebuggerConfig = {
  projectKey: string;
  enabled: boolean;
  endpoint?: string;
  captureConsoleErrors?: boolean;
  captureRuntimeErrors?: boolean;
  capturePromiseErrors?: boolean;
  showOverlay?: boolean;
};

export type DevDebuggerEventType =
  | "window_error"
  | "console_error"
  | "react_error"
  | "unhandled_rejection";

export type DevDebuggerErrorPayload = {
  type: DevDebuggerEventType;
  message: string;
  url: string;
  environmentInfo: string;
  timestamp: string;
  stack?: string;
  errorSource?: string;
  line?: number;
  column?: number;
};

export type DevDebuggerListenerCallback = (
  payload: DevDebuggerErrorPayload,
) => void;
