"use client";

import { Suspense, useRef, useState, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Text } from "@react-three/drei";
import * as THREE from "three";
import { TombstoneWithStats } from "@/types/tombstone";
import { ageString } from "@/lib/github/analyze";

// ─── Ground ──────────────────────────────────────────────────────────────────
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[80, 80]} />
      <meshLambertMaterial color="#1a1a14" />
    </mesh>
  );
}

// ─── Grass patches ───────────────────────────────────────────────────────────
function GrassPatches() {
  const patches = Array.from({ length: 120 }, (_, i) => ({
    x: (Math.random() - 0.5) * 60,
    z: (Math.random() - 0.5) * 60,
    scale: 0.3 + Math.random() * 0.5,
    rot: Math.random() * Math.PI,
  }));
  return (
    <group>
      {patches.map((p, i) => (
        <mesh key={i} position={[p.x, 0.05, p.z]} rotation={[0, p.rot, 0]}>
          <planeGeometry args={[p.scale, p.scale * 1.5]} />
          <meshLambertMaterial color="#1f2a0e" side={THREE.DoubleSide} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Bare tree ────────────────────────────────────────────────────────────────
function BareTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* trunk */}
      <mesh castShadow position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.12, 0.22, 5, 6]} />
        <meshLambertMaterial color="#1a1208" />
      </mesh>
      {/* branches */}
      {[
        [0.6, 4.2, 0, 0, 0, -0.4],
        [-0.7, 3.8, 0, 0, 0, 0.5],
        [0.3, 5, 0.4, -0.3, 0, -0.2],
        [-0.4, 4.5, -0.3, 0.2, 0, 0.3],
        [0, 5.5, 0, 0, 0, -0.15],
      ].map(([x, y, z, rx, ry, rz], i) => (
        <mesh key={i} position={[x, y, z as number]} rotation={[rx as number, ry as number, rz as number]} castShadow>
          <cylinderGeometry args={[0.04, 0.1, 1.4, 5]} />
          <meshLambertMaterial color="#1a1208" />
        </mesh>
      ))}
    </group>
  );
}

// ─── Tombstone 3D ─────────────────────────────────────────────────────────────
function Tombstone3D({
  tombstone,
  position,
  rotation,
  onClick,
  isHovered,
  onHover,
  onUnhover,
}: {
  tombstone: TombstoneWithStats;
  position: [number, number, number];
  rotation: number;
  onClick: () => void;
  isHovered: boolean;
  onHover: () => void;
  onUnhover: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const hoverProgress = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const target = isHovered ? 1 : 0;
    hoverProgress.current += (target - hoverProgress.current) * 8 * delta;
    const h = hoverProgress.current;

    // Hover: float up + tilt back slightly
    groupRef.current.position.y = h * 0.18;
    groupRef.current.rotation.x = h * -0.06;

    if (glowRef.current) {
      glowRef.current.intensity = h * 1.2;
    }
  });

  const stoneColor = isHovered ? "#3d3858" : "#2a2840";
  const nameColor = isHovered ? "#e8e4f8" : "#c8c0e0";

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, rotation, 0]}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); onHover(); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { onUnhover(); document.body.style.cursor = "default"; }}
    >
      {/* Glow light on hover */}
      <pointLight ref={glowRef} color="#a78bfa" intensity={0} distance={3} position={[0, 1.2, 0.3]} />

      {/* Stone base / pedestal */}
      <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
        <boxGeometry args={[0.72, 0.16, 0.28]} />
        <meshLambertMaterial color="#1e1c2e" />
      </mesh>

      {/* Main stone body */}
      <mesh castShadow receiveShadow position={[0, 0.85, 0]}>
        <boxGeometry args={[0.6, 1.4, 0.18]} />
        <meshLambertMaterial color={stoneColor} />
      </mesh>

      {/* Arch top */}
      <mesh castShadow position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.18, 12, 1, false, 0, Math.PI]} />
        <meshLambertMaterial color={stoneColor} />
      </mesh>

      {/* Front face slightly lighter */}
      <mesh position={[0, 0.85, 0.092]}>
        <boxGeometry args={[0.56, 1.38, 0.001]} />
        <meshLambertMaterial color={isHovered ? "#4a4568" : "#312e50"} />
      </mesh>

      {/* Engraved name text */}
      <Text
        position={[0, 1.05, 0.1]}
        fontSize={0.11}
        color={nameColor}
        font="/fonts/playfair.woff"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.5}
        textAlign="center"
      >
        {tombstone.repo_name.length > 12
          ? tombstone.repo_name.slice(0, 11) + "…"
          : tombstone.repo_name}
      </Text>

      {/* Dates */}
      <Text
        position={[0, 0.78, 0.1]}
        fontSize={0.065}
        color="#8880a8"
        anchorX="center"
        anchorY="middle"
      >
        {new Date(tombstone.born_at).getFullYear()} — {new Date(tombstone.died_at).getFullYear()}
      </Text>

      {/* Cause of death — small */}
      <Text
        position={[0, 0.58, 0.1]}
        fontSize={0.055}
        color={isHovered ? "#a78bfa" : "#7060a0"}
        anchorX="center"
        anchorY="middle"
        maxWidth={0.48}
        textAlign="center"
        fontStyle="italic"
      >
        {tombstone.cause_of_death.length > 20
          ? tombstone.cause_of_death.slice(0, 19) + "…"
          : tombstone.cause_of_death}
      </Text>

      {/* Candles at base — lit on hover */}
      {isHovered && (
        <>
          {[-0.22, 0.22].map((x, i) => (
            <group key={i} position={[x, 0.18, 0.08]}>
              <mesh>
                <cylinderGeometry args={[0.018, 0.018, 0.12, 6]} />
                <meshLambertMaterial color="#f5f0e8" />
              </mesh>
              <pointLight color="#fbbf24" intensity={0.6} distance={1} position={[0, 0.1, 0]} />
              <mesh position={[0, 0.08, 0]}>
                <sphereGeometry args={[0.025, 6, 6]} />
                <meshBasicMaterial color="#fde68a" />
              </mesh>
            </group>
          ))}
        </>
      )}
    </group>
  );
}

