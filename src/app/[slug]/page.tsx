import { notFound } from "next/navigation";
import PortfolioClient from "../PortfolioClient";
import { getPublicProfileBySlug } from "@/data/publicData";

type PublicPortfolioPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

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