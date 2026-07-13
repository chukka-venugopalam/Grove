'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useStationContext } from '@/app/providers';

export default function SignOn() {
  const { setActiveStationId } = useStationContext();
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Map progress (0 = centered at start, 1 = scrolled completely out)
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.8], [0, -100]);
  const blurValue = useTransform(scrollYProgress, [0, 0.8], [0, 16]);
  const filter = useTransform(blurValue, (b) => `blur(${b}px)`);

  return (
    <section
      ref={sectionRef}
      className="frequency-section"
      id="station-sign-on"
      style={{ overflow: 'hidden' }}
    >
      <motion.div
        onViewportEnter={() => setActiveStationId('sign-on')}
        viewport={{ margin: '-20% 0px -20% 0px' }}
        className="sign-on-content"
        style={{
          opacity,
          y,
          filter,
        }}
      >
        <h1 className="name">
          VENUGOPALAM
          <br />
          CHUKKA
        </h1>
        <p className="role">Creative Frontend Engineering &amp; Interactive Systems</p>
        
        <motion.div
          style={{
            marginTop: '4rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: 'var(--accent)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase' as const,
          }}
          animate={{
            y: [0, 6, 0],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          Scroll to explore &darr;
        </motion.div>
      </motion.div>
    </section>
  );
}
