"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ConfirmEditFormProps = {
  email: string;
};

export default function ConfirmEditForm({
  email,
}: ConfirmEditFormProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!password) {
      setError("Enter your password to continue.");
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError) {
      setError("Incorrect password. Please try again.");
      setLoading(false);
      return;
    }

    window.location.href = "/admin/dashboard";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070b12] px-6 py-12 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/30">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-xl text-cyan-300">
          🔒
        </div>

        <p className="mt-6 text-sm uppercase tracking-[0.3em] text-cyan-300">
          Owner Verification
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Confirm it&apos;s you.
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/50">
          Re-enter your password before opening the website editor.
        </p>

        <div className="mt-6 rounded-xl border border-white/10 bg-black/15 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-white/25">
            Signed in as
          </p>
          <p className="mt-1 text-sm text-white/65">
            {email}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          <label className="text-sm font-medium text-white/60">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete="current-password"
              autoFocus
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/40"
              placeholder="Enter your password"
            />
          </label>

          {error && (
            <p className="mt-4 rounded-xl border border-red-400/15 bg-red-400/[0.06] px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-cyan-300 px-5 py-3.5 font-semibold text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Checking..."
              : "Confirm & Edit Website →"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => window.history.back()}
          className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.025] px-5 py-3 text-sm text-white/45 transition hover:bg-white/[0.05] hover:text-white"
        >
          Cancel
        </button>

        <p className="mt-6 text-center text-xs leading-5 text-white/25">
          Visitors to your public website cannot access your editor
          without your account credentials.
        </p>
      </div>
    </main>
  );
}