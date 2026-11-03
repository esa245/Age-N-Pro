import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#00f2fe',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Age N Calculator Pro – Family Edition',
  description: 'A professional age calculator for families with live tracking, birthday alerts, and data backup.',
  openGraph: {
    title: 'Age N Calculator Pro – Family Edition',
    description: 'A professional age calculator for families with live tracking, birthday alerts, and data backup.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className="bg-[#040817] text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
