import { PentruTine } from "@/components/PentruTine";

// „Pentru tine”: macheta v6 a lui Andrei pe motorul aplicației (components/PentruTine.tsx).
// ?p=andrei|maria|ion|ioana|elena arată o persoană demo; fără profil, exemplul e Andrei.
// Landing-ul de prezentare e la /despre; macheta statică, la /v6.
export const metadata = { title: "Pentru tine · Ce înseamnă pentru mine" };

export default async function Pagina({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { p } = await searchParams;
  return <PentruTine demoId={p ?? null} />;
}
