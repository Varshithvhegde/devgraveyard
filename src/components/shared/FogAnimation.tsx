export default function FogAnimation() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="fog-layer-1 absolute inset-0" />
      <div className="fog-layer-2 absolute inset-0" />
      <div className="fog-layer-3 absolute inset-0" />
    </div>
  );
}
