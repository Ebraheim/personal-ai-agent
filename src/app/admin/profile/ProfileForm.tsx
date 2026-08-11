"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ProfileData = {
  full_name: string;
  professional_title: string;
  hero_tagline: string;
  bio: string;
  location: string;
  email: string;
  linkedin_url: string;
  github_url: string;
};

type ProfileFormProps = {
  userId: string;
  initialProfile: ProfileData;
};

export default function ProfileForm({
  userId,
  initialProfile,
}: ProfileFormProps) {
  const [form, setForm] = useState<ProfileData>(initialProfile);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(field: keyof ProfileData, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    const supabase = createClient();

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: form.full_name,
      professional_title: form.professional_title,
      hero_tagline: form.hero_tagline,
      bio: form.bio,
      location: form.location,
      email: form.email,
      linkedin_url: form.linkedin_url,
      github_url: form.github_url,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setMessage("Profile saved successfully.");
    setSaving(false);
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/40";

  const labelClass = "text-sm text-white/60";

  return (
    <form
      onSubmit={handleSave}
      className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className={labelClass}>Full Name</label>

          <input
            type="text"
            value={form.full_name}
            onChange={(event) =>
              updateField("full_name", event.target.value)
            }
            className={inputClass}
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className={labelClass}>Professional Title</label>

          <input
            type="text"
            value={form.professional_title}
            onChange={(event) =>
              updateField("professional_title", event.target.value)
            }
            className={inputClass}
            placeholder="Computer & Autonomous Systems Engineer"
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Hero Tagline</label>

          <input
            type="text"
            value={form.hero_tagline}
            onChange={(event) =>
              updateField("hero_tagline", event.target.value)
            }
            className={inputClass}
            placeholder="AI • Robotics • Autonomous Systems"
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Bio</label>

          <textarea
            rows={6}
            value={form.bio}
            onChange={(event) => updateField("bio", event.target.value)}
            className={inputClass}
            placeholder="Write a short professional biography..."
          />
        </div>

        <div>
          <label className={labelClass}>Location</label>

          <input
            type="text"
            value={form.location}
            onChange={(event) =>
              updateField("location", event.target.value)
            }
            className={inputClass}
            placeholder="Fujairah, UAE"
          />
        </div>

        <div>
          <label className={labelClass}>Email</label>

          <input
            type="email"
            value={form.email}
            onChange={(event) =>
              updateField("email", event.target.value)
            }
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className={labelClass}>LinkedIn URL</label>

          <input
            type="url"
            value={form.linkedin_url}
            onChange={(event) =>
              updateField("linkedin_url", event.target.value)
            }
            className={inputClass}
            placeholder="https://linkedin.com/in/..."
          />
        </div>

        <div>
          <label className={labelClass}>GitHub URL</label>

          <input
            type="url"
            value={form.github_url}
            onChange={(event) =>
              updateField("github_url", event.target.value)
            }
            className={inputClass}
            placeholder="https://github.com/..."
          />
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

      <div className="mt-8 flex flex-wrap gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-6 py-3 font-medium text-cyan-200 transition hover:bg-cyan-300/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>

        <a
          href="/admin/dashboard"
          className="rounded-xl border border-white/10 px-6 py-3 font-medium text-white/60 transition hover:bg-white/[0.05] hover:text-white"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}