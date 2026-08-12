"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type HomeProfile = {
  full_name: string;
  professional_title: string;
  hero_tagline: string;
  bio: string;
};

type HeroHighlight = {
  id: string;
  label: string;
  display_order: number;
  is_visible: boolean;
};

type HomeEditorProps = {
  userId: string;
  initialProfile: HomeProfile;
  initialHighlights: HeroHighlight[];
};

type HighlightForm = {
  label: string;
  display_order: number;
  is_visible: boolean;
};

const emptyHighlight: HighlightForm = {
  label: "",
  display_order: 0,
  is_visible: true,
};

export default function HomeEditor({
  userId,
  initialProfile,
  initialHighlights,
}: HomeEditorProps) {
  const [profile, setProfile] =
    useState<HomeProfile>(initialProfile);

  const [highlights, setHighlights] =
    useState<HeroHighlight[]>(initialHighlights);

  const [highlightForm, setHighlightForm] =
    useState<HighlightForm>(emptyHighlight);

  const [editingHighlightId, setEditingHighlightId] =
    useState<string | null>(null);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [savingHighlight, setSavingHighlight] =
    useState(false);

  const [profileMessage, setProfileMessage] =
    useState("");

  const [highlightMessage, setHighlightMessage] =
    useState("");

  const [error, setError] = useState("");

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/40";

  const labelClass =
    "text-sm font-medium text-white/60";

  const sectionClass =
    "rounded-3xl border border-white/10 bg-white/[0.025] p-6 md:p-8";

  async function regenerateSuggestedQuestions() {
    try {
      const response = await fetch("/api/chat/suggestions/regenerate", {
        method: "POST",
        cache: "no-store",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.warn(
          "Suggested question regeneration failed:",
          data.error || response.statusText
        );
      }
    } catch (regenerationError) {
      console.warn(
        "Could not regenerate suggested questions:",
        regenerationError
      );
    }
  }

  function updateProfile(
    field: keyof HomeProfile,
    value: string
  ) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateHighlight<K extends keyof HighlightForm>(
    field: K,
    value: HighlightForm[K]
  ) {
    setHighlightForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveHomeProfile(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSavingProfile(true);
    setProfileMessage("");
    setError("");

    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        full_name: profile.full_name.trim(),
        professional_title:
          profile.professional_title.trim(),
        hero_tagline: profile.hero_tagline.trim(),
        bio: profile.bio.trim(),
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      setError(error.message);
      setSavingProfile(false);
      return;
    }

    await regenerateSuggestedQuestions();

    setProfileMessage(
      "Home information saved successfully."
    );

    setSavingProfile(false);
  }

  function startEditHighlight(
    item: HeroHighlight
  ) {
    setEditingHighlightId(item.id);

    setHighlightForm({
      label: item.label,
      display_order: item.display_order,
      is_visible: item.is_visible,
    });

    setHighlightMessage("");
    setError("");
  }

  function cancelHighlightEdit() {
    setEditingHighlightId(null);
    setHighlightForm(emptyHighlight);
    setHighlightMessage("");
    setError("");
  }

  async function saveHighlight(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!highlightForm.label.trim()) {
      setError("Highlight text is required.");
      return;
    }

    setSavingHighlight(true);
    setHighlightMessage("");
    setError("");

    const supabase = createClient();

    const dataToSave = {
      label: highlightForm.label.trim(),
      display_order:
        highlightForm.display_order,
      is_visible:
        highlightForm.is_visible,
      updated_at: new Date().toISOString(),
    };

    if (editingHighlightId) {
      const { data, error } = await supabase
        .from("hero_highlights")
        .update(dataToSave)
        .eq("id", editingHighlightId)
        .eq("user_id", userId)
        .select(
          "id, label, display_order, is_visible"
        )
        .single();

      if (error) {
        setError(error.message);
        setSavingHighlight(false);
        return;
      }

      setHighlights((current) =>
        current
          .map((item) =>
            item.id === editingHighlightId
              ? data
              : item
          )
          .sort(
            (a, b) =>
              a.display_order -
              b.display_order
          )
      );

      setHighlightMessage(
        "Highlight updated successfully."
      );
    } else {
      const { data, error } = await supabase
        .from("hero_highlights")
        .insert({
          user_id: userId,
          ...dataToSave,
        })
        .select(
          "id, label, display_order, is_visible"
        )
        .single();

      if (error) {
        setError(error.message);
        setSavingHighlight(false);
        return;
      }

      setHighlights((current) =>
        [...current, data].sort(
          (a, b) =>
            a.display_order -
            b.display_order
        )
      );

      setHighlightMessage(
        "Highlight added successfully."
      );
    }

    await regenerateSuggestedQuestions();

    setHighlightForm(emptyHighlight);
    setEditingHighlightId(null);
    setSavingHighlight(false);
  }

  async function toggleHighlight(
    item: HeroHighlight
  ) {
    setError("");

    const supabase = createClient();

    const { data, error } = await supabase
      .from("hero_highlights")
      .update({
        is_visible: !item.is_visible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id)
      .eq("user_id", userId)
      .select(
        "id, label, display_order, is_visible"
      )
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    setHighlights((current) =>
      current.map((highlight) =>
        highlight.id === item.id
          ? data
          : highlight
      )
    );

    await regenerateSuggestedQuestions();
  }

  async function deleteHighlight(
    item: HeroHighlight
  ) {
    const confirmed = window.confirm(
      `Delete "${item.label}"?`
    );

    if (!confirmed) return;

    setError("");

    const supabase = createClient();

    const { error } = await supabase
      .from("hero_highlights")
      .delete()
      .eq("id", item.id)
      .eq("user_id", userId);

    if (error) {
      setError(error.message);
      return;
    }

    setHighlights((current) =>
      current.filter(
        (highlight) =>
          highlight.id !== item.id
      )
    );

    if (editingHighlightId === item.id) {
      cancelHighlightEdit();
    }

    await regenerateSuggestedQuestions();
  }

  return (
    <div className="space-y-8">
      {/* HOME INTRODUCTION */}
      <form
        onSubmit={saveHomeProfile}
        className={sectionClass}
      >
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
            Main Hero
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Main Home Information
          </h2>

          <p className="mt-2 text-sm text-white/40">
            These fields control the large introduction visitors see at the
            top of your website.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass}>
              Name or Business Name
            </label>

            <input
              type="text"
              value={profile.full_name}
              onChange={(event) =>
                updateProfile(
                  "full_name",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Your name or business name"
            />
          </div>

          <div>
            <label className={labelClass}>
              Main Title
            </label>

            <input
              type="text"
              value={
                profile.professional_title
              }
              onChange={(event) =>
                updateProfile(
                  "professional_title",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Engineer, Gym, Restaurant, Consultant..."
            />
          </div>

          <div>
            <label className={labelClass}>
              Short Tagline
            </label>

            <input
              type="text"
              value={profile.hero_tagline}
              onChange={(event) =>
                updateProfile(
                  "hero_tagline",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="A short message about what you do"
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>
              Introduction
            </label>

            <textarea
              rows={5}
              value={profile.bio}
              onChange={(event) =>
                updateProfile(
                  "bio",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Briefly explain who you are and what visitors should know..."
            />
          </div>
        </div>

        {profileMessage && (
          <div className="mt-6 rounded-xl border border-green-400/20 bg-green-400/10 p-3 text-sm text-green-300">
            {profileMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={savingProfile}
          className="mt-8 rounded-xl bg-cyan-300 px-6 py-3 font-semibold text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {savingProfile
            ? "Saving..."
            : "Save Home Information"}
        </button>
      </form>

      {/* HERO HIGHLIGHTS */}
      <section className={sectionClass}>
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
            Highlights
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Home Highlights
          </h2>

          <p className="mt-2 max-w-2xl text-sm text-white/40">
            These are the short words or phrases displayed underneath the main
            Home buttons.
          </p>
        </div>

        <form
          onSubmit={saveHighlight}
          className="rounded-2xl border border-white/10 bg-black/10 p-5"
        >
          <div className="grid gap-5 md:grid-cols-[1fr_160px]">
            <div>
              <label className={labelClass}>
                Highlight
              </label>

              <input
                type="text"
                value={highlightForm.label}
                onChange={(event) =>
                  updateHighlight(
                    "label",
                    event.target.value
                  )
                }
                className={inputClass}
                placeholder="Example: Personal Training"
              />
            </div>

            <div>
              <label className={labelClass}>
                Display Order
              </label>

              <input
                type="number"
                value={
                  highlightForm.display_order
                }
                onChange={(event) =>
                  updateHighlight(
                    "display_order",
                    Number(
                      event.target.value
                    )
                  )
                }
                className={inputClass}
              />
            </div>
          </div>

          <label className="mt-5 flex items-center gap-3 text-sm text-white/60">
            <input
              type="checkbox"
              checked={
                highlightForm.is_visible
              }
              onChange={(event) =>
                updateHighlight(
                  "is_visible",
                  event.target.checked
                )
              }
            />

            Show this highlight publicly
          </label>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={savingHighlight}
              className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-5 py-2.5 text-sm font-medium text-cyan-200 transition hover:bg-cyan-300/20 disabled:opacity-50"
            >
              {savingHighlight
                ? "Saving..."
                : editingHighlightId
                  ? "Update Highlight"
                  : "Add Highlight"}
            </button>

            {editingHighlightId && (
              <button
                type="button"
                onClick={
                  cancelHighlightEdit
                }
                className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-white/50 transition hover:bg-white/5 hover:text-white"
              >
                Cancel
              </button>
            )}
          </div>

          {highlightMessage && (
            <p className="mt-4 text-sm text-green-300">
              {highlightMessage}
            </p>
          )}
        </form>

        <div className="mt-6 space-y-3">
          {highlights.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-white/35">
              No highlights yet.
            </div>
          ) : (
            highlights.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.025] p-4"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-medium">
                      {item.label}
                    </p>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs ${
                        item.is_visible
                          ? "bg-green-400/10 text-green-300"
                          : "bg-white/5 text-white/35"
                      }`}
                    >
                      {item.is_visible
                        ? "Visible"
                        : "Hidden"}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-white/30">
                    Order {item.display_order}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      startEditHighlight(
                        item
                      )
                    }
                    className="rounded-lg border border-cyan-300/20 px-3 py-2 text-sm text-cyan-300 transition hover:bg-cyan-300/10"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      toggleHighlight(item)
                    }
                    className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/50 transition hover:bg-white/5 hover:text-white"
                  >
                    {item.is_visible
                      ? "Hide"
                      : "Show"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteHighlight(item)
                    }
                    className="rounded-lg border border-red-400/20 px-3 py-2 text-sm text-red-300 transition hover:bg-red-400/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* BOTTOM ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8">
        <a
          href="/admin/dashboard"
          className="text-sm text-white/40 transition hover:text-white"
        >
          ← Dashboard
        </a>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-sm font-medium text-cyan-200 transition hover:bg-cyan-300/20 hover:text-white"
        >
          Preview Home ↗
        </a>
      </div>
    </div>
  );
}