import { notFound } from "next/navigation";
import { marked } from "marked";
import { getAllPacks, getPackByName, getPackReadme } from "@/lib/registry";
import { ScoreBadge } from "@/components/ScoreBadge";
import { InstallCommand } from "@/components/InstallCommand";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return getAllPacks().map((p) => ({ name: p.name }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const pack = getPackByName(name);
  if (!pack) return {};
  return {
    title: `${pack.name} — BobPacks`,
    description: pack.description,
  };
}

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
const INTEGRITY_LABEL: Record<string, string> = {
  "hints-only": "Hints only",
  "full-solutions": "Full solutions",
  "course-policy": "Course policy",
};
const COMPONENT_LABELS: Record<string, string> = {
  skills: "Skills",
  modes: "Custom modes",
  rules: "Rules",
  mcp: "MCP config",
  agents: "AGENTS.md",
};

export default async function PackPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const pack = getPackByName(name);
  if (!pack) notFound();

  const rawReadme = getPackReadme(pack.sourcePath);
  const readmeHtml = rawReadme ? marked.parse(rawReadme) : "";

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <p className="font-mono text-xs text-zinc-400 mb-6">
        <a href="/" className="hover:underline">BobPacks</a>
        {" / "}
        <span>{pack.name}</span>
      </p>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* ── Left: README ─────────────────────────────────────────────── */}
        <article className="flex-1 min-w-0">
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: readmeHtml }}
          />
        </article>

        {/* ── Right: sidebar ───────────────────────────────────────────── */}
        <aside className="lg:w-72 shrink-0 space-y-6">

          {/* Install command */}
          <section>
            <p className="font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">Install</p>
            <InstallCommand cmd={`npx bobpacks add ${pack.name}`} />
          </section>

          {/* Meta */}
          <section className="border border-black divide-y divide-zinc-200 text-sm font-mono">
            <MetaRow label="Version" value={`v${pack.version}`} />
            <MetaRow label="Author" value={pack.author} />
            <MetaRow label="License" value={pack.license} />
            <MetaRow label="Audience" value={AUDIENCE_LABEL[pack.audience]} />
            <MetaRow label="Level" value={LEVEL_LABEL[pack.level]} />
            {pack.integrityStance && (
              <MetaRow label="Integrity" value={INTEGRITY_LABEL[pack.integrityStance] ?? pack.integrityStance} />
            )}
            {pack.ibmProducts.length > 0 && (
              <MetaRow label="Products" value={pack.ibmProducts.join(", ")} />
            )}
            <MetaRow label="Bob" value={pack.bobVersion} />
          </section>

          {/* Components */}
          <section>
            <p className="font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">Components</p>
            <ul className="space-y-1 font-mono text-sm">
              {pack.components.map((c) => (
                <li key={c} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-black shrink-0" />
                  {COMPONENT_LABELS[c] ?? c}
                </li>
              ))}
            </ul>
          </section>

          {/* Tags */}
          {pack.tags.length > 0 && (
            <section>
              <p className="font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {pack.tags.map((t) => (
                  <a
                    key={t}
                    href={`/?q=${encodeURIComponent(t)}`}
                    className="font-mono text-xs border border-black px-1.5 py-0.5 hover:bg-black hover:text-white transition-colors"
                  >
                    {t}
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Quality score */}
          <section>
            <p className="font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">Quality score</p>
            <ScoreBadge score={pack.score} />
            {pack.score.lastChecked && (
              <p className="font-mono text-xs text-zinc-400 mt-2">
                Last checked:{" "}
                {new Date(pack.score.lastChecked).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            )}
          </section>

        </aside>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex px-3 py-2 gap-3">
      <span className="text-zinc-400 shrink-0 w-16">{label}</span>
      <span className="text-black">{value}</span>
    </div>
  );
}
