"use client";

import { useEffect } from "react";
import { initDevDebugger, destroyDevDebugger } from "devdebugger";

export default function Home() {
  useEffect(() => {
    initDevDebugger({
      projectKey: "test-project",
      enabled: true,
    });
  }, []);

  return (
    <main>
      <h1>DevDebugger Test App</h1>

      <button onClick={() => console.error("Console error test")}>
        Trigger Console Error
      </button>

      <button
        onClick={() => {
          Promise.reject(new Error("Promise rejection test"));
        }}
      >
        Trigger Promise Error
      </button>

      <button
        onClick={() => {
          throw new Error("Runtime error test");
        }}
      >
        Trigger Runtime Error
      </button>
      <button onClick={() => destroyDevDebugger()}>Destroy DevDebugger</button>
    </main>
  );
}
