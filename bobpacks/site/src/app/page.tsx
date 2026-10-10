import { getAllPacks } from "@/lib/registry";
import { HomeShell } from "./HomeShell";

export default function HomePage() {
  const packs = getAllPacks();
  return <HomeShell packs={packs} />;
}
