import Link from "next/link";

export function Navbar() {
  return (
    <header className="border-b border-black">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-mono font-bold text-lg tracking-tight hover:underline">
          BobPacks
        </Link>
        <nav className="flex gap-6 text-sm font-mono">
          <Link href="/" className="hover:underline">
            Browse
          </Link>
          <a
            href="https://github.com/bobpacks/bobpacks"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            GitHub ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
