"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type KnowledgeItem = {
  id: string;
  title: string;
  content: string;
  category: string;
  is_active: boolean;
  priority: number;
};

type KnowledgeForm = {
  title: string;
  content: string;
  category: string;
  is_active: boolean;
  priority: number;
};

type SectionContent = {
  ai_label: string;
  ai_heading: string;
  ai_description: string;
};

type KnowledgeManagerProps = {
  userId: string;
  initialKnowledge: KnowledgeItem[];
  initialSectionContent: SectionContent;
};

const emptyForm: KnowledgeForm = {
  title: "",
  content: "",
  category: "general",
  is_active: true,
  priority: 0,
};

export default function KnowledgeManager({
  userId,
  initialKnowledge,
  initialSectionContent,
}: KnowledgeManagerProps) {
  const [knowledge, setKnowledge] =
    useState<KnowledgeItem[]>(initialKnowledge);

  const [sectionContent, setSectionContent] =
    useState<SectionContent>(initialSectionContent);

  const [form, setForm] = useState<KnowledgeForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [savingSection, setSavingSection] = useState(false);
  const [savingKnowledge, setSavingKnowledge] = useState(false);

  const [sectionMessage, setSectionMessage] = useState("");
  const [knowledgeMessage, setKnowledgeMessage] = useState("");
  const [error, setError] = useState("");

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/40";

  const labelClass = "text-sm font-medium text-white/60";

  const sectionClass =
    "rounded-3xl border border-white/10 bg-white/[0.025] p-6 md:p-8";

  function updateSectionField(
    field: keyof SectionContent,
    value: string
  ) {
    setSectionContent((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateField<K extends keyof KnowledgeForm>(
    field: K,
    value: KnowledgeForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveSectionContent(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSavingSection(true);
    setSectionMessage("");
    setError("");

    const supabase = createClient();

    const sectionData = {
      ai_label: sectionContent.ai_label.trim(),
      ai_heading: sectionContent.ai_heading.trim(),
      ai_description: sectionContent.ai_description.trim(),
      updated_at: new Date().toISOString(),
    };

    const { data: existingContent, error: findError } =
      await supabase
        .from("site_content")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

    if (findError) {
      setError(findError.message);
      setSavingSection(false);
      return;
    }

    if (existingContent) {
      const { error: updateError } = await supabase
        .from("site_content")
        .update(sectionData)
        .eq("user_id", userId);

      if (updateError) {
        setError(updateError.message);
        setSavingSection(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from("site_content")
        .insert({
          user_id: userId,
          ...sectionData,
        });

      if (insertError) {
        setError(insertError.message);
        setSavingSection(false);
        return;
      }
    }

    setSectionMessage(
      "AI Assistant section text saved successfully."
    );
    setSavingSection(false);
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setKnowledgeMessage("");
    setError("");
  }

  function startEdit(item: KnowledgeItem) {
    setEditingId(item.id);

    setForm({
      title: item.title,
      content: item.content,
      category: item.category,
      is_active: item.is_active,
      priority: item.priority,
    });

    setKnowledgeMessage("");
    setError("");

    window.scrollTo({
      top: 560,
      behavior: "smooth",
    });
  }

  async function handleSave(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Knowledge title is required.");
      return;
    }

    if (!form.content.trim()) {
      setError("Knowledge content is required.");
      return;
    }

    setSavingKnowledge(true);
    setKnowledgeMessage("");
    setError("");

    const supabase = createClient();

    const knowledgeData = {
      title: form.title.trim(),
      content: form.content.trim(),
      category: form.category,
      is_active: form.is_active,
      priority: form.priority,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { data, error } = await supabase
        .from("agent_knowledge")
        .update(knowledgeData)
        .eq("id", editingId)
        .eq("user_id", userId)
        .select("id, title, content, category, is_active, priority")
        .single();

      if (error) {
        setError(error.message);
        setSavingKnowledge(false);
        return;
      }

      setKnowledge((current) =>
        current
          .map((item) =>
            item.id === editingId ? data : item
          )
          .sort((a, b) => b.priority - a.priority)
      );

      setKnowledgeMessage("Knowledge updated successfully.");
    } else {
      const { data, error } = await supabase
        .from("agent_knowledge")
        .insert({
          user_id: userId,
          ...knowledgeData,
        })
        .select("id, title, content, category, is_active, priority")
        .single();

      if (error) {
        setError(error.message);
        setSavingKnowledge(false);
        return;
      }

      setKnowledge((current) =>
        [...current, data].sort(
          (a, b) => b.priority - a.priority
        )
      );

      setKnowledgeMessage("Knowledge added successfully.");
    }

    setForm(emptyForm);
    setEditingId(null);
    setSavingKnowledge(false);
  }

  async function toggleActive(item: KnowledgeItem) {
    setError("");

    const supabase = createClient();

    const { data, error } = await supabase
      .from("agent_knowledge")
      .update({
        is_active: !item.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id)
      .eq("user_id", userId)
      .select("id, title, content, category, is_active, priority")
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    setKnowledge((current) =>
      current.map((knowledgeItem) =>
        knowledgeItem.id === item.id ? data : knowledgeItem
      )
    );
  }

  async function deleteKnowledge(item: KnowledgeItem) {
    const confirmed = window.confirm(
      `Delete "${item.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setError("");

    const supabase = createClient();

    const { error } = await supabase
      .from("agent_knowledge")
      .delete()
      .eq("id", item.id)
      .eq("user_id", userId);

    if (error) {
      setError(error.message);
      return;
    }

    setKnowledge((current) =>
      current.filter(
        (knowledgeItem) => knowledgeItem.id !== item.id
      )
    );

    if (editingId === item.id) {
      resetForm();
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={saveSectionContent}
        className={sectionClass}
      >
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
            Section Text
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            AI Assistant Section Information
          </h2>

          <p className="mt-2 max-w-2xl text-sm text-white/40">
            Control the public label, heading, and description shown above the
            AI assistant.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className={labelClass}>
              Small Label
            </label>

            <input
              type="text"
              value={sectionContent.ai_label}
              onChange={(event) =>
                updateSectionField(
                  "ai_label",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="AI Assistant"
            />
          </div>

          <div>
            <label className={labelClass}>
              Main Heading
            </label>

            <input
              type="text"
              value={sectionContent.ai_heading}
              onChange={(event) =>
                updateSectionField(
                  "ai_heading",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Ask a question."
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>
              Section Description
            </label>

            <textarea
              rows={4}
              value={sectionContent.ai_description}
              onChange={(event) =>
                updateSectionField(
                  "ai_description",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Explain what visitors can ask the AI assistant..."
            />
          </div>
        </div>

        {sectionMessage && (
          <div className="mt-6 rounded-xl border border-green-400/20 bg-green-400/10 p-3 text-sm text-green-300">
            {sectionMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={savingSection}
          className="mt-8 rounded-xl bg-cyan-300 px-6 py-3 font-semibold text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {savingSection
            ? "Saving..."
            : "Save AI Assistant Section"}
        </button>
      </form>

      <form
        onSubmit={handleSave}
        className={sectionClass}
      >
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
              Verified Knowledge
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              {editingId
                ? "Edit Knowledge"
                : "Add Knowledge"}
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-white/40">
              Add information the AI assistant is allowed to use when answering
              visitor questions.
            </p>
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
              Knowledge Title
            </label>

            <input
              type="text"
              value={form.title}
              onChange={(event) =>
                updateField("title", event.target.value)
              }
              className={inputClass}
              placeholder="Example: Services Offered"
            />
          </div>

          <div>
            <label className={labelClass}>
              Category
            </label>

            <select
              value={form.category}
              onChange={(event) =>
                updateField(
                  "category",
                  event.target.value
                )
              }
              className={inputClass}
            >
              <option value="general">General</option>
              <option value="profile">Profile</option>
              <option value="education">Education</option>
              <option value="experience">Experience</option>
              <option value="project">Project</option>
              <option value="skills">Skills</option>
              <option value="certification">Certification</option>
              <option value="career">Career</option>
              <option value="services">Services</option>
              <option value="business">Business</option>
              <option value="faq">FAQ</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>
              Priority
            </label>

            <input
              type="number"
              value={form.priority}
              onChange={(event) =>
                updateField(
                  "priority",
                  Number(event.target.value)
                )
              }
              className={inputClass}
            />

            <p className="mt-2 text-xs text-white/30">
              Higher numbers place the entry earlier in the knowledge list.
            </p>
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>
              Verified Information
            </label>

            <textarea
              rows={8}
              value={form.content}
              onChange={(event) =>
                updateField(
                  "content",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Write the exact verified information the assistant is allowed to use..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-3 text-sm text-white/60">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  updateField(
                    "is_active",
                    event.target.checked
                  )
                }
                className="h-4 w-4"
              />

              Allow the AI assistant to use this knowledge
            </label>
          </div>
        </div>

        {knowledgeMessage && (
          <div className="mt-6 rounded-xl border border-green-400/20 bg-green-400/10 p-3 text-sm text-green-300">
            {knowledgeMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={savingKnowledge}
          className="mt-8 rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-6 py-3 font-medium text-cyan-200 transition hover:bg-cyan-300/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {savingKnowledge
            ? "Saving..."
            : editingId
              ? "Update Knowledge"
              : "Add Knowledge"}
        </button>
      </form>

      <section className={sectionClass}>
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
            Knowledge Base
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Existing Knowledge
          </h2>
        </div>

        {knowledge.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-white/40">
            No knowledge added yet.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {knowledge.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                      {item.category}
                    </p>

                    <h3 className="mt-2 text-xl font-semibold">
                      {item.title}
                    </h3>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      item.is_active
                        ? "bg-green-400/10 text-green-300"
                        : "bg-white/5 text-white/40"
                    }`}
                  >
                    {item.is_active
                      ? "Active"
                      : "Disabled"}
                  </span>
                </div>

                <p className="mt-4 line-clamp-5 text-sm leading-6 text-white/50">
                  {item.content}
                </p>

                <p className="mt-4 text-xs text-white/30">
                  Priority: {item.priority}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="rounded-lg border border-cyan-300/20 px-4 py-2 text-sm text-cyan-300 transition hover:bg-cyan-300/10"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleActive(item)}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/[0.05] hover:text-white"
                  >
                    {item.is_active
                      ? "Disable"
                      : "Enable"}
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteKnowledge(item)}
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

      {error && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8">
        <a
          href="/admin/dashboard"
          className="text-sm text-white/40 transition hover:text-white"
        >
          ← Dashboard
        </a>

        <a
          href="/#agent"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-sm font-medium text-cyan-200 transition hover:bg-cyan-300/20 hover:text-white"
        >
          Preview AI Assistant ↗
        </a>
      </div>
    </div>
  );
}