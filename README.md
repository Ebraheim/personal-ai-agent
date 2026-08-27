Gradfolio

Turn your CV into a website that speaks for you.

Gradfolio is an AI-powered career website platform for students and fresh graduates. It converts CV information into a structured public portfolio with projects, experience, education, skills, certifications, achievements, contact details, and a verified-data AI assistant.

Live platform: https://gradfolio-ai.vercel.app

Example portfolio: https://gradfolio-ai.vercel.app/ebraheim

Repository: https://github.com/Ebraheim/personal-ai-agent

Who It Is For

Gradfolio is designed for students and fresh graduates who have useful projects, skills, certifications, internships, and achievements that are difficult to communicate through a traditional one-page CV. It gives them one public link that recruiters can browse or question through an AI assistant.

What It Does

AI-assisted CV import

Users can upload a CV and extract structured profile, experience, education, project, skill, certification, and AI-knowledge data. Extracted content is shown for review before it is imported; AI output is not treated as automatically correct.

Public career website

Each account receives a public portfolio route such as /ebraheim. Visible sections can include:

Home and professional summary

Projects

Experience

Education

Achievements

Skills

Certifications

About

Contact links and form

Downloadable CV

AI career assistant

Sections without content can be hidden.

Private website editor

Authenticated owners can edit their portfolio without changing code. The admin area supports profile content, projects, experience, education, achievements, skills, certifications, AI knowledge, section ordering, visibility, contact information, and CV management.

Verified-data AI assistant

The public assistant answers questions about the portfolio owner using information connected to that user's Gradfolio. It is intentionally scoped to portfolio evidence instead of acting as a general-purpose chatbot.

Multi-user security

Every user has a separate account, slug, public website, CV, AI knowledge base, and suggested questions. Supabase Row Level Security (RLS) and authenticated server routes enforce owner-level isolation.

Usage Examples

Visitor: inspect evidence

Open https://gradfolio-ai.vercel.app/ebraheim.

Select Projects to inspect Gradfolio and robotics work.

Open the live-demo or GitHub link on a project card.

Visitor: ask the AI assistant

Select AI Agent.

Ask: What are Ebraheim's main skills?

The assistant returns a response grounded in the published portfolio data.

If the input is empty, submission is blocked. If the message is meaningless, the assistant asks for a clearer question instead of inventing portfolio facts.

Owner: create or update a portfolio

Create an account or sign in.

Upload a CV or enter content manually.

Review AI-extracted data before import.

Edit sections in the private dashboard.

Publish and share the public slug.

Architecture

flowchart TD
    V[Visitor] --> P[Public portfolio /slug]
    P --> D[Portfolio data]
    P --> A[Verified-data AI assistant]
    O[Authenticated owner] --> E[Admin editor]
    E --> S[(Supabase)]
    D --> S
    A --> G[Google Gemini]
    A --> S
    S --> R[RLS, Auth, Storage]

Main components

Next.js App Router: landing page, public portfolio, authenticated admin pages, and API routes

Supabase PostgreSQL: portfolio content and suggested questions

Supabase Auth: account and owner authentication

Supabase Storage: private CV files

Supabase RLS: database-level user isolation

Google Gemini: CV extraction and grounded portfolio answers

Vercel: production hosting, Analytics, and Speed Insights

Formspree: public contact-form delivery

Tech Stack

Next.js 16

React 19

TypeScript

Tailwind CSS

Next.js Route Handlers

Supabase PostgreSQL, Auth, Storage, and RLS

Google Gemini through @google/genai

Vercel Analytics and Speed Insights

Formspree

Local Setup

Prerequisites

Node.js 20 or later

npm

A Supabase project configured with the Gradfolio tables, storage bucket, and RLS policies

A Google Gemini API key

1. Clone the repository

git clone https://github.com/Ebraheim/personal-ai-agent.git
cd personal-ai-agent

2. Install dependencies

npm ci

3. Configure environment variables

Create .env.local in the repository root:

GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SECRET_KEY=your_server_only_supabase_secret_key

Never commit real secret values. SUPABASE_SECRET_KEY must remain server-only.

4. Prepare Supabase

The configured project must contain these application tables:

profiles

projects

experience

education

achievements

skills

