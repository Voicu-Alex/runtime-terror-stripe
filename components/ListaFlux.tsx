import Link from "next/link";
import CardSchimbare from "@/components/CardSchimbare";
import { dupaImpact, dupaNoutate } from "@/lib/card";
import type { Potrivire } from "@/lib/potrivire";
import type { Valori } from "@/lib/profil";

export type Sortare = "impact" | "noi";

export function sortareDin(x: string | undefined): Sortare {
  return x === "noi" ? "noi" : "impact";
}

/** Lista „Toate actele care te privesc”, cu comutatorul de sortare. O folosesc și profilul real, și persoanele demo. */
export function ListaFlux({ potriviri, valori, sortare, baza }: { potriviri: Potrivire[]; valori: Valori; sortare: Sortare; baza: string }) {
  const flux = [...potriviri].sort(sortare === "noi" ? dupaNoutate : dupaImpact);
  const sep = baza.includes("?") ? "&" : "?";
  const optiune = (s: Sortare, text: string) =>
    s === sortare ? (
      <b className="text-v3-ink" aria-current="true">
        {text}
      </b>
    ) : (
      <Link href={`${baza}${sep}sort=${s}`} className="text-v3-ink-2 underline decoration-v3-line underline-offset-2 hover:text-v3-ink">
        {text}
      </Link>
    );

  return (
    <>
      <h2 className="mt-5 mb-0 flex flex-wrap items-baseline justify-between gap-x-3 border-b-2 border-v3-ink pb-2 text-[13px] font-extrabold tracking-[.08em] text-v3-ink uppercase">
        Toate actele care te privesc
        <small className="text-[13px] font-semibold tracking-normal normal-case">
          {optiune("impact", "după impact")} <span className="text-v3-ink-2">·</span> {optiune("noi", "cele mai noi")}
        </small>
      </h2>
      {flux.length === 0 ? (
        <p className="mt-4 text-[15px] text-v3-ink-2">Niciun act din catalog nu se potrivește cu etichetele tale deocamdată.</p>
      ) : (
        <ul className="m-0 list-none p-0">
          {flux.map((x) => (
            <CardSchimbare key={x.schimbare.id} p={x} valori={valori} />
          ))}
        </ul>
      )}
    </>
  );
}
