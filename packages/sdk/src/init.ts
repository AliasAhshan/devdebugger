import { setupErrorListeners } from "./listeners";
import { DevDebuggerConfig, DevDebuggerErrorPayload } from "./types";

let isInit = false;

export function initDevDebugger(config: DevDebuggerConfig) {
  const defaultConfig: Partial<DevDebuggerConfig> = {
    captureConsoleErrors: true,
    capturePromiseErrors: true,
    captureRuntimeErrors: true,
    showOverlay: true,
  };

  const finalConfig = {
    ...defaultConfig,
    ...config,
  };

  if (!finalConfig.enabled) return;
  if (isInit) return;

  isInit = true;

  function handlePayload(payload: DevDebuggerErrorPayload) {
    console.log(`[DevDebugger]`, payload);
  }

  setupErrorListeners((payload) => {
    console.log(payload);
  }, finalConfig);
}
