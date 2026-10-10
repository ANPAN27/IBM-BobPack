import type { PackScore } from "@/lib/types";

const LAYER_LABELS: { key: keyof PackScore; label: string; max: number }[] = [
  { key: "schema", label: "Schema", max: 20 },
  { key: "safetyLint", label: "Safety", max: 25 },
  { key: "contentQuality", label: "Content", max: 20 },
  { key: "scenarioTests", label: "Scenarios", max: 25 },
  { key: "maintenance", label: "Maintenance", max: 10 },
];

interface Props {
  score: PackScore;
  compact?: boolean;
}

export function ScoreBadge({ score, compact = false }: Props) {
  const pct = Math.round((score.total / 100) * 100);

  if (compact) {
    return (
      <span
        className="inline-block font-mono text-xs border border-black px-1.5 py-0.5 tabular-nums"
        title={`Quality score: ${score.total}/100`}
      >
        {score.total}/100
      </span>
    );
  }

  return (
    <div className="border border-black p-4 space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="font-mono font-bold text-2xl">{score.total}</span>
        <span className="font-mono text-sm text-zinc-500">/100</span>
      </div>

      {/* Overall bar */}
      <div className="h-1.5 w-full bg-zinc-200">
        <div className="h-full bg-black" style={{ width: `${pct}%` }} />
      </div>

      {/* Per-layer rows */}
      <div className="space-y-1.5">
        {LAYER_LABELS.map(({ key, label, max }) => {
          const val = score[key] as number | null;
          const display = val === null ? "—" : `${val}/${max}`;
          const barPct = val === null ? 0 : Math.round((val / max) * 100);
          return (
            <div key={key} className="flex items-center gap-2 text-xs font-mono">
              <span className="w-24 shrink-0 text-zinc-500">{label}</span>
              <div className="flex-1 h-1 bg-zinc-200">
                <div className="h-full bg-black" style={{ width: `${barPct}%` }} />
              </div>
              <span className="w-10 text-right tabular-nums">{display}</span>
            </div>
          );
        })}
      </div>

      {score.scenarioTestStatus === "unverified-runtime" && (
        <p className="text-xs font-mono text-zinc-400 border-t border-zinc-200 pt-2">
          Scenario tests: unverified runtime
        </p>
      )}
    </div>
  );
}
