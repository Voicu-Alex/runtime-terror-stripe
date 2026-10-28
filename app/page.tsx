import Link from "next/link";
import { CATALOG } from "@/lib/catalog";
import { FAMILII, TOATE_TAGURILE } from "@/lib/taguri";

export default function Acasa() {
  const verificate = CATALOG.filter((s) => s.verificat_la).length;
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold">Fiecare lege nouă, tradusă în lei pe lună pentru tine.</h1>
        <p className="mt-2 text-stone-600">
          Catalogul are {CATALOG.length} schimbări ({verificate} verificate în text, restul de verificat)
          și {TOATE_TAGURILE.length} etichete în {Object.keys(FAMILII).length} familii. Potrivirea rulează pe dispozitiv:
          profilul nu pleacă nicăieri.
        </p>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="font-semibold">Încarcă un document și profilul se completează singur</h2>
        <p className="mt-1 text-sm text-stone-600">
          Contract de muncă, fluturaș, cupon de pensie, factură. Claude citește documentul, etichetele și cifrele intră în profil, tu
          scoți ce nu e cazul. Apoi vezi fluxul tău: fiecare act care te privește, în lei pe lună.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/profil" className="inline-block rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white">
            Completează profilul
          </Link>
          <Link href="/flux" className="inline-block rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium">
            Fluxul meu
          </Link>
        </div>
      </section>

      <section className="text-sm text-stone-500">
        <p>
          Exemple fictive: <Link href="/flux?p=andrei" className="underline">Andrei, 32</Link> ·{" "}
          <Link href="/flux?p=maria" className="underline">Maria, 45</Link> · <Link href="/flux?p=ion" className="underline">Ion, 67</Link>.
          Notificarea e la „Azi”, „Planul meu” e bara de jos din flux. Logica de potrivire e în <code>lib/potrivire.ts</code>, catalogul în{" "}
          <code>data/catalog.json</code>.
        </p>
      </section>
    </div>
  );
}
