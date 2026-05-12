import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ShieldCheck } from "lucide-react";
import { ToastProvider } from "@/components/toast-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DepScan - Dependency Vulnerability Scanner",
  description: "Scanner de vulnérabilités pour vos dépendances open-source, inspiré de Dependency-Track.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="bg-[#F8F8F6]">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <div className="bg-[#E24B4A] p-2 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">DepScan</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] uppercase tracking-wider font-bold rounded-md ml-2 border border-gray-200">
                OWASP Demo
              </span>
            </a>
            
            <div className="flex items-center gap-4">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                GitHub
              </a>
              <a href="https://osv.dev" target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                OSV API
              </a>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
          {children}
        </main>
        
        <footer className="py-6 text-center text-gray-500 text-sm border-t border-gray-200 mt-auto">
          <p>&copy; 2025 DepScan Demo &mdash; Développé avec Next.js 14</p>
        </footer>

        <ToastProvider />
      </body>
    </html>
  );
}
