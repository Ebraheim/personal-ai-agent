"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Skill = {
  id: string;
  title: string;
  description: string;
  display_order: number;
  is_visible: boolean;
};

type SkillsManagerProps = {
  userId: string;
  initialSkills: Skill[];
};

type SkillForm = {
  title: string;
  description: string;
  display_order: number;
  is_visible: boolean;
};

const emptyForm: SkillForm = {
  title: "",
  description: "",
  display_order: 0,
  is_visible: true,
};

export default function SkillsManager({
  userId,
  initialSkills,
}: SkillsManagerProps) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [form, setForm] = useState<SkillForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField<K extends keyof SkillForm>(
    field: K,
    value: SkillForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
    setError("");
  }

  function startEdit(skill: Skill) {
    setEditingId(skill.id);

    setForm({
      title: skill.title,
      description: skill.description,
      display_order: skill.display_order,
      is_visible: skill.is_visible,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Skill title is required.");
      return;
    }

    if (!form.description.trim()) {
      setError("Skill description is required.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    const supabase = createClient();

    const skillData = {
      title: form.title.trim(),
      description: form.description.trim(),
      display_order: form.display_order,
      is_visible: form.is_visible,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { data, error } = await supabase
        .from("skills")
        .update(skillData)
        .eq("id", editingId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }

      setSkills((current) =>
        current
          .map((skill) =>
            skill.id === editingId ? data : skill
          )
          .sort((a, b) => a.display_order - b.display_order)
      );

      setMessage("Skill updated successfully.");
    } else {
      const { data, error } = await supabase
        .from("skills")
        .insert({
          user_id: userId,
          ...skillData,
        })
        .select()
        .single();

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }

      setSkills((current) =>
        [...current, data].sort(
          (a, b) => a.display_order - b.display_order
        )
      );

      setMessage("Skill added successfully.");
    }

    setForm(emptyForm);
    setEditingId(null);
    setSaving(false);
  }

  async function toggleVisibility(skill: Skill) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("skills")
      .update({
        is_visible: !skill.is_visible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", skill.id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    setSkills((current) =>
      current.map((item) =>
        item.id === skill.id ? data : item
      )
    );
  }

  async function deleteSkill(skill: Skill) {
    const confirmed = window.confirm(
      `Delete "${skill.title}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("skills")
      .delete()
      .eq("id", skill.id)
      .eq("user_id", userId);

    if (error) {
      setError(error.message);
      return;
    }

    setSkills((current) =>
      current.filter((item) => item.id !== skill.id)
    );

    if (editingId === skill.id) {
      resetForm();
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/40";

  const labelClass = "text-sm text-white/60";

  return (
    <div className="space-y-10">
      <form
        onSubmit={handleSave}
        className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8"
      >
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-cyan-300">
              {editingId ? "Editing Skill" : "New Skill"}
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              {editingId ? "Update Skill" : "Add Skill"}
            </h2>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/[0.05] hover:text-white"
            >
              Cancel Editing
            </button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass}>
              Skill Group Title
            </label>

            <input
              type="text"
              value={form.title}
              onChange={(event) =>
                updateField("title", event.target.value)
              }
              className={inputClass}
              placeholder="Robotics & Autonomous Systems"
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>
              Skills / Description
            </label>

            <textarea
              rows={5}
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              className={inputClass}
              placeholder="ROS, SLAM, TurtleBot3, Autonomous Navigation..."
            />
          </div>

          <div>
            <label className={labelClass}>
              Display Order
            </label>

            <input
              type="number"
              value={form.display_order}
              onChange={(event) =>
                updateField(
                  "display_order",
                  Number(event.target.value)
                )
              }
              className={inputClass}
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-3 pb-3 text-sm text-white/60">
              <input
                type="checkbox"
                checked={form.is_visible}
                onChange={(event) =>
                  updateField("is_visible", event.target.checked)
                }
                className="h-4 w-4"
              />

              Show this skill publicly
            </label>
          </div>
        </div>

        {message && (
          <div className="mt-6 rounded-xl border border-green-400/20 bg-green-400/10 p-3 text-sm text-green-300">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-8 rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-6 py-3 font-medium text-cyan-200 transition hover:bg-cyan-300/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : editingId
              ? "Update Skill"
              : "Add Skill"}
        </button>
      </form>

      <section>
        <div className="mb-5">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
            Portfolio Skills
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Existing Skills
          </h2>
        </div>

        {skills.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-white/40">
            No skills added yet.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {skills.map((skill) => (
              <article
                key={skill.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {skill.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-white/50">
                      {skill.description}
                    </p>

                    <p className="mt-4 text-xs text-white/30">
                      Order: {skill.display_order}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      skill.is_visible
                        ? "bg-green-400/10 text-green-300"
                        : "bg-white/5 text-white/40"
                    }`}
                  >
                    {skill.is_visible ? "Visible" : "Hidden"}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => startEdit(skill)}
                    className="rounded-lg border border-cyan-300/20 px-4 py-2 text-sm text-cyan-300 transition hover:bg-cyan-300/10"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleVisibility(skill)}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/[0.05] hover:text-white"
                  >
                    {skill.is_visible ? "Hide" : "Show"}
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteSkill(skill)}
                    className="rounded-lg border border-red-400/20 px-4 py-2 text-sm text-red-300 transition hover:bg-red-400/10"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}