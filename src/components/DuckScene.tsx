"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Sparkles } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const POINTER = {
  x: 0.55,
  y: 0.5,
  sx: 0.55,
  sy: 0.5,
  clean: 0,
  sClean: 0,
};

function PointerTracker() {
  useFrame(() => {
    POINTER.sx += (POINTER.x - POINTER.sx) * 0.07;
    POINTER.sy += (POINTER.y - POINTER.sy) * 0.07;
    POINTER.sClean += (POINTER.clean - POINTER.sClean) * 0.06;
  });
  return null;
}

function Duck() {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Mesh>(null);
  const head = useRef<THREE.Mesh>(null);
  const wing = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!root.current) return;
    const t = state.clock.elapsedTime;

    root.current.position.y = Math.sin(t * 1.1) * 0.14;
    root.current.rotation.y =
      (POINTER.sx - 0.5) * 0.55 + Math.sin(t * 0.4) * 0.04;
    root.current.rotation.x = (POINTER.sy - 0.5) * 0.22;

    if (head.current) {
      head.current.rotation.z = Math.sin(t * 1.8) * 0.06;
    }
    if (wing.current) {
      wing.current.rotation.z = -0.25 + Math.sin(t * 4) * 0.08;
    }
  });

  return (
    <group ref={root} position={[2.6, 0.1, 0]}>
      {/* halo glow */}
      <mesh>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshBasicMaterial color="#FFD400" transparent opacity={0.05} />
      </mesh>

      {/* body */}
      <mesh ref={body} position={[0, -0.25, 0]} scale={[1.45, 1.05, 1.25]}>
        <sphereGeometry args={[1, 96, 96]} />
        <meshPhysicalMaterial
          color="#FFD66B"
          transmission={0.55}
          thickness={1.2}
          roughness={0.12}
          metalness={0.05}
          ior={1.45}
          clearcoat={1}
          clearcoatRoughness={0.08}
          attenuationColor="#FFB000"
          attenuationDistance={2.4}
          emissive="#FFC400"
          emissiveIntensity={0.14}
        />
      </mesh>

      {/* head */}
      <mesh ref={head} position={[-0.85, 0.78, 0.1]}>
        <sphereGeometry args={[0.7, 64, 64]} />
        <meshPhysicalMaterial
          color="#FFE08A"
          transmission={0.5}
          thickness={1}
          roughness={0.1}
          metalness={0.05}
          ior={1.45}
          clearcoat={1}
          clearcoatRoughness={0.08}
          attenuationColor="#FFB000"
          attenuationDistance={2.2}
          emissive="#FFC400"
          emissiveIntensity={0.18}
        />
      </mesh>

      {/* beak (top + bottom) */}
      <group position={[-1.6, 0.7, 0.18]} rotation={[0, 0, -0.05]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.24, 0.6, 36]} />
          <meshStandardMaterial
            color="#FF8A00"
            emissive="#FF5A00"
            emissiveIntensity={0.45}
            roughness={0.45}
            metalness={0.25}
          />
        </mesh>
        <mesh position={[0, -0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.18, 0.5, 28]} />
          <meshStandardMaterial
            color="#FF6A00"
            emissive="#FF3A00"
            emissiveIntensity={0.35}
            roughness={0.5}
            metalness={0.2}
          />
        </mesh>
      </group>

      {/* eye + sparkle */}
      <mesh position={[-1.05, 0.95, 0.5]}>
        <sphereGeometry args={[0.09, 24, 24]} />
        <meshStandardMaterial
          color="#0A0A0A"
          emissive="#FFD400"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>
      <mesh position={[-1.02, 0.99, 0.56]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* wing */}
      <mesh
        ref={wing}
        position={[0.15, -0.05, 0.7]}
        rotation={[0.2, 0.2, -0.25]}
      >
        <sphereGeometry args={[0.78, 48, 48]} />
        <meshPhysicalMaterial
          color="#FFC85A"
          transmission={0.4}
          thickness={0.8}
          roughness={0.18}
          ior={1.4}
          clearcoat={1}
          emissive="#FF9A00"
          emissiveIntensity={0.12}
        />
      </mesh>
    </group>
  );
}

