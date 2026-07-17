"use client";

import { Suspense, useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Text, Instances, Instance } from "@react-three/drei";
import * as THREE from "three";
import { TombstoneWithStats } from "@/types/tombstone";
import { ageString } from "@/lib/github/analyze";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// ─── Shared geometries & materials (created once, reused everywhere) ──────────
const TOMB_SHAPE = (() => {
  const w = 0.34, h = 0.95;
  const s = new THREE.Shape();
  s.moveTo(-w, 0); s.lineTo(-w, h);
  s.absarc(0, h, w, Math.PI, 0, false);
  s.lineTo(w, 0); s.lineTo(-w, 0);
  return s;
})();

const SHARED_GEO = {
  tombBody: new THREE.ExtrudeGeometry(TOMB_SHAPE, {
    depth: 0.22, bevelEnabled: true, bevelThickness: 0.018,
    bevelSize: 0.014, bevelSegments: 2, curveSegments: 16,
  }),
  baseSlab:  new THREE.BoxGeometry(0.88, 0.18, 0.38),
  dirtMound: new THREE.BoxGeometry(0.75, 0.08, 1.4),
  mossPatch: new THREE.PlaneGeometry(0.6, 0.12),
  ground:    new THREE.PlaneGeometry(100, 100),
  ring:      new THREE.RingGeometry(0.38, 0.46, 24),
  candleBody: new THREE.CylinderGeometry(0.022, 0.022, 0.13, 6),
  candleFlame: new THREE.ConeGeometry(0.025, 0.07, 5),
  wisp:      new THREE.SphereGeometry(0.025, 4, 4),
  treeTrunk: new THREE.CylinderGeometry(0.1, 0.2, 5, 6),
  treeBranch: new THREE.CylinderGeometry(0.03, 0.09, 1.3, 4),
  grass:     new THREE.PlaneGeometry(1, 1),
};

const SHARED_MAT = {
  stone:     new THREE.MeshLambertMaterial({ color: "#585660" }),
  stoneHover:new THREE.MeshLambertMaterial({ color: "#7a7880" }),
  face:      new THREE.MeshLambertMaterial({ color: "#686670" }),
  faceHover: new THREE.MeshLambertMaterial({ color: "#8a8890" }),
  slab:      new THREE.MeshLambertMaterial({ color: "#4a4850" }),
  dirt:      new THREE.MeshLambertMaterial({ color: "#1a170d" }),
  ground:    new THREE.MeshLambertMaterial({ color: "#1e1f0e" }),
  moss:      new THREE.MeshBasicMaterial({ color: "#1e2e08", transparent: true, opacity: 0.5 }),
  tree:      new THREE.MeshLambertMaterial({ color: "#1a1208" }),
  grass:     new THREE.MeshBasicMaterial({ color: "#1e2a0a", side: THREE.DoubleSide, transparent: true, opacity: 0.5 }),
  flameBasic: new THREE.MeshBasicMaterial({ color: "#fff8a0" }),
  candleWax:  new THREE.MeshLambertMaterial({ color: "#f5f0e8" }),
  wisp:      new THREE.MeshBasicMaterial({ color: "#e8d8ff", transparent: true, opacity: 0.4, depthWrite: false }),
  ring:      new THREE.MeshBasicMaterial({ color: "#34d399", transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false }),
};

// ─── Ground ──────────────────────────────────────────────────────────────────
function Ground() {
  return (
    <mesh geometry={SHARED_GEO.ground} material={SHARED_MAT.ground}
      rotation={[-Math.PI / 2, 0, 0]} receiveShadow />
  );
}

// ─── Grass — instanced, single draw call ─────────────────────────────────────
function GrassTufts() {
  const data = useMemo(() => Array.from({ length: 120 }, () => ({
    x: (Math.random() - 0.5) * 60, z: (Math.random() - 0.5) * 60,
    sx: 0.2 + Math.random() * 0.4, sz: 0.3 + Math.random() * 0.6,
    ry: Math.random() * Math.PI,
  })), []);

  return (
    <Instances geometry={SHARED_GEO.grass} material={SHARED_MAT.grass} limit={120}>
      {data.map((t, i) => (
        <Instance key={i}
          position={[t.x, 0.05, t.z]}
          rotation={[Math.PI / 2, t.ry, 0]}
          scale={[t.sx, t.sz, 1]}
        />
      ))}
    </Instances>
  );
}

