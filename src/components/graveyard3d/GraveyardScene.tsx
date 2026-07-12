"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Text } from "@react-three/drei";
import * as THREE from "three";
import { TombstoneWithStats } from "@/types/tombstone";
import { ageString } from "@/lib/github/analyze";

// ─── Ground ──────────────────────────────────────────────────────────────────
function Ground() {
  return (
    <>
      {/* Main ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100, 8, 8]} />
        <meshStandardMaterial color="#1e1f0e" roughness={1} />
      </mesh>
      {/* Path between rows */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[1.2, 40]} />
        <meshStandardMaterial color="#2a2415" roughness={1} transparent opacity={0.6} />
      </mesh>
    </>
  );
}

// ─── Grass tufts ─────────────────────────────────────────────────────────────
function GrassTufts() {
  const tufts = useRef<Array<{ x: number; z: number; s: number; r: number }>>([]);
  if (tufts.current.length === 0) {
    for (let i = 0; i < 200; i++) {
      tufts.current.push({
        x: (Math.random() - 0.5) * 70,
        z: (Math.random() - 0.5) * 70,
        s: 0.2 + Math.random() * 0.5,
        r: Math.random() * Math.PI,
      });
    }
  }
  return (
    <group>
      {tufts.current.map((t, i) => (
        <mesh key={i} position={[t.x, 0.06, t.z]} rotation={[Math.PI / 2, t.r, 0]}>
          <planeGeometry args={[t.s, t.s * 1.6]} />
          <meshBasicMaterial color="#1e2a0a" side={THREE.DoubleSide} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Bare tree ────────────────────────────────────────────────────────────────
function BareTree({ pos }: { pos: [number, number, number] }) {
  const branches: Array<[number, number, number, number, number, number, number]> = [
    [0.5, 3.8, 0, 0, 0, -0.5, 1.4],
    [-0.6, 3.5, 0, 0, 0, 0.55, 1.3],
    [0.3, 4.4, 0.3, -0.3, 0, -0.25, 1.2],
    [-0.35, 4.1, -0.25, 0.25, 0, 0.3, 1.1],
    [0.1, 5.0, 0, 0, 0, -0.15, 0.9],
  ];
  return (
    <group position={pos}>
      <mesh castShadow position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.1, 0.2, 5, 7]} />
        <meshStandardMaterial color="#1a1208" roughness={1} />
      </mesh>
      {branches.map(([x, y, z, rx, ry, rz, len], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[rx, ry, rz]} castShadow>
          <cylinderGeometry args={[0.03, 0.09, len, 5]} />
          <meshStandardMaterial color="#1a1208" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Tombstone shape (extruded arch) ─────────────────────────────────────────
function makeTombstoneShape() {
  const w = 0.34; // half-width
  const h = 0.95; // body height before arch starts
  const r = w;    // arch radius = half-width → perfect semicircle
  const shape = new THREE.Shape();
  shape.moveTo(-w, 0);
  shape.lineTo(-w, h);
  // Semicircular arch top
  shape.absarc(0, h, r, Math.PI, 0, false);
  shape.lineTo(w, 0);
  shape.lineTo(-w, 0);
  return shape;
}

// ─── 3D Tombstone ─────────────────────────────────────────────────────────────
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
  const t = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current || !glowRef.current) return;
    t.current += delta * (isHovered ? 8 : 8);
    const target = isHovered ? 1 : 0;
    const cur = groupRef.current.userData.h ?? 0;
    const next = cur + (target - cur) * Math.min(1, delta * 7);
    groupRef.current.userData.h = next;

    groupRef.current.position.y = next * 0.22;
    groupRef.current.rotation.x = next * -0.05;
    glowRef.current.intensity = next * 2.5;
  });

  const h = isHovered;
  const stone = h ? "#7a7880" : "#585660";
  const face  = h ? "#8a8890" : "#686670";

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, rotation, 0]}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); onHover(); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { onUnhover(); document.body.style.cursor = "default"; }}
    >
      {/* Hover purple glow */}
      <pointLight ref={glowRef} color="#a78bfa" intensity={0} distance={4} position={[0, 1.5, 0.4]} />

      {/* Ground dirt mound behind stone */}
      <mesh receiveShadow position={[0, 0.04, 0.5]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[0.75, 0.08, 1.4]} />
        <meshStandardMaterial color="#1a170d" roughness={1} />
      </mesh>

      {/* Base slab */}
      <mesh castShadow receiveShadow position={[0, 0.09, 0]}>
        <boxGeometry args={[0.88, 0.18, 0.38]} />
        <meshStandardMaterial color="#4a4850" roughness={0.95} metalness={0.02} />
      </mesh>

      {/* ONE solid extruded arch — the actual tombstone shape */}
      <mesh castShadow receiveShadow position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <extrudeGeometry args={[makeTombstoneShape(), {
          depth: 0.22,
          bevelEnabled: true,
          bevelThickness: 0.018,
          bevelSize: 0.014,
          bevelSegments: 4,
          curveSegments: 24,
        }]} />
        <meshStandardMaterial color={stone} roughness={0.9} metalness={0.03} />
      </mesh>

      {/* Recessed inscription panel (slightly inset front face) */}
      <mesh position={[0, 0.78, 0.135]}>
        <shapeGeometry args={[(() => {
          const s = new THREE.Shape();
          s.moveTo(-0.22, 0); s.lineTo(-0.22, 0.65);
          s.lineTo(0.22, 0.65); s.lineTo(0.22, 0); s.lineTo(-0.22, 0);
          return s;
        })()]} />
        <meshStandardMaterial color={face} roughness={0.85} />
      </mesh>

      {/* Moss at base */}
      <mesh position={[0, 0.21, 0.136]}>
        <planeGeometry args={[0.6, 0.12]} />
        <meshStandardMaterial color="#1e2e08" roughness={1} transparent opacity={0.5} />
      </mesh>

      {/* Project name — in arch area */}
      <Text
        position={[0, 1.32, 0.14]}
        fontSize={0.11}
        color={h ? "#ffffff" : "#ede8e0"}
        anchorX="center"
        anchorY="middle"
        maxWidth={0.5}
        textAlign="center"
        outlineWidth={0.007}
        outlineColor="#0a0908"
        outlineOpacity={1}
      >
        {tombstone.repo_name.length > 10 ? tombstone.repo_name.slice(0, 9) + "…" : tombstone.repo_name}
      </Text>

      {/* Dates */}
      <Text
        position={[0, 1.02, 0.14]}
        fontSize={0.065}
        color={h ? "#d8d0c8" : "#a8a098"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.006}
        outlineColor="#0a0908"
        outlineOpacity={1}
      >
        {`${new Date(tombstone.born_at).getFullYear()} — ${new Date(tombstone.died_at).getFullYear()}`}
      </Text>

      {/* Cause of death */}
      <Text
        position={[0, 0.76, 0.14]}
        fontSize={0.054}
        color={h ? "#e0c8ff" : "#a880c8"}
        anchorX="center"
        anchorY="middle"
        maxWidth={0.46}
        textAlign="center"
        outlineWidth={0.006}
        outlineColor="#0a0908"
        outlineOpacity={1}
      >
        {tombstone.cause_of_death.length > 18
          ? tombstone.cause_of_death.slice(0, 17) + "…"
          : tombstone.cause_of_death}
      </Text>

      {/* Candles on hover */}
      {isHovered && [-0.28, 0.28].map((x, i) => (
        <group key={i} position={[x, 0.22, 0.14]}>
          <mesh>
            <cylinderGeometry args={[0.022, 0.022, 0.14, 7]} />
            <meshStandardMaterial color="#f5f0e8" />
          </mesh>
          <pointLight color="#fbbf24" intensity={2.0} distance={2.5} position={[0, 0.11, 0]} />
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color="#fff8c0" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── Grave mound ──────────────────────────────────────────────────────────────
function GraveMound({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.05, 0.5]} rotation={[-0.08, 0, 0]} receiveShadow>
        <boxGeometry args={[0.7, 0.1, 1.4]} />
        <meshStandardMaterial color="#191710" roughness={1} />
      </mesh>
    </group>
  );
}

// ─── Fireflies ─────────────────────────────────────────────────────────────────
function Fireflies() {
  const COUNT = 50;
  const ref = useRef<THREE.Points>(null);

  const basePos = useRef(
    Float32Array.from({ length: COUNT * 3 }, (_, i) => {
      if (i % 3 === 1) return 0.5 + Math.random() * 2.5;
      return (Math.random() - 0.5) * 32;
    })
  );
  const phases = useRef(Array.from({ length: COUNT }, () => Math.random() * Math.PI * 2));

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(basePos.current.slice(), 3));

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    const t = clock.getElapsedTime();
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 1] = basePos.current[i * 3 + 1] + Math.sin(t * 0.7 + phases.current[i]) * 0.35;
      arr[i * 3]     = basePos.current[i * 3]     + Math.cos(t * 0.4 + phases.current[i]) * 0.2;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    (ref.current.material as THREE.PointsMaterial).opacity = 0.5 + Math.sin(t * 1.8) * 0.25;
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#fbbf24" size={0.07} transparent opacity={0.65} sizeAttenuation depthWrite={false} />
    </points>
  );
}

