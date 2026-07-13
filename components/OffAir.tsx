'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function OffAir() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [60, 0, 0, -60]);
  const blurValue = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [12, 0, 0, 12]);
  const filter = useTransform(blurValue, (b) => `blur(${b}px)`);

  return (
    <section
      ref={sectionRef}
      className="frequency-section"
      id="station-off-air"
      style={{ overflow: 'hidden' }}
    >
      <motion.div
        className="contact-container"
        style={{ opacity, y, filter }}
      >
        <h2>Get in Touch</h2>
        <p>
          If you&apos;d like to get in touch, send a transmission through any
          of the channels below.
        </p>
        <div className="contact-links">
          <a
            href="mailto:hello@frequency.dev"
            className="contact-link"
            rel="noopener noreferrer"
          >
            Email
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-link"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-link"
          >
            LinkedIn
          </a>
        </div>
        <p
          style={{
            marginTop: '3rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            color: 'var(--text-dim)',
            letterSpacing: '0.15em',
          }}
        >
          &copy; {new Date().getFullYear()} &middot; VENUGOPALAM CHUKKA
        </p>
      </motion.div>
    </section>
  );
}
