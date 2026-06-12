export function devDebuggerTest() {
  return "DevDebugger SDK is working";
}

export { initDevDebugger } from "./init";
export type {
  DevDebuggerConfig,
  DevDebuggerErrorPayload,
  DevDebuggerEventType,
} from "./types";
