import Flux from "@/components/Flux";
import { idPersoana } from "@/lib/persoane-demo";

export default async function PaginaFlux({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { p } = await searchParams;
  return <Flux id={idPersoana(p)} />;
}
