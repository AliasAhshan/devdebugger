import type { DevDebuggerErrorPayload } from "./types";

let overlayRootEl: HTMLDivElement | null = null;
let errors: DevDebuggerErrorPayload[] = [];
let selectedIndex = 0;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatEventType(type: string): string {
  return type
    .split("_")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString();
}

function formatStack(stack?: string): string {
  if (!stack) return "No stack trace available";

  return stack
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function createCopyText(payload: DevDebuggerErrorPayload): string {
  return [
    `Type: ${formatEventType(payload.type)}`,
    `Message: ${payload.message}`,
    `URL: ${payload.url}`,
    `Time: ${payload.timestamp}`,
    payload.errorSource ? `Source: ${payload.errorSource}` : null,
    payload.line ? `Line: ${payload.line}` : null,
    payload.column ? `Column: ${payload.column}` : null,
    "",
    "Stack Trace:",
    payload.stack ?? "No stack trace available",
  ]
    .filter(Boolean)
    .join("\n");
}

function removeOverlay() {
  overlayRootEl?.remove();
  overlayRootEl = null;
}

function renderOverlay() {
  const payload = errors[selectedIndex];

  if (!overlayRootEl || !payload) return;

  const source = payload.errorSource
    ? `
      <div style="margin-top: 8px;">
        <div style="color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em;">
          Source
        </div>
        <div style="color: #e5e7eb; font-size: 13px; word-break: break-all;">
          ${escapeHtml(payload.errorSource)}
          ${
            payload.line
              ? `<span style="color: #9ca3af;">:${payload.line}${
                  payload.column ? `:${payload.column}` : ""
                }</span>`
              : ""
          }
        </div>
      </div>
    `
    : "";

  const errorList = errors
    .map(
      (error, index) => `
        <button
          id="devdebugger-error-${index}"
          style="
            width: 100%;
            text-align: left;
            padding: 8px 10px;
            border-radius: 8px;
            border: 1px solid ${index === selectedIndex ? "#ef4444" : "#1e293b"};
            background: ${index === selectedIndex ? "rgba(239,68,68,0.14)" : "#020617"};
            color: #e5e7eb;
            cursor: pointer;
            margin-bottom: 6px;
            font-size: 12px;
          "
        >
          <div style="font-weight: 700; color: #fca5a5;">
            ${escapeHtml(formatEventType(error.type))}
          </div>
          <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #cbd5e1;">
            ${escapeHtml(error.message)}
          </div>
        </button>
      `,
    )
    .join("");

  overlayRootEl.innerHTML = `
    <div style="
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 520px;
      max-height: 640px;
      overflow: hidden;
      background: #0f172a;
      color: #f9fafb;
      border: 1px solid #334155;
      border-radius: 14px;
      z-index: 999999;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      box-shadow: 0 24px 60px rgba(0,0,0,0.45);
    ">
      <div style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 16px;
        border-bottom: 1px solid #334155;
        background: #111827;
      ">
        <div>
          <div style="font-weight: 700; font-size: 14px;">
            DevDebugger
          </div>
          <div style="color: #9ca3af; font-size: 12px; margin-top: 2px;">
            ${errors.length} error${errors.length === 1 ? "" : "s"} detected
          </div>
        </div>

        <button
          id="devdebugger-close"
          aria-label="Close DevDebugger overlay"
          style="
            width: 28px;
            height: 28px;
            border-radius: 999px;
            background: #1f2937;
            color: #d1d5db;
            border: 1px solid #374151;
            font-size: 18px;
            line-height: 1;
            cursor: pointer;
          "
        >
          ×
        </button>
      </div>

      <div style="display: grid; grid-template-columns: 170px 1fr;">
        <aside style="
          padding: 12px;
          border-right: 1px solid #334155;
          max-height: 560px;
          overflow: auto;
          background: #0b1120;
        ">
          ${errorList}
        </aside>

        <section style="
          padding: 16px;
          max-height: 560px;
          overflow: auto;
        ">
          <div style="
            display: inline-flex;
            align-items: center;
            padding: 4px 8px;
            border-radius: 999px;
            background: rgba(248, 113, 113, 0.12);
            color: #fca5a5;
            border: 1px solid rgba(248, 113, 113, 0.25);
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 10px;
          ">
            ${escapeHtml(formatEventType(payload.type))}
          </div>

          <h3 style="
            margin: 0;
            font-size: 16px;
            line-height: 1.4;
            color: #f9fafb;
          ">
            ${escapeHtml(payload.message)}
          </h3>

          <div style="
            display: flex;
            gap: 8px;
            margin-top: 14px;
            flex-wrap: wrap;
          ">
            <button id="devdebugger-copy" style="
              padding: 8px 10px;
              border-radius: 8px;
              border: 1px solid #334155;
              background: #1e293b;
              color: #e5e7eb;
              cursor: pointer;
              font-size: 12px;
              font-weight: 600;
            ">
              Copy Error
            </button>

            <button id="devdebugger-clear-selected" style="
              padding: 8px 10px;
              border-radius: 8px;
              border: 1px solid #334155;
              background: #1e293b;
              color: #e5e7eb;
              cursor: pointer;
              font-size: 12px;
              font-weight: 600;
            ">
              Clear Error
            </button>

            <button id="devdebugger-clear-all" style="
              padding: 8px 10px;
              border-radius: 8px;
              border: 1px solid #7f1d1d;
              background: rgba(127,29,29,0.35);
              color: #fecaca;
              cursor: pointer;
              font-size: 12px;
              font-weight: 600;
            ">
              Clear All
            </button>

            <button id="devdebugger-ai" style="
              padding: 8px 10px;
              border-radius: 8px;
              border: 1px solid rgba(59,130,246,0.45);
              background: rgba(59,130,246,0.12);
              color: #93c5fd;
              cursor: not-allowed;
              font-size: 12px;
              font-weight: 600;
            ">
              AI Explain Soon
            </button>
          </div>

          <div style="
            margin-top: 14px;
            padding: 12px;
            border-radius: 10px;
            background: #020617;
            border: 1px solid #1e293b;
          ">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div>
                <div style="color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em;">
                  Time
                </div>
                <div style="color: #e5e7eb; font-size: 13px;">
                  ${escapeHtml(formatTime(payload.timestamp))}
                </div>
              </div>

              <div>
                <div style="color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em;">
                  URL
                </div>
                <div style="color: #e5e7eb; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${escapeHtml(payload.url)}
                </div>
              </div>
            </div>

            ${source}
          </div>

          <div style="margin-top: 14px;">
            <div style="
              color: #9ca3af;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.06em;
              margin-bottom: 6px;
            ">
              Stack Trace
            </div>

            <pre style="
              margin: 0;
              white-space: pre-wrap;
              word-break: break-word;
              font-size: 12px;
              line-height: 1.5;
              color: #d1d5db;
              background: #020617;
              padding: 12px;
              border-radius: 10px;
              border: 1px solid #1e293b;
            ">${escapeHtml(formatStack(payload.stack))}</pre>
          </div>
        </section>
      </div>
    </div>
  `;

  document
    .getElementById("devdebugger-close")
    ?.addEventListener("click", () => {
      removeOverlay();
    });

  document
    .getElementById("devdebugger-clear-selected")
    ?.addEventListener("click", () => {
      errors.splice(selectedIndex, 1);

      if (errors.length === 0) {
        selectedIndex = 0;
        removeOverlay();
        return;
      }

      selectedIndex = Math.min(selectedIndex, errors.length - 1);
      renderOverlay();
    });

  document
    .getElementById("devdebugger-clear-all")
    ?.addEventListener("click", () => {
      errors = [];
      selectedIndex = 0;
      removeOverlay();
    });

  document
    .getElementById("devdebugger-copy")
    ?.addEventListener("click", async () => {
      await navigator.clipboard.writeText(createCopyText(payload));
    });

  errors.forEach((_, index) => {
    document
      .getElementById(`devdebugger-error-${index}`)
      ?.addEventListener("click", () => {
        selectedIndex = index;
        renderOverlay();
      });
  });
}

export function showOverlay(payload: DevDebuggerErrorPayload) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  if (!overlayRootEl) {
    overlayRootEl = document.createElement("div");
    overlayRootEl.id = "devdebugger-overlay";
    document.body.appendChild(overlayRootEl);
  }

  errors.unshift(payload);
  selectedIndex = 0;

  renderOverlay();
}
