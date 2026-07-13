export interface StationData {
  id: string;
  frequency: number;
  name: string;
  subtitle?: string;
  type: 'sign-on' | 'about' | 'project' | 'contact';
  skills?: string[];
  /** Name of the demo component to render for project-type stations */
  demoComponent?: string;
}

export const stations: StationData[] = [
  {
    id: 'sign-on',
    frequency: 88.1,
    name: 'SIGN ON',
    subtitle: 'Tuning In',
    type: 'sign-on',
  },
  {
    id: 'about',
    frequency: 91.3,
    name: 'NOW BROADCASTING',
    subtitle: 'Full-Stack Engineer & Creative Developer',
    type: 'about',
    skills: [
      'TypeScript',
      'React',
      'Next.js',
      'Node.js',
      'Three.js',
      'WebGL',
      'GLSL',
      'Tailwind CSS',
      'Framer Motion',
      'PostgreSQL',
      'Redis',
      'Docker',
      'AWS',
      'GraphQL',
      'Rust',
      'Python',
    ],
  },
  {
    id: 'demo-spring',
    frequency: 88.7,
    name: 'SPRING PHYSICS',
    subtitle: 'Weight & Momentum',
    type: 'project',
    demoComponent: 'SpringPhysicsDemo',
  },
  {
    id: 'demo-shaders',
    frequency: 91.9,
    name: 'SHADERS',
    subtitle: 'Live GLSL',
    type: 'project',
    demoComponent: 'ShaderDemo',
  },
  {
    id: 'demo-micro',
    frequency: 95.1,
    name: 'MICRO-INTERACTIONS',
    subtitle: 'Tactile Feedback',
    type: 'project',
    demoComponent: 'MicroInteractionsDemo',
  },
  {
    id: 'demo-kinetic',
    frequency: 98.3,
    name: 'KINETIC TYPE',
    subtitle: 'Letter by Letter',
    type: 'project',
    demoComponent: 'KineticTypeDemo',
  },
  {
    id: 'demo-scroll',
    frequency: 101.7,
    name: 'SCROLL CHOREOGRAPHY',
    subtitle: 'Reactive Layout',
    type: 'project',
    demoComponent: 'ScrollChoreographyDemo',
  },
  {
    id: 'demo-particles',
    frequency: 105.1,
    name: 'PARTICLES / CANVAS',
    subtitle: 'Cursor Response',
    type: 'project',
    demoComponent: 'ParticlesDemo',
  },
  {
    id: 'contact',
    frequency: 107.9,
    name: 'OFF AIR',
    subtitle: 'Send a transmission',
    type: 'contact',
  },
];

export function getStationByFrequency(freq: number): StationData | null {
  let closest: StationData | null = null;
  let minDist = Infinity;

  for (const station of stations) {
    const dist = Math.abs(station.frequency - freq);
    if (dist < minDist) {
      minDist = dist;
      closest = station;
    }
  }

  return closest;
}

export function getStationPosition(freq: number): number {
  const minFreq = stations[0].frequency;
  const maxFreq = stations[stations.length - 1].frequency;
  return (freq - minFreq) / (maxFreq - minFreq);
}

export function getFrequencyFromPosition(pos: number): number {
  const minFreq = stations[0].frequency;
  const maxFreq = stations[stations.length - 1].frequency;
  return minFreq + pos * (maxFreq - minFreq);
}
