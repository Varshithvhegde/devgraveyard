export default function TombstoneSkeleton() {
  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        borderRadius: "50% 50% 6px 6px / 48px 48px 6px 6px",
        background: "linear-gradient(170deg, #1a1a22 0%, #111118 100%)",
        border: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div className="p-6 flex flex-col gap-3">
        {/* cross */}
        <div className="flex flex-col items-center gap-1 pt-1">
          <div className="w-3 h-5 skeleton-shimmer rounded" />
          <div className="w-8 h-2 skeleton-shimmer rounded" />
        </div>
        {/* name */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-32 h-5 skeleton-shimmer rounded" />
          <div className="w-20 h-3 skeleton-shimmer rounded opacity-50" />
        </div>
        {/* dates */}
        <div className="w-24 h-3 skeleton-shimmer rounded mx-auto" />
        {/* divider */}
        <div className="h-px bg-zinc-800/50 mx-2 my-1" />
        {/* cause */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-20 h-2 skeleton-shimmer rounded opacity-50" />
          <div className="w-36 h-3.5 skeleton-shimmer rounded" />
        </div>
        {/* epitaph */}
        <div className="h-14 skeleton-shimmer rounded mx-2" />
        {/* langs */}
        <div className="flex justify-center gap-1.5">
          <div className="w-16 h-5 skeleton-shimmer rounded-full" />
          <div className="w-14 h-5 skeleton-shimmer rounded-full" />
        </div>
      </div>
      {/* base */}
      <div className="border-t border-zinc-800/40 px-5 py-3 flex justify-between">
        <div className="w-8 h-3 skeleton-shimmer rounded" />
        <div className="w-16 h-3 skeleton-shimmer rounded" />
        <div className="w-8 h-3 skeleton-shimmer rounded" />
      </div>
    </div>
  );
}
