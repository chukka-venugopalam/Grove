'use client';

import { useMemo } from 'react';
import { stations, getStationByFrequency, getFrequencyFromPosition, StationData } from './stations';

export interface FrequencyState {
  /** Current position on the band (0-1) */
  position: number;
  /** Current frequency (88.1 - 107.9) */
  frequency: number;
  /** Signal strength (0 = pure static, 1 = fully clear) */
  signalStrength: number;
  /** The currently tuned station */
  currentStation: StationData | null;
  /** The next station (for transition awareness) */
  nextStation: StationData | null;
  /** Whether we're in a "de-tune" transition zone */
  isDetuning: boolean;
}

/**
 * Calculate signal strength with hysteresis.
 *
 * ENTER lock: dist < tuneRadius (wider: covers most of zone)
 * EXIT lock:  dist > tuneRadius * 1.6 (much farther — sticky once locked)
 *
 * While locked, signal stays high with a smooth rolloff at the release
 * boundary, preventing flicker from small scroll jitter.
 */
function calculateSignalStrength(
  position: number,
  lockedStationId: string | null
): number {
  const numStations = stations.length;
  const zoneWidth = 1 / numStations;
  const tuneRadius = zoneWidth * 0.48;   // wider: covers most of the zone
  const releaseRadius = tuneRadius * 1.6; // much wider: exit threshold

  // If currently locked to a station, use its position for the hysteresis check
  if (lockedStationId) {
    const lockedIndex = stations.findIndex((s) => s.id === lockedStationId);
    if (lockedIndex >= 0) {
      const stationPosition = lockedIndex / (numStations - 1);
      const dist = Math.abs(position - stationPosition);
      const pct = dist / releaseRadius; // 0 at center, 1 at release edge

      if (pct < 1) {
        // Stay at/near 1.0 for the inner ~70% of the release zone,
        // then roll off softly from 1.0 → 0.9 in the outer 30%.
        // This means tiny scroll jitter doesn't budge the signal
        // at all, and even near the release edge it stays locked.
        if (pct < 0.7) {
          return 1.0;
        }
        // Outer 30%: soft smoothstep rolloff, 1.0 → 0.9
        const p = (pct - 0.7) / 0.3; // 0→1 across the outer band
        return 1.0 - p * p * (3 - 2 * p) * 0.1;
      }

      // Beyond release radius: fully detuned
      return 0;
    }
  }

  // Not locked — try to find a station to lock onto
  // Find the closest station center
  let minDist = Infinity;
  let closestIndex = -1;
  for (let i = 0; i < numStations; i++) {
    const stationPos = i / (numStations - 1);
    const dist = Math.abs(position - stationPos);
    if (dist < minDist) {
      minDist = dist;
      closestIndex = i;
    }
  }

  if (closestIndex >= 0 && minDist < tuneRadius) {
    // Close enough to enter lock — apply smooth entry ramp
    const t = 1 - minDist / tuneRadius;
    return t * t * (3 - 2 * t);
  }

  // Fully between stations — pure static
  return 0;
}

export function useFrequency(
  scrollProgress: number,
  lockedStationId: string | null,
  setLockedStationId: (id: string | null) => void
): FrequencyState {
  const position = Math.max(0, Math.min(1, scrollProgress));
  const frequency = getFrequencyFromPosition(position);
  const rawStation = getStationByFrequency(frequency);

  // ─── Hysteresis: decide lock state ───
  const numStations = stations.length;
  const zoneWidth = 1 / numStations;
  const tuneRadius = zoneWidth * 0.48;
  const releaseRadius = tuneRadius * 1.6;

  // If locked, check if we should stay locked
  let shouldLock = false;
  let lockedStation: StationData | null = null;

  if (lockedStationId) {
    const lockedIdx = stations.findIndex((s) => s.id === lockedStationId);
    if (lockedIdx >= 0) {
      const stationPos = lockedIdx / (numStations - 1);
      const dist = Math.abs(position - stationPos);
      if (dist < releaseRadius) {
        shouldLock = true;
        lockedStation = stations[lockedIdx];
      }
    }
  }

  // If not locked, check if we should enter a lock
  if (!shouldLock) {
    let minDist = Infinity;
    let closestIdx = -1;
    for (let i = 0; i < numStations; i++) {
      const stationPos = i / (numStations - 1);
      const dist = Math.abs(position - stationPos);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = i;
      }
    }

    if (closestIdx >= 0 && minDist < tuneRadius) {
      shouldLock = true;
      lockedStation = stations[closestIdx];
    }
  }

  // Persist the lock decision (triggers re-render via the setter)
  // Only update if changed to avoid unnecessary re-renders
  if (shouldLock && lockedStation && lockedStation.id !== lockedStationId) {
    setLockedStationId(lockedStation.id);
  } else if (!shouldLock && lockedStationId !== null) {
    setLockedStationId(null);
  }

  const currentStation = lockedStation ?? rawStation;
  const signalStrength = calculateSignalStrength(position, lockedStationId);

  // Find the next station (for transition awareness)
  const nextStation = useMemo(() => {
    const curIdx = stations.findIndex((s) => s.id === currentStation?.id);
    if (curIdx < stations.length - 1) return stations[curIdx + 1];
    return null;
  }, [currentStation]);

  const isDetuning = signalStrength < 0.5;

  return {
    position,
    frequency,
    signalStrength,
    currentStation,
    nextStation,
    isDetuning,
  };
}
