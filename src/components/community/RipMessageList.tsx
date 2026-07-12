"use client";

import { motion, AnimatePresence } from "motion/react";
import { RipMessage } from "@/types/tombstone";
import { formatDate } from "@/lib/utils";
import Image from "next/image";

interface RipMessageListProps {
  messages: RipMessage[];
}

export default function RipMessageList({ messages }: RipMessageListProps) {
  if (messages.length === 0) {
    return (
      <p className="text-zinc-700 text-sm italic text-center py-8">
        No condolences yet. Be the first to pay respects.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {messages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35, delay: i === 0 ? 0 : i * 0.04, ease: [0.16, 1, 0.3, 1] }}
            className="flex gap-3 p-4 rounded-xl"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            {msg.author_avatar ? (
              <Image src={msg.author_avatar} alt={msg.author_name} width={32} height={32}
                className="rounded-full w-8 h-8 flex-shrink-0 ring-1 ring-zinc-800" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex-shrink-0 flex items-center justify-center text-xs text-zinc-500 ring-1 ring-zinc-700">
                {msg.author_name[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-zinc-300 text-sm font-medium">{msg.author_name}</span>
                <span className="text-zinc-700 text-xs font-mono">{formatDate(msg.created_at)}</span>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed">{msg.message}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
