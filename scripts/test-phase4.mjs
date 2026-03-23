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
   const result = { steps: [], ok: false };
   try {
     const env = await loadEnv();
     const url = env.NEXT_PUBLIC_SUPABASE_URL;
     const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
     const service = process.env.SUPABASE_SERVICE_ROLE || "";
     if (!url || !anon) {
       result.steps.push({ step: "env", ok: false, reason: "env_missing" });
       console.log(JSON.stringify(result, null, 2));
       process.exit(2);
     }
    let offline = false;
    try {
      const res = await fetch(`${url}/auth/v1/settings`);
      offline = !res.ok && res.status >= 500;
    } catch {
      offline = true;
    }
     const clientAnon = createClient(url, anon);
     const clientDb = createClient(url, service && service.length > 0 ? service : anon);
     const clientAdmin = createClient(url, service && service.length > 0 ? service : anon);
 
     const emailAdmin = `admin-${rnd(10)}@example.local`;
     const passAdmin = `Pw-${rnd(12)}`;
     const orgName = `Test Org ${rnd(6)}`;
     const inviteCode = rnd(8).toUpperCase();
 
    let adminId = "";
    if (!offline) {
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
    } else {
      result.steps.push({ step: "network", ok: false, reason: "offline" });
      adminId = `offline-admin-${rnd(12)}`;
    }
 
    let orgId = `offline-org-${rnd(8)}`;
    if (!offline) {
      const o = await clientDb.from("organizations").insert({ name: orgName, invite_code: inviteCode }).select("id,invite_code").single();
      if (o.error) throw new Error(o.error.message);
      result.steps.push({ step: "org_create", ok: true });
      orgId = o.data.id;
      const p = await clientDb.from("users").upsert({ id: adminId, name: "Test Admin", role: "admin", organization_id: orgId });
      if (p.error) throw new Error(p.error.message);
      result.steps.push({ step: "admin_profile", ok: true });
    } else {
      result.steps.push({ step: "org_create_simulated", ok: true });
      result.steps.push({ step: "admin_profile_simulated", ok: true });
    }
 
     const fields = [
       { id: `fld_${rnd(6)}`, type: "text", label: "Your Name", required: true },
       { id: `fld_${rnd(6)}`, type: "select", label: "Department", required: false, options: ["Sales", "Engineering", "HR"] },
       { id: `fld_${rnd(6)}`, type: "textarea", label: "Feedback", required: true },
     ];
    let formId = `offline-form-${rnd(8)}`;
    if (!offline) {
      const fv = await clientDb.from("forms").insert({ title: "Employee Survey", description: "Annual employee feedback", organization_id: orgId, fields }).select("id").single();
      if (fv.error) throw new Error(fv.error.message);
      result.steps.push({ step: "form_create", ok: true });
      formId = fv.data.id;
    } else {
      result.steps.push({ step: "form_create_simulated", ok: true });
    }
 
    if (!offline) {
      const up = await clientDb.from("forms").update({ title: "Employee Survey v2" }).eq("id", formId);
      result.steps.push({ step: "form_update", ok: !up.error });
      const vf = await clientDb.from("forms").select("id,title").eq("id", formId).maybeSingle();
      result.steps.push({ step: "form_update_verify", ok: !vf.error && vf.data?.title === "Employee Survey v2" });
    } else {
      result.steps.push({ step: "form_update_simulated", ok: true });
      result.steps.push({ step: "form_update_verify_simulated", ok: true });
    }

    await clientAnon.auth.signOut();
    const emailWorker = `worker-${rnd(10)}@example.local`;
    const passWorker = `Pw-${rnd(12)}`;
    let workerId = "";
    if (!offline) {
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
      const pw = await clientDb.from("users").upsert({ id: workerId, name: "Test Worker", role: "worker", organization_id: orgId });
      if (pw.error) throw new Error(pw.error.message);
      result.steps.push({ step: "worker_profile", ok: true });
    } else {
      workerId = `offline-worker-${rnd(12)}`;
      result.steps.push({ step: "worker_profile_simulated", ok: true });
    }
 
     const answers = {};
     answers[fields[0].id] = "John Doe";
     answers[fields[1].id] = "Engineering";
     answers[fields[2].id] = "Great company culture!";
    if (!offline) {
      const sub = await clientAnon.from("submissions").insert({
        form_id: formId,
        organization_id: orgId,
        submitted_by: workerId,
        answers,
      });
      result.steps.push({ step: "submission_create", ok: !sub.error });
    } else {
      result.steps.push({ step: "submission_create_simulated", ok: true });
    }
 
    if (!offline) {
      const cf = await clientDb.from("forms").select("*", { count: "exact", head: true }).eq("organization_id", orgId);
      const cs = await clientDb.from("submissions").select("*", { count: "exact", head: true }).eq("organization_id", orgId);
      result.steps.push({ step: "count_forms", ok: (cf.count || 0) > 0 });
      result.steps.push({ step: "count_submissions", ok: (cs.count || 0) > 0 });
      const fl = await clientDb.from("forms").select("id,title").eq("organization_id", orgId);
      const sl = await clientDb.from("submissions").select("id,form_id,submitted_by,answers").eq("organization_id", orgId);
      result.steps.push({ step: "forms_list", ok: !fl.error && (fl.data || []).length > 0 });
      result.steps.push({ step: "submissions_list", ok: !sl.error && (sl.data || []).length > 0 });
    } else {
      result.steps.push({ step: "counts_simulated", ok: true });
      result.steps.push({ step: "lists_simulated", ok: true });
    }
 
     result.ok = result.steps.every((s) => s.ok);
     console.log(JSON.stringify(result, null, 2));
     process.exit(result.ok ? 0 : 1);
   } catch (e) {
     const reason = String(e?.message || e);
     const payload = { steps: [{ step: "error", ok: false, reason }], ok: false };
     console.log(JSON.stringify(payload, null, 2));
     process.exit(3);
   }
 }
 
 main();
