"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type CVManagerProps = {
  userId: string;
  currentFilePath: string | null;
  hasExistingFile: boolean;
};

type ExtractedProfile = {
  full_name?: string;
  professional_title?: string;
  hero_tagline?: string;
  bio?: string;
  location?: string;
  email?: string;
  linkedin_url?: string;
  github_url?: string;
};

type ExtractedExperience = {
  company?: string;
  role?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  description?: string;
};

type ExtractedEducation = {
  institution?: string;
  degree?: string;
  field?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
};

type ExtractedProject = {
  title?: string;
  short_description?: string;
  full_description?: string;
  technologies?: string;
  status?: string;
};

type ExtractedSkill = {
  title?: string;
  description?: string;
};

type ExtractedCertification = {
  title?: string;
  issuer?: string;
  status?: string;
  issue_date?: string;
  expiry_date?: string;
  credential_url?: string;
};

type ExtractedKnowledge = {
  title?: string;
  category?: string;
  content?: string;
  priority?: number;
};

type ExtractedCV = {
  profile?: ExtractedProfile;
  experience?: ExtractedExperience[];
  education?: ExtractedEducation[];
  projects?: ExtractedProject[];
  skills?: ExtractedSkill[];
  certifications?: ExtractedCertification[];
  knowledge?: ExtractedKnowledge[];
};

type SelectedSections = {
  profile: boolean;
  experience: boolean;
  education: boolean;
  projects: boolean;
  skills: boolean;
  certifications: boolean;
  knowledge: boolean;
};

const defaultSelected: SelectedSections = {
  profile: true,
  experience: true,
  education: true,
  projects: true,
  skills: true,
  certifications: true,
  knowledge: true,
};

