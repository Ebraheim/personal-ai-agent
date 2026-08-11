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

type SectionContent = {
  projects_label: string;
  projects_heading: string;
  projects_description: string;
};

type ProjectsManagerProps = {
  userId: string;
  initialProjects: Project[];
  initialSectionContent: SectionContent;
};

const emptyProjectForm: ProjectForm = {
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
  initialSectionContent,
}: ProjectsManagerProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [sectionContent, setSectionContent] =
    useState<SectionContent>(initialSectionContent);

  const [form, setForm] = useState<ProjectForm>(emptyProjectForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [savingSection, setSavingSection] = useState(false);
  const [savingProject, setSavingProject] = useState(false);

  const [sectionMessage, setSectionMessage] = useState("");
  const [projectMessage, setProjectMessage] = useState("");
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

  function updateProjectField<K extends keyof ProjectForm>(
    field: K,
    value: ProjectForm[K]
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
      projects_label: sectionContent.projects_label.trim(),
      projects_heading: sectionContent.projects_heading.trim(),
      projects_description: sectionContent.projects_description.trim(),
      updated_at: new Date().toISOString(),
    };

    const { data: existingContent, error: findError } = await supabase
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

    setSectionMessage("Projects section text saved successfully.");
    setSavingSection(false);
  }

  function resetProjectForm() {
    setForm(emptyProjectForm);
    setEditingId(null);
    setProjectMessage("");
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

    setProjectMessage("");
    setError("");

    window.scrollTo({
      top: 520,
      behavior: "smooth",
    });
  }

  async function saveProject(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Project title is required.");
      return;
    }

    setSavingProject(true);
    setProjectMessage("");
    setError("");

    const supabase = createClient();

    const projectData = {
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
    };

    if (editingId) {
      const { data, error } = await supabase
        .from("projects")
        .update(projectData)
        .eq("id", editingId)
        .eq("user_id", userId)
        .select(
          "id, title, short_description, full_description, technologies, project_url, github_url, status, display_order, is_visible"
        )
        .single();

      if (error) {
        setError(error.message);
        setSavingProject(false);
        return;
      }

      setProjects((current) =>
        current
          .map((project) =>
            project.id === editingId ? data : project
          )
          .sort(
            (a, b) =>
              a.display_order - b.display_order
          )
      );

      setProjectMessage("Project updated successfully.");
    } else {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          user_id: userId,
          ...projectData,
        })
        .select(
          "id, title, short_description, full_description, technologies, project_url, github_url, status, display_order, is_visible"
        )
        .single();

      if (error) {
        setError(error.message);
        setSavingProject(false);
        return;
      }

      setProjects((current) =>
        [...current, data].sort(
          (a, b) =>
            a.display_order - b.display_order
        )
      );

      setProjectMessage("Project added successfully.");
    }

    setForm(emptyProjectForm);
    setEditingId(null);
    setSavingProject(false);
  }

  async function toggleVisibility(project: Project) {
    setError("");

    const supabase = createClient();

    const { data, error } = await supabase
      .from("projects")
      .update({
        is_visible: !project.is_visible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", project.id)
      .eq("user_id", userId)
      .select(
        "id, title, short_description, full_description, technologies, project_url, github_url, status, display_order, is_visible"
      )
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

    if (!confirmed) return;

    setError("");

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
      resetProjectForm();
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
            Projects Section Information
          </h2>

          <p className="mt-2 max-w-2xl text-sm text-white/40">
            These fields control the heading and introduction shown above your
            project cards.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className={labelClass}>
              Small Label
            </label>

            <input
              type="text"
              value={sectionContent.projects_label}
              onChange={(event) =>
                updateSectionField(
                  "projects_label",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Selected Work"
            />
          </div>

          <div>
            <label className={labelClass}>
              Main Heading
            </label>

            <input
              type="text"
              value={sectionContent.projects_heading}
              onChange={(event) =>
                updateSectionField(
                  "projects_heading",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Projects"
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>
              Section Description
            </label>

            <textarea
              rows={4}
              value={sectionContent.projects_description}
              onChange={(event) =>
                updateSectionField(
                  "projects_description",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Describe the work, services, products, or projects shown in this section..."
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
            : "Save Projects Section"}
        </button>
      </form>

      <form
        onSubmit={saveProject}
        className={sectionClass}
      >
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
              Project Cards
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              {editingId
                ? "Edit Project"
                : "Add Project"}
            </h2>

            <p className="mt-2 text-sm text-white/40">
              Add or update an individual project shown in this section.
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetProjectForm}
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
                updateProjectField(
                  "title",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Project title"
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
                updateProjectField(
                  "short_description",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Short summary shown on the project card"
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
                updateProjectField(
                  "full_description",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Explain the project in more detail..."
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>
              Technologies / Tags
            </label>

            <input
              type="text"
              value={form.technologies}
              onChange={(event) =>
                updateProjectField(
                  "technologies",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Separate items with commas"
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
                updateProjectField(
                  "project_url",
                  event.target.value
                )
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
                updateProjectField(
                  "github_url",
                  event.target.value
                )
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
                updateProjectField(
                  "status",
                  event.target.value
                )
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
                updateProjectField(
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
                  updateProjectField(
                    "is_visible",
                    event.target.checked
                  )
                }
                className="h-4 w-4"
              />

              Show this project publicly
            </label>
          </div>
        </div>

        {projectMessage && (
          <div className="mt-6 rounded-xl border border-green-400/20 bg-green-400/10 p-3 text-sm text-green-300">
            {projectMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={savingProject}
          className="mt-8 rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-6 py-3 font-medium text-cyan-200 transition hover:bg-cyan-300/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {savingProject
            ? "Saving..."
            : editingId
              ? "Update Project"
              : "Add Project"}
        </button>
      </form>

      <section className={sectionClass}>
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
            Current Content
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
                      {project.status.replaceAll("-", " ")}
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
                    {project.is_visible
                      ? "Visible"
                      : "Hidden"}
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

                <p className="mt-4 text-xs text-white/30">
                  Order: {project.display_order}
                </p>

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
                    onClick={() =>
                      toggleVisibility(project)
                    }
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/[0.05] hover:text-white"
                  >
                    {project.is_visible
                      ? "Hide"
                      : "Show"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteProject(project)
                    }
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
          href="/#projects"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-sm font-medium text-cyan-200 transition hover:bg-cyan-300/20 hover:text-white"
        >
          Preview Projects ↗
        </a>
      </div>
    </div>
  );
}