/**
 * SSE Broadcast — module-level Set of active admin SSE controllers.
 * Works in single-process deployments (local dev + VPS).
 */
type SSEController = ReadableStreamDefaultController<Uint8Array>;

const clients = new Set<SSEController>();
const encoder = new TextEncoder();

export function addSSEClient(controller: SSEController) {
  clients.add(controller);
}

export function removeSSEClient(controller: SSEController) {
  clients.delete(controller);
}

export function broadcastSSE(event: string, data: object) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  const encoded = encoder.encode(payload);
  for (const ctrl of [...clients]) {
    try {
      ctrl.enqueue(encoded);
    } catch {
      clients.delete(ctrl);
    }
  }
}

export function sendSSEKeepAlive(controller: SSEController) {
  try {
    controller.enqueue(encoder.encode(": keep-alive\n\n"));
  } catch {
    clients.delete(controller);
  }
}
