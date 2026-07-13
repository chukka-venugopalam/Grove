'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── Interactive distortion shader ─── */

const DistortionShader = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision highp float;
    varying vec2 vUv;
    uniform float uTime;
    uniform vec2 uMouse;

    void main() {
      vec2 uv = vUv;
      vec2 mouse = uMouse;

      // Distance from mouse cursor
      float dist = distance(uv, mouse);

      // Ripple displacement
      float ripple = sin(dist * 30.0 - uTime * 3.0) * 0.03 / (dist * 1.5 + 0.5);
      vec2 distortedUv = uv + (uv - mouse) * ripple;

      // Color field — amber tones
      float r = 0.96 * (0.5 + 0.5 * sin(distortedUv.x * 4.0 + uTime * 0.5));
      float g = 0.62 * (0.5 + 0.5 * sin(distortedUv.y * 4.0 + uTime * 0.4));
      float b = 0.04 * (0.5 + 0.5 * sin((distortedUv.x + distortedUv.y) * 3.0 + uTime * 0.3));

      // Cursor glow
      float glow = 0.15 / (dist * 2.0 + 0.3);
      r += glow * 0.3;
      g += glow * 0.2;

      // Grid lines for structure
      float gridX = step(0.95, fract(distortedUv.x * 12.0));
      float gridY = step(0.95, fract(distortedUv.y * 12.0));
      float grid = max(gridX, gridY) * 0.15;
      r += grid;
      g += grid;

      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `,
};

function ShaderQuad() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size, pointer } = useThree();
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      ...DistortionShader,
    });
  }, []);

  useFrame((state) => {
    if (material) {
      material.uniforms.uTime.value = state.clock.elapsedTime;
      // Map pointer (ranges from -1 to 1) to 0-1 UV space
      material.uniforms.uMouse.value.set(
        pointer.x * 0.5 + 0.5,
        pointer.y * 0.5 + 0.5
      );
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export default function ShaderDemo() {
  return (
    <div
      style={{
        width: '100%',
        height: 300,
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid rgba(245, 158, 11, 0.1)',
      }}
    >
      <Canvas
        orthographic
        camera={{ position: [0, 0, 1], zoom: 1, near: 0.1, far: 10 }}
        gl={{ antialias: false, alpha: false }}
        style={{ width: '100%', height: '100%' }}
      >
        <ShaderQuad />
      </Canvas>
    </div>
  );
}
