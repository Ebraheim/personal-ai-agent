"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AccountSettingsClientProps = {
  email: string;
  websiteHref: string;
};

export default function AccountSettingsClient({
  email,
  websiteHref,
}: AccountSettingsClientProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [deletePassword, setDeletePassword] = useState("");
  const [deleteText, setDeleteText] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  async function changePassword(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (newPassword.length < 8) {
      setPasswordError(
        "Your new password must be at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("The passwords do not match.");
      return;
    }

    setSavingPassword(true);

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordError(error.message);
      setSavingPassword(false);
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage("Password updated successfully.");
    setSavingPassword(false);
  }

  async function handleLogout() {
    setLoggingOut(true);

    const supabase = createClient();
    await supabase.auth.signOut();

    window.location.href = "/admin";
  }

  async function handleDeleteAccount(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setDeleteError("");

    if (!deletePassword) {
      setDeleteError("Enter your current password.");
      return;
    }

    if (deleteText !== "DELETE") {
      setDeleteError('Type DELETE exactly to confirm.');
      return;
    }

    setDeletingAccount(true);

    const supabase = createClient();

    const { error: verifyError } =
      await supabase.auth.signInWithPassword({
        email,
        password: deletePassword,
      });

    if (verifyError) {
      setDeleteError("Incorrect password.");
      setDeletingAccount(false);
      return;
    }

    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setDeleteError(
          data.error || "Could not delete the account."
        );
        setDeletingAccount(false);
        return;
      }

      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Delete account error:", error);
      setDeleteError("Could not connect to the delete service.");
      setDeletingAccount(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">
          Your Account
        </p>

        <h2 className="mt-3 text-2xl font-semibold">
          Account Details
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-white/30">
              Email
            </p>

            <p className="mt-2 break-all text-sm text-white/70">
              {email || "No email available"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-white/30">
              Public Website
            </p>

            <a
              href={websiteHref}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block break-all text-sm text-cyan-300 transition hover:text-cyan-200"
            >
              {websiteHref} ↗
            </a>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">
          Security
        </p>

        <h2 className="mt-3 text-2xl font-semibold">
          Change Password
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">
          Choose a new password for your website owner account.
        </p>

        <form
          onSubmit={changePassword}
          className="mt-6 max-w-xl space-y-5"
        >
          <label className="block text-sm font-medium text-white/60">
            New Password
            <input
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/40"
            />
          </label>

          <label className="block text-sm font-medium text-white/60">
            Confirm New Password
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              autoComplete="new-password"
              placeholder="Enter the new password again"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/40"
            />
          </label>

          {passwordError && (
            <p className="rounded-xl border border-red-400/15 bg-red-400/[0.06] px-4 py-3 text-sm text-red-200">
              {passwordError}
            </p>
          )}

          {passwordMessage && (
            <p className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-3 text-sm text-emerald-200">
              {passwordMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={savingPassword}
            className="rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingPassword
              ? "Updating..."
              : "Update Password"}
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-white/30">
          Session
        </p>

        <h2 className="mt-3 text-2xl font-semibold">
          Sign Out
        </h2>

        <p className="mt-3 text-sm leading-6 text-white/45">
          Sign out of the website editor on this browser.
        </p>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white/65 transition hover:border-red-300/20 hover:bg-red-300/[0.05] hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loggingOut ? "Signing Out..." : "Log Out"}
        </button>
      </section>

      <section className="rounded-3xl border border-red-400/20 bg-red-400/[0.025] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-red-300">
          Danger Zone
        </p>

        <h2 className="mt-3 text-2xl font-semibold text-red-100">
          Delete Account
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">
          Permanently delete your account, public website content,
          saved AI knowledge, and uploaded CV files. This cannot be undone.
        </p>

        <form
          onSubmit={handleDeleteAccount}
          className="mt-6 max-w-xl space-y-5"
        >
          <label className="block text-sm font-medium text-white/60">
            Current Password
            <input
              type="password"
              value={deletePassword}
              onChange={(event) =>
                setDeletePassword(event.target.value)
              }
              autoComplete="current-password"
              placeholder="Enter your current password"
              className="mt-2 w-full rounded-xl border border-red-400/15 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-red-300/40"
            />
          </label>

          <label className="block text-sm font-medium text-white/60">
            Type DELETE to confirm
            <input
              type="text"
              value={deleteText}
              onChange={(event) =>
                setDeleteText(event.target.value)
              }
              autoComplete="off"
              placeholder="DELETE"
              className="mt-2 w-full rounded-xl border border-red-400/15 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/20 focus:border-red-300/40"
            />
          </label>

          {deleteError && (
            <p className="rounded-xl border border-red-400/15 bg-red-400/[0.06] px-4 py-3 text-sm text-red-200">
              {deleteError}
            </p>
          )}

          <button
            type="submit"
            disabled={
              deletingAccount ||
              !deletePassword ||
              deleteText !== "DELETE"
            }
            className="rounded-xl border border-red-300/25 bg-red-400/10 px-5 py-3 font-semibold text-red-200 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {deletingAccount
              ? "Deleting Account..."
              : "Permanently Delete Account"}
          </button>
        </form>
      </section>
    </div>
  );
}