import Link from "next/link";
import type { RegistryPack } from "@/lib/types";
import { ScoreBadge } from "./ScoreBadge";

const AUDIENCE_LABEL: Record<string, string> = {
  student: "Student",
  educator: "Educator",
  developer: "Developer",
};

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const COMPONENT_ICONS: Record<string, string> = {
  skills: "skill",
  modes: "mode",
  rules: "rules",
  mcp: "mcp",
  agents: "agents.md",
};

interface Props {
  pack: RegistryPack;
}

export function PackCard({ pack }: Props) {
  return (
    <Link
      href={`/packs/${pack.name}`}
      className="block border border-black p-5 hover:bg-black hover:text-white transition-colors group"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <span className="font-mono font-bold text-base">{pack.name}</span>
          <span className="font-mono text-xs text-zinc-400 group-hover:text-zinc-300 ml-2">
            v{pack.version}
          </span>
        </div>
        <ScoreBadge score={pack.score} compact />
      </div>

      {/* Description */}
      <p className="text-sm leading-snug mb-4 text-zinc-700 group-hover:text-zinc-200">
        {pack.description}
      </p>

      {/* Meta row */}
      <div className="flex flex-wrap gap-2 text-xs font-mono">
        <Tag>{AUDIENCE_LABEL[pack.audience]}</Tag>
        <Tag>{LEVEL_LABEL[pack.level]}</Tag>
        {pack.integrityStance && <Tag>{pack.integrityStance}</Tag>}
        {pack.components.map((c) => (
          <Tag key={c}>{COMPONENT_ICONS[c] ?? c}</Tag>
        ))}
      </div>
    </Link>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="border border-current px-1.5 py-0.5 leading-none">
      {children}
    </span>
  );
}
