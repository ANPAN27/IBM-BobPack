// Types mirroring pack.schema.json and registry.schema.json

export interface PackScore {
  total: number;
  schema: number;
  safetyLint: number;
  contentQuality: number;
  scenarioTests: number | null;
  maintenance: number;
  scenarioTestStatus: "passed" | "failed" | "unverified-runtime";
  lastChecked: string;
  bobVersionTestedOn: string | null;
}

export interface RegistryPack {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  audience: "student" | "educator" | "developer";
  level: "beginner" | "intermediate" | "advanced";
  integrityStance?: "hints-only" | "full-solutions" | "course-policy";
  ibmProducts: string[];
  bobVersion: string;
  tags: string[];
  components: string[];
  sourcePath: string;
  score: PackScore;
}

export interface Registry {
  version: string;
  generatedAt: string;
  packs: RegistryPack[];
}
