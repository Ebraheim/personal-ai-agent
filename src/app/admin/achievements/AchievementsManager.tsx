"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AchievementItem = {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  display_order: number;
  is_visible: boolean;
};

type AchievementsManagerProps = {
  userId: string;
  initialAchievements: AchievementItem[];
};

type AchievementForm = {
  title: string;
  description: string;
  date: string;
  display_order: string;
  is_visible: boolean;
};

const emptyForm: AchievementForm = {
  title: "",
  description: "",
  date: "",
  display_order: "0",
  is_visible: true,
};

export default function AchievementsManager({
  userId,
  initialAchievements,
}: AchievementsManagerProps) {
  const supabase = createClient();

  const [items, setItems] =
    useState<AchievementItem[]>(initialAchievements);
  const [form, setForm] = useState<AchievementForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function regenerateSuggestedQuestions() {
    try {
      const response = await fetch("/api/chat/suggestions/regenerate", {
        method: "POST",
      });

      if (!response.ok) {
        console.error(
          "Suggested-question regeneration failed:",
          await response.text()
        );
      }
    } catch (regenerationError) {
      console.error(
        "Suggested-question regeneration failed:",
        regenerationError
      );
    }
  }

  function updateField<K extends keyof AchievementForm>(
    key: K,
    value: AchievementForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function startEdit(item: AchievementItem) {
    setEditingId(item.id);

    setForm({
      title: item.title ?? "",
      description: item.description ?? "",
      date: item.date ?? "",
      display_order: String(item.display_order ?? 0),
      is_visible: item.is_visible,
    });

    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  }

  async function saveAchievement() {
    if (!form.title.trim()) {
      setMessage("Achievement title is required.");
      return;
    }

    setSaving(true);
    setMessage("");

    const payload = {
      user_id: userId,
      title: form.title.trim(),
      description: form.description.trim(),
      date: form.date.trim(),
      display_order: Number(form.display_order) || 0,
      is_visible: form.is_visible,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { data, error } = await supabase
        .from("achievements")
        .update(payload)
        .eq("id", editingId)
        .eq("user_id", userId)
        .select(
          "id, title, description, date, display_order, is_visible"
        )
        .single();

      if (error) {
        setMessage(error.message);
        setSaving(false);
        return;
      }

      setItems((current) =>
        current
          .map((item) => (item.id === editingId ? data : item))
          .sort((a, b) => a.display_order - b.display_order)
      );

      setMessage("Achievement updated.");
    } else {
      const { data, error } = await supabase
        .from("achievements")
        .insert(payload)
        .select(
          "id, title, description, date, display_order, is_visible"
        )
        .single();

      if (error) {
        setMessage(error.message);
        setSaving(false);
        return;
      }

      setItems((current) =>
        [...current, data].sort(
          (a, b) => a.display_order - b.display_order
        )
      );

      setMessage("Achievement added.");
    }

    await regenerateSuggestedQuestions();

    setEditingId(null);
    setForm(emptyForm);
    setSaving(false);
  }

  async function deleteAchievement(id: string) {
    const confirmed = window.confirm(
      "Delete this achievement?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("achievements")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setItems((current) =>
      current.filter((item) => item.id !== id)
    );

    if (editingId === id) {
      cancelEdit();
    }

    await regenerateSuggestedQuestions();

    setMessage("Achievement deleted.");
  }

  async function toggleVisibility(item: AchievementItem) {
    const { data, error } = await supabase
      .from("achievements")
      .update({
        is_visible: !item.is_visible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id)
      .eq("user_id", userId)
      .select(
        "id, title, description, date, display_order, is_visible"
      )
      .single();

    if (error) {
      setMessage(error.message);
      return;
    }

    setItems((current) =>
      current.map((existing) =>
        existing.id === item.id ? data : existing
      )
    );

    await regenerateSuggestedQuestions();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
          {editingId ? "Edit Entry" : "New Entry"}
        </p>

        <h2 className="mt-3 text-2xl font-semibold">
          {editingId ? "Update Achievement" : "Add Achievement"}
        </h2>

        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm text-white/55">
              Title
            </span>
            <input
              value={form.title}
              onChange={(event) =>
                updateField("title", event.target.value)
              }
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none transition focus:border-cyan-300/40"
              placeholder="Award, competition, publication, recognition..."
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-white/55">
              Date
            </span>
            <input
              value={form.date}
              onChange={(event) =>
                updateField("date", event.target.value)
              }
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none transition focus:border-cyan-300/40"
              placeholder="2026"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-white/55">
              Description
            </span>
            <textarea
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              rows={7}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none transition focus:border-cyan-300/40"
              placeholder="Describe the achievement and why it matters."
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-white/55">
                Display Order
              </span>
              <input
                type="number"
                value={form.display_order}
                onChange={(event) =>
                  updateField("display_order", event.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none transition focus:border-cyan-300/40"
              />
            </label>

            <label className="flex items-center gap-3 self-end rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">
              <input
                type="checkbox"
                checked={form.is_visible}
                onChange={(event) =>
                  updateField("is_visible", event.target.checked)
                }
              />
              <span className="text-sm text-white/60">
                Visible on website
              </span>
            </label>
          </div>

          {message && (
            <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/60">
              {message}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={saveAchievement}
              disabled={saving}
              className="rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-black transition hover:bg-cyan-200 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Save Changes"
                  : "Add Achievement"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-white/65 transition hover:text-white"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.25em] text-white/30">
            Published Data
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Achievement Entries
          </h2>
        </div>

        <div className="space-y-4">
          {items.length > 0 ? (
            items.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/[0.025] p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div>
                    {item.date && (
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                        {item.date}
                      </p>
                    )}

                    <h3 className="mt-2 text-xl font-semibold">
                      {item.title}
                    </h3>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      item.is_visible
                        ? "bg-cyan-300/10 text-cyan-300"
                        : "bg-white/5 text-white/35"
                    }`}
                  >
                    {item.is_visible ? "Visible" : "Hidden"}
                  </span>
                </div>

                {item.description && (
                  <p className="mt-4 whitespace-pre-wrap leading-7 text-white/50">
                    {item.description}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-3 border-t border-white/10 pt-5">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-200 transition hover:bg-cyan-300/20"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleVisibility(item)}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/60 transition hover:text-white"
                  >
                    {item.is_visible ? "Hide" : "Show"}
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteAchievement(item.id)}
                    className="rounded-lg border border-red-400/15 bg-red-400/5 px-4 py-2 text-sm text-red-300 transition hover:bg-red-400/10"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-white/35">
              No achievements yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}