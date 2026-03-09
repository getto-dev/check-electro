import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const isProd = process.env.NODE_ENV === 'production';
const basePath = isProd ? '/check-electro' : '';

export const metadata: Metadata = {
  title: "ЭлектроСчет - Калькулятор смет",
  description: "Профессиональный калькулятор для расчёта смет на электромонтажные работы. Кабели, освещение, щиты и многое другое.",
  keywords: ["смета", "электрика", "калькулятор", "электромонтаж", "кабель", "освещение", "расчёт стоимости"],
  authors: [{ name: "ЭлектроСчет" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ЭлектроСчет",
  },
  manifest: `${basePath}/manifest.json`,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f59e0b" },
    { media: "(prefers-color-scheme: dark)", color: "#1e1b4b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="ЭлектроСчет" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ЭлектроСчет" />
        <meta name="msapplication-TileColor" content="#f59e0b" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Favicon */}
        <link rel="icon" href={`${basePath}/favicon.ico`} sizes="any" />
        <link rel="icon" type="image/svg+xml" href={`${basePath}/icons/icon.svg`} />
        <link rel="icon" type="image/png" sizes="16x16" href={`${basePath}/icons/favicon-16x16.png`} />
        <link rel="icon" type="image/png" sizes="32x32" href={`${basePath}/icons/favicon-32x32.png`} />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href={`${basePath}/icons/apple-touch-icon.png`} />

        {/* Android/Chrome icons */}
        <link rel="icon" type="image/png" sizes="192x192" href={`${basePath}/icons/android/android-192x192.png`} />
        <link rel="icon" type="image/png" sizes="512x512" href={`${basePath}/icons/android/android-512x512.png`} />

        {/* Windows tiles */}
        <meta name="msapplication-config" content={`${basePath}/browserconfig.xml`} />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var swPath = '${basePath}/sw.js';
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register(swPath).then(
                      function(registration) {
                        console.log('SW registered:', registration.scope);
                      },
                      function(err) {
                        console.log('SW registration failed:', err);
                      }
                    );
                  });
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