// ─── Grave mound ──────────────────────────────────────────────────────────────
function GraveMound({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.04, 0.4]} rotation={[-0.1, 0, 0]} receiveShadow>
        <boxGeometry args={[0.65, 0.08, 1.2]} />
        <meshLambertMaterial color="#16150e" />
      </mesh>
    </group>
  );
}

// ─── Firefly particle system ──────────────────────────────────────────────────
function Fireflies() {
  const count = 40;
  const meshRef = useRef<THREE.Points>(null);
  const positions = useRef(
    Float32Array.from({ length: count * 3 }, (_, i) =>
      i % 3 === 1 ? 0.3 + Math.random() * 2.5 : (Math.random() - 0.5) * 30
    )
  );
  const phases = useRef(Array.from({ length: count }, () => Math.random() * Math.PI * 2));

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const pos = meshRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] = positions.current[i * 3 + 1] + Math.sin(t * 0.6 + phases.current[i]) * 0.3;
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
    const mat = meshRef.current.material as THREE.PointsMaterial;
    mat.opacity = 0.5 + Math.sin(t * 1.5) * 0.25;
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions.current, 3));

  return (
    <points ref={meshRef} geometry={geo}>
      <pointsMaterial color="#fbbf24" size={0.06} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

// ─── Ambient mist ─────────────────────────────────────────────────────────────
function MistPlane() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.x = Math.sin(clock.getElapsedTime() * 0.08) * 3;
  });
  return (
    <mesh ref={ref} position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[80, 80]} />
      <meshBasicMaterial color="#4a3a6a" transparent opacity={0.04} />
    </mesh>
  );
}

// ─── Camera controller — gentle auto-drift ────────────────────────────────────
function CameraRig() {
  const { camera } = useThree();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.06;
    camera.position.x += (Math.sin(t) * 0.5 - camera.position.x) * 0.002;
  });
  return null;
}

