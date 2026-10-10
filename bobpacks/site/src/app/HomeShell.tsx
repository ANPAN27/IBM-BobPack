"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { RegistryPack } from "@/lib/types";
import { PackCard } from "@/components/PackCard";
import { SearchBar } from "@/components/SearchBar";
import { FilterBar } from "@/components/FilterBar";

interface Props {
  packs: RegistryPack[];
}

function PacksGrid({ packs }: Props) {
  const params = useSearchParams();
  const q = params.get("q")?.toLowerCase() ?? "";
  const audience = params.get("audience") ?? "";
  const level = params.get("level") ?? "";
  const component = params.get("component") ?? "";

  const filtered = packs.filter((p) => {
    if (audience && p.audience !== audience) return false;
    if (level && p.level !== level) return false;
    if (component && !p.components.includes(component)) return false;
    if (q) {
      const haystack = [p.name, p.description, ...p.tags, ...p.ibmProducts].join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <p className="text-xs font-mono text-zinc-400">
        {filtered.length} pack{filtered.length !== 1 ? "s" : ""}
      </p>
      {filtered.length === 0 ? (
        <div className="border border-zinc-200 px-6 py-12 text-center font-mono text-sm text-zinc-400">
          No packs match your filters.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((pack) => (
            <PackCard key={pack.name} pack={pack} />
          ))}
        </div>
      )}
    </div>
  );
}

export function HomeShell({ packs }: Props) {
  return (
    <Suspense>
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Hero */}
        <section className="border-b border-black pb-8 space-y-4">
          <h1 className="font-mono font-bold text-3xl leading-tight">BobPacks</h1>
          <p className="font-mono text-sm text-zinc-500 max-w-xl">
            Install a complete, tested IBM Bob setup — skills, modes, rules, MCP and{" "}
            <code className="text-xs bg-zinc-100 px-1 border border-zinc-300">AGENTS.md</code> — with one command.
          </p>
          <div className="bg-black text-white font-mono text-sm px-4 py-3 inline-block">
            npx bobpacks add code-tutor
          </div>
        </section>

        {/* Layout: filters + grid */}
        <div className="flex gap-10">
          <div className="w-36 shrink-0">
            <FilterBar />
          </div>
          <div className="flex-1 space-y-4">
            <SearchBar />
            <PacksGrid packs={packs} />
          </div>
        </div>
      </div>
    </Suspense>
  );
}
