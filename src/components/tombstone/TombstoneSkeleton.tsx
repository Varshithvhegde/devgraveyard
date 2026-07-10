export default function TombstoneSkeleton() {
  return (
    <div className="flex flex-col bg-gradient-to-b from-zinc-800 to-zinc-900 border border-zinc-700/60 rounded-t-[50%_40px] shadow-2xl shadow-black/60 overflow-hidden animate-pulse">
      <div className="p-6 flex flex-col gap-4">
        <div className="text-center space-y-2">
          <div className="h-3 w-12 bg-zinc-700 rounded mx-auto" />
          <div className="h-4 w-4 bg-zinc-700 rounded mx-auto" />
        </div>
        <div className="text-center space-y-2">
          <div className="h-6 w-32 bg-zinc-700 rounded mx-auto" />
          <div className="h-3 w-20 bg-zinc-700/50 rounded mx-auto" />
        </div>
        <div className="h-4 w-24 bg-zinc-700/50 rounded mx-auto" />
        <div className="border-t border-zinc-700/60" />
        <div className="space-y-2 text-center">
          <div className="h-3 w-24 bg-zinc-700/50 rounded mx-auto" />
          <div className="h-4 w-40 bg-zinc-700 rounded mx-auto" />
        </div>
        <div className="h-16 bg-zinc-700/30 rounded" />
        <div className="flex justify-center gap-2">
          <div className="h-5 w-16 bg-zinc-700/50 rounded-full" />
          <div className="h-5 w-14 bg-zinc-700/50 rounded-full" />
        </div>
      </div>
      <div className="border-t border-zinc-700/40 bg-black/30 px-6 py-3 flex justify-between">
        <div className="h-4 w-10 bg-zinc-700/50 rounded" />
        <div className="h-4 w-16 bg-zinc-700/50 rounded" />
        <div className="h-4 w-10 bg-zinc-700/50 rounded" />
      </div>
    </div>
  );
}
