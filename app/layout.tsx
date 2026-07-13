import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Playfair_Display } from 'next/font/google';
import './globals.css';
import AmbientBackground from '@/components/AmbientBackground';
import CursorGlow from '@/components/CursorGlow';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  variable: '--font-playfair-display',
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'Drift — VENUGOPALAM CHUKKA',
  description:
    'A portfolio built around quiet, breathing motion, floating aesthetics, and smooth scroll transitions.',
  keywords: ['portfolio', 'developer', 'creative', 'drift', 'smooth', 'animations'],
  authors: [{ name: 'VENUGOPALAM CHUKKA' }],
};

export const viewport: Viewport = {
  themeColor: '#030303',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${playfairDisplay.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-[var(--bg-base)] text-[var(--text-primary)] antialiased relative min-h-screen">
        {/* Ambient Particle Field Background */}
        <AmbientBackground />
        
        {/* Cursor Halo Glow */}
        <CursorGlow />

        {/* Core Portfolio Content */}
        {children}
      </body>
    </html>
  );
}
