// src/app/(site)/contact/ContactForm.tsx
"use client";

import { useState } from "react";

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="mt-8 rounded-xl border p-4">
        Thanks for the note. Please send it by email so I can reply.
      </div>
    );
  }

  return (
    <form
      className="mt-10 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const data = new FormData(form);
        // Honeypot: if this hidden field is filled, do nothing
        if (String(data.get("company")).trim().length > 0) return;
        setSent(true);
      }}
    >
      {/* Honeypot anti-spam field */}
      <input
        type="text"
        name="company"
        defaultValue=""
        aria-hidden="true"
        tabIndex={-1}
        className="hidden"
        autoComplete="off"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          required
          name="name"
          placeholder="Your name"
          className="rounded-xl border px-3 py-2"
        />
        <input
          required
          type="email"
          name="email"
          placeholder="Your email"
          className="rounded-xl border px-3 py-2"
        />
      </div>
      <textarea
        required
        name="message"
        placeholder="How can I help"
        rows={5}
        className="mt-3 w-full rounded-xl border px-3 py-2"
      />
      <button
        type="submit"
        className="mt-2 rounded-xl border px-4 py-2 font-medium"
      >
        Send
      </button>
      <p className="text-sm text-muted">
        This sends nothing yet. Use the email links above to reach me.
      </p>
    </form>
  );
}
