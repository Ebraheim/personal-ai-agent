"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type CareerFocusItem = {
  id: string;
  title: string;
  display_order: number;
  is_visible: boolean;
};

type SectionContent = {
  about_label: string;
  about_heading: string;
  about_primary_text: string;
  about_secondary_text: string;
  about_focus_heading: string;
};

type FocusForm = {
  title: string;
  display_order: number;
  is_visible: boolean;
};

type AboutManagerProps = {
  userId: string;
  initialSectionContent: SectionContent;
  initialCareerFocus: CareerFocusItem[];
};

const emptyFocusForm: FocusForm = {
  title: "",
  display_order: 0,
  is_visible: true,
};

export default function AboutManager({
  userId,
  initialSectionContent,
  initialCareerFocus,
}: AboutManagerProps) {
  const [sectionContent, setSectionContent] =
    useState<SectionContent>(initialSectionContent);

  const [focusItems, setFocusItems] =
    useState<CareerFocusItem[]>(initialCareerFocus);

  const [focusForm, setFocusForm] =
    useState<FocusForm>(emptyFocusForm);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [savingSection, setSavingSection] =
    useState(false);

  const [savingFocus, setSavingFocus] =
    useState(false);

  const [sectionMessage, setSectionMessage] =
    useState("");

  const [focusMessage, setFocusMessage] =
    useState("");

  const [error, setError] = useState("");

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/40";

  const labelClass =
    "text-sm font-medium text-white/60";

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

  function updateFocusField<K extends keyof FocusForm>(
    field: K,
    value: FocusForm[K]
  ) {
    setFocusForm((current) => ({
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
      about_label: sectionContent.about_label.trim(),
      about_heading: sectionContent.about_heading.trim(),
      about_primary_text:
        sectionContent.about_primary_text.trim(),
      about_secondary_text:
        sectionContent.about_secondary_text.trim(),
      about_focus_heading:
        sectionContent.about_focus_heading.trim(),
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
      "About section text saved successfully."
    );
    setSavingSection(false);
  }

  function resetFocusForm() {
    setFocusForm(emptyFocusForm);
    setEditingId(null);
    setFocusMessage("");
    setError("");
  }

  function startEdit(item: CareerFocusItem) {
    setEditingId(item.id);

    setFocusForm({
      title: item.title,
      display_order: item.display_order,
      is_visible: item.is_visible,
    });

    setFocusMessage("");
    setError("");

    window.scrollTo({
      top: 700,
      behavior: "smooth",
    });
  }

  async function saveFocusItem(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!focusForm.title.trim()) {
      setError("Focus item title is required.");
      return;
    }

    setSavingFocus(true);
    setFocusMessage("");
    setError("");

    const supabase = createClient();

    const itemData = {
      title: focusForm.title.trim(),
      display_order: focusForm.display_order,
      is_visible: focusForm.is_visible,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { data, error } = await supabase
        .from("career_focus")
        .update(itemData)
        .eq("id", editingId)
        .eq("user_id", userId)
        .select("id, title, display_order, is_visible")
        .single();

      if (error) {
        setError(error.message);
        setSavingFocus(false);
        return;
      }

      setFocusItems((current) =>
        current
          .map((item) =>
            item.id === editingId ? data : item
          )
          .sort(
            (a, b) =>
              a.display_order - b.display_order
          )
      );

      setFocusMessage("Focus item updated successfully.");
    } else {
      const { data, error } = await supabase
        .from("career_focus")
        .insert({
          user_id: userId,
          ...itemData,
        })
        .select("id, title, display_order, is_visible")
        .single();

      if (error) {
        setError(error.message);
        setSavingFocus(false);
        return;
      }

      setFocusItems((current) =>
        [...current, data].sort(
          (a, b) =>
            a.display_order - b.display_order
        )
      );

      setFocusMessage("Focus item added successfully.");
    }

    setFocusForm(emptyFocusForm);
    setEditingId(null);
    setSavingFocus(false);
  }

  async function toggleVisibility(item: CareerFocusItem) {
    setError("");

    const supabase = createClient();

    const { data, error } = await supabase
      .from("career_focus")
      .update({
        is_visible: !item.is_visible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id)
      .eq("user_id", userId)
      .select("id, title, display_order, is_visible")
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    setFocusItems((current) =>
      current.map((focusItem) =>
        focusItem.id === item.id ? data : focusItem
      )
    );
  }

  async function deleteItem(item: CareerFocusItem) {
    const confirmed = window.confirm(
      `Delete "${item.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setError("");

    const supabase = createClient();

    const { error } = await supabase
      .from("career_focus")
      .delete()
      .eq("id", item.id)
      .eq("user_id", userId);

    if (error) {
      setError(error.message);
      return;
    }

    setFocusItems((current) =>
      current.filter(
        (focusItem) => focusItem.id !== item.id
      )
    );

    if (editingId === item.id) {
      resetFocusForm();
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
            About Section Information
          </h2>

          <p className="mt-2 max-w-2xl text-sm text-white/40">
            Control all of the main text shown in your About section.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className={labelClass}>
              Small Label
            </label>

            <input
              type="text"
              value={sectionContent.about_label}
              onChange={(event) =>
                updateSectionField(
                  "about_label",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="About"
            />
          </div>

          <div>
            <label className={labelClass}>
              Main Heading
            </label>

            <input
              type="text"
              value={sectionContent.about_heading}
              onChange={(event) =>
                updateSectionField(
                  "about_heading",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Tell visitors who you are."
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>
              Main About Paragraph
            </label>

            <textarea
              rows={5}
              value={sectionContent.about_primary_text}
              onChange={(event) =>
                updateSectionField(
                  "about_primary_text",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Write your main About paragraph..."
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>
              Secondary Paragraph
            </label>

            <textarea
              rows={5}
              value={sectionContent.about_secondary_text}
              onChange={(event) =>
                updateSectionField(
                  "about_secondary_text",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Add a second paragraph if needed..."
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>
              Focus Box Heading
            </label>

            <input
              type="text"
              value={sectionContent.about_focus_heading}
              onChange={(event) =>
                updateSectionField(
                  "about_focus_heading",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Focus Areas"
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
            : "Save About Section"}
        </button>
      </form>

      <form
        onSubmit={saveFocusItem}
        className={sectionClass}
      >
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
              Focus Items
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              {editingId
                ? "Edit Focus Item"
                : "Add Focus Item"}
            </h2>

            <p className="mt-2 text-sm text-white/40">
              These items appear inside the About section focus box.
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetFocusForm}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/[0.05] hover:text-white"
            >
              Cancel Editing
            </button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass}>
              Focus Item
            </label>

            <input
              type="text"
              value={focusForm.title}
              onChange={(event) =>
                updateFocusField(
                  "title",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Example: Product Design"
            />
          </div>

          <div>
            <label className={labelClass}>
              Display Order
            </label>

            <input
              type="number"
              value={focusForm.display_order}
              onChange={(event) =>
                updateFocusField(
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
                checked={focusForm.is_visible}
                onChange={(event) =>
                  updateFocusField(
                    "is_visible",
                    event.target.checked
                  )
                }
                className="h-4 w-4"
              />

              Show this item publicly
            </label>
          </div>
        </div>

        {focusMessage && (
          <div className="mt-6 rounded-xl border border-green-400/20 bg-green-400/10 p-3 text-sm text-green-300">
            {focusMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={savingFocus}
          className="mt-8 rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-6 py-3 font-medium text-cyan-200 transition hover:bg-cyan-300/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {savingFocus
            ? "Saving..."
            : editingId
              ? "Update Focus Item"
              : "Add Focus Item"}
        </button>
      </form>

      <section className={sectionClass}>
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
            Current Content
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Existing Focus Items
          </h2>
        </div>

        {focusItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-white/40">
            No focus items added yet.
          </div>
        ) : (
          <div className="space-y-4">
            {focusItems.map((item) => (
              <article
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold">
                      {item.title}
                    </h3>

                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        item.is_visible
                          ? "bg-green-400/10 text-green-300"
                          : "bg-white/5 text-white/40"
                      }`}
                    >
                      {item.is_visible
                        ? "Visible"
                        : "Hidden"}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-white/40">
                    Order: {item.display_order}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="rounded-lg border border-cyan-300/20 px-4 py-2 text-sm text-cyan-300 transition hover:bg-cyan-300/10"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      toggleVisibility(item)
                    }
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/[0.05] hover:text-white"
                  >
                    {item.is_visible
                      ? "Hide"
                      : "Show"}
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteItem(item)}
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
          href="/#about"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-sm font-medium text-cyan-200 transition hover:bg-cyan-300/20 hover:text-white"
        >
          Preview About ↗
        </a>
      </div>
    </div>
  );
}