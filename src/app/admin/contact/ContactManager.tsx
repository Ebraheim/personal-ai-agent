"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ContactContent = {
  contact_label: string;
  contact_heading: string;
  contact_description: string;
  location: string;
  email: string;
  linkedin_url: string;
  github_url: string;
};

type ContactManagerProps = {
  userId: string;
  initialContent: ContactContent;
};

export default function ContactManager({
  userId,
  initialContent,
}: ContactManagerProps) {
  const [form, setForm] =
    useState<ContactContent>(initialContent);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/40";

  const labelClass =
    "text-sm font-medium text-white/60";

  const sectionClass =
    "rounded-3xl border border-white/10 bg-white/[0.025] p-6 md:p-8";

  function updateField(
    field: keyof ContactContent,
    value: string
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

    const { data: existingContent, error: findError } =
      await supabase
        .from("site_content")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

    if (findError) {
      setError(findError.message);
      setSaving(false);
      return;
    }

    const siteContentData = {
      contact_label: form.contact_label.trim(),
      contact_heading: form.contact_heading.trim(),
      contact_description: form.contact_description.trim(),
      updated_at: new Date().toISOString(),
    };

    if (existingContent) {
      const { error: updateSiteError } = await supabase
        .from("site_content")
        .update(siteContentData)
        .eq("user_id", userId);

      if (updateSiteError) {
        setError(updateSiteError.message);
        setSaving(false);
        return;
      }
    } else {
      const { error: insertSiteError } = await supabase
        .from("site_content")
        .insert({
          user_id: userId,
          ...siteContentData,
        });

      if (insertSiteError) {
        setError(insertSiteError.message);
        setSaving(false);
        return;
      }
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        location: form.location.trim(),
        email: form.email.trim(),
        linkedin_url: form.linkedin_url.trim(),
        github_url: form.github_url.trim(),
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      setError(profileError.message);
      setSaving(false);
      return;
    }

    setMessage("Contact section saved successfully.");
    setSaving(false);
  }

  return (
    <form
      onSubmit={handleSave}
      className="space-y-8"
    >
      <section className={sectionClass}>
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
            Section Text
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Contact Section Information
          </h2>

          <p className="mt-2 max-w-2xl text-sm text-white/40">
            These fields control the text shown at the top of your public Contact section.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
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

          <div className="md:col-span-2">
            <label className={labelClass}>
              Contact Description
            </label>

            <textarea
              rows={5}
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

      <section className={sectionClass}>
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
            Contact Details
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Links & Information
          </h2>

          <p className="mt-2 max-w-2xl text-sm text-white/40">
            Update the contact details used by the buttons on your public website.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className={labelClass}>
              Email
            </label>

            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                updateField(
                  "email",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className={labelClass}>
              Location
            </label>

            <input
              type="text"
              value={form.location}
              onChange={(event) =>
                updateField(
                  "location",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Dubai, UAE"
            />
          </div>

          <div>
            <label className={labelClass}>
              LinkedIn URL
            </label>

            <input
              type="url"
              value={form.linkedin_url}
              onChange={(event) =>
                updateField(
                  "linkedin_url",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="https://linkedin.com/in/..."
            />
          </div>

          <div>
            <label className={labelClass}>
              GitHub URL
            </label>

            <input
              type="url"
              value={form.github_url}
              onChange={(event) =>
                updateField(
                  "github_url",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="https://github.com/..."
            />
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
              CV / Resume
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Manage CV
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-white/40">
              Upload, replace, view, or remove the CV used by the public Download CV button.
            </p>
          </div>

          <a
            href="/admin/cv"
            className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-sm font-medium text-cyan-200 transition hover:bg-cyan-300/20 hover:text-white"
          >
            Open CV Manager →
          </a>
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

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-cyan-300 px-7 py-3.5 font-semibold text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : "Save Contact Section"}
        </button>

        <a
          href="/#contact"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-white/10 px-5 py-3 text-sm text-white/60 transition hover:bg-white/[0.05] hover:text-white"
        >
          Preview Contact ↗
        </a>
      </div>
    </form>
  );
}