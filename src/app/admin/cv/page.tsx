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

  const { data: fileList } = await supabase.storage
    .from("cvs")
    .list(user.id, {
      limit: 100,
      sortBy: {
        column: "created_at",
        order: "desc",
      },
    });

  const pdfFiles = (fileList ?? [])
    .filter((file) =>
      file.name.toLowerCase().endsWith(".pdf")
    )
    .sort((a, b) => {
      const aTime = new Date(
        a.updated_at || a.created_at || 0
      ).getTime();

      const bTime = new Date(
        b.updated_at || b.created_at || 0
      ).getTime();

      return bTime - aTime;
    });

  const latestFile = pdfFiles[0] ?? null;

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
            Upload or replace your latest CV. Each replacement is stored
            with a fresh file path so the public website always opens the
            newest version.
          </p>
        </div>

        <div className="mt-10">
          <CVManager
            userId={user.id}
            currentFilePath={
              latestFile
                ? `${user.id}/${latestFile.name}`
                : null
            }
            hasExistingFile={Boolean(latestFile)}
          />
        </div>
      </div>
    </main>
  );
}