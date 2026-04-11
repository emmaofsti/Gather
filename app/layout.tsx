import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { LangProvider } from "@/lib/i18n-context";
import { getLang } from "@/lib/get-lang";

export const metadata: Metadata = {
  title: "Gather",
  description: "Én tur. Ett sted. Samle minnene.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Gather", statusBarStyle: "black-translucent" },
  icons: { apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#FBF7F0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang === "en" ? "en" : "no"}>
      <body>
        <LangProvider lang={lang}>
          <div className="pt-safe-top mx-auto min-h-dvh max-w-md pb-24">{children}</div>
          <BottomNav />
        </LangProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(()=>{})); }`,
          }}
        />
      </body>
    </html>
  );
}
