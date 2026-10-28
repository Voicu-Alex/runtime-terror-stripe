import { FormularDocument } from "./FormularDocument";

export const metadata = { title: "Documente · Ce înseamnă pentru mine" };

export default function PaginaDocumente() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Completează profilul dintr-un document</h1>
        <p className="mt-1 text-stone-600">
          Contract de muncă, factură de utilități sau fluturaș de salariu. Claude citește documentul și propune etichete pentru
          profil. Nimic nu intră în profil până nu confirmi tu.
        </p>
      </div>

      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">Cum folosim documentul</p>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          <li>Documentul e trimis o singură dată pentru analiză și nu îl păstrăm. Nu îl scriem pe server și nu îl logăm.</li>
          <li>
            Înainte să îl încarci, <strong>acoperă CNP-ul, IBAN-ul și seria de buletin</strong>. Nu avem nevoie de ele. Dacă
            apar totuși în răspuns, le mascăm.
          </li>
          <li>Profilul rezultat rămâne doar pe telefonul sau calculatorul tău.</li>
        </ul>
      </div>

      <FormularDocument />
    </div>
  );
}
