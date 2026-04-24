import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://zdfi.me'),
  title: 'zdfi.me | Global Payment Links by ZendFi',
  description: 'Get paid globally with one smart link. zdfi.me localizes payment instructions by payer country and route.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'zdfi.me | Global Payment Links by ZendFi',
    description: 'One link for global payments with localized payer instructions.',
    url: 'https://zdfi.me',
    siteName: 'zdfi.me',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'zdfi.me | Global Payment Links by ZendFi',
    description: 'One link for global payments with localized payer instructions.',
  },
  icons: {
    icon: '/favicon.ico',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#FAFBFC',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script src="https://cdn.jsdelivr.net/npm/qrious@4/dist/qrious.min.js" async></script>
      </head>
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