// ─── Bare tree — instanced branches ──────────────────────────────────────────
const TREE_POSITIONS: [number, number, number][] = [
  [-13,0,-10],[13,0,-10],[-15,0,5],[15,0,3],[-11,0,16],[11,0,14],[0,0,-16],[-6,0,-14],[7,0,-13]
];
const BRANCH_DATA: [number,number,number,number,number,number][] = [
  [0.5,3.8,0, 0,-0.5,1.0], [-0.6,3.5,0, 0,0.55,1.0],
  [0.3,4.4,0.3, -0.3,-0.25,0.9], [-0.35,4.1,-0.25, 0.25,0.3,0.9], [0.1,5.0,0, 0,-0.15,0.8],
];

function BareTree({ pos }: { pos: [number,number,number] }) {
  return (
    <group position={pos}>
      <mesh geometry={SHARED_GEO.treeTrunk} material={SHARED_MAT.tree} position={[0,2.5,0]} castShadow />
      {BRANCH_DATA.map(([x,y,z,ry,rz,s],i) => (
        <mesh key={i} geometry={SHARED_GEO.treeBranch} material={SHARED_MAT.tree}
          position={[x,y,z]} rotation={[0,ry,rz]} scale={[1,s,1]} castShadow />
      ))}
    </group>
  );
}

// ─── Flickering candle ────────────────────────────────────────────────────────
function FlickerCandle({ x, phase = 0 }: { x: number; phase?: number }) {
  const flameRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const f = Math.sin(t * 8 + phase) * 0.08 + Math.sin(t * 13 + phase * 2) * 0.04 + 1;
    if (flameRef.current) flameRef.current.scale.set(f * 0.8, f, f * 0.8);
    if (lightRef.current) lightRef.current.intensity = 1.5 + Math.sin(t * 7 + phase) * 0.4;
  });
  return (
    <group position={[x, 0.2, 0.14]}>
      <mesh geometry={SHARED_GEO.candleBody} material={SHARED_MAT.candleWax} />
      <mesh ref={flameRef} geometry={SHARED_GEO.candleFlame} material={SHARED_MAT.flameBasic} position={[0, 0.1, 0]} />
      <pointLight ref={lightRef} color="#fbbf24" intensity={1.5} distance={2} position={[0, 0.12, 0]} />
    </group>
  );
}

// ─── Soul wisps ───────────────────────────────────────────────────────────────
function SoulWisps({ count }: { count: number }) {
  const n = Math.min(count, 3);
  const refs = useRef<THREE.Mesh[]>([]);
  const phases = useMemo(() => Array.from({ length: n }, () => Math.random() * Math.PI * 2), [n]);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    refs.current.forEach((m, i) => {
      if (!m) return;
      const p = phases[i];
      m.position.y = 1.2 + ((t * 0.3 + p) % 1.4);
      m.position.x = Math.sin(t * 0.8 + p) * 0.12;
      const life = ((t * 0.3 + p) % 1.4) / 1.4;
      (m.material as THREE.MeshBasicMaterial).opacity = life < 0.2 ? (life / 0.2) * 0.5 : (1 - life) * 0.5;
    });
  });
  return (
    <group>
      {Array.from({ length: n }).map((_, i) => (
        <mesh key={i} ref={el => { if (el) refs.current[i] = el; }}
          geometry={SHARED_GEO.wisp} material={SHARED_MAT.wisp.clone()} position={[0, 1.2, 0.08]} />
      ))}
    </group>
  );
}

// ─── Resurrection pulse ───────────────────────────────────────────────────────
function ResurrectPulse() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.getElapsedTime() * 0.8) % 1;
    ref.current.scale.setScalar(1 + t * 2.5);
    (ref.current.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.6;
  });
  return (
    <mesh ref={ref} geometry={SHARED_GEO.ring} material={SHARED_MAT.ring.clone()}
      rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} />
  );
}

