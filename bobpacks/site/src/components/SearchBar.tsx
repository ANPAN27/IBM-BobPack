"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

interface Props {
  initialValue?: string;
}

export function SearchBar({ initialValue = "" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = new URLSearchParams(params.toString());
      if (e.target.value) {
        next.set("q", e.target.value);
      } else {
        next.delete("q");
      }
      startTransition(() => {
        router.replace(`${pathname}?${next.toString()}`);
      });
    },
    [params, pathname, router]
  );

  return (
    <input
      type="search"
      placeholder="Search packs…"
      defaultValue={initialValue}
      onChange={handleChange}
      className="w-full border border-black bg-white px-4 py-2.5 font-mono text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black"
    />
  );
}
