import inter from '@/shared/assets/fonts/inter';
import '@/shared/assets/styles/globals.css';
import generateMetadata from '@/shared/lib/metadata';
import Providers from '@/shared/providers';

export const metadata = generateMetadata();

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
