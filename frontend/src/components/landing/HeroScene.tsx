import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

// Shared mouse position for attraction
const mouse = { x: 0, y: 0 };

const MouseAttractor = () => {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  return null;
};

const AnimatedSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Attraction to mouse
    if (meshRef.current) {
      const targetX = mouse.x * 2.5;
      const targetY = mouse.y * 1.6;
      meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.08;
      meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.08;
      meshRef.current.rotation.x = t * 0.08;
      meshRef.current.rotation.y = t * 0.12;
      meshRef.current.rotation.z = t * 0.05;
    }
    if (materialRef.current) {
      // Color shifts between cyan and blue
      const hue = 0.52 + Math.sin(t * 0.3) * 0.05;
      materialRef.current.color.setHSL(hue, 1, 0.5);
      materialRef.current.emissive.setHSL(hue, 0.8, 0.15);
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={1.8}>
      <mesh ref={meshRef} scale={2.4}>
        <icosahedronGeometry args={[1, 6]} />
        <MeshDistortMaterial
          ref={materialRef}
          color="#00d4ff"
          emissive="#003344"
          emissiveIntensity={0.5}
          roughness={0.15}
          metalness={0.9}
          distort={0.35}
          speed={1.8}
          wireframe
        />
      </mesh>
    </Float>
  );
};

const InnerRing = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.2) * 0.1;
      meshRef.current.rotation.z = t * 0.08;
    }
  });

  return (
    <mesh ref={meshRef} scale={3.2}>
      <torusGeometry args={[1, 0.005, 16, 100]} />
      <meshBasicMaterial color="#00d4ff" transparent opacity={0.25} />
    </mesh>
  );
};

const OuterRing = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.PI / 3 + Math.cos(t * 0.15) * 0.15;
      meshRef.current.rotation.z = -t * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} scale={4}>
      <torusGeometry args={[1, 0.003, 16, 120]} />
      <meshBasicMaterial color="#3366ff" transparent opacity={0.15} />
    </mesh>
  );
};


const Particles = () => {
  const count = 350;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 4;
    }
    return pos;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useEffect(() => {
    if (pointsRef.current) {
      const attr = pointsRef.current.geometry.getAttribute('position');
      // Only call setUsage if attr is a BufferAttribute (not InterleavedBufferAttribute)
      if (attr && (attr as THREE.BufferAttribute).setUsage) {
        (attr as THREE.BufferAttribute).setUsage(THREE.DynamicDrawUsage);
      }
    }
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.1;
      pointsRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.01) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.012} color="#00d4ff" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
};

const HeroScene = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.25} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#00d4ff" />
        <pointLight position={[-5, -5, 3]} intensity={0.5} color="#3366ff" />
        <pointLight position={[0, 3, -3]} intensity={0.3} color="#00aaff" />
        <MouseAttractor />
        <AnimatedSphere />
        <InnerRing />
        <OuterRing />
        <Particles />
      </Canvas>
    </div>
  );
};

export default HeroScene;
