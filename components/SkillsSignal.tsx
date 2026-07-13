'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useFrequencyContext } from '@/app/providers';
import { stations } from '@/lib/stations';

function getRandomItems<T>(arr: T[], count: number): number[] {
  // Deterministic "random" selection based on array length
  const indices: number[] = [];
  const seed = arr.length;
  for (let i = 0; i < count && i < arr.length; i++) {
    const idx = (seed * 7 + i * 13) % arr.length;
    if (!indices.includes(idx)) indices.push(idx);
  }
  return indices;
}

export default function SkillsSignal() {
  const { frequency } = useFrequencyContext();

  const aboutStation = stations.find((s) => s.type === 'about');
  const allSkills = aboutStation?.skills ?? [];

  // Pick 2 skills for idle drift (deterministic selection)
  const driftIndices = useMemo(() => getRandomItems(allSkills, 2), [allSkills.length]);

  const skillStates = useMemo(() => {
    return allSkills.map((skill, index) => {
      const skillPosition = index / Math.max(allSkills.length - 1, 1);
      const dist = Math.abs(frequency.position - skillPosition);
      const clarity = Math.max(0, 1 - dist * 4);

      // Whether this skill gets idle drift oscillation
      const isDrifting = driftIndices.includes(index);

      return { skill, clarity, isDrifting };
    });
  }, [allSkills, frequency.position, driftIndices]);

  if (frequency.signalStrength < 0.05 && skillStates.every((s) => s.clarity < 0.1)) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: '1.5rem',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 40,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '0.35rem',
        maxWidth: '140px',
      }}
    >
      {skillStates.map(({ skill, clarity, isDrifting }) =>
        clarity > 0.05 || isDrifting ? (
          <motion.span
            key={skill}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              color: clarity > 0.6 ? 'var(--amber)' : 'var(--amber-dim)',
              whiteSpace: 'nowrap',
              textShadow:
                clarity > 0.5
                  ? '0 0 8px var(--amber-glow)'
                  : 'none',
            }}
            animate={
              isDrifting
                ? {
                    opacity: [clarity * 0.5 + 0.05, clarity * 0.5 + 0.2, clarity * 0.5 + 0.05],
                  }
                : {
                    opacity: clarity * 0.6,
                  }
            }
            transition={
              isDrifting
                ? {
                    duration: 3.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
                : {
                    duration: 0.8,
                    ease: 'easeInOut',
                  }
            }
          >
            {clarity > 0.5 ? '◈' : '◇'} {skill}
          </motion.span>
        ) : null
      )}
    </div>
  );
}