export default function CVManager({
  userId,
  currentFilePath,
  hasExistingFile,
}: CVManagerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [hasCV, setHasCV] = useState(hasExistingFile);
  const [activeFilePath, setActiveFilePath] =
    useState<string | null>(currentFilePath);

  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] =
    useState(false);
  const [deleting, setDeleting] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [importing, setImporting] = useState(false);

  const [extractedData, setExtractedData] =
    useState<ExtractedCV | null>(null);

  const [extractedFileName, setExtractedFileName] =
    useState("");

  const [selected, setSelected] =
    useState<SelectedSections>(defaultSelected);

  const [drafts, setDrafts] = useState({
    experience: "[]",
    education: "[]",
    projects: "[]",
    skills: "[]",
    certifications: "[]",
    knowledge: "[]",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/40";

  function setProfileField(
    field: keyof ExtractedProfile,
    value: string
  ) {
    setExtractedData((current) => {
      if (!current) return current;

      return {
        ...current,
        profile: {
          ...(current.profile ?? {}),
          [field]: value,
        },
      };
    });
  }

  function toggleSection(field: keyof SelectedSections) {
    setSelected((current) => ({
      ...current,
      [field]: !current[field],
    }));
  }

  function resetReview() {
    setExtractedData(null);
    setExtractedFileName("");
    setSelected(defaultSelected);
    setDrafts({
      experience: "[]",
      education: "[]",
      projects: "[]",
      skills: "[]",
      certifications: "[]",
      knowledge: "[]",
    });
  }

  async function handleUpload() {
    if (!file) {
      setError("Please choose a PDF file first.");
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("The CV must be smaller than 10 MB.");
      return;
    }

    setUploading(true);
    setMessage("");
    setError("");
    resetReview();

    const supabase = createClient();

    const newFileName = `resume-${Date.now()}.pdf`;
    const newFilePath = `${userId}/${newFileName}`;

    const { error: uploadError } =
      await supabase.storage
        .from("cvs")
        .upload(newFilePath, file, {
          cacheControl: "0",
          upsert: false,
          contentType: "application/pdf",
        });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: existingFiles } =
      await supabase.storage
        .from("cvs")
        .list(userId, {
          limit: 100,
        });

    const oldPaths = (existingFiles ?? [])
      .filter(
        (item) =>
          item.name.toLowerCase().endsWith(".pdf") &&
          item.name !== newFileName
      )
      .map((item) => `${userId}/${item.name}`);

    if (oldPaths.length > 0) {
      const { error: removeOldError } =
        await supabase.storage
          .from("cvs")
          .remove(oldPaths);

      if (removeOldError) {
        console.warn(
          "New CV uploaded, but old CV cleanup failed:",
          removeOldError
        );
      }
    }

    setHasCV(true);
    setActiveFilePath(newFilePath);
    setFile(null);

    setMessage(
      hasCV
        ? "CV replaced successfully. The public website will now use the new CV."
        : "CV uploaded successfully."
    );

    setUploading(false);

    const fileInput = document.getElementById(
      "cv-file"
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = "";
    }
  }

  async function handleDownload() {
    if (!activeFilePath) {
      setError("No CV is currently available.");
      return;
    }

    setDownloading(true);
    setMessage("");
    setError("");

    const supabase = createClient();

    const { data, error } =
      await supabase.storage
        .from("cvs")
        .createSignedUrl(activeFilePath, 60);

    if (error || !data?.signedUrl) {
      setError(
        error?.message ||
          "Could not create CV preview link."
      );
      setDownloading(false);
      return;
    }

    window.open(
      `${data.signedUrl}&v=${Date.now()}`,
      "_blank",
      "noopener,noreferrer"
    );

    setDownloading(false);
  }

  async function handleDelete() {
    if (!activeFilePath) {
      return;
    }

    const confirmed = window.confirm(
      "Delete your uploaded CV? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setMessage("");
    setError("");

    const supabase = createClient();

    const { error } = await supabase.storage
      .from("cvs")
      .remove([activeFilePath]);

    if (error) {
      setError(error.message);
      setDeleting(false);
      return;
    }

    setHasCV(false);
    setActiveFilePath(null);
    setFile(null);
    resetReview();
    setMessage("CV deleted successfully.");
    setDeleting(false);
  }

  async function handleExtractWithAI() {
    if (!hasCV) {
      setError("Upload a CV before extracting information.");
      return;
    }

    setExtracting(true);
    setMessage("");
    setError("");
    resetReview();

    try {
      const response = await fetch("/api/cv/extract", {
        method: "POST",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Could not extract information from the CV."
        );
        return;
      }

      const extracted =
        (data.extracted ?? {}) as ExtractedCV;

      setExtractedData(extracted);
      setExtractedFileName(data.fileName ?? "");

      setDrafts({
        experience: JSON.stringify(
          extracted.experience ?? [],
          null,
          2
        ),
        education: JSON.stringify(
          extracted.education ?? [],
          null,
          2
        ),
        projects: JSON.stringify(
          extracted.projects ?? [],
          null,
          2
        ),
        skills: JSON.stringify(
          extracted.skills ?? [],
          null,
          2
        ),
        certifications: JSON.stringify(
          extracted.certifications ?? [],
          null,
          2
        ),
        knowledge: JSON.stringify(
          extracted.knowledge ?? [],
          null,
          2
        ),
      });

      setSelected(defaultSelected);

      setMessage(
        "CV extraction complete. Review and edit everything below before importing."
      );
    } catch (extractError) {
      console.error("CV extraction request error:", extractError);
      setError("Could not connect to the CV extraction service.");
    } finally {
      setExtracting(false);
    }
  }

  function parseDraft<T>(
    label: string,
    value: string
  ): T[] | null {
    try {
      const parsed = JSON.parse(value);

      if (!Array.isArray(parsed)) {
        setError(`${label} must be a JSON array.`);
        return null;
      }

      return parsed as T[];
    } catch {
      setError(
        `${label} contains invalid JSON. Fix it before importing.`
      );
      return null;
    }
  }

  async function handleConfirmImport() {
    if (!extractedData) {
      return;
    }

    setImporting(true);
    setMessage("");
    setError("");

    const experience = parseDraft<ExtractedExperience>(
      "Experience",
      drafts.experience
    );
    if (!experience) {
      setImporting(false);
      return;
    }

    const education = parseDraft<ExtractedEducation>(
      "Education",
      drafts.education
    );
    if (!education) {
      setImporting(false);
      return;
    }

    const projects = parseDraft<ExtractedProject>(
      "Projects",
      drafts.projects
    );
    if (!projects) {
      setImporting(false);
      return;
    }

    const skills = parseDraft<ExtractedSkill>(
      "Skills",
      drafts.skills
    );
    if (!skills) {
      setImporting(false);
      return;
    }

    const certifications =
      parseDraft<ExtractedCertification>(
        "Certifications",
        drafts.certifications
      );
    if (!certifications) {
      setImporting(false);
      return;
    }

    const knowledge = parseDraft<ExtractedKnowledge>(
      "AI Knowledge",
      drafts.knowledge
    );
    if (!knowledge) {
      setImporting(false);
      return;
    }

    try {
      const response = await fetch("/api/cv/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile: extractedData.profile ?? {},
          experience,
          education,
          projects,
          skills,
          certifications,
          knowledge,
          selected,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "CV import failed.");
        return;
      }

      const imported = data.imported ?? {};

      setMessage(
        `Import complete. Profile: ${imported.profile ?? 0}, Projects: ${
          imported.projects ?? 0
        }, Skills: ${imported.skills ?? 0}, Certifications: ${
          imported.certifications ?? 0
        }, AI knowledge entries: ${imported.knowledge ?? 0}.`
      );
    } catch (importError) {
      console.error("CV import request error:", importError);
      setError("Could not connect to the CV import service.");
    } finally {
      setImporting(false);
    }
  }

  const reviewBlock = (
    key:
      | "experience"
      | "education"
      | "projects"
      | "skills"
      | "certifications"
      | "knowledge",
    title: string,
    note?: string
  ) => (
    <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {note && (
            <p className="mt-1 text-xs leading-5 text-white/35">
              {note}
            </p>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-white/55">
          <input
            type="checkbox"
            checked={selected[key]}
            onChange={() => toggleSection(key)}
          />
          Import
        </label>
      </div>

      <textarea
        value={drafts[key]}
        onChange={(event) =>
          setDrafts((current) => ({
            ...current,
            [key]: event.target.value,
          }))
        }
        rows={12}
        spellCheck={false}
        className="mt-4 w-full rounded-xl border border-white/10 bg-black/20 p-4 font-mono text-xs leading-6 text-white/60 outline-none transition focus:border-cyan-300/40"
      />
    </section>
  );

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm text-cyan-300">
              Current CV
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              {hasCV
                ? "CV Uploaded"
                : "No CV Uploaded"}
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">
              Your CV is stored privately in Supabase Storage.
              Replacing it creates a fresh file version so visitors
              receive the latest document.
            </p>
          </div>

          <div
            className={`rounded-full px-4 py-2 text-xs font-medium ${
              hasCV
                ? "bg-green-400/10 text-green-300"
                : "bg-white/5 text-white/40"
            }`}
          >
            {hasCV ? "Available" : "Missing"}
          </div>
        </div>

        {hasCV && (
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="rounded-xl border border-cyan-300/20 px-5 py-3 text-sm text-cyan-300 transition hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {downloading
                ? "Opening..."
                : "View Current CV"}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl border border-red-400/20 px-5 py-3 text-sm text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting
                ? "Deleting..."
                : "Delete CV"}
            </button>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <p className="text-sm text-cyan-300">
          {hasCV ? "Replace CV" : "Upload CV"}
        </p>

        <h2 className="mt-2 text-2xl font-semibold">
          Choose PDF
        </h2>

        <p className="mt-3 text-sm leading-6 text-white/50">
          Upload a PDF up to 10 MB. A replacement receives a
          new storage path so the old cached PDF cannot be reused.
        </p>

        <div className="mt-6">
          <input
            id="cv-file"
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) => {
              setFile(
                event.target.files?.[0] ?? null
              );
              setMessage("");
              setError("");
            }}
            className="block w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/60 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-300/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-cyan-300"
          />
        </div>

        {file && (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm font-medium text-white">
              {file.name}
            </p>

            <p className="mt-1 text-xs text-white/40">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="mt-6 rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-6 py-3 font-medium text-cyan-200 transition hover:bg-cyan-300/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading
            ? "Uploading..."
            : hasCV
              ? "Replace CV"
              : "Upload CV"}
        </button>
      </section>

      <section className="rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.025] p-6 md:p-8">
        <p className="text-sm text-cyan-300">
          AI CV Import
        </p>

        <h2 className="mt-2 text-2xl font-semibold">
          Extract CV Information
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
          AI reads the uploaded CV and prepares structured data.
          You review and edit it before anything is imported.
        </p>

        <button
          type="button"
          onClick={handleExtractWithAI}
          disabled={!hasCV || extracting}
          className="mt-6 rounded-xl bg-cyan-300 px-6 py-3 font-semibold text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {extracting
            ? "Reading CV..."
            : "Extract with AI"}
        </button>
      </section>

      {message && (
        <div className="rounded-xl border border-green-400/20 bg-green-400/10 p-4 text-sm text-green-300">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm leading-6 text-red-300">
          {error}
        </div>
      )}

      {extractedData && (
        <section className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
              Review Before Import
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Review CV Information
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/40">
              {extractedFileName
                ? `Extracted from ${extractedFileName}. `
                : ""}
              Untick anything you do not want imported. You can edit
              the values before confirming.
            </p>
          </div>

          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">
                Profile
              </h3>

              <label className="flex items-center gap-2 text-sm text-white/55">
                <input
                  type="checkbox"
                  checked={selected.profile}
                  onChange={() => toggleSection("profile")}
                />
                Import
              </label>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {(
                [
                  ["full_name", "Full name"],
                  [
                    "professional_title",
                    "Professional title",
                  ],
                  ["hero_tagline", "Hero tagline"],
                  ["location", "Location"],
                  ["email", "Email"],
                  ["linkedin_url", "LinkedIn URL"],
                  ["github_url", "GitHub URL"],
                ] as Array<
                  [keyof ExtractedProfile, string]
                >
              ).map(([field, label]) => (
                <label
                  key={field}
                  className="text-sm text-white/55"
                >
                  {label}
                  <input
                    value={
                      extractedData.profile?.[field] ?? ""
                    }
                    onChange={(event) =>
                      setProfileField(
                        field,
                        event.target.value
                      )
                    }
                    className={inputClass}
                  />
                </label>
              ))}
            </div>

            <label className="mt-4 block text-sm text-white/55">
              Bio
              <textarea
                value={extractedData.profile?.bio ?? ""}
                onChange={(event) =>
                  setProfileField(
                    "bio",
                    event.target.value
                  )
                }
                rows={5}
                className={inputClass}
              />
            </label>
          </section>

          {reviewBlock(
            "experience",
            "Experience",
            "Your current database has no dedicated experience table, so approved experience is imported into verified AI Knowledge."
          )}

          {reviewBlock(
            "education",
            "Education",
            "Your current database has no dedicated education table, so approved education is imported into verified AI Knowledge."
          )}

          {reviewBlock("projects", "Projects")}
          {reviewBlock("skills", "Skills")}
          {reviewBlock(
            "certifications",
            "Certifications"
          )}
          {reviewBlock(
            "knowledge",
            "Additional AI Knowledge"
          )}

          <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.035] p-5">
            <p className="text-sm font-medium text-amber-200">
              Check before confirming
            </p>

            <p className="mt-2 text-sm leading-6 text-white/45">
              Confirm Import adds approved projects, skills,
              certifications and knowledge. Non-empty approved profile
              fields update the existing profile. Empty profile values
              will not erase existing information.
            </p>
          </div>

          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={importing}
            className="rounded-xl bg-green-300 px-6 py-3 font-semibold text-black transition hover:bg-green-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {importing
              ? "Importing..."
              : "Confirm Import"}
          </button>
        </section>
      )}
    </div>
  );
}