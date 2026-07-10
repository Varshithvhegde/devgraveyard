interface EulogySectionProps {
  eulogy: string;
}

export default function EulogySection({ eulogy }: EulogySectionProps) {
  return (
    <div className="relative border border-zinc-700/50 rounded-lg overflow-hidden bg-gradient-to-b from-zinc-900 to-black">
      {/* parchment corner decorations */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-zinc-600/40" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-zinc-600/40" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-zinc-600/40" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-zinc-600/40" />

      <div className="p-8">
        <div className="text-center mb-4">
          <span className="text-zinc-500 text-xs uppercase tracking-[0.3em]">
            Eulogy
          </span>
        </div>
        <div className="font-gothic text-zinc-300 text-base leading-relaxed whitespace-pre-wrap italic">
          {eulogy}
        </div>
      </div>
    </div>
  );
}
