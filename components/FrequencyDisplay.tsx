'use client';

import { useFrequencyContext } from '@/app/providers';

export default function FrequencyDisplay() {
  const { frequency } = useFrequencyContext();
  const { currentStation, signalStrength } = frequency;

  const displayFreq = frequency.frequency.toFixed(1);
  const displayName = currentStation?.name ?? '---';
  const isLocked = signalStrength > 0.8;
  const isVisible = signalStrength > 0.1;

  return (
    <div
      className="frequency-display"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      <div className="freq-num">{displayFreq}</div>
      <div
        className="freq-label"
        style={{
          color: isLocked
            ? 'var(--amber)'
            : 'var(--amber-dim)',
          transition: 'color 0.4s ease',
        }}
      >
        {displayName}
      </div>
    </div>
  );
}
