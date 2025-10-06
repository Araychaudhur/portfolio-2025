"use client";

import { useChat } from "@ai-sdk/react"; // Correct v5 import
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RagBotUI() {
  // The useChat hook is now simpler
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex items-center gap-x-2">
          <Input
            value={input}
            placeholder="Ask about my work..."
            onChange={handleInputChange}
            className="flex-grow"
          />
          <Button type="submit">Send</Button>
        </div>
      </form>
    </div>
  );
}