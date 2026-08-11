"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type CVManagerProps = {
  userId: string;
  filePath: string;
  hasExistingFile: boolean;
};

export default function CVManager({
  userId,
  filePath,
  hasExistingFile,
}: CVManagerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [hasCV, setHasCV] = useState(hasExistingFile);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

    const supabase = createClient();

    const { error: uploadError } = await supabase.storage
      .from("cvs")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: "application/pdf",
      });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    setHasCV(true);
    setFile(null);
    setMessage(
      hasCV
        ? "CV replaced successfully."
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
    setDownloading(true);
    setMessage("");
    setError("");

    const supabase = createClient();

    const { data, error } = await supabase.storage
      .from("cvs")
      .createSignedUrl(filePath, 60);

    if (error) {
      setError(error.message);
      setDownloading(false);
      return;
    }

    window.open(data.signedUrl, "_blank");

    setDownloading(false);
  }

  async function handleDelete() {
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
      .remove([filePath]);

    if (error) {
      setError(error.message);
      setDeleting(false);
      return;
    }

    setHasCV(false);
    setFile(null);
    setMessage("CV deleted successfully.");
    setDeleting(false);
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm text-cyan-300">
              Current CV
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              {hasCV ? "CV Uploaded" : "No CV Uploaded"}
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">
              Your CV is stored privately in Supabase Storage.
              Only your authenticated account can manage it.
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
              {downloading ? "Opening..." : "View CV"}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl border border-red-400/20 px-5 py-3 text-sm text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete CV"}
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
          Upload a PDF up to 10 MB. Uploading another file will replace
          the existing CV.
        </p>

        <div className="mt-6">
          <input
            id="cv-file"
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
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

      <section className="rounded-3xl border border-dashed border-white/10 p-6">
        <p className="text-sm font-medium text-white/70">
          AI CV Import
        </p>

        <p className="mt-2 text-sm leading-6 text-white/40">
          Coming next: extract structured information from the uploaded CV,
          compare it with the current website data, and let you approve or
          reject each suggested change before publishing.
        </p>
      </section>
    </div>
  );
}