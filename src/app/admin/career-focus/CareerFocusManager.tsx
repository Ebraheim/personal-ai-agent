"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type CareerFocusItem = {
  id: string;
  title: string;
  display_order: number;
  is_visible: boolean;
};

type CareerFocusManagerProps = {
  userId: string;
  initialCareerFocus: CareerFocusItem[];
};

type CareerFocusForm = {
  title: string;
  display_order: number;
  is_visible: boolean;
};

const emptyForm: CareerFocusForm = {
  title: "",
  display_order: 0,
  is_visible: true,
};

export default function CareerFocusManager({
  userId,
  initialCareerFocus,
}: CareerFocusManagerProps) {
  const [items, setItems] =
    useState<CareerFocusItem[]>(initialCareerFocus);

  const [form, setForm] = useState<CareerFocusForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField<K extends keyof CareerFocusForm>(
    field: K,
    value: CareerFocusForm[K]
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

  function startEdit(item: CareerFocusItem) {
    setEditingId(item.id);

    setForm({
      title: item.title,
      display_order: item.display_order,
      is_visible: item.is_visible,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Career focus title is required.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    const supabase = createClient();

    const itemData = {
      title: form.title.trim(),
      display_order: form.display_order,
      is_visible: form.is_visible,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { data, error } = await supabase
        .from("career_focus")
        .update(itemData)
        .eq("id", editingId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }

      setItems((current) =>
        current
          .map((item) =>
            item.id === editingId ? data : item
          )
          .sort((a, b) => a.display_order - b.display_order)
      );

      setMessage("Career focus updated successfully.");
    } else {
      const { data, error } = await supabase
        .from("career_focus")
        .insert({
          user_id: userId,
          ...itemData,
        })
        .select()
        .single();

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }

      setItems((current) =>
        [...current, data].sort(
          (a, b) => a.display_order - b.display_order
        )
      );

      setMessage("Career focus added successfully.");
    }

    setForm(emptyForm);
    setEditingId(null);
    setSaving(false);
  }

  async function toggleVisibility(item: CareerFocusItem) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("career_focus")
      .update({
        is_visible: !item.is_visible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    setItems((current) =>
      current.map((careerItem) =>
        careerItem.id === item.id ? data : careerItem
      )
    );
  }

  async function deleteItem(item: CareerFocusItem) {
    const confirmed = window.confirm(
      `Delete "${item.title}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

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

    setItems((current) =>
      current.filter((careerItem) => careerItem.id !== item.id)
    );

    if (editingId === item.id) {
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
              {editingId ? "Editing Career Focus" : "New Career Focus"}
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              {editingId ? "Update Career Focus" : "Add Career Focus"}
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
              Career Focus
            </label>

            <input
              type="text"
              value={form.title}
              onChange={(event) =>
                updateField("title", event.target.value)
              }
              className={inputClass}
              placeholder="AI Engineering"
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

              Show this career focus publicly
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
              ? "Update Career Focus"
              : "Add Career Focus"}
        </button>
      </form>

      <section>
        <div className="mb-5">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
            Portfolio Career Focus
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Existing Career Focus
          </h2>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-white/40">
            No career focus items added yet.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
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
                      {item.is_visible ? "Visible" : "Hidden"}
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
                    onClick={() => toggleVisibility(item)}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/[0.05] hover:text-white"
                  >
                    {item.is_visible ? "Hide" : "Show"}
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
    </div>
  );
}