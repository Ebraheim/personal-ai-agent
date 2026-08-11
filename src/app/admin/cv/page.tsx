import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CVManager from "./CVManager";

export default async function AdminCVPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  const filePath = `${user.id}/resume.pdf`;

  const { data: fileList } = await supabase.storage
    .from("cvs")
    .list(user.id, {
      limit: 20,
      search: "resume.pdf",
    });

  const existingFile =
    fileList?.find((file) => file.name === "resume.pdf") ?? null;

  return (
    <main className="min-h-screen bg-[#070b12] px-6 py-20 text-white">
      <div className="mx-auto max-w-4xl">
        <a
          href="/admin/dashboard"
          className="text-sm text-cyan-300 transition hover:text-cyan-200"
        >
          ← Back to Dashboard
        </a>

        <div className="mt-8">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
            CV Manager
          </p>

          <h1 className="text-4xl font-bold">
            Manage CV
          </h1>

          <p className="mt-4 max-w-2xl text-white/50">
            Upload or replace your latest CV. Later, the AI import system can
            read it and suggest profile, project, and certification updates
            before anything is published.
          </p>
        </div>

        <div className="mt-10">
          <CVManager
            userId={user.id}
            filePath={filePath}
            hasExistingFile={Boolean(existingFile)}
          />
        </div>
      </div>
    </main>
  );
}