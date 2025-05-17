import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth/AuthContext';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata = {
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
