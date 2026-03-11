import type { Metadata } from 'next';
import { Cormorant_Garamond, Instrument_Sans } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
});

const instrument = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument',
  weight: ['400', '500', '600'],
});


export const metadata: Metadata = {
  title: 'CTP',
  description: 'The live pulse of NYC. Real-time vibe intelligence for coffee, bars, gyms, and everywhere in between.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${instrument.variable} font-sans bg-ink text-ghost antialiased`}>
        {children}
      </body>
    </html>
  );
}
