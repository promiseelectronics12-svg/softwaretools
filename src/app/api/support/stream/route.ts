import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { addSSEClient, removeSSEClient, sendSSEKeepAlive } from "@/lib/sse-broadcast";

/**
 * GET /api/support/stream — Admin-only SSE endpoint.
 * Keeps an HTTP connection open and pushes "new_message" events
 * whenever a customer submits a support message.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let controller: ReadableStreamDefaultController<Uint8Array>;

  const stream = new ReadableStream<Uint8Array>({
    start(ctrl) {
      controller = ctrl;
      addSSEClient(ctrl);

      // Keep-alive ping every 20 seconds to prevent proxy timeouts
      const keepAlive = setInterval(() => sendSSEKeepAlive(ctrl), 20_000);

      // Cleanup when the connection closes
      const cleanup = () => {
        clearInterval(keepAlive);
        removeSSEClient(ctrl);
        try { ctrl.close(); } catch {}
      };

      // Store cleanup on the controller for access in cancel
      (ctrl as unknown as Record<string, unknown>)._cleanup = cleanup;
    },
    cancel() {
      const cleanup = (controller as unknown as Record<string, unknown>)._cleanup;
      if (typeof cleanup === "function") cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
