"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { RagBotUI } from "./rag-bot-ui";

export function RagBotEntry() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="fixed bottom-8 right-8 rounded-full h-16 w-16 shadow-lg">
          Ask AI
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Ask about my work</SheetTitle>
        </SheetHeader>
        <RagBotUI />
      </SheetContent>
    </Sheet>
  );
}