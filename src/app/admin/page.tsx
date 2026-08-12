"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export default function AdminLoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setError("");
    setMessage("");
    setPassword("");
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/admin/dashboard";
  }

  async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Could not create your account.");
        return;
      }

      const supabase = createClient();

      const { error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (signInError) {
        setMessage(
          "Account created successfully. Please sign in with your new account."
        );
        setMode("login");
        setPassword("");
        return;
      }

      window.location.href = "/admin/dashboard";
    } catch (signupError) {
      console.error("Signup request error:", signupError);
      setError("Could not connect to the signup service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070b12] px-6 py-12 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
          Website Platform
        </p>

        <h1 className="text-3xl font-bold">
          {mode === "login" ? "Admin Login" : "Create Your Website"}
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/50">
          {mode === "login"
            ? "Sign in to manage your website and AI assistant."
            : "Create an account to start building your AI-powered website."}
        </p>

        <div className="mt-7 grid grid-cols-2 rounded-xl border border-white/10 bg-black/20 p-1">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`rounded-lg px-4 py-2.5 text-sm transition ${
              mode === "login"
                ? "bg-cyan-300/10 text-cyan-200"
                : "text-white/40 hover:text-white"
            }`}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => switchMode("signup")}
            className={`rounded-lg px-4 py-2.5 text-sm transition ${
              mode === "signup"
                ? "bg-cyan-300/10 text-cyan-200"
                : "text-white/40 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        <form
          onSubmit={mode === "login" ? handleLogin : handleSignup}
          className="mt-8 space-y-5"
        >
          {mode === "signup" && (
            <div>
              <label
                htmlFor="full-name"
                className="mb-2 block text-sm text-white/60"
              >
                Full Name
              </label>

              <input
                id="full-name"
                type="text"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your full name"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/40"
              />
            </div>
          )}

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
              placeholder="you@example.com"
              autoComplete="email"
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
              minLength={mode === "signup" ? 8 : undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={
                mode === "signup"
                  ? "At least 8 characters"
                  : "Your password"
              }
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/40"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-xl border border-green-400/20 bg-green-400/10 p-3 text-sm text-green-300">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-5 py-3 font-medium text-cyan-200 transition hover:bg-cyan-300/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? mode === "login"
                ? "Signing in..."
                : "Creating account..."
              : mode === "login"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        {mode === "signup" && (
          <p className="mt-5 text-center text-xs leading-5 text-white/30">
            Your account receives its own private admin area and unique public
            website address.
          </p>
        )}

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