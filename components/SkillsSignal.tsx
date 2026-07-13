'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStationContext } from '@/app/providers';
import { stations } from '@/lib/stations';

export default function SkillsSignal() {
  const { activeStationId } = useStationContext();

  // Find the active station's skills
  const activeSkills = useMemo(() => {
    const activeStation = stations.find((s) => s.id === activeStationId);
    return activeStation?.skills ?? [];
  }, [activeStationId]);

  // Default to about section skills if no active station
  const displaySkills = activeSkills.length > 0 ? activeSkills
    : stations.find((s) => s.type === 'about')?.skills ?? [];

  if (displaySkills.length === 0) return null;

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
      {displaySkills.map((skill, index) => (
        <motion.span
          key={skill}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 0.5, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{
            delay: index * 0.03,
            duration: 0.5,
            ease: 'easeOut',
          }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: index % 3 === 0 ? 'var(--accent)' : 'var(--text-dim)',
            whiteSpace: 'nowrap',
          }}
        >
          &rsaquo; {skill}
        </motion.span>
      ))}
    </div>
  );
}
