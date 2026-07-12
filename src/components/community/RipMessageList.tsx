"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RipMessage } from "@/types/tombstone";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import { toast } from "sonner";

interface RipMessageListProps {
  messages: RipMessage[];
  currentUserId?: string;
  onDelete?: (id: string) => void;
}

function MessageRow({
  msg,
  isOwn,
  onDelete,
}: {
  msg: RipMessage;
  isOwn: boolean;
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch("/api/rip-messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message_id: msg.id }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      onDelete(msg.id);
      toast.success("Condolence removed");
    } catch {
      toast.error("Failed to delete");
      setDeleting(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.95, transition: { duration: 0.25 } }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex gap-3 p-4 rounded-xl transition-colors"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.04)",
      }}
      whileHover={{
        background: "rgba(255,255,255,0.03)",
        borderColor: "rgba(139,92,246,0.1)",
      }}
    >
      {/* Avatar */}
      {msg.author_avatar ? (
        <Image
          src={msg.author_avatar}
          alt={msg.author_name}
          width={36}
          height={36}
          className="rounded-full flex-shrink-0 ring-1 ring-zinc-800 w-9 h-9"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex-shrink-0 flex items-center justify-center text-sm text-zinc-400 ring-1 ring-zinc-700 font-medium">
          {msg.author_name[0]?.toUpperCase()}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-zinc-200 text-sm font-medium">{msg.author_name}</span>
          <span className="text-zinc-700 text-[11px] font-mono">{formatDate(msg.created_at)}</span>
          {isOwn && (
            <span className="text-[10px] text-purple-600 font-mono px-1.5 py-0.5 rounded"
              style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)" }}>
              you
            </span>
          )}
        </div>
        <p className="text-zinc-400 text-sm leading-relaxed">{msg.message}</p>
      </div>

      {/* Delete button — only for own messages */}
      {isOwn && (
        <AnimatePresence>
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0, scale: 1 }}
            whileHover={{ opacity: 1 }}
            className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleDelete}
            disabled={deleting}
            title={confirmDelete ? "Click again to confirm" : "Delete condolence"}
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: confirmDelete ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.08)",
                border: `1px solid ${confirmDelete ? "rgba(239,68,68,0.4)" : "rgba(239,68,68,0.2)"}`,
                color: confirmDelete ? "rgba(252,165,165,0.9)" : "rgba(239,68,68,0.7)",
              }}
            >
              {deleting ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  className="w-3 h-3 border border-t-red-400 border-red-800 rounded-full block"
                />
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 3h8M5 3V2h2v1M4 3v6h4V3H4z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {confirmDelete ? "Confirm?" : "Delete"}
                </>
              )}
            </motion.div>
          </motion.button>
        </AnimatePresence>
      )}
    </motion.div>
  );
}

export default function RipMessageList({ messages: initial, currentUserId, onDelete }: RipMessageListProps) {
  const [messages, setMessages] = useState(initial);

  const handleDelete = (id: string) => {
    setMessages((m) => m.filter((msg) => msg.id !== id));
    onDelete?.(id);
  };

  if (messages.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-10 space-y-2"
      >
        <div className="text-3xl select-none opacity-30">🕯️</div>
        <p className="text-zinc-700 text-sm italic">No condolences yet. Be the first to pay respects.</p>
      </motion.div>
    );
  }

  return (
    <motion.div layout className="space-y-2.5">
      <AnimatePresence mode="popLayout">
        {messages.map((msg) => (
          <MessageRow
            key={msg.id}
            msg={msg}
            isOwn={!!currentUserId && msg.user_id === currentUserId}
            onDelete={handleDelete}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