certifications

sections

site_content

hero_highlights

career_focus

agent_knowledge

suggested_questions

Create a private cvs storage bucket. Enable RLS on owner-scoped tables and restrict writes using the authenticated user ID, for example auth.uid() = user_id. Profile ownership uses auth.uid() = id.

5. Start the development server

npm run dev

Open http://localhost:3000.

6. Verify a production build

npm run build
npm start

Important Routes

Route

Purpose

/

Gradfolio landing page

/[slug]

Public portfolio

/admin

Sign-in and owner entry

/admin/dashboard

Private content dashboard

/api/chat

Grounded AI answer endpoint

/api/cv/extract

AI-assisted CV extraction

/api/cv/import

Reviewed CV-data import

/robots.txt

Search-crawler rules

/sitemap.xml

Search discovery sitemap

V2 Hardening Evaluation

The second evaluation pass was completed on 27 August 2026 against the deployed production site.

Area

Scenarios

Result

Landing and portfolio navigation

12

12 passed

AI assistant edge cases

4

4 passed

Contact-form validation and delivery

3

3 passed

Chrome, Microsoft Edge, and phone checks

3

3 passed

Production build and deployment

1

1 passed

SEO, social preview, HTTPS, and analytics checks

5

5 passed

Total

28

28 expected outcomes

Edge cases exercised

Empty AI question

Nonsense AI question (asdfghjkl 12345 !!!)

Rapid double AI submission

Empty contact form

Invalid email format

Valid contact submission

Every public navigation item

Project demo and repository links

Chrome and Microsoft Edge rendering

Phone rendering

Search metadata, robots.txt, sitemap, and Open Graph preview

Live Vercel Analytics event

PageSpeed results

Metric

Mobile

Desktop

Performance

77

71

Accessibility

100

100

Best Practices

100

100

SEO

100

100

Key Design Decisions

Verified context instead of a generic chatbot

Recruiters need evidence about the candidate, not an unrestricted chatbot. The assistant therefore retrieves portfolio-specific information and is instructed to stay within that evidence.

Review before CV import

AI extraction can be wrong. Gradfolio presents extracted content for human review before writing it to the public site.

Database-level isolation

Multi-user separation is enforced with Supabase RLS instead of relying only on hidden buttons or frontend checks.

One public link and a separate private editor

The portfolio is safe to share publicly. Editing remains behind authentication and owner verification.

Known Limitations

Performance: PageSpeed performance measured 77 on mobile and 71 on desktop. The animation-heavy interface and client-side data loading need further optimization.

Contact confirmation: Formspree redirects visitors to its generic confirmation page instead of showing an on-site success state.

Initial fallback state: During one Chrome test, placeholder portfolio content appeared briefly before the saved profile data loaded.

Search indexing: The metadata, robots file, and sitemap are live, but new pages may not immediately appear in Google results.

Social metadata length: The share card renders, but one inspector warned that the title is long and the description is short.

Database portability: The production Supabase schema and RLS policies are not yet versioned as a migration in this repository, so a brand-new database requires manual recreation of the documented tables and policies.

Lint debt: The production build succeeds, but the full lint check reports pre-existing issues mainly involving internal admin navigation and one React effect.

AI Transparency

I used Claude Code and ChatGPT/Codex as development partners for brainstorming, initial code generation, debugging, code review, testing plans, and documentation. Google Gemini powers the product's CV extraction and portfolio assistant. I personally chose the product scope and architecture, reviewed changes, configured the data model and security behavior, tested edge cases, verified the production build, and checked the deployed site. AI-generated output was reviewed rather than accepted automatically.

Deployment

Gradfolio is deployed on Vercel. Pushes to main trigger a production deployment.

Production: https://gradfolio-ai.vercel.app

HTTPS: enabled

Analytics: Vercel Analytics

Performance monitoring: Vercel Speed Insights

Status

Gradfolio is live and functional. The current version includes production deployment, multi-user portfolio management, AI-assisted CV import, a verified-data assistant, SEO discovery files, social metadata, analytics, and documented hardening results.

Author

Ebraheim Mohamed Pasha Qadri

Computer & Autonomous Systems Engineer focused on AI, robotics, autonomous systems, and intelligent software.