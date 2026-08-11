"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/admin/dashboard";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070b12] px-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
          Private Access
        </p>

        <h1 className="text-3xl font-bold">
          Admin Login
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/50">
          Sign in to manage your website and personal AI agent.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm text-white/60"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Your email"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/40"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm text-white/60"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/40"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-5 py-3 font-medium text-cyan-200 transition hover:bg-cyan-300/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <a
          href="/"
          className="mt-6 block text-center text-sm text-white/40 transition hover:text-cyan-300"
        >
          ← Back to website
        </a>
      </div>
    </main>
  );
}