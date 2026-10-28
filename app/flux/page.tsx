import CardSchimbare from "@/components/CardSchimbare";
import { CATALOG } from "@/lib/catalog";
import { dupaImpact } from "@/lib/card";
import { persoanaDemo } from "@/lib/persoane-demo";
import { potriveste } from "@/lib/potrivire";

// Data demo-ului (CLAUDE.md, session-state): fluxul se vede ca pe 28 oct 2026.
const AZI_DEMO = "2026-10-28";

export default async function Flux({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { p } = await searchParams;
  const persoana = persoanaDemo(p);
  const flux = potriveste(persoana.profil, CATALOG, AZI_DEMO).sort(dupaImpact);

  return (
    <div>
      <h1 className="m-0 font-head text-2xl font-extrabold tracking-[-.015em] text-v3-ink">Fluxul meu</h1>
      <p className="mt-1 mb-0 text-sm text-v3-ink-2">
        Profil demo: <b className="text-v3-ink">{persoana.nume}</b> · {flux.length} acte care te privesc
      </p>
      <h2 className="mt-5 mb-0 border-b-2 border-v3-ink pb-2 text-[13px] font-extrabold tracking-[.08em] text-v3-ink uppercase">
        Toate actele care te privesc <small className="text-[13px] font-semibold tracking-normal text-v3-ink-2 normal-case">după impact</small>
      </h2>
      <ul className="m-0 list-none p-0">
        {flux.map((x) => (
          <CardSchimbare key={x.schimbare.id} p={x} valori={persoana.profil.valori} />
        ))}
      </ul>
    </div>
  );
}
