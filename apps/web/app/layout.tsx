import type { Metadata } from 'next';
import { Montserrat, Playfair_Display, Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: '900',
  variable: '--font-playfair-display',
  display: 'swap',
});
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Music-Saas – Music Lesson',
  description:
    'Music-Saas is an interactive music education system that provides unique experiences of mathematical music theory.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${playfair.variable} ${inter.variable} ${plusJakarta.variable}`}>
      <body>{children}</body>
    </html>
  );
}
