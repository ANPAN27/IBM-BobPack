interface Props {
  cmd: string;
}

export function InstallCommand({ cmd }: Props) {
  return (
    <div className="flex items-stretch border border-black font-mono text-sm">
      <span className="px-3 py-2 bg-black text-white select-none shrink-0">$</span>
      <span className="flex-1 px-3 py-2 bg-zinc-50 text-black select-all overflow-x-auto whitespace-nowrap">
        {cmd}
      </span>
    </div>
  );
}
