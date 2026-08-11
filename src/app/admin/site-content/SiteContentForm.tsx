"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type SiteContent = {
  id?: string;
  about_label: string | null;
  about_heading: string | null;
  about_secondary_text: string | null;
  projects_label: string | null;
  projects_description: string | null;
  contact_label: string | null;
  contact_heading: string | null;
  contact_description: string | null;
};

type SiteContentFormProps = {
  userId: string;
  initialContent: SiteContent | null;
};

type FormState = {
  about_label: string;
  about_heading: string;
  about_secondary_text: string;
  projects_label: string;
  projects_description: string;
  contact_label: string;
  contact_heading: string;
  contact_description: string;
};

export default function SiteContentForm({
  userId,
  initialContent,
}: SiteContentFormProps) {
  const [form, setForm] = useState<FormState>({
    about_label: initialContent?.about_label ?? "",
    about_heading: initialContent?.about_heading ?? "",
    about_secondary_text:
      initialContent?.about_secondary_text ?? "",

    projects_label: initialContent?.projects_label ?? "",
    projects_description:
      initialContent?.projects_description ?? "",

    contact_label: initialContent?.contact_label ?? "",
    contact_heading: initialContent?.contact_heading ?? "",
    contact_description:
      initialContent?.contact_description ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSave(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    const supabase = createClient();

    const { error } = await supabase
      .from("site_content")
      .upsert(
        {
          user_id: userId,

          about_label: form.about_label.trim(),
          about_heading: form.about_heading.trim(),
          about_secondary_text:
            form.about_secondary_text.trim(),

          projects_label: form.projects_label.trim(),
          projects_description:
            form.projects_description.trim(),

          contact_label: form.contact_label.trim(),
          contact_heading: form.contact_heading.trim(),
          contact_description:
            form.contact_description.trim(),

          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setMessage("Website content saved successfully.");
    setSaving(false);
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/40";

  const labelClass =
    "text-sm text-white/60";

  const sectionClass =
    "rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8";

  return (
    <form
      onSubmit={handleSave}
      className="space-y-8"
    >
      {/* ABOUT */}
      <section className={sectionClass}>
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
          About Section
        </p>

        <h2 className="mt-2 text-2xl font-semibold">
          About Text
        </h2>

        <div className="mt-6 space-y-6">
          <div>
            <label className={labelClass}>
              Small Label
            </label>

            <input
              type="text"
              value={form.about_label}
              onChange={(event) =>
                updateField(
                  "about_label",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="About Me"
            />
          </div>

          <div>
            <label className={labelClass}>
              Main Heading
            </label>

            <input
              type="text"
              value={form.about_heading}
              onChange={(event) =>
                updateField(
                  "about_heading",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Building practical AI and autonomous systems."
            />
          </div>

          <div>
            <label className={labelClass}>
              Secondary About Text
            </label>

            <textarea
              rows={5}
              value={form.about_secondary_text}
              onChange={(event) =>
                updateField(
                  "about_secondary_text",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Tell visitors more about your work, business, or background..."
            />
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section className={sectionClass}>
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
          Projects Section
        </p>

        <h2 className="mt-2 text-2xl font-semibold">
          Projects Text
        </h2>

        <div className="mt-6 space-y-6">
          <div>
            <label className={labelClass}>
              Small Label
            </label>

            <input
              type="text"
              value={form.projects_label}
              onChange={(event) =>
                updateField(
                  "projects_label",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Selected Work"
            />
          </div>

          <div>
            <label className={labelClass}>
              Projects Description
            </label>

            <textarea
              rows={4}
              value={form.projects_description}
              onChange={(event) =>
                updateField(
                  "projects_description",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Describe the type of work, services, products, or projects shown here..."
            />
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className={sectionClass}>
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
          Contact Section
        </p>

        <h2 className="mt-2 text-2xl font-semibold">
          Contact Text
        </h2>

        <div className="mt-6 space-y-6">
          <div>
            <label className={labelClass}>
              Small Label
            </label>

            <input
              type="text"
              value={form.contact_label}
              onChange={(event) =>
                updateField(
                  "contact_label",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Contact"
            />
          </div>

          <div>
            <label className={labelClass}>
              Main Heading
            </label>

            <input
              type="text"
              value={form.contact_heading}
              onChange={(event) =>
                updateField(
                  "contact_heading",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Let's build something useful."
            />
          </div>

          <div>
            <label className={labelClass}>
              Contact Description
            </label>

            <textarea
              rows={4}
              value={form.contact_description}
              onChange={(event) =>
                updateField(
                  "contact_description",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Tell visitors why they should contact you..."
            />
          </div>
        </div>
      </section>

      {message && (
        <div className="rounded-xl border border-green-400/20 bg-green-400/10 p-4 text-sm text-green-300">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-7 py-3.5 font-medium text-cyan-200 transition hover:bg-cyan-300/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving
          ? "Saving..."
          : "Save Website Text"}
      </button>
    </form>
  );
}