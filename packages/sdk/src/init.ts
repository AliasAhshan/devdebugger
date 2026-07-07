import { setupErrorListeners } from "./listeners";
import { DevDebuggerConfig, DevDebuggerErrorPayload } from "./types";
import { showOverlay } from "./overlay";

let isInit = false;
let cleanupListeners: (() => void) | null = null;

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
    if (finalConfig.showOverlay) {
      showOverlay(payload);
    }
  }

  cleanupListeners = setupErrorListeners((payload) => {
    handlePayload(payload);
  }, finalConfig);
}

export function destroyDevDebugger() {
  cleanupListeners?.();
  cleanupListeners = null;
  isInit = false;
}
