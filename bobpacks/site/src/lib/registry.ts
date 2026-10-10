import fs from "fs";
import path from "path";
import type { Registry, RegistryPack } from "./types";

// Resolve registry.json from the repo root (one level up from site/)
const REGISTRY_PATH = path.resolve(process.cwd(), "..", "registry.json");

let _cache: Registry | null = null;

export function getRegistry(): Registry {
  if (_cache) return _cache;
  const raw = fs.readFileSync(REGISTRY_PATH, "utf-8");
  _cache = JSON.parse(raw) as Registry;
  return _cache;
}

export function getAllPacks(): RegistryPack[] {
  return getRegistry().packs;
}

export function getPackByName(name: string): RegistryPack | undefined {
  return getAllPacks().find((p) => p.name === name);
}

export function getPackReadme(sourcePath: string): string {
  const readmePath = path.resolve(process.cwd(), "..", sourcePath, "README.md");
  if (!fs.existsSync(readmePath)) return "";
  return fs.readFileSync(readmePath, "utf-8");
}
