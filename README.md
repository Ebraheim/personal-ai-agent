Gradfolio

Turn your CV into a website that speaks for you.

Gradfolio is an AI-powered career website platform for students and fresh graduates. It transforms a traditional CV into a structured, interactive public portfolio with projects, experience, education, skills, certifications, achievements, and a verified-data AI assistant.

Live Demo: https://gradfolio-ai.vercel.app
Example Portfolio: https://gradfolio-ai.vercel.app/ebraheim

Why I Built It

Students and fresh graduates often have useful projects, skills, certifications, internships, and achievements that are difficult to communicate through a traditional one-page CV.

Gradfolio was built to turn that information into a cleaner, more interactive career presence that can be shared with recruiters through one link.

The goal was to build something that:

starts from information the user already has in a CV

makes portfolio creation easier for non-technical users

gives each user their own public website

allows the owner to edit their content without touching code

gives visitors an AI assistant that answers using verified portfolio data

keeps each user's data isolated and protected

Core Features

CV Import

Users can upload a CV and use AI-assisted extraction to identify structured information such as:

profile details

experience

education

projects

skills

certifications

AI knowledge

The user reviews the extracted content before importing it into their website.

Public Career Website

Each account receives its own public portfolio URL.

Example:

gradfolio-ai.vercel.app/ebraheim

The public website can display:

Home / hero section

Projects

Experience

Education

Achievements

Skills

Certifications

About

Contact

Downloadable CV

AI assistant

Sections with no content can be hidden automatically.

Website Editor

The private admin dashboard lets the owner manage their website without editing code.

Owners can update:

homepage content

projects

experience

education

achievements

skills

certifications

about content

contact information

AI knowledge

section visibility and ordering

CV

Verified-Data AI Assistant

Each public portfolio includes an AI assistant that can answer visitor questions about the portfolio owner.

The assistant is designed to respond using verified information connected to that specific user instead of acting as a general-purpose chatbot.

Example questions:

What projects has this person worked on?

What are their main skills?

What experience do they have?

How can I contact them?

Suggested questions are stored and reused so the application does not need to regenerate them on every page refresh.

Multi-User Architecture

Gradfolio supports multiple independent users.

Each user has:

their own account

their own portfolio slug

their own website content

their own CV

their own AI knowledge

their own suggested questions

User data is isolated at both the application and database level.

Secure Owner Editing

Visitors can freely view a public portfolio, but editing controls are only available to the authenticated owner.

The owner flow includes:

Public Portfolio
      ↓
Edit Website
      ↓
Owner Password Confirmation
      ↓
Admin Dashboard

A recruiter visiting the same public link cannot access the editor without the owner's account credentials.

Account Management

Owners can:

view their account email

view their public website URL

change their password

log out

permanently delete their account

Account deletion requires:

the current password

typing DELETE

final confirmation

Deletion removes the user's website data, uploaded CV files, and authentication account.

Tech Stack

Frontend

Next.js

React

TypeScript

Tailwind CSS

Next.js App Router

Backend

Next.js Route Handlers

Supabase

Database & Authentication

Supabase PostgreSQL

Supabase Auth

Row Level Security (RLS)

Supabase Storage

AI

Google Gemini

@google/genai

Deployment

Vercel

Vercel Speed Insights

High-Level Architecture

                    ┌─────────────────────┐
                    │      Visitor        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Public Portfolio  │
                    │   /[profile-slug]   │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
        ┌─────────────────┐        ┌─────────────────┐
        │ Portfolio Data  │        │  AI Assistant   │
        └────────┬────────┘        └────────┬────────┘
                 │                           │
                 └─────────────┬─────────────┘
                               ▼
                    ┌─────────────────────┐
                    │      Supabase       │
                    │ DB / Auth / Storage │
                    └──────────┬──────────┘
                               ▲
                               │
                    ┌──────────┴──────────┐
                    │   Admin Dashboard   │
                    │ Authenticated Owner │
                    └─────────────────────┘

Database Design

Gradfolio uses owner-scoped data across tables including:

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

Uploaded CV files are stored in the private cvs storage bucket.

Security

Security was treated as part of the application design rather than only as a UI feature.

Row Level Security

RLS is enabled across the application's public database tables.

Owner-editable rows use policies based on the authenticated Supabase user, for example:

auth.uid() = user_id

Profiles use the authenticated account ID:

auth.uid() = id

This prevents one signed-in user from modifying another user's portfolio data.

Additional Protection

admin pages require authentication

owner editing is separated from public viewing

public profile editing controls are only shown to the profile owner

entering editing mode from the public website requires password confirmation

account deletion requires password verification and explicit confirmation

server-only Supabase credentials are stored in environment variables

CV files are stored separately by user

User Flow

Create Account
      ↓
Onboarding
      ↓
Upload CV
      ↓
AI-Assisted Extraction
      ↓
Review & Import
      ↓
Edit Website
      ↓
Publish Public Portfolio
      ↓
Share Link With Recruiters

Users can also skip CV import and build their website manually.

Running Locally

1. Clone the repository

git clone <your-repository-url>
cd personal-ai-agent

2. Install dependencies

npm install

3. Create .env.local

Add the required environment variables:

GEMINI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=

Never commit real secret values to Git.

4. Run the development server

npm run dev

Open:

http://localhost:3000

Production Build

Run:

npm run build

The project has been successfully tested with a production Next.js build before deployment.

Deployment

Gradfolio is deployed using Vercel.

Production:

https://gradfolio-ai.vercel.app

Vercel is connected to the GitHub repository, so pushes to the production branch trigger a new deployment automatically.

Vercel Speed Insights is also enabled to collect real-user performance metrics.

Key Engineering Decisions

Verified AI Context Instead of a Generic Chatbot

The public assistant is intentionally scoped to the portfolio owner's information.

This reduces irrelevant responses and makes the AI feature useful to recruiters who want to understand the candidate.

Review Before CV Import

AI extraction is not treated as automatically correct.

Users review extracted information before it is written into their public portfolio.

Database-Level User Isolation

Multi-user separation is enforced through Supabase RLS rather than relying only on frontend checks.

One Public Link, Separate Private Editor

The public portfolio is designed to be safely shared with anyone.

Editing happens through authenticated admin routes, while owner-only controls remain hidden from normal visitors.

What I Learned

Building Gradfolio required combining frontend development, backend APIs, authentication, databases, AI integration, security, deployment, and product design into one working system.

Key areas developed during the project included:

designing a multi-user SaaS architecture

implementing authentication and authorization

working with Supabase PostgreSQL and RLS

designing CRUD-based content management

integrating an LLM into a scoped application workflow

handling CV upload, extraction, and storage

separating public and private application experiences

building secure account management

deploying and validating a production application

using real-user performance monitoring

AI-Assisted Development

AI tools were used during development for activities such as:

exploring implementation approaches

debugging

reviewing code

generating initial code structures

discussing architecture and product decisions

Final decisions about product scope, validation rules, user flows, security behavior, database structure, feature acceptance, testing, and deployment were reviewed and controlled by the developer.

Status

Gradfolio v1.0 — Live

The core product is deployed and functional.

Author

Ebraheim Mohamed Pasha Qadri

Built as a practical AI/software engineering project focused on turning a traditional student or graduate CV into a stronger interactive career presence.