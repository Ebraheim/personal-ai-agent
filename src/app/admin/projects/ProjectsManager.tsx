"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Project = {
  id: string;
  title: string;
  short_description: string | null;
  full_description: string | null;
  technologies: string | null;
  project_url: string | null;
  github_url: string | null;
  status: string;
  display_order: number;
  is_visible: boolean;
};

type ProjectsManagerProps = {
  userId: string;
  initialProjects: Project[];
};

type ProjectForm = {
  title: string;
  short_description: string;
  full_description: string;
  technologies: string;
  project_url: string;
  github_url: string;
  status: string;
  display_order: number;
  is_visible: boolean;
};

const emptyForm: ProjectForm = {
  title: "",
  short_description: "",
  full_description: "",
  technologies: "",
  project_url: "",
  github_url: "",
  status: "completed",
  display_order: 0,
  is_visible: true,
};

export default function ProjectsManager({
  userId,
  initialProjects,
}: ProjectsManagerProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField<K extends keyof ProjectForm>(
    field: K,
    value: ProjectForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
    setError("");
  }

  function startEdit(project: Project) {
    setEditingId(project.id);

    setForm({
      title: project.title ?? "",
      short_description: project.short_description ?? "",
      full_description: project.full_description ?? "",
      technologies: project.technologies ?? "",
      project_url: project.project_url ?? "",
      github_url: project.github_url ?? "",
      status: project.status ?? "completed",
      display_order: project.display_order ?? 0,
      is_visible: project.is_visible ?? true,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Project title is required.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    const supabase = createClient();

    if (editingId) {
      const { data, error } = await supabase
        .from("projects")
        .update({
          title: form.title.trim(),
          short_description: form.short_description.trim(),
          full_description: form.full_description.trim(),
          technologies: form.technologies.trim(),
          project_url: form.project_url.trim(),
          github_url: form.github_url.trim(),
          status: form.status,
          display_order: form.display_order,
          is_visible: form.is_visible,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }

      setProjects((current) =>
        current.map((project) =>
          project.id === editingId ? data : project
        )
      );

      setMessage("Project updated successfully.");
    } else {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          user_id: userId,
          title: form.title.trim(),
          short_description: form.short_description.trim(),
          full_description: form.full_description.trim(),
          technologies: form.technologies.trim(),
          project_url: form.project_url.trim(),
          github_url: form.github_url.trim(),
          status: form.status,
          display_order: form.display_order,
          is_visible: form.is_visible,
        })
        .select()
        .single();

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }

      setProjects((current) => [data, ...current]);
      setMessage("Project added successfully.");
    }

    setForm(emptyForm);
    setEditingId(null);
    setSaving(false);
  }

  async function toggleVisibility(project: Project) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("projects")
      .update({
        is_visible: !project.is_visible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", project.id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    setProjects((current) =>
      current.map((item) =>
        item.id === project.id ? data : item
      )
    );
  }

  async function deleteProject(project: Project) {
    const confirmed = window.confirm(
      `Delete "${project.title}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", project.id)
      .eq("user_id", userId);

    if (error) {
      setError(error.message);
      return;
    }

    setProjects((current) =>
      current.filter((item) => item.id !== project.id)
    );

    if (editingId === project.id) {
      resetForm();
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/40";

  const labelClass = "text-sm text-white/60";

  return (
    <div className="space-y-10">
      {/* ADD / EDIT FORM */}
      <form
        onSubmit={handleSave}
        className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8"
      >
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-cyan-300">
              {editingId ? "Editing Project" : "New Project"}
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              {editingId ? "Update Project" : "Add Project"}
            </h2>
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
              Project Title
            </label>

            <input
              type="text"
              required
              value={form.title}
              onChange={(event) =>
                updateField("title", event.target.value)
              }
              className={inputClass}
              placeholder="Swarm Robotics for Indoor Safety"
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>
              Short Description
            </label>

            <input
              type="text"
              value={form.short_description}
              onChange={(event) =>
                updateField("short_description", event.target.value)
              }
              className={inputClass}
              placeholder="A short summary for the project card"
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>
              Full Description
            </label>

            <textarea
              rows={5}
              value={form.full_description}
              onChange={(event) =>
                updateField("full_description", event.target.value)
              }
              className={inputClass}
              placeholder="Explain the problem, approach, tools, and result..."
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>
              Technologies
            </label>

            <input
              type="text"
              value={form.technologies}
              onChange={(event) =>
                updateField("technologies", event.target.value)
              }
              className={inputClass}
              placeholder="ROS, Python, SLAM, TurtleBot3"
            />
          </div>

          <div>
            <label className={labelClass}>
              Project URL
            </label>

            <input
              type="url"
              value={form.project_url}
              onChange={(event) =>
                updateField("project_url", event.target.value)
              }
              className={inputClass}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className={labelClass}>
              GitHub URL
            </label>

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

              <option value="prototype">
                Prototype
              </option>

              <option value="research">
                Research
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

          <div className="md:col-span-2">
            <label className="flex items-center gap-3 text-sm text-white/60">
              <input
                type="checkbox"
                checked={form.is_visible}
                onChange={(event) =>
                  updateField("is_visible", event.target.checked)
                }
                className="h-4 w-4"
              />

              Show this project publicly
            </label>
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

        <button
          type="submit"
          disabled={saving}
          className="mt-8 rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-6 py-3 font-medium text-cyan-200 transition hover:bg-cyan-300/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : editingId
              ? "Update Project"
              : "Add Project"}
        </button>
      </form>

      {/* EXISTING PROJECTS */}
      <section>
        <div className="mb-5">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
            Portfolio Projects
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Existing Projects
          </h2>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-white/40">
            No projects added yet.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {projects.map((project) => (
              <article
                key={project.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                      {project.status}
                    </p>

                    <h3 className="mt-2 text-xl font-semibold">
                      {project.title}
                    </h3>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      project.is_visible
                        ? "bg-green-400/10 text-green-300"
                        : "bg-white/5 text-white/40"
                    }`}
                  >
                    {project.is_visible ? "Visible" : "Hidden"}
                  </span>
                </div>

                {project.short_description && (
                  <p className="mt-4 text-sm leading-6 text-white/50">
                    {project.short_description}
                  </p>
                )}

                {project.technologies && (
                  <p className="mt-4 text-sm text-white/40">
                    {project.technologies}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => startEdit(project)}
                    className="rounded-lg border border-cyan-300/20 px-4 py-2 text-sm text-cyan-300 transition hover:bg-cyan-300/10"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleVisibility(project)}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/[0.05] hover:text-white"
                  >
                    {project.is_visible ? "Hide" : "Show"}
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteProject(project)}
                    className="rounded-lg border border-red-400/20 px-4 py-2 text-sm text-red-300 transition hover:bg-red-400/10"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}