function Laser() {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((state) => {
    if (!ref.current || !mat.current) return;
    const t = state.clock.elapsedTime;
    const v = POINTER.sClean;
    mat.current.opacity = 0.12 + 0.85 * v + 0.06 * Math.sin(t * 14);
    ref.current.scale.x = 0.6 + 1.2 * Math.sin(t * 9) * v * 0.05 + v * 0.3;
    ref.current.scale.z = 0.6 + v * 0.3;
  });
  return (
    <mesh
      ref={ref}
      position={[0.4, 0.35, 0.4]}
      rotation={[0, 0, Math.PI / 2]}
    >
      <cylinderGeometry args={[0.05, 0.05, 3.6, 24, 1, true]} />
      <meshBasicMaterial
        ref={mat as never}
        color="#FFD400"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function makeMessyTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 640;
  const ctx = c.getContext("2d")!;
  // bg
  const grad = ctx.createLinearGradient(0, 0, 0, 640);
  grad.addColorStop(0, "#1a1a22");
  grad.addColorStop(1, "#101015");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 640);
  // border
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, 496, 624);
  // chaotic lines
  ctx.strokeStyle = "rgba(220,220,255,0.45)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 22; i++) {
    const y = 40 + i * 24 + (Math.random() - 0.5) * 8;
    ctx.beginPath();
    ctx.moveTo(28, y);
    for (let x = 28; x < 480; x += 6) {
      ctx.lineTo(x, y + (Math.random() - 0.5) * 8);
    }
    ctx.stroke();
  }
  // smudges
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.beginPath();
  ctx.arc(370, 470, 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,80,80,0.5)";
  ctx.fillRect(60, 540, 120, 12);
  // X marks
  ctx.strokeStyle = "rgba(255,60,60,0.7)";
  ctx.lineWidth = 6;
  for (let i = 0; i < 3; i++) {
    const x = 80 + i * 160;
    const y = 600;
    ctx.beginPath();
    ctx.moveTo(x - 18, y - 18);
    ctx.lineTo(x + 18, y + 18);
    ctx.moveTo(x - 18, y + 18);
    ctx.lineTo(x + 18, y - 18);
    ctx.stroke();
  }
  // crumple noise
  for (let i = 0; i < 1200; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.08})`;
    ctx.fillRect(Math.random() * 512, Math.random() * 640, 1, 1);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function makeCleanTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 640;
  const ctx = c.getContext("2d")!;
  // bg: pristine off-white
  const grad = ctx.createLinearGradient(0, 0, 0, 640);
  grad.addColorStop(0, "#fafafa");
  grad.addColorStop(1, "#f0efea");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 640);
  // border
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 2;
  ctx.strokeRect(4, 4, 504, 632);
  // top "PDF" badge
  ctx.fillStyle = "#FFD400";
  ctx.fillRect(32, 32, 92, 32);
  ctx.fillStyle = "#0A0A0A";
  ctx.font = "bold 20px 'Inter', system-ui, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText("PDF", 56, 50);
  // headline
  ctx.fillStyle = "#0A0A0A";
  ctx.fillRect(32, 96, 380, 18);
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(32, 124, 220, 8);
  // body
  ctx.fillStyle = "rgba(0,0,0,0.85)";
  for (let i = 0; i < 14; i++) {
    const y = 168 + i * 24;
    const w = i % 4 === 3 ? 240 : 440;
    ctx.fillRect(32, y, w, 6);
  }
  // signature block
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(32, 520, 200, 60);
  ctx.fillStyle = "#FFD400";
  ctx.font = "italic 26px 'Inter', cursive";
  ctx.fillText("~ duck ~", 60, 555);
  // tiny doc icon
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(420, 36, 60, 24);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 12px 'Inter', sans-serif";
  ctx.fillText("✓ AI", 432, 50);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function Documents() {
  const messyTex = useMemo(() => makeMessyTexture(), []);
  const cleanTex = useMemo(() => makeCleanTexture(), []);

  const messyRef = useRef<THREE.Mesh>(null);
  const cleanRef = useRef<THREE.Mesh>(null);
  const messyMat = useRef<THREE.MeshStandardMaterial>(null);
  const cleanMat = useRef<THREE.MeshStandardMaterial>(null);
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const v = POINTER.sClean;

    if (messyMat.current) messyMat.current.opacity = 1 - v;
    if (cleanMat.current) cleanMat.current.opacity = v;

    if (messyRef.current) {
      messyRef.current.rotation.z =
        Math.sin(t * 0.8) * 0.04 * (1 - v) - 0.04 * (1 - v);
      messyRef.current.rotation.y = Math.sin(t * 0.6) * 0.05 * (1 - v);
      messyRef.current.position.x = -1 + (1 - v) * -0.05;
      messyRef.current.position.y = Math.sin(t * 0.9) * 0.08 + 0.05;
    }
    if (cleanRef.current) {
      cleanRef.current.rotation.z = Math.sin(t * 0.6) * 0.03 * v;
      cleanRef.current.rotation.y = Math.sin(t * 0.5) * 0.04 * v;
      cleanRef.current.position.x = -1 + v * 0.05;
      cleanRef.current.position.y = Math.sin(t * 0.7) * 0.08 + 0.05;
      cleanRef.current.scale.setScalar(0.92 + v * 0.08);
    }
    if (group.current) {
      group.current.rotation.y = (POINTER.sx - 0.5) * 0.2;
      group.current.rotation.x = (POINTER.sy - 0.5) * 0.12;
    }
  });

  return (
    <group ref={group}>
      <mesh ref={messyRef} position={[-1, 0, 0]}>
        <planeGeometry args={[2.4, 3, 32, 32]} />
        <meshStandardMaterial
          ref={messyMat}
          map={messyTex}
          transparent
          opacity={1}
          roughness={0.95}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={cleanRef} position={[-1, 0, 0.01]}>
        <planeGeometry args={[2.4, 3, 32, 32]} />
        <meshStandardMaterial
          ref={cleanMat}
          map={cleanTex}
          transparent
          opacity={0}
          roughness={0.6}
          metalness={0.05}
          emissive="#FFD400"
          emissiveIntensity={0.04}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* clean doc glow underlay */}
      <mesh position={[-1, 0, -0.05]}>
        <planeGeometry args={[3.4, 4, 1, 1]} />
        <meshBasicMaterial color="#FFD400" transparent opacity={0.06} />
      </mesh>
    </group>
  );
}

function SceneInner() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 8, 6]} intensity={1.4} color="#FFE08A" />
      <pointLight position={[-3, 2, 4]} intensity={1.2} color="#00E5FF" />
      <pointLight position={[3, -2, 4]} intensity={0.8} color="#B026FF" />

      <Environment preset="city" />

      <PointerTracker />
      <Documents />
      <Laser />
      <Duck />

      <Sparkles
        count={60}
        scale={[6, 4, 2]}
        size={3}
        speed={0.4}
        color="#FFD400"
        opacity={0.7}
      />
    </>
  );
}

export function DuckScene() {
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      POINTER.x = e.clientX / window.innerWidth;
      POINTER.y = e.clientY / window.innerHeight;
      POINTER.clean = Math.min(
        1,
        Math.max(0, (POINTER.x - 0.15) * 1.35),
      );
    };
    const onTouch = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      POINTER.x = e.touches[0].clientX / window.innerWidth;
      POINTER.y = e.touches[0].clientY / window.innerHeight;
      POINTER.clean = Math.min(
        1,
        Math.max(0, (POINTER.x - 0.15) * 1.35),
      );
    };

    // gentle auto-animation if no input
    let auto = 0;
    let lastInput = performance.now();
    const onInput = () => {
      lastInput = performance.now();
    };
    window.addEventListener("mousemove", (e) => {
      onMove(e);
      onInput();
    });
    window.addEventListener("touchmove", (e) => {
      onTouch(e);
      onInput();
    });

    const id = setInterval(() => {
      if (performance.now() - lastInput > 1800) {
        auto += 0.016;
        POINTER.x = 0.5 + Math.sin(auto * 0.8) * 0.35;
        POINTER.clean = Math.min(
          1,
          Math.max(0, (POINTER.x - 0.15) * 1.35),
        );
      }
    }, 50);

    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.3, 6.5], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
      >
        <SceneInner />
      </Canvas>
    </div>
  );
}
