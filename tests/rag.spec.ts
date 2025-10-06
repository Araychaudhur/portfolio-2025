import { test, expect } from "@playwright/test";

test("RAG endpoint refuses off-corpus", async ({ request }) => {
  const res = await request.post("/api/ask", { data: { question: "Tell me about quantum teleportation frogs" } });
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.answer).toMatch(/I can only answer from my site/i);
});
