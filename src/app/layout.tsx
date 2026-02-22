import type { Metadata } from 'next';
import { Cormorant_Garamond, Outfit, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const cormorantGaramond = Cormorant_Garamond({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LuminaForge — Parametric Lamp & Vase Designer',
  description:
    'Design beautiful 3D-printable lamps and vases with parametric controls. Export print-ready STL files.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${outfit.variable} ${ibmPlexMono.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
