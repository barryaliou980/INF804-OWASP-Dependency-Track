import type { Metadata } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { ShieldCheck } from "lucide-react";
import { ToastProvider } from "@/components/toast-provider";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-display" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "DepScan - INF804 Sécurité des logiciels",
  description: "Scanner de vulnérabilités pour vos dépendances open-source - Projet Groupe 2, OWASP Dependency-Track",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${outfit.variable} ${jetbrains.variable}`}>
      <body className="font-sans min-h-screen flex flex-col bg-[hsl(40,20%,97%)]">
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-xl">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <div className="bg-emerald-600 p-2 rounded-lg shadow-md">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900 font-[family-name:var(--font-display)]">DepScan</span>
              <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] uppercase tracking-wider font-bold rounded-md ml-1 border border-emerald-200 font-mono">
                INF804
              </span>
            </a>

            <div className="flex items-center gap-4">
              <a href="https://osv.dev" target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors font-mono">
                OSV API
              </a>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
          {children}
        </main>

        <footer className="py-6 text-center text-gray-400 text-xs border-t border-gray-200 mt-auto font-mono">
          <p>INF804 &mdash; Sécurité des logiciels &mdash; Été 2026 &mdash; Groupe 2</p>
        </footer>

        <ToastProvider />
      </body>
    </html>
  );
}
