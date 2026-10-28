import Link from "next/link";
import { CATALOG } from "@/lib/catalog";
import { TOATE_TAGURILE } from "@/lib/taguri";

export default function Acasa() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold">Fiecare lege nouă, tradusă în lei pe lună pentru tine.</h1>
        <p className="mt-2 text-stone-600">
          Scheletul aplicației. Catalogul are {CATALOG.length} schimbări verificate și {TOATE_TAGURILE.length} etichete în 6
          familii. Potrivirea rulează pe dispozitiv: profilul nu pleacă nicăieri.
        </p>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="font-semibold">Completează profilul dintr-un document</h2>
        <p className="mt-1 text-sm text-stone-600">
          Încarci un contract de muncă, o factură sau un fluturaș de salariu. Claude propune etichetele, tu le confirmi.
        </p>
        <Link
          href="/documente"
          className="mt-3 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Încarcă un document
        </Link>
      </section>

      <section className="text-sm text-stone-500">
        <p>
          Fluxul cu carduri, notificarea și „Planul meu” sunt în lucru (issue #3). Logica de potrivire e în{" "}
          <code>lib/potrivire.ts</code>, catalogul în <code>data/catalog.json</code>.
        </p>
      </section>
    </div>
  );
}
