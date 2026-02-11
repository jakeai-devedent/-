import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Image Playlist | 이미지 플레이리스트',
  description: 'AI가 이미지를 분석해 어울리는 플레이리스트를 만들어요',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} className="dark">
      <body className="font-sans antialiased min-h-screen bg-zinc-950 text-zinc-100"
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
