"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Certification = {
  id: string;
  title: string;
  issuer: string | null;
  credential_url: string | null;
  status: string;
  issue_date: string | null;
  expiry_date: string | null;
  display_order: number;
  is_visible: boolean;
};

type CertificationForm = {
  title: string;
  issuer: string;
  credential_url: string;
  status: string;
  issue_date: string;
  expiry_date: string;
  display_order: number;
  is_visible: boolean;
};

type SectionContent = {
  certifications_label: string;
  certifications_heading: string;
  certifications_description: string;
};

type CertificationsManagerProps = {
  userId: string;
  initialCertifications: Certification[];
  initialSectionContent: SectionContent;
};

const emptyForm: CertificationForm = {
  title: "",
  issuer: "",
  credential_url: "",
  status: "completed",
  issue_date: "",
  expiry_date: "",
  display_order: 0,
  is_visible: true,
};

export default function CertificationsManager({
  userId,
  initialCertifications,
  initialSectionContent,
}: CertificationsManagerProps) {
  const [certifications, setCertifications] =
    useState<Certification[]>(initialCertifications);

  const [sectionContent, setSectionContent] =
    useState<SectionContent>(initialSectionContent);

  const [form, setForm] = useState<CertificationForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [savingSection, setSavingSection] = useState(false);
  const [savingCertification, setSavingCertification] = useState(false);

  const [sectionMessage, setSectionMessage] = useState("");
  const [certificationMessage, setCertificationMessage] = useState("");
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

  function updateField<K extends keyof CertificationForm>(
    field: K,
    value: CertificationForm[K]
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
      certifications_label:
        sectionContent.certifications_label.trim(),
      certifications_heading:
        sectionContent.certifications_heading.trim(),
      certifications_description:
        sectionContent.certifications_description.trim(),
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
      "Certifications section text saved successfully."
    );
    setSavingSection(false);
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setCertificationMessage("");
    setError("");
  }

  function startEdit(certification: Certification) {
    setEditingId(certification.id);

    setForm({
      title: certification.title ?? "",
      issuer: certification.issuer ?? "",
      credential_url: certification.credential_url ?? "",
      status: certification.status ?? "completed",
      issue_date: certification.issue_date ?? "",
      expiry_date: certification.expiry_date ?? "",
      display_order: certification.display_order ?? 0,
      is_visible: certification.is_visible ?? true,
    });

    setCertificationMessage("");
    setError("");

    window.scrollTo({
      top: 520,
      behavior: "smooth",
    });
  }

  async function handleSave(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Certification title is required.");
      return;
    }

    setSavingCertification(true);
    setCertificationMessage("");
    setError("");

    const supabase = createClient();

    const certificationData = {
      title: form.title.trim(),
      issuer: form.issuer.trim(),
      credential_url: form.credential_url.trim(),
      status: form.status,
      issue_date: form.issue_date || null,
      expiry_date: form.expiry_date || null,
      display_order: form.display_order,
      is_visible: form.is_visible,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { data, error } = await supabase
        .from("certifications")
        .update(certificationData)
        .eq("id", editingId)
        .eq("user_id", userId)
        .select(
          "id, title, issuer, credential_url, status, issue_date, expiry_date, display_order, is_visible"
        )
        .single();

      if (error) {
        setError(error.message);
        setSavingCertification(false);
        return;
      }

      setCertifications((current) =>
        current
          .map((certification) =>
            certification.id === editingId ? data : certification
          )
          .sort(
            (a, b) =>
              a.display_order - b.display_order
          )
      );

      setCertificationMessage(
        "Certification updated successfully."
      );
    } else {
      const { data, error } = await supabase
        .from("certifications")
        .insert({
          user_id: userId,
          ...certificationData,
        })
        .select(
          "id, title, issuer, credential_url, status, issue_date, expiry_date, display_order, is_visible"
        )
        .single();

      if (error) {
        setError(error.message);
        setSavingCertification(false);
        return;
      }

      setCertifications((current) =>
        [...current, data].sort(
          (a, b) =>
            a.display_order - b.display_order
        )
      );

      setCertificationMessage(
        "Certification added successfully."
      );
    }

    setForm(emptyForm);
    setEditingId(null);
    setSavingCertification(false);
  }

  async function toggleVisibility(
    certification: Certification
  ) {
    setError("");

    const supabase = createClient();

    const { data, error } = await supabase
      .from("certifications")
      .update({
        is_visible: !certification.is_visible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", certification.id)
      .eq("user_id", userId)
      .select(
        "id, title, issuer, credential_url, status, issue_date, expiry_date, display_order, is_visible"
      )
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    setCertifications((current) =>
      current.map((item) =>
        item.id === certification.id ? data : item
      )
    );
  }

  async function deleteCertification(
    certification: Certification
  ) {
    const confirmed = window.confirm(
      `Delete "${certification.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setError("");

    const supabase = createClient();

    const { error } = await supabase
      .from("certifications")
      .delete()
      .eq("id", certification.id)
      .eq("user_id", userId);

    if (error) {
      setError(error.message);
      return;
    }

    setCertifications((current) =>
      current.filter((item) => item.id !== certification.id)
    );

    if (editingId === certification.id) {
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
            Certifications Section Information
          </h2>

          <p className="mt-2 max-w-2xl text-sm text-white/40">
            These fields control the label, heading, and description shown
            above your certifications.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className={labelClass}>
              Small Label
            </label>

            <input
              type="text"
              value={sectionContent.certifications_label}
              onChange={(event) =>
                updateSectionField(
                  "certifications_label",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Certifications"
            />
          </div>

          <div>
            <label className={labelClass}>
              Main Heading
            </label>

            <input
              type="text"
              value={sectionContent.certifications_heading}
              onChange={(event) =>
                updateSectionField(
                  "certifications_heading",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Qualifications & Credentials"
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>
              Section Description
            </label>

            <textarea
              rows={4}
              value={sectionContent.certifications_description}
              onChange={(event) =>
                updateSectionField(
                  "certifications_description",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Explain the certifications, credentials, awards, qualifications, or training shown here..."
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
            : "Save Certifications Section"}
        </button>
      </form>

      <form
        onSubmit={handleSave}
        className={sectionClass}
      >
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
              Certification Cards
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              {editingId
                ? "Edit Certification"
                : "Add Certification"}
            </h2>

            <p className="mt-2 text-sm text-white/40">
              Add or update an individual certification shown in this section.
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
              Certification Title
            </label>

            <input
              type="text"
              required
              value={form.title}
              onChange={(event) =>
                updateField("title", event.target.value)
              }
              className={inputClass}
              placeholder="Certification title"
            />
          </div>

          <div>
            <label className={labelClass}>
              Issuer
            </label>

            <input
              type="text"
              value={form.issuer}
              onChange={(event) =>
                updateField("issuer", event.target.value)
              }
              className={inputClass}
              placeholder="Issuer or organization"
            />
          </div>

          <div>
            <label className={labelClass}>
              Credential URL
            </label>

            <input
              type="url"
              value={form.credential_url}
              onChange={(event) =>
                updateField(
                  "credential_url",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className={labelClass}>
              Status
            </label>

            <select
              value={form.status}
              onChange={(event) =>
                updateField("status", event.target.value)
              }
              className={inputClass}
            >
              <option value="completed">
                Completed
              </option>

              <option value="in-progress">
                In Progress
              </option>

              <option value="planned">
                Planned
              </option>
            </select>
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

          <div>
            <label className={labelClass}>
              Issue Date
            </label>

            <input
              type="date"
              value={form.issue_date}
              onChange={(event) =>
                updateField(
                  "issue_date",
                  event.target.value
                )
              }
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Expiry Date
            </label>

            <input
              type="date"
              value={form.expiry_date}
              onChange={(event) =>
                updateField(
                  "expiry_date",
                  event.target.value
                )
              }
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-3 text-sm text-white/60">
              <input
                type="checkbox"
                checked={form.is_visible}
                onChange={(event) =>
                  updateField(
                    "is_visible",
                    event.target.checked
                  )
                }
                className="h-4 w-4"
              />

              Show this certification publicly
            </label>
          </div>
        </div>

        {certificationMessage && (
          <div className="mt-6 rounded-xl border border-green-400/20 bg-green-400/10 p-3 text-sm text-green-300">
            {certificationMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={savingCertification}
          className="mt-8 rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-6 py-3 font-medium text-cyan-200 transition hover:bg-cyan-300/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {savingCertification
            ? "Saving..."
            : editingId
              ? "Update Certification"
              : "Add Certification"}
        </button>
      </form>

      <section className={sectionClass}>
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
            Current Content
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Existing Certifications
          </h2>
        </div>

        {certifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-white/40">
            No certifications added yet.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {certifications.map((certification) => (
              <article
                key={certification.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                      {certification.status.replaceAll("-", " ")}
                    </p>

                    <h3 className="mt-2 text-xl font-semibold">
                      {certification.title}
                    </h3>

                    {certification.issuer && (
                      <p className="mt-2 text-sm text-white/50">
                        {certification.issuer}
                      </p>
                    )}

                    <p className="mt-4 text-xs text-white/30">
                      Order: {certification.display_order}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      certification.is_visible
                        ? "bg-green-400/10 text-green-300"
                        : "bg-white/5 text-white/40"
                    }`}
                  >
                    {certification.is_visible
                      ? "Visible"
                      : "Hidden"}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      startEdit(certification)
                    }
                    className="rounded-lg border border-cyan-300/20 px-4 py-2 text-sm text-cyan-300 transition hover:bg-cyan-300/10"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      toggleVisibility(certification)
                    }
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/[0.05] hover:text-white"
                  >
                    {certification.is_visible
                      ? "Hide"
                      : "Show"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteCertification(certification)
                    }
                    className="rounded-lg border border-red-400/20 px-4 py-2 text-sm text-red-300 transition hover:bg-red-400/10"
                  >
                    Delete
                  </button>

                  {certification.credential_url && (
                    <a
                      href={certification.credential_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      Credential ↗
                    </a>
                  )}
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
          href="/#certifications"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-sm font-medium text-cyan-200 transition hover:bg-cyan-300/20 hover:text-white"
        >
          Preview Certifications ↗
        </a>
      </div>
    </div>
  );
}