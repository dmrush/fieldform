 "use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type FieldType = "text" | "textarea" | "number" | "select" | "date";
type BuilderField = {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options?: string[];
};

export default function AdminEditFormPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const formId = params?.id || "";
  const { profile } = useAuth();
  const orgId = profile?.organization_id || null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<BuilderField[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!formId) return;
      setLoading(true);
      setError(null);
      const f = await supabase.from("forms").select("id,organization_id,title,description,fields").eq("id", formId).maybeSingle();
      if (f.error || !f.data) {
        setError(f.error?.message || "Form not found");
        setLoading(false);
        return;
      }
      if (orgId && f.data.organization_id && f.data.organization_id !== orgId) {
        setError("Not authorized to edit this form");
        setLoading(false);
        return;
      }
      setTitle(f.data.title || "");
      setDescription(f.data.description || "");
      setFields((f.data.fields || []) as BuilderField[]);
      setLoading(false);
    };
    run();
  }, [formId, orgId]);

  const valid = useMemo(() => {
    if (!title.trim()) return false;
    if (fields.length === 0) return false;
    for (const f of fields) {
      if (!f.label.trim()) return false;
      if (f.type === "select" && (!f.options || f.options.length === 0)) return false;
    }
    return true;
  }, [title, fields]);

  const updateField = (id: string, updates: Partial<BuilderField>) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };
  const removeField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };
  const moveField = (id: string, dir: "up" | "down") => {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === id);
      if (idx === -1) return prev;
      const target = dir === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [f] = next.splice(idx, 1);
      next.splice(target, 0, f);
      return next;
    });
  };

  const onSave = async () => {
    setError(null);
    if (!valid) {
      setError("Please complete all required fields");
      return;
    }
    setSaving(true);
    const payload = {
      title,
      description,
      fields,
    };
    const { error } = await supabase.from("forms").update(payload).eq("id", formId);
    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }
    setSaved(true);
    setSaving(false);
    setTimeout(() => {
      router.replace("/admin/forms");
    }, 700);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Edit Form</h1>
          <p className="mt-2 text-zinc-600">Modify form details and fields.</p>
        </div>
      </div>
      {error && <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}
      {saved && <div className="rounded-lg bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">Saved</div>}
      {loading ? (
        <div className="text-zinc-600">Loading…</div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Form Title</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </label>
          </div>
          <div className="space-y-4">
            <div className="text-sm font-medium text-zinc-700">Fields</div>
            <div className="space-y-3">
              {fields.map((f) => (
                <div key={f.id} className="rounded-lg border border-zinc-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-zinc-700">{f.type.toUpperCase()}</div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => moveField(f.id, "up")} className="rounded-lg ring-1 ring-zinc-200 px-2 py-1 text-xs hover:bg-zinc-50">Up</button>
                      <button onClick={() => moveField(f.id, "down")} className="rounded-lg ring-1 ring-zinc-200 px-2 py-1 text-xs hover:bg-zinc-50">Down</button>
                      <button onClick={() => removeField(f.id)} className="rounded-lg ring-1 ring-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50">Remove</button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-3">
                    <label className="block">
                      <span className="text-xs font-medium text-zinc-700">Label</span>
                      <input
                        type="text"
                        value={f.label}
                        onChange={(e) => updateField(f.id, { label: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={f.required}
                        onChange={(e) => updateField(f.id, { required: e.target.checked })}
                        className="rounded border-zinc-300"
                      />
                      <span className="text-zinc-700">Required</span>
                    </label>
                    {f.type === "select" && (
                      <label className="block">
                        <span className="text-xs font-medium text-zinc-700">Options (one per line)</span>
                        <textarea
                          rows={3}
                          value={(f.options || []).join("\n")}
                          onChange={(e) =>
                            updateField(f.id, {
                              options: e.target.value
                                .split("\n")
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </label>
                    )}
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <button
                  onClick={onSave}
                  disabled={saving || !valid}
                  className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
