import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const out = {
    tables: ["organizations", "users", "forms", "submissions"],
    requireService: false,
    timeoutMs: 10000,
  };
  for (const arg of argv) {
    if (arg.startsWith("--tables=")) {
      const v = arg.slice("--tables=".length).trim();
      if (v.length > 0) out.tables = v.split(",").map((s) => s.trim()).filter(Boolean);
    } else if (arg === "--require-service") {
      out.requireService = true;
    } else if (arg.startsWith("--timeout=")) {
      const n = Number(arg.slice("--timeout=".length));
      if (Number.isFinite(n) && n > 0) out.timeoutMs = n;
    }
  }
  return out;
}

async function loadEnv() {
  const envPath = path.join(projectRoot, ".env.local");
  const raw = await readFile(envPath, "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    env[key] = value;
  }
  return env;
}

function validateEnv(env) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const urlOk = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url);
  const anonOk = /^eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/.test(
    anon
  );
  return { urlOk, anonOk, url, anonPresent: !!anon };
}

async function tableHead(client, table) {
  const { error } = await client
    .from(table)
    .select("*", { head: true, count: "exact" });
  if (error) {
    throw new Error(error.message || "Unknown error");
  }
  return true;
}

function classifyError(e) {
  const m = String(e && e.message ? e.message : e || "");
  const ml = m.toLowerCase();
  if (ml.includes("does not exist") && ml.includes("relation")) return "missing";
  if (ml.includes("permission denied") || ml.includes("row-level security")) return "rls";
  if (ml.includes("jwt") || (ml.includes("key") && ml.includes("invalid"))) return "auth";
  if (ml.includes("network") || ml.includes("fetch")) return "network";
  return "error";
}

function withTimeout(p, ms) {
  let to;
  const t = new Promise((_, rej) => {
    to = setTimeout(() => rej(new Error("timeout")), ms);
  });
  return Promise.race([p.finally(() => clearTimeout(to)), t]);
}

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const env = await loadEnv();
    const { urlOk, anonOk } = validateEnv(env);
    const service = process.env.SUPABASE_SERVICE_ROLE;
    if (args.requireService && !service) {
      console.error(JSON.stringify({ ok: false, reason: "service_required" }, null, 2));
      process.exit(2);
    }
    if (!urlOk || !anonOk) {
      console.error(
        JSON.stringify(
          { ok: false, reason: "Invalid or missing Supabase env values" },
          null,
          2
        )
      );
      process.exit(2);
    }
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      service && service.length > 0
        ? service
        : env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const tables = args.tables;
    const results = {};
    for (const t of tables) {
      try {
        await withTimeout(tableHead(supabase, t), args.timeoutMs);
        results[t] = { ok: true };
      } catch (e) {
        results[t] = { ok: false, reason: classifyError(e) };
      }
    }
    const allOk = tables.every((t) => results[t].ok);
    const payload = {
      env: { urlOk, anonOk },
      auth: { type: service && service.length > 0 ? "service" : "anon" },
      tables: results,
      ok: allOk,
    };
    console.log(JSON.stringify(payload, null, 2));
    if (allOk) {
      process.exit(0);
    } else {
      process.exit(service && service.length > 0 ? 4 : 1);
    }
  } catch (e) {
    console.error(
      JSON.stringify({ ok: false, error: String(e?.message || e) }, null, 2)
    );
    process.exit(3);
  }
}

main();
