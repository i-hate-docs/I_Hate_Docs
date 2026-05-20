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
    <group ref={root} position={[0, 0.1, 0]} scale={0.85}>
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

function Ambience() {
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const shards = useRef<THREE.Group>(null);

  // stable orbit params so the shards don't reshuffle each frame
  const orbits = useMemo(
    () =>
      [
        { r: 2.6, y: 0.4, phase: 0, speed: 0.35, size: 0.16, hue: "#FFD400" },
        { r: 3.0, y: -0.3, phase: 1.2, speed: -0.28, size: 0.12, hue: "#00E5FF" },
        { r: 2.3, y: 0.9, phase: 2.4, speed: 0.45, size: 0.1, hue: "#B026FF" },
        { r: 3.2, y: -0.6, phase: 3.6, speed: -0.22, size: 0.18, hue: "#FFD400" },
        { r: 2.75, y: 0.05, phase: 4.8, speed: 0.32, size: 0.09, hue: "#00E5FF" },
      ] as const,
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringA.current) {
      ringA.current.rotation.z = t * 0.12;
      ringA.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.3) * 0.05;
    }
    if (ringB.current) {
      ringB.current.rotation.z = -t * 0.09;
      ringB.current.rotation.x = Math.PI / 2 + 0.35 + Math.sin(t * 0.2) * 0.04;
    }
    if (shards.current) {
      shards.current.children.forEach((child, i) => {
        const o = orbits[i];
        if (!o) return;
        const a = o.phase + t * o.speed;
        child.position.set(
          Math.cos(a) * o.r,
          o.y + Math.sin(t * 1.2 + o.phase) * 0.15,
          Math.sin(a) * o.r * 0.6,
        );
        child.rotation.x = t * 0.6 + o.phase;
        child.rotation.y = t * 0.4 - o.phase;
      });
    }
  });

  return (
    <group>
      {/* soft volumetric glow disk behind the duck */}
      <mesh position={[0, 0, -1.2]}>
        <circleGeometry args={[2.8, 64]} />
        <meshBasicMaterial
          color="#FFD400"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* twin glass orbit rings around the duck */}
      <mesh ref={ringA} position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.8, 0.025, 24, 220]} />
        <meshPhysicalMaterial
          color="#FFD400"
          emissive="#FFD400"
          emissiveIntensity={0.5}
          transmission={0.8}
          thickness={0.4}
          roughness={0.1}
          metalness={0.1}
          ior={1.45}
          transparent
          opacity={0.55}
        />
      </mesh>
      <mesh
        ref={ringB}
        position={[0, 0.1, 0]}
        rotation={[Math.PI / 2 + 0.35, 0, 0.4]}
      >
        <torusGeometry args={[3.3, 0.018, 20, 220]} />
        <meshPhysicalMaterial
          color="#00E5FF"
          emissive="#00E5FF"
          emissiveIntensity={0.45}
          transmission={0.85}
          thickness={0.4}
          roughness={0.08}
          metalness={0.05}
          ior={1.45}
          transparent
          opacity={0.45}
        />
      </mesh>

      {/* orbiting glassy shards */}
      <group ref={shards}>
        {orbits.map((o, i) => (
          <mesh key={i}>
            <icosahedronGeometry args={[o.size, 0]} />
            <meshPhysicalMaterial
              color={o.hue}
              emissive={o.hue}
              emissiveIntensity={0.55}
              transmission={0.7}
              thickness={0.6}
              roughness={0.12}
              metalness={0.15}
              ior={1.45}
              clearcoat={1}
              transparent
              opacity={0.9}
            />
          </mesh>
        ))}
      </group>
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
      <Ambience />
      <Duck />

      <Sparkles
        count={90}
        scale={[5, 4, 2]}
        size={3.4}
        speed={0.45}
        color="#FFD400"
        opacity={0.85}
      />
      <Sparkles
        count={50}
        scale={[4.5, 3.5, 1.5]}
        size={2}
        speed={0.6}
        color="#00E5FF"
        opacity={0.55}
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
        camera={{ position: [0, 0.3, 9], fov: 36 }}
        gl={{ antialias: true, alpha: true }}
      >
        <SceneInner />
      </Canvas>
    </div>
  );
}
