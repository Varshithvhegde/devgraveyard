"use client";

import { RipMessage } from "@/types/tombstone";
import { formatDate } from "@/lib/utils";
import Image from "next/image";

interface RipMessageListProps {
  messages: RipMessage[];
}

export default function RipMessageList({ messages }: RipMessageListProps) {
  if (messages.length === 0) {
    return (
      <p className="text-zinc-600 text-sm italic text-center py-6">
        No condolences yet. Be the first to pay respects.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <div key={msg.id} className="flex gap-3">
          {msg.author_avatar ? (
            <Image
              src={msg.author_avatar}
              alt={msg.author_name}
              width={32}
              height={32}
              className="rounded-full flex-shrink-0 w-8 h-8"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex-shrink-0 flex items-center justify-center text-xs text-zinc-500">
              {msg.author_name[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-zinc-300 text-sm font-medium">
                {msg.author_name}
              </span>
              <span className="text-zinc-600 text-xs font-mono">
                {formatDate(msg.created_at)}
              </span>
            </div>
            <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
              {msg.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
