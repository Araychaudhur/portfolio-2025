"use client";

import { useState, FormEvent } from "react";
import { useChat } from "@ai-sdk/react"; // v5 API
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * RagBotUI (AI SDK v5)
 * - Manage your own input state (v5 no longer provides it).
 * - Use `status` to derive loading instead of `isLoading`.
 * - Render text by joining message.parts (fallback to legacy .content).
 */
export function RagBotUI() {
  const [text, setText] = useState("");

  // v5 returns `messages`, `sendMessage`, `status`, `error`, etc.
  const { messages, sendMessage, status, error, clearError } = useChat();

  // Loading when a request is being submitted or streaming
  const loading = status === "submitted" || status === "streaming";

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    clearError?.();
    // v5: sendMessage with plain text or a CreateUIMessage
    sendMessage({ text: t });
    setText("");
  }

  // Safely extract text from v5 UIMessage.parts; fall back to legacy .content
  function messageText(m: any): string {
    if (Array.isArray(m?.parts)) {
      return m.parts
        .map((p: any) => (typeof p?.text === "string" ? p.text : ""))
        .join("");
    }
    return typeof m?.content === "string" ? m.content : "";
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-grow space-y-4 overflow-y-auto p-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`rounded-lg p-3 ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p className="whitespace-pre-wrap">{messageText(m)}</p>
            </div>
          </div>
        ))}

        {error ? (
          <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {String(error?.message || "Something went wrong")}
          </div>
        ) : null}
      </div>

      <form onSubmit={onSubmit} className="border-t p-4">
        <div className="flex items-center gap-x-2">
          <Input
            value={text}
            placeholder="Ask about my work..."
            onChange={(e) => setText(e.target.value)}
            className="flex-grow"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !text.trim()}>
            {loading ? "Sending..." : "Send"}
          </Button>
        </div>
      </form>
    </div>
  );
}