// ─── Fireflies — single Points object, typed array update ─────────────────────
function Fireflies() {
  const COUNT = 35;
  const ref = useRef<THREE.Points>(null);
  const { base, phases, geo } = useMemo(() => {
    const base = Float32Array.from({ length: COUNT * 3 }, (_, i) =>
      i % 3 === 1 ? 0.5 + Math.random() * 2.5 : (Math.random() - 0.5) * 30
    );
    const phases = Array.from({ length: COUNT }, () => Math.random() * Math.PI * 2);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(base.slice(), 3));
    return { base, phases, geo };
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    const t = clock.getElapsedTime();
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * 0.7 + phases[i]) * 0.4;
      arr[i * 3]     = base[i * 3]     + Math.cos(t * 0.4 + phases[i]) * 0.2;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    (ref.current.material as THREE.PointsMaterial).opacity = 0.5 + Math.sin(t * 1.8) * 0.2;
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#fbbf24" size={0.07} transparent opacity={0.6} sizeAttenuation depthWrite={false} />
    </points>
  );
}

// ─── Camera drift ─────────────────────────────────────────────────────────────
function CameraRig() {
  const { camera } = useThree();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.04;
    camera.position.x += (Math.sin(t) * 1.2 - camera.position.x) * 0.001;
  });
  return null;
}

