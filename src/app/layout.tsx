import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import { translations, t, type Language } from '@/lib/translations'; // Import translations

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Note: Metadata cannot be dynamic based on localStorage language directly here.
// It's set at build time or request time on server.
// For dynamic titles based on user language, you'd typically handle this in the page component.
export const metadata: Metadata = {
  title: translations.es.appTitle, // Default to Spanish or a neutral title
  description: translations.es.appDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The actual language state will be managed in page.tsx and passed down or via context.
  // Here, we just ensure the HTML lang attribute can be set if needed, though `page.tsx` will handle UI text.
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
