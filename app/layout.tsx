import type { Metadata } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { ShieldCheck } from "lucide-react";
import { ToastProvider } from "@/components/toast-provider";
import { ThemeToggle } from "@/components/theme-toggle";

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
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              const theme = localStorage.getItem('theme');
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (e) {}
          })()
        `}} />
      </head>
      <body className="font-sans min-h-screen flex flex-col selection:bg-accent/20 selection:text-accent-400">
        <header className="sticky top-0 z-50 w-full border-b border-[var(--header-border)] bg-[var(--header-bg)] backdrop-blur-md shadow-md shadow-black/5 dark:shadow-black/20 transition-all duration-300">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-accent to-accent-700 p-2 rounded-lg shadow-lg shadow-accent/20 transition-transform group-hover:scale-105 border border-accent-400/20">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black tracking-tight text-[var(--text-primary)] font-[family-name:var(--font-display)] transition-colors group-hover:text-accent dark:group-hover:text-accent-400">
                Dep<span className="text-accent dark:text-accent-400">Scan</span>
              </span>
              <span className="px-2 py-0.5 bg-accent/10 text-accent dark:text-accent-400 text-[10px] uppercase tracking-wider font-bold rounded border border-accent/20 font-mono ml-1">
                INF804
              </span>
            </a>

            <div className="flex items-center gap-6">
              <a href="/guide" className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-accent dark:hover:text-accent-400 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-accent hover:after:w-full after:transition-all">
                GitHub Actions
              </a>
              <a href="https://osv.dev" target="_blank" rel="noreferrer" className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-accent dark:hover:text-accent-400 transition-colors py-1 font-mono flex items-center gap-1">
                OSV API <span className="text-[10px] text-accent/80 dark:text-accent-400 font-bold shrink-0">v1</span>
              </a>
              <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 shrink-0" />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
          {children}
        </main>

        <footer className="py-6 text-center text-[var(--footer-text)] text-xs border-t border-[var(--footer-border)] mt-auto font-mono transition-all duration-300">
          <p>
            INF804 &mdash; Sécurité des logiciels &mdash; 
            <span className="text-slate-500"> Été 2026</span> &mdash; 
            <span className="text-accent/80 dark:text-accent-400/80 font-bold"> Groupe 2</span>
          </p>
        </footer>

        <ToastProvider />
      </body>
    </html>
  );
}
