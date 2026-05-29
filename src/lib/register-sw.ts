/**
 * Registers the service worker if the browser supports it.
 * Call this once from the client-side app entry point.
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined") return null;
  if (!("serviceWorker" in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    console.log("[SW] Service Worker registered, scope:", registration.scope);
    return registration;
  } catch (err) {
    console.warn("[SW] Service Worker registration failed:", err);
    return null;
  }
}
