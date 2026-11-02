import type { Metadata, Viewport } from 'next';
import { Hind_Siliguri, Poppins } from 'next/font/google';
import './globals.css';

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali'],
  weight: ['400', '600', '700'],
  variable: '--font-hind-siliguri',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-poppins',
});

export const viewport: Viewport = {
  themeColor: '#00f2fe',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'Age N Calculator Pro – Family Edition',
  description: 'A professional age calculator for families with live tracking, birthday alerts, and data backup.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FamilyAge',
  },
  icons: {
    apple: 'https://res.cloudinary.com/dlklqihg6/image/upload/v1793605832/naydn7myt42abjuizhmm.png',
  },
  openGraph: {
    title: 'Age N Calculator Pro – Family Edition',
    description: 'A professional age calculator for families with live tracking, birthday alerts, and data backup.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Age N Calculator Pro – Family Edition',
    description: 'A professional age calculator for families with live tracking, birthday alerts, and data backup.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${hindSiliguri.variable} ${poppins.variable}`}>
      <body suppressHydrationWarning className="bg-[#040817] text-white selection:bg-[#00ff88] selection:text-[#040817]">
        {children}
      </body>
    </html>
  );
}
