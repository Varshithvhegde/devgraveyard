"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { RipMessage } from "@/types/tombstone";

interface RipMessageFormProps {
  tombstoneId: string;
  onMessage: (msg: RipMessage) => void;
}

const MAX = 280;

export default function RipMessageForm({ tombstoneId, onMessage }: RipMessageFormProps) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/rip-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tombstone_id: tombstoneId, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) toast.error("Sign in to leave a message");
        else throw new Error(data.error);
        return;
      }
      onMessage(data.message);
      setMessage("");
      toast.success("RIP message left 🕯️");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to post message");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Leave your condolences... (e.g. 'It had so much promise.')"
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, MAX))}
        rows={3}
        className="bg-zinc-900 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 resize-none"
      />
      <div className="flex justify-between items-center">
        <span
          className={`text-xs font-mono ${
            MAX - message.length < 20 ? "text-amber-400" : "text-zinc-600"
          }`}
        >
          {MAX - message.length} chars left
        </span>
        <button
          onClick={submit}
          disabled={submitting || !message.trim()}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {submitting ? "Posting..." : "Pay Respects"}
        </button>
      </div>
    </div>
  );
}
