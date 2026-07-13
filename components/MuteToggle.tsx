'use client';

import { useAudioContext } from '@/app/providers';

export default function MuteToggle() {
  const { isMuted, toggleMute } = useAudioContext();

  return (
    <button
      className={`mute-toggle ${isMuted ? 'muted' : ''}`}
      onClick={toggleMute}
      aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
      title={isMuted ? 'Unmute' : 'Mute'}
      type="button"
    >
      {isMuted ? '♪╳' : '♪'}
    </button>
  );
}
