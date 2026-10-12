import { existsSync } from "fs";
import { resolve } from "path";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

/** Same default as Nest `app.module` / docker-compose host port 5433. */
const DEFAULT_LOCAL_DATABASE_URL =
  "postgresql://music:music123@localhost:5433/music_saas?schema=public";

function loadEnvFiles(): void {
  const candidates = [
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), "services", "api", ".env"),
  ];
  for (const p of candidates) {
    if (existsSync(p)) {
      loadEnv({ path: p, override: true });
    }
  }
}

loadEnvFiles();

export default defineConfig({
  schema: "./prisma/schema.prisma",

  migrations: {
    path: "./prisma/migrations",
    seed: "ts-node ./prisma/seed.ts",
  },

  datasource: {
    url:
      process.env.DATABASE_URL?.trim() ||
      process.env.DATABASE_URL_LOCAL?.trim() ||
      DEFAULT_LOCAL_DATABASE_URL,
  },
});
