'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLenis } from 'lenis/react';

const stations = [
  { id: 0, targetT: 0.12, label: 'Spring Seed Pod', desc: 'Tactile Euler Physics' },
  { id: 1, targetT: 0.26, label: 'Dew Leaf Pool', desc: 'GPU Fluid Ripples' },
  { id: 2, targetT: 0.40, label: 'Pollen Bulb', desc: 'Brownian Dust Fields' },
  { id: 3, targetT: 0.54, label: 'Crystal Cluster', desc: '3D Crystal Clusters' },
  { id: 4, targetT: 0.68, label: 'Growing Vine', desc: 'Spline Growth Extrusion' },
  { id: 5, targetT: 0.82, label: 'Dappled Shadow Sphere', desc: 'Dappled Leaf Shadows' },
  { id: 6, targetT: 0.96, label: 'Clearing Exit', desc: 'Volumetric Glow Core' },
];

interface ProgressTrailProps {
  scrollProgress: number;
}

export default function ProgressTrail({ scrollProgress }: ProgressTrailProps) {
  const lenis = useLenis();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const handleJump = (targetT: number) => {
    if (lenis) {
      lenis.scrollTo(lenis.limit * targetT, { duration: 1.8 });
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        right: 24,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.8rem',
        padding: '14px 8px',
        borderRadius: '20px',
        background: 'rgba(5, 12, 8, 0.45)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      {stations.map((s, idx) => {
        const isCurrent = Math.abs(scrollProgress - s.targetT) < 0.08;
        const isVisited = scrollProgress >= s.targetT + 0.08;

        return (
          <div
            key={s.id}
            style={{ position: 'relative' }}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {/* Clickable Area button */}
            <button
              onClick={() => handleJump(s.targetT)}
              aria-label={`Jump to ${s.label}`}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                width: 24,
                height: 24,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none',
              }}
            >
              {/* Dot visual */}
              <motion.div
                animate={{
                  scale: isCurrent ? 1.25 : 1.0,
                  backgroundColor: isCurrent
                    ? 'var(--accent)'
                    : isVisited
                    ? 'rgba(255, 255, 255, 0.5)'
                    : 'transparent',
                }}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  border: isCurrent
                    ? 'none'
                    : isVisited
                    ? 'none'
                    : '1.5px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: isCurrent ? '0 0 10px var(--accent-glow)' : 'none',
                  transition: 'border 0.3s ease, background-color 0.3s ease',
                }}
              />
            </button>

            {/* Hover tooltip showing station label and description */}
            <AnimatePresence>
              {hoveredIdx === idx && (
                <motion.div
                  initial={{ opacity: 0, x: -10, scale: 0.95 }}
                  animate={{ opacity: 1, x: -15, scale: 1 }}
                  exit={{ opacity: 0, x: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'absolute',
                    right: '100%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    whiteSpace: 'nowrap',
                    background: 'rgba(5, 12, 8, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    fontFamily: 'var(--font-mono), monospace',
                  }}
                >
                  <span style={{ fontSize: '0.68rem', color: 'var(--accent)', fontWeight: 600 }}>
                    {s.label}
                  </span>
                  <span style={{ fontSize: '0.58rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    {s.desc}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Skip to Contact Link at the bottom */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          width: '12px',
          height: '1px',
          margin: '4px 0',
        }}
      />
      
      <button
        onClick={() => handleJump(0.96)} // Jump straight to outro clearing
        aria-label="Skip to Contact"
        title="Skip to Contact"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--font-mono), monospace',
          fontSize: '0.55rem',
          color: 'var(--text-dim)',
          textTransform: 'uppercase',
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          padding: '4px 0',
          letterSpacing: '0.15em',
          outline: 'none',
          transition: 'color 0.3s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
      >
        Outro
      </button>
    </div>
  );
}
