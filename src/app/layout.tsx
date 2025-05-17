import { Inter } from 'next/font/google';
import { AuthProvider } from '@/providers/AuthProvider';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'onePhoto',
  description: 'Просмотр последних фотографий из OneDrive',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
