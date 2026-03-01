import type { Metadata } from 'next';
import { Cormorant_Garamond, Outfit, IBM_Plex_Mono } from 'next/font/google';
import { ThemeSync } from '@/components/ui/ThemeSync';
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
  title: 'LuminaForge — Parametric Vase Designer',
  description:
    'Design beautiful 3D-printable vases with parametric controls. Export print-ready STL files.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cormorantGaramond.variable} ${outfit.variable} ${ibmPlexMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('lf-theme');if(!t)t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)})()`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
