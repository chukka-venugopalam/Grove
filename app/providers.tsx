'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface StationContextValue {
  activeStationId: string | null;
  setActiveStationId: (id: string | null) => void;
}

const StationCtx = createContext<StationContextValue | null>(null);

export function StationProvider({ children }: { children: ReactNode }) {
  const [activeStationId, setActiveStationId] = useState<string | null>(null);

  return (
    <StationCtx.Provider value={{ activeStationId, setActiveStationId }}>
      {children}
    </StationCtx.Provider>
  );
}

export function useStationContext() {
  const ctx = useContext(StationCtx);
  if (!ctx) throw new Error('useStationContext must be used within StationProvider');
  return ctx;
}
