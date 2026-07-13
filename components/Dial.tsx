'use client';

import { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { useSpring, animated } from '@react-spring/three';
import { useFrequencyContext } from '@/app/providers';
import { stations } from '@/lib/stations';

/* ─── 3D Dial Mesh ─── */

function DialMesh() {
  const groupRef = useRef<THREE.Group>(null);
  const { frequency } = useFrequencyContext();

  // Map frequency position (0-1) to rotation angle (-120° to 120°)
  const targetRotation = useMemo(() => {
    const minAngle = -2.09;
    const maxAngle = 2.09;
    return minAngle + frequency.position * (maxAngle - minAngle);
  }, [frequency.position]);

  // ─── DETENTS: uneven spring stiffness near station notches ───
  const nearestStationDist = useMemo(() => {
    let minDist = Infinity;
    for (let i = 0; i < stations.length; i++) {
      const stationPos = i / (stations.length - 1);
      const dist = Math.abs(frequency.position - stationPos);
      if (dist < minDist) minDist = dist;
    }
    return minDist;
  }, [frequency.position]);

  // Detent strength: 1 when right on a station, 0 when far from any
  const detentStrength = Math.max(0, 1 - nearestStationDist / 0.12);

  // Spring config with detent — dial feels heavier and stickier near stations
  const springConfig = useMemo(() => ({
    mass: 1.8 + detentStrength * 4,
    tension: 160 - detentStrength * 50,
    friction: 22 + detentStrength * 30,
    precision: 0.001,
  }), [detentStrength]);

  const { rotation } = useSpring({
    rotation: targetRotation,
    config: springConfig,
  });

  // ─── KNOB GEOMETRY (lathed profile) ───
  const knobGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const segments = 32;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const radius =
        0.8 +
        (t < 0.05 ? 0.15 : 0) +    // top rim
        (t > 0.05 && t < 0.2 ? 0.05 : 0) +  // top bevel
        (t > 0.3 && t < 0.5 ? -0.1 : 0) +   // grip indent
        (t > 0.7 && t < 0.85 ? 0.1 : 0) +   // bottom bevel
        (t > 0.9 ? 0.2 : 0);                 // base
      points.push(new THREE.Vector2(radius * 0.5, t * 1.2 - 0.6));
    }
    return new THREE.LatheGeometry(points, 48);
  }, []);

  // ─── BRUSHED METAL MATERIAL ───
  const metalMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#2a2a2a'),
        metalness: 0.88,
        roughness: 0.3,
        envMapIntensity: 1.2,
      }),
    []
  );

  // ─── NEEDLE INDICATOR ───
  const indicatorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#f59e0b'),
        emissive: new THREE.Color('#f59e0b'),
        emissiveIntensity: 0.6,
        metalness: 0.3,
        roughness: 0.4,
      }),
    []
  );

  const indicatorGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.02, -0.25);
    shape.lineTo(0.02, -0.25);
    shape.lineTo(0.01, 0.38);
    shape.lineTo(-0.01, 0.38);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, []);

  // ─── GRIP RING ───
  const gripGeo = useMemo(() => {
    const shape = new THREE.Shape();
    const r = 0.48;
    const segs = 64;
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      const rr = r + (i % 8 === 0 ? 0.02 : 0);
      const x = Math.cos(a) * rr;
      const y = Math.sin(a) * rr;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, []);

  // ─── DETENT NOTCH RING (faint amber ring indicating station positions) ───
  const notchRingGeo = useMemo(() => {
    const shape = new THREE.Shape();
    const r = 0.42;
    const segs = 72;
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      // Add bumps at station positions
      const stationAngle = (i / segs) * stations.length;
      const bump = Math.abs(stationAngle - Math.round(stationAngle)) < 0.08 ? 0.015 : 0;
      const rr = r + bump;
      const x = Math.cos(a) * rr;
      const y = Math.sin(a) * rr;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, []);

  return (
    <group ref={groupRef}>
      {/* Lighting */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[2, 3, 4]} intensity={0.7} />
      {/* Warm rim light for brushed metal edge highlight */}
      <directionalLight position={[-3, 1, 2]} intensity={0.5} color="#f59e0b" />
      {/* Fill light from below */}
      <directionalLight position={[0, -2, 2]} intensity={0.15} />

      {/* Knob body */}
      <animated.group rotation-z={rotation}>
        {/* Base knob */}
        <mesh geometry={knobGeometry} material={metalMaterial} />
        {/* Notch ring (stationary dial markings) */}
        <mesh geometry={notchRingGeo} material={metalMaterial} position={[0, 0, 0.51]} />
        {/* Needle indicator */}
        <mesh
          geometry={indicatorGeo}
          material={indicatorMaterial}
          position={[0, 0, 0.52]}
        />
        {/* Grip ring */}
        <mesh
          geometry={gripGeo}
          material={metalMaterial}
          position={[0, 0, 0.51]}
        />
      </animated.group>

      {/* Base ring (stationary) */}
      <mesh position={[0, 0, -0.05]}>
        <ringGeometry args={[0.38, 0.52, 48]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.6}
          roughness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export default function Dial() {
  return (
    <div className="dial-container">
      <Canvas
        camera={{ position: [0, 0, 1.8], fov: 40 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{
          width: '100%',
          height: '100%',
          cursor: 'grab',
        }}
      >
        <DialMesh />
      </Canvas>
    </div>
  );
}
