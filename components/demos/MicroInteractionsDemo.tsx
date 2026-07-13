'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

/* ─── 1. Shimmer button ─── */
function ShimmerButton() {
  const [clicked, setClicked] = useState(false);
  return (
    <motion.button
      onClick={() => { setClicked(true); setTimeout(() => setClicked(false), 600); }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      style={{
        padding: '8px 18px',
        background: clicked
          ? 'linear-gradient(135deg, rgba(94, 234, 212, 0.2), rgba(94, 234, 212, 0.06))'
          : 'linear-gradient(135deg, rgba(94, 234, 212, 0.1), transparent)',
        border: '1px solid rgba(94, 234, 212, 0.2)',
        borderRadius: 4,
        color: clicked ? 'var(--accent)' : 'var(--accent-dim)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6rem',
        cursor: 'pointer',
        letterSpacing: '0.1em',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {clicked && (
        <motion.span
          initial={{ x: '-100%', opacity: 0.6 }}
          animate={{ x: '200%', opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(94, 234, 212, 0.25), transparent)',
          }}
        />
      )}
      SHIMMER
    </motion.button>
  );
}

/* ─── 2. Morph toggle ─── */
function MorphToggle() {
  const [on, setOn] = useState(false);
  return (
    <motion.div
      onClick={() => setOn(!on)}
      style={{
        width: 44,
        height: 22,
        borderRadius: 11,
        padding: 2,
        cursor: 'pointer',
        background: on ? 'rgba(94, 234, 212, 0.2)' : 'rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: on ? 'flex-end' : 'flex-start',
        border: '1px solid rgba(94, 234, 212, 0.15)',
      }}
      layout
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          width: 16,
          height: 16,
          borderRadius: on ? 4 : 8,
          background: on ? 'var(--accent)' : 'rgba(255,255,255,0.25)',
        }}
      />
    </motion.div>
  );
}

/* ─── 3. Ripple button ─── */
function RippleButton() {
  const [ripples, setRipples] = useState<number[]>([]);
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => {
        const id = Date.now();
        setRipples((prev) => [...prev, id]);
        setTimeout(() => setRipples((prev) => prev.filter((r) => r !== id)), 600);
      }}
      style={{
        padding: '8px 18px',
        background: 'transparent',
        border: '1px solid rgba(94, 234, 212, 0.2)',
        borderRadius: 4,
        color: 'var(--accent-dim)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6rem',
        cursor: 'pointer',
        letterSpacing: '0.1em',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      RIPPLE
      {ripples.map((id) => (
        <motion.span
          key={id}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'rgba(94, 234, 212, 0.15)',
          }}
        />
      ))}
    </motion.button>
  );
}

/* ─── 4. Stagger card ─── */
function StaggerCard() {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        gap: 4,
        cursor: 'pointer',
        padding: '8px 12px',
        border: '1px solid rgba(94, 234, 212, 0.1)',
        borderRadius: 4,
      }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            y: hovered ? -4 : 0,
            scale: hovered ? 1.15 : 1,
          }}
          transition={{
            delay: i * 0.05,
            type: 'spring',
            stiffness: 400,
            damping: 15,
          }}
          style={{
            width: 12,
            height: 24,
            borderRadius: 3,
            background: `rgba(94, 234, 212, ${0.2 + i * 0.15})`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── 5. Press-and-hold fill ─── */
function PressFill() {
  const [pressing, setPressing] = useState(false);
  return (
    <div
      onMouseDown={() => setPressing(true)}
      onMouseUp={() => setPressing(false)}
      onMouseLeave={() => setPressing(false)}
      style={{
        padding: '8px 18px',
        border: '1px solid rgba(94, 234, 212, 0.2)',
        borderRadius: 4,
        color: pressing ? 'var(--bg-base)' : 'var(--accent-dim)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.55rem',
        cursor: 'pointer',
        letterSpacing: '0.1em',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <motion.div
        initial={{ width: '0%' }}
        animate={{ width: pressing ? '100%' : '0%' }}
        transition={{ duration: pressing ? 0.4 : 0.2, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--accent)',
        }}
      />
      <span style={{ position: 'relative', zIndex: 1 }}>
        {pressing ? 'RELEASED' : 'HOLD ME'}
      </span>
    </div>
  );
}

/* ─── Main component ─── */
export default function MicroInteractionsDemo() {
  return (
    <div
      style={{
        width: '100%',
        minHeight: 280,
        border: '1px solid rgba(94, 234, 212, 0.06)',
        borderRadius: 4,
        background: 'rgba(0,0,0,0.2)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 32,
      }}
    >
      <ShimmerButton />
      <MorphToggle />
      <RippleButton />
      <StaggerCard />
      <PressFill />
    </div>
  );
}
