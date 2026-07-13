'use client';

import { useCallback, useRef } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import { FrequencyProvider, AudioProvider, StationProvider, useFrequencyContext } from '@/app/providers';
import { stations } from '@/lib/stations';
import ShaderCanvas from '@/components/ShaderCanvas';
import Dial from '@/components/Dial';
import FrequencyDisplay from '@/components/FrequencyDisplay';
import SignOn from '@/components/SignOn';
import Station from '@/components/Station';
import SkillsSignal from '@/components/SkillsSignal';
import OffAir from '@/components/OffAir';
import AudioEngine from '@/components/AudioEngine';
import MuteToggle from '@/components/MuteToggle';

/* ─── Inner content that consumes providers ─── */

function FrequencyContent() {
  const { setScrollProgress, frequency } = useFrequencyContext();

  // Wire Lenis scroll progress to drive signal strength
  const lenisProgressRef = useRef(0);

  const handleLenisScroll = useCallback((lenis: any) => {
    const next = lenis.progress;
    const prev = lenisProgressRef.current;
    // Only update if it changed enough to matter — prevents render thrashing
    if (Math.abs(next - prev) > 0.0001) {
      lenisProgressRef.current = next;
      setScrollProgress(next);
    }
  }, [setScrollProgress]);

  useLenis(handleLenisScroll, [handleLenisScroll]);

  // Project stations (non sign-on, about, contact)
  const projectStations = stations.filter((s) => s.type === 'project');

  return (
    <>
      {/* Audio Engine (no visual output) */}
      <AudioEngine />

      {/* Shader / Noise Overlay */}
      <ShaderCanvas />

      {/* Mute Toggle */}
      <MuteToggle />

      {/* Skills Signal (ambient left sidebar) */}
      <SkillsSignal />

      {/* Main Content Sections */}
      <div className="content-layer">
        {/* Sign-On Landing */}
        <SignOn />

        {/* About / Skills Station */}          <section className="frequency-section" id="station-about">
          <div
            style={{
              opacity: frequency.currentStation?.id === 'about' ? frequency.signalStrength : 0,
              filter: `blur(${(1 - frequency.signalStrength) * 6}px)`,
              transition: 'opacity 0.6s ease, filter 0.6s ease',
            }}
          >
            <div className="skills-container">
              <h2>Now Broadcasting</h2>
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  marginBottom: '2.5rem',
                }}
              >
                Full-stack engineer and creative developer based in Brooklyn.
                I build performant web applications, interactive experiences,
                and developer tools — always exploring the edge between code
                and craft.
              </p>
            </div>
          </div>
        </section>

        {/* Project Stations */}
        {projectStations.map((station) => (
          <Station
            key={station.id}
            station={station}
            signalStrength={
              frequency.currentStation?.id === station.id
                ? frequency.signalStrength
                : 0
            }
            isActive={frequency.currentStation?.id === station.id}
          />
        ))}

        {/* Off Air / Contact */}
        <OffAir />
      </div>

      {/* Fixed Dial + Frequency Display */}
      <div
        style={{
          position: 'fixed',
          bottom: '3rem',
          right: '3rem',
          zIndex: 60,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
        }}
      >
        <Dial />
        <FrequencyDisplay />
      </div>
    </>
  );
}

/* ─── Root Page ─── */

export default function Home() {
  return (
    <AudioProvider>
      <StationProvider>
        <FrequencyProvider>
          <ReactLenis
            root
            options={{
              duration: 1.4,
              easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
              orientation: 'vertical',
              smoothWheel: true,
              wheelMultiplier: 1,
              touchMultiplier: 1.5,
            }}
          >
            <FrequencyContent />
          </ReactLenis>
        </FrequencyProvider>
      </StationProvider>
    </AudioProvider>
  );
}
