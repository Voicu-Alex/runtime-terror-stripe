import type { AnalizaDocument } from "./analiza-document";

/**
 * Modul demo: răspunsuri pregătite pentru documentele din test-docs/, fără apel la model.
 * Se activează când lipsește ANTHROPIC_API_KEY. Răspunsurile sunt scrise de mână după
 * conținutul documentelor fictive; cu o cheie reală, aceeași rută cheamă Claude.
 */
export const RASPUNSURI_DEMO: Record<string, AnalizaDocument> = {
  "contract-munca.pdf": {
    mod: "demo",
    tip_document: "contract_munca",
    etichete_propuse: [
      { tag: "angajat", incredere: 0.98, motiv: "Contract individual de muncă pe durată nedeterminată, normă întreagă." },
      { tag: "it", incredere: 0.9, motiv: "Angajatorul are cod CAEN 6201 (realizare software), iar funcția este programator." },
    ],
    valori: { salariu_brut: 12000 },
    explicatie_scurta:
      "Am găsit un contract de muncă la o firmă de software, pentru funcția de programator, cu salariu de bază brut de 12.000 lei pe lună. CNP-ul și IBAN-ul din document nu le-am păstrat.",
  },
  "factura-gaz.pdf": {
    mod: "demo",
    tip_document: "factura_utilitati",
    etichete_propuse: [
      { tag: "consumator_gaz", incredere: 0.97, motiv: "Factură de gaze naturale pentru un client casnic, cu consum lunar în kWh." },
    ],
    valori: { furnizor: "Engie", suma_factura: 553.44 },
    explicatie_scurta:
      "Am găsit o factură de gaze naturale de la Engie pentru luna septembrie 2026, client casnic, cu un total de plată de 553,44 lei și scadență pe 25 octombrie 2026.",
  },
  "fluturas-salariu.png": {
    mod: "demo",
    tip_document: "fluturas_salariu",
    etichete_propuse: [
      { tag: "angajat", incredere: 0.98, motiv: "Fluturaș de salariu cu salariu brut, contribuții și net." },
      { tag: "constructii", incredere: 0.9, motiv: "Angajatorul are cod CAEN 4120 (construcții de clădiri), funcția este zidar." },
      { tag: "pilon3", incredere: 0.85, motiv: "Apare o reținere lunară de 100 lei pentru Pilon III." },
      { tag: "pilon2", incredere: 0.6, motiv: "CAS-ul menționează partea de Pilon II (4,75%); nu spune la ce fond ești." },
    ],
    valori: { salariu_brut: 6500, salariu_net: 3802 },
    explicatie_scurta:
      "Am găsit un fluturaș de salariu pentru octombrie 2026 la o firmă de construcții: 6.500 lei brut, 3.802 lei net, cu contribuție la Pilon III de 100 lei pe lună.",
  },
};

export function raspunsDemo(numeFisier: string): AnalizaDocument | null {
  return RASPUNSURI_DEMO[numeFisier.toLowerCase()] ?? null;
}
