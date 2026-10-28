import Link from "next/link";
import { T } from "@/components/Limba";
import { CATALOG } from "@/lib/catalog";
import { FAMILII, TOATE_TAGURILE } from "@/lib/taguri";

export default function Acasa() {
  const verificate = CATALOG.filter((s) => s.verificat_la).length;
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section>
        <h1 className="m-0 font-head text-[clamp(26px,6.6vw,34px)] leading-[1.16] font-extrabold tracking-[-.015em] text-v3-ink">
          <T k="Fiecare lege nouă, tradusă în lei pe lună pentru tine." />
        </h1>
        <p className="mt-3 text-[15px] text-v3-ink-2">
          {CATALOG.length} acte în catalog ({verificate} verificate în text) · {TOATE_TAGURILE.length} etichete în{" "}
          {Object.keys(FAMILII).length} familii · potrivirea rulează pe dispozitiv.
        </p>
      </section>

      <section className="rounded-2xl border border-v3-tintb bg-linear-135 from-v3-tint1 via-v3-tint2 via-45% to-white px-[18px] py-5 lg:px-[34px] lg:py-[30px]">
        <h2 className="m-0 font-head text-[22px] leading-[1.25] font-extrabold tracking-[-.015em]">
          <T k="Încarcă un document și profilul se completează singur" />
        </h2>
        <p className="mt-2 max-w-[62ch] text-[17px] leading-[1.6] text-[#1F2937]">
          <T k="Contract de muncă, fluturaș, cupon de pensie, factură. Claude citește documentul, etichetele și cifrele intră în profil, tu scoți ce nu e cazul. Apoi vezi fluxul tău: fiecare act care te privește, în lei pe lună." />
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/profil" className="inline-flex min-h-[46px] items-center rounded-[10px] bg-v3-ink px-[18px] font-bold text-white no-underline">
            <T k="Completează profilul" />
          </Link>
          <Link href="/flux" className="inline-flex min-h-[46px] items-center rounded-[10px] border border-v3-line bg-white px-[18px] font-semibold text-v3-ink no-underline">
            <T k="Fluxul meu" />
          </Link>
        </div>
      </section>

      <section className="text-sm text-v3-ink-2">
        <p>
          <T k="Exemple fictive:" /> <Link href="/flux?p=andrei" className="underline">Andrei, 32</Link> ·{" "}
          <Link href="/flux?p=maria" className="underline">Maria, 45</Link> · <Link href="/flux?p=ion" className="underline">Ion, 67</Link> ·{" "}
          <Link href="/flux?p=ioana" className="underline">Ioana, 23</Link>
        </p>
      </section>
    </div>
  );
}
