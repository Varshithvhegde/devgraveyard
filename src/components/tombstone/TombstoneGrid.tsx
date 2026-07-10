import { TombstoneWithStats } from "@/types/tombstone";
import TombstoneCard from "./TombstoneCard";
import TombstoneSkeleton from "./TombstoneSkeleton";

interface TombstoneGridProps {
  tombstones?: TombstoneWithStats[];
  loading?: boolean;
  skeletonCount?: number;
}

export default function TombstoneGrid({
  tombstones,
  loading,
  skeletonCount = 6,
}: TombstoneGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
      {loading
        ? Array.from({ length: skeletonCount }).map((_, i) => (
            <TombstoneSkeleton key={i} />
          ))
        : tombstones?.map((t) => <TombstoneCard key={t.id} tombstone={t} />)}
    </div>
  );
}
