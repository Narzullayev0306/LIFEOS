import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'LIFEOS — Shaxsiy Operatsion Tizim',
  description:
    'Vaqt, vazifalar, TOPIK tayyorgarligi, odatlar, maqsadlar, moliya va intizomni birlashtiruvchi shaxsiy boshqaruv tizimi.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" data-theme="dark">
      <body>
        <div id="app-root">{children}</div>
      </body>
    </html>
  );
}
