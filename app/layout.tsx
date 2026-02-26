import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ZendFi Checkout | Secure Crypto Payments',
  description: 'Secure crypto payment powered by Solana',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.ico', sizes: '16x16' },
    ],
    apple: '/favicon.ico',
  },
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
