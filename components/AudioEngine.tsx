'use client';

import { useEffect, useRef } from 'react';
import { useFrequencyContext, useAudioContext } from '@/app/providers';

/**
 * AudioEngine listens to frequency changes and signal strength transitions,
 * triggering appropriate sounds via the AudioContext.
 *
 * The lock chime is synchronized with the shader's overshoot by using the
 * same threshold (signalStrength > 0.9) and crossing detection.
 */
export default function AudioEngine() {
  const { frequency } = useFrequencyContext();
  const { isMuted, playTuningStatic, playLockChime } = useAudioContext();
  const lockPlayedRef = useRef(false);
  const prevSignalRef = useRef(0);

  // Play tuning static based on signal strength — fires live on every change
  useEffect(() => {
    if (isMuted) return;

    const signal = frequency.signalStrength;
    // intensity: 1 at full static, 0 at clear signal
    const staticIntensity = Math.max(0, Math.min(1, (1 - signal) * 1.5));
    playTuningStatic(staticIntensity);
  }, [frequency.signalStrength, isMuted, playTuningStatic]);

  // Play lock chime — synchronized with the shader overshoot moment
  useEffect(() => {
    const signal = frequency.signalStrength;
    const prev = prevSignalRef.current;

    // Detect crossing of 0.9 threshold (same as ShaderCanvas overshoot)
    if (prev < 0.9 && signal >= 0.9 && !lockPlayedRef.current) {
      playLockChime();
      lockPlayedRef.current = true;
    }

    // Reset when signal drops enough (de-tune)
    if (signal < 0.3) {
      lockPlayedRef.current = false;
    }

    prevSignalRef.current = signal;
  }, [frequency.signalStrength, playLockChime]);

  // This component is purely auditory — no visual output
  return null;
}
