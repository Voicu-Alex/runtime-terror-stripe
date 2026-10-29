import Link from "next/link";
import { FluxMeu } from "@/components/FluxMeu";
import { T } from "@/components/Limba";
import { ListaFlux } from "@/components/ListaFlux";
import { sortareDin, type Sortare } from "@/lib/card";
import { CATALOG } from "@/lib/catalog";
import { PERSOANE_DEMO, persoanaDemo } from "@/lib/persoane-demo";
import { potriveste } from "@/lib/potrivire";

// Data demo-ului (CLAUDE.md, session-state): fluxul persoanelor demo se vede ca pe 28 oct 2026.
const AZI_DEMO = "2026-10-28";

export const metadata = { title: "Fluxul meu · Buzunar" };

export default async function Flux({ searchParams }: { searchParams: Promise<{ p?: string; sort?: string }> }) {
  const { p, sort } = await searchParams;
  const sortare = sortareDin(sort);

  return (
    <div>
      <h1 className="m-0 font-head text-[clamp(26px,6.6vw,34px)] leading-[1.16] font-extrabold tracking-[-.015em] text-v3-ink">
        <T k="Fluxul meu" />
      </h1>
      {p && p in PERSOANE_DEMO ? <FluxDemo id={p} sortare={sortare} /> : <FluxMeu sortare={sortare} />}
    </div>
  );
}

/** Persoanele fictive din demo (Andrei, Maria, Ion, Ioana), calculate pe server pentru că nu depind de dispozitiv. */
function FluxDemo({ id, sortare }: { id: string; sortare: Sortare }) {
  const persoana = persoanaDemo(id);
  const potriviri = potriveste(persoana.profil, CATALOG, AZI_DEMO);
  return (
    <>
      <p className="mt-1 mb-0 text-sm text-v3-ink-2">
        <T k="Profil demo:" /> <b className="text-v3-ink">{persoana.nume}</b> ·{" "}
        <Link href="/flux" className="text-v3-ink underline decoration-v3-line underline-offset-2">
          <T k="profilul meu" />
        </Link>
        {" · "}<Link href={`/notificare?p=${id}`} className="underline decoration-v3-line underline-offset-2"><T k="Previzualizare notificări" /></Link>
      </p>
      <ListaFlux
        potriviri={potriviri}
        valori={persoana.profil.valori}
        sortare={sortare}
        baza={`/flux?p=${id}`}
        azi={AZI_DEMO}
        profil={persoana.profil}
        pastrare={{ tip: "demo", cheie: `cipm.demo.${id}.valori` }}
      />
    </>
  );
}
