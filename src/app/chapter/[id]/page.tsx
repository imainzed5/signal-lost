import { notFound } from "next/navigation";

import { ChapterRouteView } from "@/components/ChapterRouteView";
import { parseChapterId } from "@/data/chapters";

type ChapterPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { id } = await params;
  const chapterId = parseChapterId(id);

  if (chapterId === null) {
    notFound();
  }

  return <ChapterRouteView chapterId={chapterId} />;
}
