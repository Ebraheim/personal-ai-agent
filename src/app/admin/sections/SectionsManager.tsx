"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Section = {
  id: string;
  section_key: string;
  label: string;
  display_order: number;
  is_visible: boolean;
};

type SectionsManagerProps = {
  userId: string;
  initialSections: Section[];
};

type SectionForm = {
  section_key: string;
  label: string;
  display_order: number;
  is_visible: boolean;
};

const emptyForm: SectionForm = {
  section_key: "",
  label: "",
  display_order: 0,
  is_visible: true,
};

const careerSections = [
  { section_key: "experience", label: "Experience" },
  { section_key: "education", label: "Education" },
  { section_key: "achievements", label: "Achievements" },
] as const;

export default function SectionsManager({
  userId,
  initialSections,
}: SectionsManagerProps) {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [form, setForm] = useState<SectionForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField<K extends keyof SectionForm>(
    field: K,
    value: SectionForm[K]
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

  function startEdit(section: Section) {
    setEditingId(section.id);

    setForm({
      section_key: section.section_key,
      label: section.label,
      display_order: section.display_order,
      is_visible: section.is_visible,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.section_key.trim()) {
      setError("Section key is required.");
      return;
    }

    if (!form.label.trim()) {
      setError("Section label is required.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    const supabase = createClient();

    if (editingId) {
      const { data, error } = await supabase
        .from("sections")
        .update({
          section_key: form.section_key.trim().toLowerCase(),
          label: form.label.trim(),
          display_order: form.display_order,
          is_visible: form.is_visible,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }

      setSections((current) =>
        current
          .map((section) =>
            section.id === editingId ? data : section
          )
          .sort((a, b) => a.display_order - b.display_order)
      );

      setMessage("Section updated successfully.");
    } else {
      const { data, error } = await supabase
        .from("sections")
        .insert({
          user_id: userId,
          section_key: form.section_key.trim().toLowerCase(),
          label: form.label.trim(),
          display_order: form.display_order,
          is_visible: form.is_visible,
        })
        .select()
        .single();

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }

      setSections((current) =>
        [...current, data].sort(
          (a, b) => a.display_order - b.display_order
        )
      );

      setMessage("Section added successfully.");
    }

    setForm(emptyForm);
    setEditingId(null);
    setSaving(false);
  }

  async function toggleVisibility(section: Section) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("sections")
      .update({
        is_visible: !section.is_visible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", section.id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    setSections((current) =>
      current.map((item) =>
        item.id === section.id ? data : item
      )
    );
  }

  async function deleteSection(section: Section) {
    const confirmed = window.confirm(
      `Delete "${section.label}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("sections")
      .delete()
      .eq("id", section.id)
      .eq("user_id", userId);

    if (error) {
      setError(error.message);
      return;
    }

    setSections((current) =>
      current.filter((item) => item.id !== section.id)
    );

    if (editingId === section.id) {
      resetForm();
    }
  }

  async function addMissingCareerSections() {
    setSaving(true);
    setMessage("");
    setError("");

    const existingKeys = new Set(
      sections.map((section) => section.section_key.toLowerCase())
    );

    const missing = careerSections.filter(
      (section) => !existingKeys.has(section.section_key)
    );

    if (missing.length === 0) {
      setMessage(
        "Experience, Education, and Achievements are already in Website Settings."
      );
      setSaving(false);
      return;
    }

    const nextOrder =
      Math.max(
        -1,
        ...sections.map((section) => section.display_order ?? -1)
      ) + 1;

    const rows = missing.map((section, index) => ({
      user_id: userId,
      section_key: section.section_key,
      label: section.label,
      display_order: nextOrder + index,
      is_visible: true,
    }));

    const supabase = createClient();

    const { data, error } = await supabase
      .from("sections")
      .insert(rows)
      .select("id, section_key, label, display_order, is_visible");

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setSections((current) =>
      [...current, ...(data ?? [])].sort(
        (a, b) => a.display_order - b.display_order
      )
    );

    setMessage(
      `Added ${data?.length ?? 0} missing career section${
        (data?.length ?? 0) === 1 ? "" : "s"
      }. You can now rename, reorder, hide, or show them below.`
    );

    setSaving(false);
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/40";

  const labelClass = "text-sm text-white/60";

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.025] p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-sm text-cyan-300">
              Career Sections
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Experience, Education & Achievements
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">
              Add any missing career sections to Website Settings so you can
              rename them, change their order, or hide/show them from here.
            </p>
          </div>

          <button
            type="button"
            onClick={addMissingCareerSections}
            disabled={saving}
            className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-5 py-3 text-sm font-medium text-cyan-200 transition hover:bg-cyan-300/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add Missing Career Sections
          </button>
        </div>
      </section>

      <form
        onSubmit={handleSave}
        className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8"
      >
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-cyan-300">
              {editingId ? "Editing Section" : "New Section"}
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              {editingId ? "Update Section" : "Add Section"}
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
          <div>
            <label className={labelClass}>Section Key</label>

            <input
              type="text"
              value={form.section_key}
              onChange={(event) =>
                updateField("section_key", event.target.value)
              }
              className={inputClass}
              placeholder="projects"
            />

            <p className="mt-2 text-xs text-white/30">
              Internal name such as projects, experience, education, achievements, skills, about, contact.
            </p>
          </div>

          <div>
            <label className={labelClass}>Menu Label</label>

            <input
              type="text"
              value={form.label}
              onChange={(event) =>
                updateField("label", event.target.value)
              }
              className={inputClass}
              placeholder="Projects"
            />
          </div>

          <div>
            <label className={labelClass}>Display Order</label>

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

              Show this section publicly
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
              ? "Update Section"
              : "Add Section"}
        </button>
      </form>

      <section>
        <div className="mb-5">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
            Website Navigation
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Existing Sections
          </h2>
        </div>

        {sections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-white/40">
            No sections added yet.
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section) => (
              <article
                key={section.id}
                className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold">
                      {section.label}
                    </h3>

                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        section.is_visible
                          ? "bg-green-400/10 text-green-300"
                          : "bg-white/5 text-white/40"
                      }`}
                    >
                      {section.is_visible ? "Visible" : "Hidden"}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-white/40">
                    Key: {section.section_key} · Order:{" "}
                    {section.display_order}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => startEdit(section)}
                    className="rounded-lg border border-cyan-300/20 px-4 py-2 text-sm text-cyan-300 transition hover:bg-cyan-300/10"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleVisibility(section)}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/[0.05] hover:text-white"
                  >
                    {section.is_visible ? "Hide" : "Show"}
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteSection(section)}
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