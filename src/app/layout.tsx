import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title:       'SkylineDB — Nissan Skyline VIN Decoder',
  description: 'Decode your Nissan Skyline R32/R33/R34 chassis number and find parts from Japanese & European JDM shops.',
  keywords:    ['Nissan Skyline', 'VIN decoder', 'R34', 'RB25DET', 'RB26DETT', 'JDM', 'ER34', 'GTR'],
  openGraph: {
    title:       'SkylineDB',
    description: 'Nissan Skyline VIN & Parts Database',
    type:        'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-jdm-bg text-jdm-text antialiased">
        {children}
      </body>
    </html>
  );
}