// ─── Tombstone ────────────────────────────────────────────────────────────────
function Tombstone3D({
  tombstone, position, rotation, index,
  onClick, isHovered, onHover, onUnhover,
  hasCandle, hasVote, justLit,
}: {
  tombstone: TombstoneWithStats;
  position: [number,number,number];
  rotation: number;
  index: number;
  onClick: () => void;
  isHovered: boolean;
  onHover: () => void;
  onUnhover: () => void;
  hasCandle: boolean;
  hasVote: boolean;
  justLit: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef  = useRef<THREE.PointLight>(null);
  const enterProgress = useRef(0);
  const entered = useRef(false);
  const ENTER_DELAY = index * 0.1;

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const elapsed = clock.getElapsedTime() - ENTER_DELAY;

    if (!entered.current) {
      if (elapsed < 0) { groupRef.current.position.y = -3; return; }
      enterProgress.current = Math.min(1, enterProgress.current + delta * 1.3);
      const ease = 1 - Math.pow(1 - enterProgress.current, 3);
      groupRef.current.position.y = -3 + ease * 3;
      if (enterProgress.current >= 1) { entered.current = true; groupRef.current.position.y = 0; }
      return;
    }

    const h = groupRef.current.userData.h ?? 0;
    const ht = isHovered ? 1 : 0;
    const next = h + (ht - h) * Math.min(1, delta * 7);
    groupRef.current.userData.h = next;
    groupRef.current.position.y = next * 0.2;
    groupRef.current.rotation.x = next * -0.04;
    if (!isHovered) groupRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.3 + index) * 0.004;
    if (glowRef.current) glowRef.current.intensity = next * 2.0 + (hasCandle ? 0.8 : 0);
  });

  return (
    <group
      ref={groupRef}
      position={[position[0], -3, position[2]]}
      rotation={[0, rotation, 0]}
      onClick={e => { e.stopPropagation(); onClick(); }}
      onPointerOver={e => { e.stopPropagation(); onHover(); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { onUnhover(); document.body.style.cursor = "default"; }}
    >
      <pointLight ref={glowRef} color="#a78bfa" intensity={0} distance={4} position={[0, 1.5, 0.4]} />

      {/* Dirt mound */}
      <mesh geometry={SHARED_GEO.dirtMound} material={SHARED_MAT.dirt}
        position={[0, 0.04, 0.5]} rotation={[-0.1, 0, 0]} receiveShadow />

      {/* Base slab */}
      <mesh geometry={SHARED_GEO.baseSlab} material={SHARED_MAT.slab}
        position={[0, 0.09, 0]} castShadow receiveShadow />

      {/* Arch body */}
      <mesh geometry={SHARED_GEO.tombBody}
        material={isHovered ? SHARED_MAT.stoneHover : SHARED_MAT.stone}
        position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow />

      {/* Face panel */}
      <mesh position={[0, 0.78, 0.135]}
        material={isHovered ? SHARED_MAT.faceHover : SHARED_MAT.face}>
        <planeGeometry args={[0.44, 0.65]} />
      </mesh>

      {/* Moss */}
      <mesh geometry={SHARED_GEO.mossPatch} material={SHARED_MAT.moss}
        position={[0, 0.21, 0.136]} />

      {/* Text */}
      <Text position={[0, 1.32, 0.14]} fontSize={0.11}
        color={isHovered ? "#ffffff" : "#ede8e0"}
        anchorX="center" anchorY="middle" maxWidth={0.5} textAlign="center"
        outlineWidth={0.007} outlineColor="#0a0908" outlineOpacity={1}>
        {tombstone.repo_name.length > 10 ? tombstone.repo_name.slice(0, 9) + "…" : tombstone.repo_name}
      </Text>
      <Text position={[0, 1.02, 0.14]} fontSize={0.065}
        color={isHovered ? "#d8d0c8" : "#a8a098"}
        anchorX="center" anchorY="middle"
        outlineWidth={0.006} outlineColor="#0a0908" outlineOpacity={1}>
        {`${new Date(tombstone.born_at).getFullYear()} — ${new Date(tombstone.died_at).getFullYear()}`}
      </Text>
      <Text position={[0, 0.76, 0.14]} fontSize={0.054}
        color={isHovered ? "#e0c8ff" : "#a880c8"}
        anchorX="center" anchorY="middle" maxWidth={0.46} textAlign="center"
        outlineWidth={0.006} outlineColor="#0a0908" outlineOpacity={1}>
        {tombstone.cause_of_death.length > 18
          ? tombstone.cause_of_death.slice(0, 17) + "…"
          : tombstone.cause_of_death}
      </Text>

      {(hasCandle || isHovered) && (
        <>
          <FlickerCandle x={-0.28} phase={0} />
          <FlickerCandle x={0.28} phase={Math.PI} />
        </>
      )}
      {tombstone.candle_count > 0 && <SoulWisps count={tombstone.candle_count} />}
      {hasVote && <ResurrectPulse />}
    </group>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────
function computeLayout(count: number) {
  const cols = Math.min(5, count);
  const rows = Math.ceil(count / cols);
  return Array.from({ length: count }, (_, i) => ({
    pos: [
      (i % cols - (cols - 1) / 2) * 3.4 + (Math.random() - 0.5) * 0.7,
      0,
      Math.floor(i / cols) * 4.2 - (rows - 1) * 1.8 + (Math.random() - 0.5) * 0.5,
    ] as [number, number, number],
    rot: (Math.random() - 0.5) * 0.2,
  }));
}

// ─── Scene ────────────────────────────────────────────────────────────────────
function Scene({
  tombstones, onSelect, litSet, votedSet, justLitId,
}: {
  tombstones: TombstoneWithStats[];
  onSelect: (t: TombstoneWithStats) => void;
  litSet: Set<string>;
  votedSet: Set<string>;
  justLitId: string | null;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const layout = useRef(computeLayout(tombstones.length));

  return (
    <>
      <ambientLight intensity={0.5} color="#8090c0" />
      <directionalLight
        position={[-10, 18, 6]} intensity={1.4} color="#d0e0ff"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-20} shadow-camera-right={20}
        shadow-camera-top={20} shadow-camera-bottom={-20}
        shadow-bias={-0.002}
      />
      <directionalLight position={[8, 6, -4]} intensity={0.25} color="#c0b8e8" />

      <fog attach="fog" args={["#0e0c18", 24, 55]} />
      <Stars radius={60} depth={30} count={800} factor={3} saturation={0.2} fade speed={0.4} />

      <CameraRig />
      <Ground />
      <GrassTufts />
      <Fireflies />

      {TREE_POSITIONS.map((p, i) => <BareTree key={i} pos={p} />)}

      {tombstones.map((t, i) => (
        <Tombstone3D
          key={t.id}
          tombstone={t}
          position={layout.current[i].pos}
          rotation={layout.current[i].rot}
          index={i}
          isHovered={hovered === t.id}
          onHover={() => setHovered(t.id)}
          onUnhover={() => setHovered(null)}
          onClick={() => onSelect(t)}
          hasCandle={litSet.has(t.id)}
          hasVote={votedSet.has(t.id)}
          justLit={justLitId === t.id}
        />
      ))}
    </>
  );
}

// ─── Info panel ───────────────────────────────────────────────────────────────
function TombstonePanel({
  tombstone, onClose, litSet, votedSet, onCandle, onVote,
}: {
  tombstone: TombstoneWithStats;
  onClose: () => void;
  litSet: Set<string>;
  votedSet: Set<string>;
  onCandle: (id: string, lit: boolean) => void;
  onVote: (id: string, voted: boolean) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [candleCount, setCandleCount] = useState(tombstone.candle_count);
  const [voteCount, setVoteCount] = useState(tombstone.resurrection_votes);
  const [candleLoading, setCandleLoading] = useState(false);
  const [voteLoading, setVoteLoading] = useState(false);
  const isLit = litSet.has(tombstone.id);
  const isVoted = votedSet.has(tombstone.id);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t); }, []);

  const toggleCandle = async () => {
    if (candleLoading) return;
    setCandleLoading(true);
    const wasLit = isLit;
    onCandle(tombstone.id, !wasLit);
    setCandleCount(c => wasLit ? c - 1 : c + 1);
    try {
      const res = await fetch("/api/candles", {
        method: wasLit ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tombstone_id: tombstone.id }),
      });
      if (!res.ok) {
        if (res.status === 401) toast.error("Sign in to light a candle");
        onCandle(tombstone.id, wasLit);
        setCandleCount(c => wasLit ? c + 1 : c - 1);
      } else if (!wasLit) toast.success("Candle lit 🕯️");
    } finally { setCandleLoading(false); }
  };

  const toggleVote = async () => {
    if (voteLoading) return;
    setVoteLoading(true);
    const wasVoted = isVoted;
    onVote(tombstone.id, !wasVoted);
    setVoteCount(c => wasVoted ? c - 1 : c + 1);
    try {
      const res = await fetch("/api/resurrect", {
        method: wasVoted ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tombstone_id: tombstone.id }),
      });
      if (!res.ok) {
        if (res.status === 401) toast.error("Sign in to vote");
        onVote(tombstone.id, wasVoted);
        setVoteCount(c => wasVoted ? c + 1 : c - 1);
      } else if (!wasVoted) toast.success("Resurrection vote cast ✨");
    } finally { setVoteLoading(false); }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center z-20"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg,#1e1c2e 0%,#13111f 100%)",
          border: "1px solid rgba(139,92,246,0.35)",
          boxShadow: "0 0 80px rgba(88,28,135,0.4)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.96)",
          transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
        }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/70 to-transparent" />
        <div className="p-7">
          <div className="text-center mb-4">
            <p className="text-[10px] font-mono text-zinc-600 tracking-[0.35em] uppercase mb-1.5">R.I.P.</p>
            <h2 className="font-gothic text-3xl mb-1" style={{ color: "#e8e4f8", textShadow: "0 0 30px rgba(139,92,246,0.5)" }}>
              {tombstone.repo_name}
            </h2>
            {tombstone.github_username && <p className="text-zinc-600 text-xs font-mono">@{tombstone.github_username}</p>}
          </div>
          <div className="text-center mb-3">
            <p className="text-zinc-400 font-mono text-sm tracking-widest">
              {new Date(tombstone.born_at).getFullYear()} — {new Date(tombstone.died_at).getFullYear()}
            </p>
            <p className="text-zinc-600 text-xs italic">({ageString(tombstone.born_at, tombstone.died_at)})</p>
          </div>
          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-purple-800/40" />
            <span className="text-zinc-700 text-xs">✦</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-purple-800/40" />
          </div>
          <div className="text-center mb-3">
            <p className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] mb-1">Cause of Death</p>
            <p className="text-purple-300 text-sm italic font-medium">&ldquo;{tombstone.cause_of_death}&rdquo;</p>
          </div>
          {tombstone.last_words && (
            <div className="text-center mb-3">
              <p className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] mb-1">Last Words</p>
              <p className="text-zinc-400 text-xs font-mono italic">&ldquo;{tombstone.last_words}&rdquo;</p>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Commits", value: tombstone.commits_count },
              { label: "Streak", value: tombstone.peak_streak_days ? `${tombstone.peak_streak_days}d` : "—" },
              { label: "Best Day", value: tombstone.most_commits_one_day || "—" },
            ].map(s => (
              <div key={s.label} className="text-center py-2.5 rounded-xl"
                style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.18)" }}>
                <p className="text-purple-300 font-mono font-bold text-sm">{s.value}</p>
                <p className="text-zinc-600 text-[9px] uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          {tombstone.epitaph && (
            <div className="text-center mb-4 px-4 py-3 rounded-xl"
              style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-zinc-400 text-sm italic font-gothic">{tombstone.epitaph}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button onClick={toggleCandle} disabled={candleLoading}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all active:scale-95"
              style={{
                background: isLit ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${isLit ? "rgba(251,191,36,0.5)" : "rgba(255,255,255,0.08)"}`,
                boxShadow: isLit ? "0 0 20px rgba(251,191,36,0.2)" : "none",
              }}>
              <span className="text-2xl" style={{ filter: isLit ? "drop-shadow(0 0 8px #fbbf24)" : "none" }}>🕯️</span>
              <span className={`font-mono text-sm font-bold ${isLit ? "text-amber-400" : "text-zinc-500"}`}>{candleCount}</span>
              <span className={`text-[10px] uppercase tracking-wider ${isLit ? "text-amber-500/70" : "text-zinc-600"}`}>
                {candleLoading ? "…" : isLit ? "Snuff" : "Light Candle"}
              </span>
            </button>
            <button onClick={toggleVote} disabled={voteLoading}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all active:scale-95"
              style={{
                background: isVoted ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${isVoted ? "rgba(52,211,153,0.45)" : "rgba(255,255,255,0.08)"}`,
                boxShadow: isVoted ? "0 0 20px rgba(52,211,153,0.15)" : "none",
              }}>
              <span className="text-2xl" style={{ filter: isVoted ? "drop-shadow(0 0 8px #34d399)" : "none" }}>✨</span>
              <span className={`font-mono text-sm font-bold ${isVoted ? "text-emerald-400" : "text-zinc-500"}`}>{voteCount}</span>
              <span className={`text-[10px] uppercase tracking-wider ${isVoted ? "text-emerald-500/70" : "text-zinc-600"}`}>
                {voteLoading ? "…" : isVoted ? "Unvote" : "Resurrect"}
              </span>
            </button>
          </div>
          <div className="mb-4 space-y-1">
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, (voteCount / 50) * 100)}%`,
                  background: "linear-gradient(90deg,rgba(139,92,246,0.7),rgba(52,211,153,0.9))",
                }} />
            </div>
            <p className="text-zinc-700 text-[10px] font-mono text-right">{voteCount}/50 to resurrect</p>
          </div>
          <div className="flex gap-3">
            <a href={`/tombstone/${tombstone.id}`}
              className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold text-white hover:scale-[1.02] transition-all"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 24px rgba(139,92,246,0.35)" }}>
              Full Tombstone →
            </a>
            <button onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function GraveyardScene({ tombstones }: { tombstones: TombstoneWithStats[] }) {
  const [selected, setSelected] = useState<TombstoneWithStats | null>(null);
  const [litSet, setLitSet] = useState<Set<string>>(new Set());
  const [votedSet, setVotedSet] = useState<Set<string>>(new Set());
  const [justLitId, setJustLitId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const [c, v] = await Promise.all([
        supabase.from("candles").select("tombstone_id").eq("user_id", user.id),
        supabase.from("resurrection_votes").select("tombstone_id").eq("user_id", user.id),
      ]);
      setLitSet(new Set((c.data ?? []).map((r: { tombstone_id: string }) => r.tombstone_id)));
      setVotedSet(new Set((v.data ?? []).map((r: { tombstone_id: string }) => r.tombstone_id)));
    });
  }, []);

  const handleCandle = useCallback((id: string, lit: boolean) => {
    setLitSet(s => { const n = new Set(s); lit ? n.add(id) : n.delete(id); return n; });
    if (lit) { setJustLitId(id); setTimeout(() => setJustLitId(null), 1500); }
  }, []);

  const handleVote = useCallback((id: string, voted: boolean) => {
    setVotedSet(s => { const n = new Set(s); voted ? n.add(id) : n.delete(id); return n; });
  }, []);

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 7, 16], fov: 52, near: 0.5, far: 120 }}
        shadows="basic"
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        frameloop="always"
        performance={{ min: 0.5 }}
        style={{ background: "#0e0c18" }}
      >
        <Suspense fallback={null}>
          <Scene tombstones={tombstones} onSelect={setSelected}
            litSet={litSet} votedSet={votedSet} justLitId={justLitId} />
        </Suspense>
        <OrbitControls enablePan enableZoom enableRotate
          minDistance={3} maxDistance={40}
          maxPolarAngle={Math.PI / 2.06} minPolarAngle={0.15}
          target={[0, 0.5, 0]} makeDefault />
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

      {selected && (
        <TombstonePanel
          tombstone={selected} onClose={() => setSelected(null)}
          litSet={litSet} votedSet={votedSet}
          onCandle={handleCandle} onVote={handleVote}
        />
      )}
    </div>
  );
}
