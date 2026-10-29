import { Noutati } from "@/components/Noutati";

export const metadata = { title: "Noutăți · Ce înseamnă pentru mine" };

export default async function PaginaNoutati({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return <Noutati qInitial={q ?? ""} />;
}
