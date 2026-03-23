import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

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

function rnd(len = 8) {
  const c = "abcdefghijklmnopqrstuvwxyz0123456789";
  let o = "";
  for (let i = 0; i < len; i++) o += c[Math.floor(Math.random() * c.length)];
  return o;
}

async function main() {
  const env = await loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE || "";
  const anonOk = !!url && !!anon;
  if (!anonOk) {
    console.log(JSON.stringify({ ok: false, reason: "env_missing" }, null, 2));
    process.exit(2);
  }
  const clientAnon = createClient(url, anon);
  const clientDb = createClient(url, service && service.length > 0 ? service : anon);
  const clientAdmin = createClient(url, service && service.length > 0 ? service : anon);
  const emailAdmin = `admin-${rnd(10)}@example.local`;
  const passAdmin = `Pw-${rnd(12)}`;
  const orgName = `Test Org ${rnd(6)}`;
  const inviteCode = rnd(8).toUpperCase();
  const emailWorker = `worker-${rnd(10)}@example.local`;
  const passWorker = `Pw-${rnd(12)}`;
  const result = { steps: [], ok: false };
  try {
    let adminId = "";
    if (service) {
      const cu = await clientAdmin.auth.admin.createUser({ email: emailAdmin, password: passAdmin, email_confirm: true });
      result.steps.push({ step: "admin_create", ok: !cu.error });
      adminId = cu.data.user?.id || "";
      await clientAnon.auth.signInWithPassword({ email: emailAdmin, password: passAdmin });
    } else {
      const s1 = await clientAnon.auth.signUp({ email: emailAdmin, password: passAdmin });
      result.steps.push({ step: "admin_sign_up", ok: !s1.error });
      if (!s1.session) await clientAnon.auth.signInWithPassword({ email: emailAdmin, password: passAdmin });
      adminId = s1.user?.id || (await clientAnon.auth.getUser()).data.user?.id;
    }
    if (!adminId) throw new Error("admin_session_failed");
    const o = await clientDb.from("organizations").insert({ name: orgName, invite_code: inviteCode }).select("id").single();
    if (o.error) throw new Error(o.error.message);
    result.steps.push({ step: "org_create", ok: true });
    const p = await clientDb.from("users").upsert({ id: adminId, name: "Test Admin", role: "admin", organization_id: o.data.id });
    if (p.error) throw new Error(p.error.message);
    result.steps.push({ step: "admin_profile", ok: true });
    await clientAnon.auth.signOut();
    let workerId = "";
    await clientAnon.auth.signOut();
    if (service) {
      const cw = await clientAdmin.auth.admin.createUser({ email: emailWorker, password: passWorker, email_confirm: true });
      result.steps.push({ step: "worker_create", ok: !cw.error });
      workerId = cw.data.user?.id || "";
      await clientAnon.auth.signInWithPassword({ email: emailWorker, password: passWorker });
    } else {
      const s2 = await clientAnon.auth.signUp({ email: emailWorker, password: passWorker });
      result.steps.push({ step: "worker_sign_up", ok: !s2.error });
      if (!s2.session) await clientAnon.auth.signInWithPassword({ email: emailWorker, password: passWorker });
      workerId = s2.user?.id || (await clientAnon.auth.getUser()).data.user?.id;
    }
    if (!workerId) throw new Error("worker_session_failed");
    const orgFetch = await clientDb.from("organizations").select("id").eq("invite_code", inviteCode).maybeSingle();
    if (orgFetch.error || !orgFetch.data) throw new Error("org_fetch_failed");
    const pw = await clientDb.from("users").upsert({ id: workerId, name: "Test Worker", role: "worker", organization_id: orgFetch.data.id });
    if (pw.error) throw new Error(pw.error.message);
    result.steps.push({ step: "worker_profile", ok: true });
    const profAdmin = await clientDb.from("users").select("role").eq("id", adminId).maybeSingle();
    const profWorker = await clientDb.from("users").select("role").eq("id", workerId).maybeSingle();
    result.steps.push({ step: "role_admin", ok: profAdmin.data?.role === "admin" });
    result.steps.push({ step: "role_worker", ok: profWorker.data?.role === "worker" });
    result.ok = result.steps.every((s) => s.ok);
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 1);
  } catch (e) {
    result.steps.push({ step: "error", ok: false, reason: String(e?.message || e) });
    console.log(JSON.stringify(result, null, 2));
    process.exit(3);
  }
}

main();
