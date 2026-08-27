import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PortfolioClient from "../PortfolioClient";
import { getPublicProfileBySlug } from "@/data/publicData";

type PublicPortfolioPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: PublicPortfolioPageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getPublicProfileBySlug(slug);

  if (!profile) {
    return {
      title: "Portfolio not found",
      robots: { index: false, follow: false },
    };
  }

  const title = `${profile.full_name} — ${
    profile.professional_title || "Professional Portfolio"
  }`;

  const description =
    profile.hero_tagline ||
    profile.bio ||
    `Explore ${profile.full_name}'s projects, experience, education, skills, and verified AI career assistant.`;

  const canonicalUrl = `https://gradfolio-ai.vercel.app/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    authors: [{ name: profile.full_name }],
    robots: { index: true, follow: true },
    openGraph: {
      type: "profile",
      url: canonicalUrl,
      title,
      description,
      siteName: "Gradfolio",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${profile.full_name}'s Gradfolio portfolio`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export default async function PublicPortfolioPage({
  params,
}: PublicPortfolioPageProps) {
  const { slug } = await params;

  const profile = await getPublicProfileBySlug(slug);

  if (!profile) {
    notFound();
  }

  return <PortfolioClient slug={slug} />;
}