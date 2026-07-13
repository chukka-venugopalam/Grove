'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useFrequencyContext } from '@/app/providers';

/* ─── The full-screen quad with our custom shader ─── */

const NoiseSignalShader = {
  uniforms: {
    uTime: { value: 0 },
    uSignalStrength: { value: 0 },
    uOvershoot: { value: 0 },
    uResolution: { value: new THREE.Vector2(1920, 1080) },
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
    uniform float uSignalStrength;
    uniform float uOvershoot;
    uniform vec2 uResolution;

    // ─── Simplex-like noise (from Ashima Arts) ───
    vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * 7.0 * (1.0/49.0));
      vec4 x_ = floor(j * 7.0 * (1.0/49.0));
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    void main() {
      vec2 uv = vUv;
      float signal = uSignalStrength;
      float overshoot = uOvershoot;

      // ─── 3-BAND NOISE ───
      // Band 1: Slow drifting cloud (low frequency)
      float cloudNoise = snoise(vec3(uv * 2.5, uTime * 0.12)) * 0.5 + 0.5;

      // Band 2: Mid glitch/interference (medium frequency)
      float midNoise = snoise(vec3(uv * 8.0 + 50.0, uTime * 0.4)) * 0.5 + 0.5;

      // Band 3: Fine grain / static (high frequency, pseudo-random)
      float fineNoise = fract(sin(dot(uv * 120.0 + uTime * 80.0, vec2(12.9898, 78.233))) * 43758.5453);
      fineNoise = mix(fineNoise, snoise(vec3(uv * 32.0 + 200.0, uTime * 0.9)) * 0.5 + 0.5, 0.2);

      // Combine into a layered static texture
      float staticNoise = mix(
        cloudNoise * 0.3 + midNoise * 0.4 + fineNoise * 0.3,
        fineNoise,
        0.3
      );

      // ─── HORIZONTAL GLITCH — scales inversely with signal ───
      float glitchSignal = 1.0 - signal; // 1 = max glitch, 0 = no glitch
      float glitchFreq = 80.0 + glitchSignal * 120.0;    // more lines at low signal
      float glitchIntensity = glitchSignal * 0.08;        // more displacement at low signal
      float glitchLine = step(0.96, fract(uv.y * glitchFreq + uTime * 2.0 * glitchSignal));
      float glitchOffset = (midNoise * 2.0 - 1.0) * glitchIntensity * glitchLine;

      vec2 glitchUv = uv + vec2(glitchOffset, 0.0);

      // ─── CHROMATIC ABERRATION — resolves to zero at full signal ───
      float chromaAmount = (1.0 - signal) * 0.02;
      vec3 noiseColor = vec3(
        fract(fineNoise + chromaAmount + cloudNoise * 0.2),
        fract(fineNoise + midNoise * 0.2),
        fract(fineNoise - chromaAmount + cloudNoise * 0.1)
      );

      // ─── COMPOSITE with signal strength ───
      vec3 finalColor = noiseColor;
      // Push toward transparent/black as signal clears
      finalColor = mix(noiseColor, vec3(0.0), signal);

      // ─── LOCK OVERSHOOT POP ───
      // When overshoot > 0, briefly boost contrast and sharpness
      // for a decisive "snap into station" feel
      float popContrast = 1.0 + overshoot * 2.0;
      finalColor = (finalColor - 0.5) * popContrast + 0.5;
      // Amber tint flash on lock
      vec3 amberTint = vec3(0.96, 0.62, 0.04);
      finalColor = mix(finalColor, amberTint * 0.3, overshoot * 0.35);

      // ─── CRT SCANLINES — always present at low opacity ───
      float scanline = sin(uv.y * 480.0 + uTime * 0.3) * 0.02 + 1.0;
      scanline = mix(scanline, 1.0, signal * 0.5); // subtler at high signal
      finalColor *= scanline;

      // ─── VIGNETTE — always present ───
      float vignette = 1.0 - length(uv - 0.5) * 0.65;
      vignette = mix(vignette, 1.0, signal * 0.3); // subtler at high signal
      // Lock overshoot: briefly reduce vignette for a brightening pop
      vignette = mix(vignette, 1.0, overshoot * 0.6);
      finalColor *= vignette;

      // ─── ALPHA ───
      float alpha = max(1.0 - signal, 0.0);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
};

function ShaderQuad() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { frequency } = useFrequencyContext();
  const { size } = useThree();

  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      ...NoiseSignalShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    return mat;
  }, []);

  // Lock overshoot state
  const overshootRef = useRef(0);
  const prevSignalRef = useRef(0);
  const armedToLockRef = useRef(true);
  const overshootStartRef = useRef(0);

  useFrame((state) => {
    if (!material) return;

    const signal = frequency.signalStrength;
    const prevSignal = prevSignalRef.current;

    // Guard: only re-trigger if signal was below 0.85 since last lock
    if (signal < 0.85) {
      armedToLockRef.current = true;
    }

    // Detect lock moment: signal crosses 0.9 going upward + armed
    if (prevSignal < 0.9 && signal >= 0.9 && armedToLockRef.current) {
      overshootRef.current = 0.0;
      overshootStartRef.current = state.clock.elapsedTime;
      armedToLockRef.current = false;
    }

    // Animate overshoot: 0 → 1 (fast rise) → 0 (slower settle) over ~200ms
    if (overshootStartRef.current > 0) {
      const elapsed = state.clock.elapsedTime - overshootStartRef.current;
      const totalDuration = 0.2; // 200ms
      const t = Math.min(elapsed / totalDuration, 1.0);

      // Fast attack (0→1 in first 30%), slower release (1→0 in remaining 70%)
      // Use smoothstep-like cubic for organic feel
      let overshoot: number;
      if (t < 0.3) {
        // Rise phase: 0 → 1, ease-out
        const p = t / 0.3;
        overshoot = p * p * (3 - 2 * p); // smoothstep
      } else {
        // Fall phase: 1 → 0, ease-out
        const p = (t - 0.3) / 0.7;
        overshoot = 1.0 - p * p * (3 - 2 * p); // 1 - smoothstep
      }

      overshootRef.current = overshoot;

      if (t >= 1.0) {
        overshootStartRef.current = 0; // end animation
        overshootRef.current = 0;
      }
    }

    // Update uniforms every frame
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uSignalStrength.value = signal;
    material.uniforms.uOvershoot.value = overshootRef.current;
    material.uniforms.uResolution.value.set(size.width, size.height);

    prevSignalRef.current = signal;
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export default function ShaderCanvas() {
  return (
    <div className="shader-layer">
      <Canvas
        orthographic
        camera={{ position: [0, 0, 1], zoom: 1, near: 0.1, far: 10 }}
        gl={{
          alpha: true,
          antialias: false,
          depth: false,
          stencil: false,
          powerPreference: 'high-performance',
        }}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
        }}
      >
        <ShaderQuad />
      </Canvas>
    </div>
  );
}