// ─── Tombstone info panel (HTML overlay) ──────────────────────────────────────
function TombstonePanel({
  tombstone,
  onClose,
}: {
  tombstone: TombstoneWithStats;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 10); }, []);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-20"
      onClick={onClose}
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="relative max-w-md w-full mx-4 rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: visible ? "translateY(0) scale(1)" : "translateY(32px) scale(0.95)",
          opacity: visible ? 1 : 0,
          transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
          background: "linear-gradient(160deg, #1e1c2e, #12101e)",
          border: "1px solid rgba(139,92,246,0.3)",
          boxShadow: "0 0 60px rgba(88,28,135,0.3), 0 0 120px rgba(88,28,135,0.1)",
        }}
      >
        {/* Glow top line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-zinc-600 text-[10px] font-mono tracking-[0.3em] uppercase mb-2">R.I.P.</div>
            <h2 className="font-gothic text-3xl text-[#e8e4f8] mb-1"
              style={{ textShadow: "0 0 30px rgba(139,92,246,0.4)" }}>
              {tombstone.repo_name}
            </h2>
            {tombstone.github_username && (
              <p className="text-zinc-600 text-xs font-mono">@{tombstone.github_username}</p>
            )}
          </div>

          {/* Dates */}
          <div className="text-center mb-5">
            <span className="text-zinc-400 font-mono text-sm tracking-widest">
              {new Date(tombstone.born_at).getFullYear()} — {new Date(tombstone.died_at).getFullYear()}
            </span>
            <p className="text-zinc-600 text-xs mt-0.5 italic">
              ({ageString(tombstone.born_at, tombstone.died_at)})
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-purple-800/40" />
            <span className="text-zinc-700 text-xs">✦</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-purple-800/40" />
          </div>

          {/* Cause */}
          <div className="text-center mb-4">
            <div className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] mb-1">Cause of Death</div>
            <p className="text-purple-300 text-sm italic font-medium">
              &ldquo;{tombstone.cause_of_death}&rdquo;
            </p>
          </div>

          {/* Last words */}
          {tombstone.last_words && (
            <div className="text-center mb-4">
              <div className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] mb-1">Last Words</div>
              <p className="text-zinc-400 text-xs font-mono italic">
                &ldquo;{tombstone.last_words}&rdquo;
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { label: "Commits", value: tombstone.commits_count },
              { label: "Peak Streak", value: tombstone.peak_streak_days ? `${tombstone.peak_streak_days}d` : "—" },
              { label: "Best Day", value: tombstone.most_commits_one_day || "—" },
            ].map((s) => (
              <div key={s.label} className="text-center py-2 rounded-lg"
                style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)" }}>
                <div className="text-purple-300 font-mono font-bold text-sm">{s.value}</div>
                <div className="text-zinc-600 text-[9px] uppercase tracking-wider mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Community */}
          <div className="flex items-center justify-center gap-6 mb-6 text-sm">
            <div className="flex items-center gap-1.5 text-amber-400/80">
              <span>🕯️</span>
              <span className="font-mono">{tombstone.candle_count}</span>
              <span className="text-zinc-600 text-xs">candles</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400/70">
              <span>↑</span>
              <span className="font-mono">{tombstone.resurrection_votes}</span>
              <span className="text-zinc-600 text-xs">resurrect</span>
            </div>
          </div>

          {/* Epitaph */}
          {tombstone.epitaph && (
            <div className="text-center mb-5 px-4 py-3 rounded-lg"
              style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <p className="text-zinc-400 text-sm italic font-gothic">{tombstone.epitaph}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <a
              href={`/tombstone/${tombstone.id}`}
              className="flex-1 text-center py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 0 20px rgba(139,92,246,0.3)" }}
            >
              View Full Tombstone →
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main scene ───────────────────────────────────────────────────────────────
interface GraveyardSceneProps {
  tombstones: TombstoneWithStats[];
}

function scatterPositions(count: number): Array<{ pos: [number, number, number]; rot: number }> {
  const result: Array<{ pos: [number, number, number]; rot: number }> = [];
  const rows = Math.ceil(count / 5);
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / 5);
    const col = i % 5;
    result.push({
      pos: [
        (col - 2) * 3.2 + (Math.random() - 0.5) * 0.8,
        0,
        row * 3.8 - rows * 1.5 + (Math.random() - 0.5) * 0.6,
      ],
      rot: (Math.random() - 0.5) * 0.18,
    });
  }
  return result;
}

function Scene({ tombstones, onSelect }: { tombstones: TombstoneWithStats[]; onSelect: (t: TombstoneWithStats) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const positions = scatterPositions(tombstones.length);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.18} color="#a090c0" />
      <directionalLight
        position={[-8, 12, -5]}
        intensity={0.5}
        color="#c0b0e0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={60}
      />
      <pointLight position={[0, 8, 0]} color="#4a3060" intensity={0.4} />

      <fog attach="fog" args={["#0a0812", 18, 55]} />
      <Stars radius={60} depth={30} count={1200} factor={3} saturation={0.2} fade />

      <CameraRig />
      <Ground />
      <GrassPatches />
      <MistPlane />
      <Fireflies />

      {/* Trees around the perimeter */}
      {[[-12, 0, -8], [12, 0, -8], [-14, 0, 4], [14, 0, 2], [-10, 0, 14], [10, 0, 12], [0, 0, -14]].map(
        ([x, y, z], i) => <BareTree key={i} position={[x, y, z] as [number, number, number]} />
      )}

      {/* Tombstones + mounds */}
      {tombstones.map((t, i) => (
        <group key={t.id}>
          <GraveMound position={[positions[i].pos[0], 0, positions[i].pos[2]]} rotation={positions[i].rot} />
          <Tombstone3D
            tombstone={t}
            position={positions[i].pos}
            rotation={positions[i].rot}
            isHovered={hovered === t.id}
            onHover={() => setHovered(t.id)}
            onUnhover={() => setHovered(null)}
            onClick={() => onSelect(t)}
          />
        </group>
      ))}
    </>
  );
}

export default function GraveyardScene({ tombstones }: GraveyardSceneProps) {
  const [selected, setSelected] = useState<TombstoneWithStats | null>(null);

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 5, 14], fov: 55, near: 0.1, far: 120 }}
        shadows
        gl={{ antialias: true, alpha: false }}
        style={{ background: "#050309" }}
      >
        <Suspense fallback={null}>
          <Scene tombstones={tombstones} onSelect={setSelected} />
        </Suspense>
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={35}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={0.2}
          target={[0, 0.5, 0]}
          makeDefault
        />
      </Canvas>

      {/* Overlay: instructions */}
      {!selected && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <div
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-xs text-zinc-400"
            style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}
          >
            <span>🖱️ Drag to rotate</span>
            <span className="text-zinc-700">·</span>
            <span>🔍 Scroll to zoom</span>
            <span className="text-zinc-700">·</span>
            <span>👆 Click a tombstone</span>
          </div>
        </div>
      )}

      {/* Tombstone info panel */}
      {selected && (
        <TombstonePanel tombstone={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
