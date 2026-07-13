'use client';

import { motion } from 'framer-motion';
import type { StationData } from '@/lib/stations';
import SpringPhysicsDemo from '@/components/demos/SpringPhysicsDemo';
import ShaderDemo from '@/components/demos/ShaderDemo';
import MicroInteractionsDemo from '@/components/demos/MicroInteractionsDemo';
import KineticTypeDemo from '@/components/demos/KineticTypeDemo';
import ScrollChoreographyDemo from '@/components/demos/ScrollChoreographyDemo';
import ParticlesDemo from '@/components/demos/ParticlesDemo';

interface StationProps {
  station: StationData;
  signalStrength: number;
  isActive: boolean;
}

const demoComponentMap: Record<string, React.FC> = {
  SpringPhysicsDemo,
  ShaderDemo,
  MicroInteractionsDemo,
  KineticTypeDemo,
  ScrollChoreographyDemo,
  ParticlesDemo,
};

export default function Station({ station, signalStrength, isActive }: StationProps) {
  const opacity = isActive ? signalStrength : 0;

  const DemoComponent = station.demoComponent
    ? demoComponentMap[station.demoComponent]
    : null;

  return (
    <section
      className="frequency-section"
      id={`station-${station.id}`}
    >
      <motion.div
        className="project-container"
        style={{
          opacity,
          filter: `blur(${(1 - signalStrength) * 6}px)`,
          transition: 'opacity 0.6s ease, filter 0.6s ease',
        }}
      >
        {/* Header — label only, signal-readout style */}
        <div className="project-header">
          <div className="signal-meta">
            <span className="bar" />
            <span>{station.frequency.toFixed(1)} MHz</span>
            <span>—</span>
            <span>{station.subtitle}</span>
          </div>
          <h2 className="project-title">{station.name}</h2>
        </div>

        {/* Live demo component */}
        {DemoComponent && (
          <div className="demo-container" style={{ width: '100%', minHeight: 280 }}>
            <DemoComponent />
          </div>
        )}
      </motion.div>
    </section>
  );
}
