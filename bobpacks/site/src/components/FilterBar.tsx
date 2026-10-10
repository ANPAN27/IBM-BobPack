"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const AUDIENCES = ["student", "educator", "developer"] as const;
const LEVELS = ["beginner", "intermediate", "advanced"] as const;
const COMPONENTS = ["skills", "modes", "rules", "mcp", "agents"] as const;

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const set = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (next.get(key) === value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      // Reset page when filter changes
      next.delete("q"); // keep search
      router.push(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router]
  );

  const active = (key: string, value: string) => params.get(key) === value;

  return (
    <aside className="space-y-5 text-sm font-mono">
      <FilterGroup
        label="Audience"
        options={[...AUDIENCES]}
        paramKey="audience"
        active={active}
        set={set}
      />
      <FilterGroup
        label="Level"
        options={[...LEVELS]}
        paramKey="level"
        active={active}
        set={set}
      />
      <FilterGroup
        label="Includes"
        options={[...COMPONENTS]}
        paramKey="component"
        active={active}
        set={set}
      />
    </aside>
  );
}

function FilterGroup({
  label,
  options,
  paramKey,
  active,
  set,
}: {
  label: string;
  options: string[];
  paramKey: string;
  active: (k: string, v: string) => boolean;
  set: (k: string, v: string) => void;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-zinc-400 mb-2">{label}</p>
      <div className="flex flex-col gap-1">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => set(paramKey, opt)}
            className={`text-left px-2 py-1 border transition-colors ${
              active(paramKey, opt)
                ? "border-black bg-black text-white"
                : "border-zinc-300 hover:border-black"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
