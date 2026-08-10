"use client";

import { useState } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function askAgent() {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAnswer(data.error || "Something went wrong.");
        return;
      }

      setAnswer(data.answer);
    } catch {
      setAnswer("Could not connect to the AI agent.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main id="home" className="min-h-screen overflow-hidden">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070b12]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a
            href="#home"
            className="text-lg font-semibold tracking-tight text-white transition hover:text-cyan-300"
          >
            Ebraheim Qadri
          </a>

          <nav className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 text-sm text-white/60">
            <a
              className="transition hover:text-cyan-300"
              href="#projects"
            >
              Projects
            </a>

            <a
              className="transition hover:text-cyan-300"
              href="#skills"
            >
              Skills
            </a>

            <a
              className="transition hover:text-cyan-300"
              href="#certifications"
            >
              Certifications
            </a>

            <a
              className="transition hover:text-cyan-300"
              href="#about"
            >
              About
            </a>

            <a
              className="transition hover:text-cyan-300"
              href="#agent"
            >
              AI Agent
            </a>

            <a
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 transition hover:border-cyan-300/40 hover:bg-white/10 hover:text-white"
              href="#contact"
            >
              Contact
            </a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative flex min-h-[90vh] items-center px-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[5%] top-[15%] h-80 w-80 rounded-full bg-cyan-400/10 blur-[100px]" />
          <div className="absolute right-[5%] top-[20%] h-96 w-96 rounded-full bg-violet-500/10 blur-[120px]" />
          <div className="absolute bottom-[10%] left-[40%] h-64 w-64 rounded-full bg-blue-500/5 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/5 px-5 py-2 text-xs uppercase tracking-[0.3em] text-cyan-300">
            Computer & Autonomous Systems Engineer
          </div>

          <p className="mb-6 text-sm font-medium tracking-wide text-white/50">
            AI • Robotics • Autonomous Systems
          </p>

          <h1 className="mb-7 bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-7xl">
            Ebraheim Mohamed
            <br className="hidden md:block" /> Pasha Qadri
          </h1>

          <p className="mx-auto mb-10 max-w-3xl text-lg leading-8 text-white/60 md:text-xl">
            I build practical AI, robotics, autonomous systems, and intelligent
            software projects with a focus on systems that can be tested,
            explained, and improved.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
  href="#projects"
  className="rounded-xl bg-white px-7 py-3.5 font-medium text-black transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/10"
>
  View Projects
</a>

            <a
              href="#agent"
              className="rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 font-medium text-white transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/10"
            >
              Ask My AI Agent
            </a>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-white/40">
            <span>ROS & SLAM</span>
            <span>AI Systems</span>
            <span>Computer Vision</span>
            <span>Backend Development</span>
            <span>Agentic AI</span>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section
        id="projects"
        className="border-t border-white/10 bg-white/[0.015] px-6 py-24"
      >
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
            Selected Work
          </p>

          <div className="mb-12 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h2 className="text-4xl font-bold md:text-5xl">Projects</h2>
              <p className="mt-4 max-w-2xl text-white/50">
                Practical engineering work across robotics, AI, backend
                systems, cybersecurity, and agentic applications.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* PROJECT 1 */}
            <div className="group rounded-2xl border border-white/10 bg-white/[0.035] p-7 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.055]">
              <div className="mb-5 inline-flex rounded-lg border border-cyan-300/15 bg-cyan-300/5 px-3 py-1 text-xs text-cyan-300">
                Robotics
              </div>

              <h3 className="mb-4 text-2xl font-semibold">
                Swarm Robotics for Indoor Safety
              </h3>

              <p className="mb-6 leading-7 text-white/55">
                ROS and SLAM-based multi-robot system for indoor exploration,
                mapping, localization, navigation, and hazard detection.
              </p>

              <div className="flex flex-wrap gap-2">
                {["ROS", "SLAM", "TurtleBot3", "CNN", "Multi-Robot"].map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-md bg-white/5 px-3 py-1 text-xs text-white/50"
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* PROJECT 2 */}
            <div className="group rounded-2xl border border-white/10 bg-white/[0.035] p-7 transition duration-300 hover:-translate-y-1 hover:border-violet-300/30 hover:bg-white/[0.055]">
              <div className="mb-5 inline-flex rounded-lg border border-violet-300/15 bg-violet-300/5 px-3 py-1 text-xs text-violet-300">
                Artificial Intelligence
              </div>

              <h3 className="mb-4 text-2xl font-semibold">
                AI SOC Triage Copilot Lite
              </h3>

              <p className="mb-6 leading-7 text-white/55">
                AI-based cybersecurity system for alert triage, contextual
                analysis, MITRE ATT&CK mapping, risk scoring, and investigation
                guidance.
              </p>

              <div className="flex flex-wrap gap-2">
                {["AI", "Cybersecurity", "MITRE ATT&CK", "Reasoning"].map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-md bg-white/5 px-3 py-1 text-xs text-white/50"
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* PROJECT 3 */}
            <div className="group rounded-2xl border border-white/10 bg-white/[0.035] p-7 transition duration-300 hover:-translate-y-1 hover:border-blue-300/30 hover:bg-white/[0.055]">
              <div className="mb-5 inline-flex rounded-lg border border-blue-300/15 bg-blue-300/5 px-3 py-1 text-xs text-blue-300">
                Backend
              </div>

              <h3 className="mb-4 text-2xl font-semibold">Task API</h3>

              <p className="mb-6 leading-7 text-white/55">
                Internship backend project demonstrating CRUD operations,
                validation, HTTP status codes, Swagger documentation, Git, and
                GitHub.
              </p>

              <div className="flex flex-wrap gap-2">
                {["Node.js", "Express", "Swagger", "REST API"].map((item) => (
                  <span
                    key={item}
                    className="rounded-md bg-white/5 px-3 py-1 text-xs text-white/50"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* PROJECT 4 */}
            <div className="group relative overflow-hidden rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-cyan-400/[0.07] to-violet-500/[0.05] p-7 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40">
              <div className="absolute right-0 top-0 rounded-bl-xl bg-cyan-300 px-3 py-1 text-xs font-medium text-black">
                CURRENT BUILD
              </div>

              <div className="mb-5 inline-flex rounded-lg border border-cyan-300/15 bg-cyan-300/5 px-3 py-1 text-xs text-cyan-300">
                Agentic AI
              </div>

              <h3 className="mb-4 text-2xl font-semibold">
                Personal AI Agent
              </h3>

              <p className="mb-6 leading-7 text-white/55">
                Recruiter-facing AI system combining a personal brand website,
                verified knowledge base, retrieval, Gemini integration, and
                grounded responses.
              </p>

              <div className="flex flex-wrap gap-2">
                {["Next.js", "Gemini", "Retrieval", "Agents", "RAG"].map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-md bg-white/5 px-3 py-1 text-xs text-white/50"
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills" className="border-t border-white/10 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
            Technical Toolkit
          </p>

          <h2 className="mb-12 text-4xl font-bold md:text-5xl">Skills</h2>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Robotics & Autonomous Systems",
                text: "ROS, SLAM, TurtleBot3, Multi-Robot Systems, Task Allocation, Autonomous Navigation",
              },
              {
                title: "AI & Computer Vision",
                text: "PyTorch, OpenCV, CNNs, Image Processing, AI Reasoning, Anomaly Detection",
              },
              {
                title: "Programming",
                text: "Python, C++, Java, MATLAB, JavaScript, TypeScript",
              },
              {
                title: "Backend & APIs",
                text: "Node.js, Express, REST APIs, Swagger, HTTP, Validation, Git & GitHub",
              },
              {
                title: "AI Application Development",
                text: "Prompt Engineering, Retrieval, RAG, AI APIs, MCP, Agent Skills, Structured Outputs",
              },
              {
                title: "Embedded & Automation",
                text: "Arduino, Raspberry Pi, PLC Programming, Sensors, Control Systems",
              },
            ].map((skill) => (
              <div
                key={skill.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition duration-300 hover:border-cyan-300/25 hover:bg-white/[0.05]"
              >
                <h3 className="mb-3 text-lg font-semibold">{skill.title}</h3>
                <p className="leading-7 text-white/50">{skill.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CERTIFICATIONS */}
      <section
        id="certifications"
        className="border-t border-white/10 bg-white/[0.015] px-6 py-24"
      >
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
            Certifications
          </p>

          <h2 className="mb-12 text-4xl font-bold md:text-5xl">
            AI & Technical Learning
          </h2>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-cyan-300/15 bg-gradient-to-br from-cyan-300/[0.05] to-transparent p-7">
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-cyan-300">
                Priority
              </p>

              <h3 className="mb-6 text-2xl font-semibold">
                Featured Certifications
              </h3>

              <ul className="space-y-3 text-white/60">
                <li>✓ AI Fluency: Framework & Foundations</li>
                <li>✓ AI Fluency for Builders</li>
                <li>✓ Claude Code 101</li>
                <li>✓ Claude Code in Action</li>
                <li>✓ Claude Platform 101</li>
                <li>✓ Building with the Claude API</li>
                <li>✓ Introduction to Model Context Protocol</li>
                <li>✓ Model Context Protocol: Advanced Topics</li>
                <li>✓ Introduction to Agent Skills</li>
                <li>✓ Introduction to Subagents</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/35">
                Additional Learning
              </p>

              <h3 className="mb-6 text-2xl font-semibold">
                Additional AI Training
              </h3>

              <ul className="space-y-3 text-white/55">
                <li>• Claude 101</li>
                <li>• Introduction to Claude Cowork</li>
                <li>• AI Capabilities and Limitations</li>
                <li>• Claude with Amazon Bedrock</li>
                <li>• Claude with Google Cloud&apos;s Vertex AI</li>
                <li>• AI Fluency for Students</li>
                <li>• AI Fluency for Educators</li>
                <li>• Teaching AI Fluency</li>
                <li>• AI Fluency for Nonprofits</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="border-t border-white/10 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
            About Me
          </p>

          <h2 className="mb-12 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
            Building practical AI and autonomous systems.
          </h2>

          <div className="grid gap-8 md:grid-cols-[1.5fr_1fr]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <p className="mb-6 text-lg leading-8 text-white/60">
                I am a Computer & Autonomous Systems Engineer focused on AI,
                robotics, autonomous navigation, and intelligent software
                systems.
              </p>

              <p className="text-lg leading-8 text-white/60">
                My work spans ROS-based robotics, AI systems, backend
                development, embedded systems, and agentic AI applications. I
                prefer building systems I can test, explain, and improve.
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.035] p-8">
              <h3 className="mb-6 text-xl font-semibold">Career Focus</h3>

              <ul className="space-y-4 text-white/60">
                <li>→ Robotics Engineering</li>
                <li>→ Autonomous Systems</li>
                <li>→ AI Engineering</li>
                <li>→ AI Application Development</li>
                <li>→ Intelligent Backend Systems</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* AI AGENT */}
      <section
        id="agent"
        className="relative border-t border-white/10 bg-white/[0.015] px-6 py-24"
      >
        <div className="pointer-events-none absolute right-[10%] top-[20%] h-72 w-72 rounded-full bg-cyan-400/5 blur-[100px]" />

        <div className="relative mx-auto max-w-6xl">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
            Personal AI Agent
          </p>

          <h2 className="mb-5 text-4xl font-bold md:text-5xl">
            Ask about my work.
          </h2>

          <p className="mb-10 max-w-3xl text-lg leading-8 text-white/55">
            This AI agent answers questions about my projects, skills,
            experience, certifications, and technical background using a
            verified knowledge base and retrieval layer.
          </p>

          <div className="max-w-4xl rounded-3xl border border-white/10 bg-[#0b111b]/90 p-5 shadow-2xl shadow-black/30 md:p-8">
            <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <p className="mb-4 text-sm font-semibold text-cyan-300">
                Try asking
              </p>

              <div className="grid gap-2 text-sm text-white/45 md:grid-cols-2">
                <button
                  onClick={() =>
                    setQuestion(
                      "What experience does Ebraheim have with ROS and SLAM?"
                    )
                  }
                  className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-left transition hover:bg-white/5 hover:text-white/70"
                >
                  What experience does Ebraheim have with ROS?
                </button>

                <button
                  onClick={() =>
                    setQuestion(
                      "Which project best demonstrates autonomous systems work?"
                    )
                  }
                  className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-left transition hover:bg-white/5 hover:text-white/70"
                >
                  Which project best shows autonomous systems?
                </button>

                <button
                  onClick={() =>
                    setQuestion(
                      "What AI and agent-related skills has Ebraheim learned?"
                    )
                  }
                  className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-left transition hover:bg-white/5 hover:text-white/70"
                >
                  What AI and agent skills has he learned?
                </button>

                <button
                  onClick={() =>
                    setQuestion("Tell me about Ebraheim's Task API project.")
                  }
                  className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-left transition hover:bg-white/5 hover:text-white/70"
                >
                  Tell me about the Task API project.
                </button>
              </div>
            </div>

            <div className="mb-5 min-h-48 rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="whitespace-pre-wrap text-sm leading-7 text-white/65">
                {loading
                  ? "Thinking..."
                  : answer ||
                    "Ask a question and the AI agent will answer using verified information."}
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <input
                type="text"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    askAgent();
                  }
                }}
                placeholder="Ask a recruiter-style question..."
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/40"
              />

              <button
                type="button"
                onClick={askAgent}
                disabled={loading}
                className="rounded-xl bg-cyan-300 px-7 py-4 font-semibold text-black transition duration-300 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Thinking..." : "Ask Agent"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="border-t border-white/10 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-8 md:p-12">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
              Contact
            </p>

            <h2 className="mb-5 text-4xl font-bold md:text-5xl">
              Let&apos;s build something useful.
            </h2>

            <p className="mb-9 max-w-3xl text-lg leading-8 text-white/55">
              I am open to opportunities in robotics, autonomous systems, AI
              engineering, and intelligent software development. If my work
              matches what your team is building, feel free to get in touch.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
  href="mailto:ebraheimpasha@gmail.com"
  className="rounded-xl bg-white px-6 py-3 font-medium text-black transition hover:-translate-y-1"
>
  Email Me
</a>

              <a
                href="https://linkedin.com/in/ebraheim13ae"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-white/70 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:text-white"
              >
                LinkedIn
              </a>

              <a
                href="https://github.com/Ebraheim"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-white/70 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:text-white"
              >
                GitHub
              </a>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/30">
            <p>© 2026 Ebraheim Mohamed Pasha Qadri</p>

            <a
              href="#home"
              className="transition hover:text-cyan-300"
            >
              Back to top ↑
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}