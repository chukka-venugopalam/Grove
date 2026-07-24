'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import { motion, AnimatePresence } from 'framer-motion';
import GroveScene from '@/components/GroveScene';
import AboutBookends from '@/components/AboutBookends';
import ProgressTrail from '@/components/ProgressTrail';

export default function Home() {
  const scrollRef = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Enforce a minimum loading sequence (2.2s) to allow R3F canvas and shaders to initialize smoothly
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  // Memoized Lenis scroll callback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleScroll = useCallback((lenis: any) => {
    scrollRef.current = lenis.progress;
    setScrollProgress(lenis.progress);
  }, []);

  useLenis(handleScroll);

  return (
    <ReactLenis
      root
      options={{
        duration: 1.5,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
      }}
    >
      <main style={{ position: 'relative', width: '100%' }}>
        {/* Full-screen 3D dolly scene */}
        <GroveScene scrollRef={scrollRef} />

        {/* Start & End About Me Bookends */}
        <AboutBookends scrollProgress={scrollProgress} />

        {/* Persistent progress trail dots wayfinding & jump navigation */}
        <ProgressTrail scrollProgress={scrollProgress} />

        {/* Status HUD overlay */}
        <div
          style={{
            position: 'fixed',
            top: 24,
            left: 24,
            zIndex: 10,
            fontFamily: 'var(--font-mono), monospace',
            color: '#ffffff',
            fontSize: '0.78rem',
            background: 'rgba(5, 12, 8, 0.85)',
            backdropFilter: 'blur(8px)',
            padding: '16px 20px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
            width: 280,
            textAlign: 'left',
          }}
        >
          <div style={{ color: 'var(--accent)', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.4rem' }}>
            {scrollProgress <= 0.33
              ? 'STAGE I: THE THRESHOLD'
              : scrollProgress <= 0.66
              ? 'STAGE II: THE CANOPY'
              : 'STAGE III: THE CLEARING'}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', marginBottom: '0.9rem' }}>
            LOCATION: {scrollProgress <= 0.33
              ? 'Entrance & Tactile Euler Physics'
              : scrollProgress <= 0.66
              ? 'Fluid Ripples & Brownian Dust Fields'
              : '3D Crystal Clusters & Volumetric Glow'}
          </div>
          
          {/* 3-segment progress indicator track */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '0.6rem' }}>
            {[0, 1, 2].map((seg) => {
              const isActive =
                (seg === 0 && scrollProgress <= 0.33) ||
                (seg === 1 && scrollProgress > 0.33 && scrollProgress <= 0.66) ||
                (seg === 2 && scrollProgress > 0.66);

              let fillPercent = 0;
              if (seg === 0) {
                fillPercent = Math.min(100, (scrollProgress / 0.33) * 100);
              } else if (seg === 1) {
                fillPercent = Math.min(100, Math.max(0, ((scrollProgress - 0.33) / 0.33) * 100));
              } else {
                fillPercent = Math.min(100, Math.max(0, ((scrollProgress - 0.66) / 0.34) * 100));
              }

              return (
                <div
                  key={seg}
                  style={{
                    flex: 1,
                    height: 3,
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${fillPercent}%`,
                      background: isActive ? 'var(--accent)' : 'rgba(255, 255, 255, 0.25)',
                      boxShadow: isActive ? '0 0 8px var(--accent)' : 'none',
                      transition: 'width 0.1s ease',
                    }}
                  />
                </div>
              );
            })}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
            <span>PROGRESS</span>
            <span>{(scrollProgress * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* Staged entry loader overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              key="loader"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                background: '#050c08',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2.5rem',
              }}
            >
              {/* Pulsing Glowing Spore Seed */}
              <div style={{ position: 'relative', width: 64, height: 64 }}>
                <motion.div
                  animate={{
                    scale: [1, 2.0, 1],
                    opacity: [0.15, 0.45, 0.15],
                  }}
                  transition={{
                    duration: 2.0,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{
                    position: 'absolute',
                    inset: -32,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)',
                  }}
                />
                <motion.div
                  animate={{
                    scale: [0.9, 1.1, 0.9],
                    boxShadow: [
                      '0 0 15px rgba(251, 191, 36, 0.6)',
                      '0 0 30px rgba(251, 191, 36, 0.9)',
                      '0 0 15px rgba(251, 191, 36, 0.6)',
                    ],
                  }}
                  transition={{
                    duration: 2.0,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: '#fbbf24',
                    border: '2px solid rgba(255, 255, 255, 0.25)',
                  }}
                />
              </div>

              {/* Status information */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                <motion.div
                  animate={{ opacity: [0.35, 1.0, 0.35] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    fontFamily: 'var(--font-mono), monospace',
                    fontSize: '0.72rem',
                    color: '#ffffff',
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                  }}
                >
                  Initializing Grove
                </motion.div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono), monospace',
                    fontSize: '0.58rem',
                    color: '#34d399',
                    opacity: 0.6,
                    letterSpacing: '0.12em',
                  }}
                >
                  Synthesizing 3D Garden Environment...
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dummy scroll area */}
        <div style={{ height: '500vh', width: '100%', pointerEvents: 'none' }} />
      </main>
    </ReactLenis>
  );
}
