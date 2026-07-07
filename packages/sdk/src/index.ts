export function devDebuggerTest() {
  return "DevDebugger SDK is working";
}

export { initDevDebugger, destroyDevDebugger } from "./init";
export type {
  DevDebuggerConfig,
  DevDebuggerErrorPayload,
  DevDebuggerEventType,
} from "./types";
