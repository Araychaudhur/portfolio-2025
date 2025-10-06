export function track(event: string, props: Record<string, any> = {}) {
  try {
    const payload = JSON.stringify({ event, props, ts: Date.now() });
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      navigator.sendBeacon("/api/events", new Blob([payload], { type: "application/json" }));
      return;
    }
    fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload });
  } catch {
    // no-op
  }
}
