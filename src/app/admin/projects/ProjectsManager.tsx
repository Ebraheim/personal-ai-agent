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
  cover_image_url: string | null;
  highlight: string | null;
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
  cover_image_url: string;
  highlight: string;
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
  cover_image_url: "",
  highlight: "",
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

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [removeExistingCoverImage, setRemoveExistingCoverImage] = useState(false);

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/40";

  const labelClass = "text-sm font-medium text-white/60";

  const sectionClass =
    "rounded-3xl border border-white/10 bg-white/[0.025] p-6 md:p-8";

  function getProjectImageStoragePath(publicUrl: string | null | undefined) {
    if (!publicUrl) return null;

    const marker = "/storage/v1/object/public/project-images/";
    const markerIndex = publicUrl.indexOf(marker);

    if (markerIndex === -1) return null;

    return decodeURIComponent(publicUrl.slice(markerIndex + marker.length));
  }

  async function uploadProjectCoverImage(
    supabase: ReturnType<typeof createClient>,
    file: File
  ) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExtension = ["jpg", "jpeg", "png", "webp"].includes(extension)
      ? extension
      : "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${safeExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("project-images")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("project-images")
      .getPublicUrl(path);

    return {
      publicUrl: data.publicUrl,
      path,
    };
  }

  async function deleteProjectCoverImage(
    supabase: ReturnType<typeof createClient>,
    publicUrl: string | null | undefined
  ) {
    const path = getProjectImageStoragePath(publicUrl);

    if (!path) return;

    const { error: removeError } = await supabase.storage
      .from("project-images")
      .remove([path]);

    if (removeError) {
      console.error("Project cover image cleanup failed:", removeError);
    }
  }

  async function regenerateSuggestedQuestions() {
    try {
      const response = await fetch("/api/chat/suggestions/regenerate", {
        method: "POST",
      });

      if (!response.ok) {
        console.error(
          "Suggested-question regeneration failed:",
          await response.text()
        );
      }
    } catch (regenerationError) {
      console.error(
        "Suggested-question regeneration failed:",
        regenerationError
      );
    }
  }

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

    await regenerateSuggestedQuestions();

    setSectionMessage("Projects section text saved successfully.");
    setSavingSection(false);
  }

  function resetProjectForm() {
    setForm(emptyProjectForm);
    setEditingId(null);
    setCoverImageFile(null);
    setRemoveExistingCoverImage(false);
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
      cover_image_url: project.cover_image_url ?? "",
      highlight: project.highlight ?? "",
      status: project.status ?? "completed",
      display_order: project.display_order ?? 0,
      is_visible: project.is_visible ?? true,
    });

    setCoverImageFile(null);
    setRemoveExistingCoverImage(false);
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

    const previousProject = editingId
      ? projects.find((project) => project.id === editingId) ?? null
      : null;

    let uploadedCover:
      | {
          publicUrl: string;
          path: string;
        }
      | null = null;

    let nextCoverImageUrl = form.cover_image_url.trim() || null;

    try {
      if (coverImageFile) {
        uploadedCover = await uploadProjectCoverImage(
          supabase,
          coverImageFile
        );
        nextCoverImageUrl = uploadedCover.publicUrl;
      } else if (removeExistingCoverImage) {
        nextCoverImageUrl = null;
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Could not upload the project cover image."
      );
      setSavingProject(false);
      return;
    }

    const projectData = {
      title: form.title.trim(),
      short_description: form.short_description.trim(),
      full_description: form.full_description.trim(),
      technologies: form.technologies.trim(),
      project_url: form.project_url.trim(),
      github_url: form.github_url.trim(),
      cover_image_url: nextCoverImageUrl,
      highlight: form.highlight.trim(),
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
          "id, title, short_description, full_description, technologies, project_url, github_url, cover_image_url, highlight, status, display_order, is_visible"
        )
        .single();

      if (error) {
        if (uploadedCover) {
          await supabase.storage
            .from("project-images")
            .remove([uploadedCover.path]);
        }

        setError(error.message);
        setSavingProject(false);
        return;
      }

      if (
        previousProject?.cover_image_url &&
        previousProject.cover_image_url !== data.cover_image_url
      ) {
        await deleteProjectCoverImage(
          supabase,
          previousProject.cover_image_url
        );
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
          "id, title, short_description, full_description, technologies, project_url, github_url, cover_image_url, highlight, status, display_order, is_visible"
        )
        .single();

      if (error) {
        if (uploadedCover) {
          await supabase.storage
            .from("project-images")
            .remove([uploadedCover.path]);
        }

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

    await regenerateSuggestedQuestions();

    setForm(emptyProjectForm);
    setEditingId(null);
    setCoverImageFile(null);
    setRemoveExistingCoverImage(false);
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
        "id, title, short_description, full_description, technologies, project_url, github_url, cover_image_url, highlight, status, display_order, is_visible"
      )
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    await deleteProjectCoverImage(
      supabase,
      project.cover_image_url
    );

    setProjects((current) =>
      current.map((item) =>
        item.id === project.id ? data : item
      )
    );

    await regenerateSuggestedQuestions();
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

    await regenerateSuggestedQuestions();
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
              Project Highlight
            </label>

            <input
              type="text"
              value={form.highlight}
              onChange={(event) =>
                updateProjectField(
                  "highlight",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Example: 3 robots · 10+ mapping runs"
            />

            <p className="mt-2 text-xs text-white/30">
              Optional. Add one short proof point, result, metric, or outcome.
            </p>
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>
              Project Cover Image
            </label>

            <div className="mt-2 rounded-2xl border border-dashed border-white/10 bg-black/10 p-4">
              {(coverImageFile ||
                (form.cover_image_url && !removeExistingCoverImage)) && (
                <div className="mb-4 overflow-hidden rounded-xl border border-white/10 bg-black/20">
                  <img
                    src={
                      coverImageFile
                        ? URL.createObjectURL(coverImageFile)
                        : form.cover_image_url
                    }
                    alt="Project cover preview"
                    className="h-56 w-full object-cover"
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2.5 text-sm font-medium text-cyan-200 transition hover:bg-cyan-300/20 hover:text-white">
                  Choose Image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;

                      if (file && file.size > 5 * 1024 * 1024) {
                        setError("Project cover image must be 5 MB or smaller.");
                        event.target.value = "";
                        return;
                      }

                      setError("");
                      setCoverImageFile(file);
                      setRemoveExistingCoverImage(false);
                    }}
                  />
                </label>

                {(coverImageFile ||
                  (form.cover_image_url && !removeExistingCoverImage)) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImageFile(null);
                      setRemoveExistingCoverImage(true);
                    }}
                    className="rounded-xl border border-red-400/20 px-4 py-2.5 text-sm text-red-300 transition hover:bg-red-400/10"
                  >
                    Remove Image
                  </button>
                )}

                <span className="text-xs text-white/30">
                  JPG, PNG or WebP · Max 5 MB
                </span>
              </div>
            </div>
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
                {project.cover_image_url && (
                  <div className="mb-5 overflow-hidden rounded-xl border border-white/10 bg-black/20">
                    <img
                      src={project.cover_image_url}
                      alt={`${project.title} cover`}
                      className="h-44 w-full object-cover"
                    />
                  </div>
                )}

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

                {project.highlight && (
                  <div className="mt-4 inline-flex rounded-lg border border-cyan-300/20 bg-cyan-300/[0.07] px-3 py-2 text-sm font-medium text-cyan-200">
                    {project.highlight}
                  </div>
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