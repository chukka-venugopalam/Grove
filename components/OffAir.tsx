'use client';

import { motion } from 'framer-motion';
import { useFrequencyContext } from '@/app/providers';

export default function OffAir() {
  const { frequency } = useFrequencyContext();
  const isActive = frequency.currentStation?.id === 'contact';
  const opacity = isActive ? frequency.signalStrength : 0;

  return (
    <section
      className="frequency-section"
      id="station-off-air"
    >
      <motion.div
        className="contact-container"
        style={{
          opacity,
          filter: `blur(${(1 - frequency.signalStrength) * 8}px)`,
          transition: 'opacity 0.6s ease, filter 0.6s ease',
        }}
      >
        <h2>END OF BAND</h2>
        <p>
          The signal ends here — for now. If you&apos;d like to get in touch,
          send a transmission through any of the channels below.
        </p>
        <div className="contact-links">
          <a
            href="mailto:hello@frequency.dev"
            className="contact-link"
            rel="noopener noreferrer"
          >
            ✦ Email
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-link"
          >
            ✦ GitHub
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-link"
          >
            ✦ LinkedIn
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
          SIGNAL LOST • {new Date().getFullYear()}
        </p>
      </motion.div>
    </section>
  );
}
