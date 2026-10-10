import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "BobPacks — IBM Bob setups in one command",
  description:
    "Install a complete, tested IBM Bob setup — skills, modes, rules, MCP and AGENTS.md — with npx bobpacks add <pack>.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-black mt-16">
          <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>BobPacks — MIT License</span>
            <a
              href="https://github.com/bobpacks/bobpacks"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black"
            >
              GitHub ↗
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
