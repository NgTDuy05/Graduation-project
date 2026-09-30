import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Unilearn - Học thông minh',
  description: 'Nền tảng học tập trực tuyến thông minh dành cho học sinh từ lớp 6 đến lớp 12',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