// ─── Camera drift ─────────────────────────────────────────────────────────────
function CameraRig() {
  const { camera } = useThree();
  const startPos = useRef(new THREE.Vector3(0, 7, 16));
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.04;
    camera.position.x += (Math.sin(t) * 1.5 - camera.position.x + startPos.current.x) * 0.001;
  });
  return null;
}

// ─── Scatter layout ───────────────────────────────────────────────────────────
function computeLayout(count: number) {
  const cols = Math.min(5, count);
  const rows = Math.ceil(count / cols);
  return Array.from({ length: count }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      pos: [
        (col - (cols - 1) / 2) * 3.4 + (Math.random() - 0.5) * 0.7,
        0,
        row * 4.2 - (rows - 1) * 1.8 + (Math.random() - 0.5) * 0.5,
      ] as [number, number, number],
      rot: (Math.random() - 0.5) * 0.2,
    };
  });
}

// ─── Scene ─────────────────────────────────────────────────────────────────────
function Scene({ tombstones, onSelect }: { tombstones: TombstoneWithStats[]; onSelect: (t: TombstoneWithStats) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const layout = useRef(computeLayout(tombstones.length));

  return (
    <>
      {/* Moonlit night — cool blue-white key light */}
      <ambientLight intensity={0.45} color="#8090c0" />
      <directionalLight
        position={[-10, 18, 6]}
        intensity={1.6}
        color="#d0e0ff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-bias={-0.001}
      />
      {/* Subtle fill from opposite side */}
      <directionalLight position={[8, 6, -4]} intensity={0.3} color="#c0b8e8" />
      {/* Warm ground bounce */}
      <pointLight position={[0, 1, 0]} color="#604820" intensity={0.25} distance={30} />

      {/* Distance fog */}
      <fog attach="fog" args={["#0e0c18", 22, 58]} />

      <Stars radius={70} depth={40} count={1600} factor={4} saturation={0.3} fade speed={0.5} />
      <CameraRig />
      <Ground />
      <GrassTufts />
      <Fireflies />

      {/* Trees */}
      {([ [-13,0,-10],[13,0,-10],[-15,0,5],[15,0,3],[-11,0,16],[11,0,14],[0,0,-16],[-6,0,-14],[7,0,-13] ] as [number,number,number][]).map(
        (p, i) => <BareTree key={i} pos={p} />
      )}

      {/* Mounds + stones */}
      {tombstones.map((t, i) => (
        <group key={t.id}>
          <GraveMound position={layout.current[i].pos} rotation={layout.current[i].rot} />
          <Tombstone3D
            tombstone={t}
            position={layout.current[i].pos}
            rotation={layout.current[i].rot}
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

// ─── Info panel overlay ───────────────────────────────────────────────────────
function TombstonePanel({ tombstone, onClose }: { tombstone: TombstoneWithStats; onClose: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t); }, []);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-20"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #1e1c2e 0%, #13111f 100%)",
          border: "1px solid rgba(139,92,246,0.35)",
          boxShadow: "0 0 80px rgba(88,28,135,0.4), 0 0 200px rgba(88,28,135,0.1)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.96)",
          transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/70 to-transparent" />

        <div className="p-7">
          <div className="text-center mb-5">
            <p className="text-[10px] font-mono text-zinc-600 tracking-[0.35em] uppercase mb-1.5">R.I.P.</p>
            <h2 className="font-gothic text-3xl mb-1" style={{ color: "#e8e4f8", textShadow: "0 0 30px rgba(139,92,246,0.5)" }}>
              {tombstone.repo_name}
            </h2>
            {tombstone.github_username && <p className="text-zinc-600 text-xs font-mono">@{tombstone.github_username}</p>}
          </div>

          <div className="text-center mb-4">
            <p className="text-zinc-400 font-mono text-sm tracking-widest">
              {new Date(tombstone.born_at).getFullYear()} — {new Date(tombstone.died_at).getFullYear()}
            </p>
            <p className="text-zinc-600 text-xs italic mt-0.5">({ageString(tombstone.born_at, tombstone.died_at)})</p>
          </div>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-purple-800/40" />
            <span className="text-zinc-700 text-xs">✦</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-purple-800/40" />
          </div>

          <div className="text-center mb-4">
            <p className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] mb-1">Cause of Death</p>
            <p className="text-purple-300 text-sm italic font-medium">&ldquo;{tombstone.cause_of_death}&rdquo;</p>
          </div>

          {tombstone.last_words && (
            <div className="text-center mb-4">
              <p className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] mb-1">Last Words</p>
              <p className="text-zinc-400 text-xs font-mono italic">&ldquo;{tombstone.last_words}&rdquo;</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Commits", value: tombstone.commits_count },
              { label: "Streak",  value: tombstone.peak_streak_days ? `${tombstone.peak_streak_days}d` : "—" },
              { label: "Best Day", value: tombstone.most_commits_one_day || "—" },
            ].map((s) => (
              <div key={s.label} className="text-center py-2.5 rounded-xl"
                style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.18)" }}>
                <p className="text-purple-300 font-mono font-bold text-sm">{s.value}</p>
                <p className="text-zinc-600 text-[9px] uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-6 mb-5 text-sm">
            <div className="flex items-center gap-1.5 text-amber-400/80">
              <span>🕯️</span><span className="font-mono">{tombstone.candle_count}</span>
              <span className="text-zinc-600 text-xs">candles</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400/70">
              <span>↑</span><span className="font-mono">{tombstone.resurrection_votes}</span>
              <span className="text-zinc-600 text-xs">resurrect</span>
            </div>
          </div>

          {tombstone.epitaph && (
            <div className="text-center mb-5 px-4 py-3 rounded-xl"
              style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-zinc-400 text-sm italic font-gothic">{tombstone.epitaph}</p>
            </div>
          )}

          <div className="flex gap-3">
            <a href={`/tombstone/${tombstone.id}`}
              className="flex-1 text-center py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 24px rgba(139,92,246,0.35)" }}>
              View Full Tombstone →
            </a>
            <button onClick={onClose}
              className="px-4 py-3 rounded-xl text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function GraveyardScene({ tombstones }: { tombstones: TombstoneWithStats[] }) {
  const [selected, setSelected] = useState<TombstoneWithStats | null>(null);

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 7, 16], fov: 52, near: 0.1, far: 150 }}
        shadows
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        style={{ background: "#0e0c18" }}
      >
        <Suspense fallback={null}>
          <Scene tombstones={tombstones} onSelect={setSelected} />
        </Suspense>
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={4}
          maxDistance={40}
          maxPolarAngle={Math.PI / 2.08}
          minPolarAngle={0.15}
          target={[0, 0.5, 0]}
          makeDefault
        />
      </Canvas>

      {!selected && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full text-xs text-zinc-400"
            style={{ background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
            <span>🖱️ Drag to rotate</span>
            <span className="text-zinc-700">·</span>
            <span>🔍 Scroll to zoom</span>
            <span className="text-zinc-700">·</span>
            <span>👆 Click a tombstone</span>
          </div>
        </div>
      )}

      {selected && <TombstonePanel tombstone={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
