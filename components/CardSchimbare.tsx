"use client";

import { useId, useRef, useState } from "react";
import type { Potrivire } from "@/lib/potrivire";
import type { CampValoare, Valori } from "@/lib/profil";
import type { Actiune, CineAplica } from "@/lib/catalog";
import { destinatie } from "@/lib/destinatii";
import { useLimba } from "@/components/Limba";
import { etichetaTagL } from "@/lib/i18n";
import { ETICHETA_STARE, cuSemn, cuTracking, dataScurta, mii, vedere, zile, type StareCard } from "@/lib/card";
import { furnizori, niveluri, specialist } from "@/lib/continut";

// Aspectul urmează rândul din lista „Toate actele care te privesc” din mockup/v3/index.html?v=f.
// Cele 3 niveluri din issue #3, cu textele din content/niveluri.json (Iasmina):
//   Zero   = rândul deschis: „Pentru tine:” + o propoziție, apoi ce poți face
//   Curios = „De ce?”: 3–4 propoziții cu un exemplu
//   Expert = „Arată-mi legea”: actul, MO, articolul, nuanțele și linkurile oficiale

const PILL: Record<StareCard, string> = {
  proiect: "border-dashed border-v3-ink-2 bg-white text-v3-ink-2",
  adoptat: "border-v3-accent bg-v3-accent-soft text-v3-accent",
  in_vigoare: "border-v3-pos bg-v3-pos-soft text-v3-pos",
  termen_depasit: "border-[#C3CAC2] bg-v3-past-bg text-v3-past",
};

const eTODO = (s: string) => !s || s.trim() === "TODO";

export default function CardSchimbare({
  p,
  valori,
  bifata = false,
  onBifeaza,
  onValoare,
}: {
  p: Potrivire;
  valori: Valori;
  /** acțiunea e bifată în „Planul meu” */
  bifata?: boolean;
  onBifeaza?: () => void;
  /** omul dă valoarea care îi lipsește formulei („spune-ne salariul brut”); o păstrează ListaFlux */
  onValoare?: (camp: CampValoare, valoare: number) => void;
}) {
  const [deschis, setDeschis] = useState(false);
  const [curios, setCurios] = useState(false);
  const [lege, setLege] = useState(false);
  const [copiat, setCopiat] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const uid = useId();
  const { t, limba } = useLimba();
  const d = (iso: string) => dataScurta(iso, limba);

  const s = p.schimbare;
  const v = vedere(p, valori, limba);
  const a = s.actiuni.find((x) => x.termen) ?? s.actiuni[0];
  const dep = v.termen?.depasit;
  const modificari = s.modificat_prin ?? [];
  const ultima = modificari[modificari.length - 1];
  const n = niveluri(s);
  const fz = furnizori(s.id);
  const sp = specialist(s);
  const surseExtra = n.surse.filter((u) => u !== s.sursa_url && !u.startsWith("https://posf.ro"));
  // suma calculată din salariul brut e brută: din ea se rețin contribuțiile și impozitul
  const brut = s.formula_tip?.tip === "diferenta_prag" && s.formula_tip.parametri.camp === "salariu_brut";

  return (
    <li id={`c-${s.id}`} className="border-b border-v3-line">
      {/* Zero */}
      <button
        type="button"
        aria-expanded={deschis}
        aria-controls={`${uid}-d`}
        onClick={() => setDeschis(!deschis)}
        className="grid w-full grid-cols-[1fr_auto] items-start gap-x-3.5 gap-y-1.5 py-4 text-left"
      >
        <span className="col-start-1 text-[11.5px] font-extrabold tracking-[.1em] text-v3-accent uppercase">{v.kicker}</span>
        <span
          className={`col-start-2 row-span-2 row-start-1 text-right font-sans text-xl font-extrabold tracking-[-.02em] whitespace-nowrap tabular-nums lining-nums ${
            dep ? "text-v3-past" : v.suma === null || v.suma === 0 ? "text-v3-ink" : v.suma < 0 ? "text-v3-neg" : "text-v3-pos"
          }`}
        >
          {v.suma === null ? "—" : cuSemn(v.suma)}
          <small className="block text-[12.5px] font-semibold tracking-normal text-v3-ink-2">
            {v.suma === null ? t("de calculat") : v.suma === 0 ? t("lei/lună acum") : brut ? t("lei/lună brut") : t("lei/lună")}
          </small>
        </span>
        <span className={`col-start-1 text-[17px] leading-[1.3] font-bold ${dep ? "text-v3-past" : "text-v3-ink"}`}>{v.titlu}</span>
        {v.termen && (
          <span
            className={`col-span-2 text-[15px] font-bold ${dep ? "text-v3-past" : v.termen.urgent ? "text-v3-urg" : "text-v3-ink"}`}
          >
            {dep ? `${t("termen depășit:")} ${v.termen.text}` : `${t("până la")} ${v.termen.text} · ${t("mai ai")} ${zile(v.termen.zile, limba)}`}
            {v.termen.urgent && (
              <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-v3-urg px-2.5 py-0.5 align-[1px] text-[12.5px] text-white">
                <span aria-hidden="true" className="size-[7px] rounded-full bg-white" />
                {t("urgent")}
              </span>
            )}
          </span>
        )}
        <span className="col-span-2 flex flex-wrap items-center gap-1.5 text-[12.5px] text-v3-ink-2">
          <span className={`rounded-full border px-[9px] py-px font-semibold ${PILL[v.stare]}`}>{t(ETICHETA_STARE[v.stare])}</span>
          <span>{v.act}</span>
          {ultima && (
            // Forma la zi: textul citit include modificările ulterioare (legea cea mai nouă câștigă).
            <span>· {t("la zi:")} {ultima.data ? `${ultima.act}, ${d(ultima.data)}` : ultima.act}</span>
          )}
        </span>
      </button>


      {deschis && (
        <div id={`${uid}-d`} className="pb-4">
          {/* Zero: o propoziție, fără jargon */}
          <p className="m-0 mb-2.5 max-w-[60ch] text-[15px] text-v3-ink">
            <b>{t("Pentru tine:")}</b> <span lang="ro">{n.zero}</span>
          </p>
          {s.estimare && v.suma !== null && v.suma !== 0 && (
            <p className="m-0 mb-2.5 text-[13.5px] text-v3-ink-2">{t("Suma e calculul nostru pe profilul tău, nu o cifră scrisă în lege.")}</p>
          )}
          {v.cere && p.valori_lipsa[0] && onValoare ? (
            // Cardul cere valoarea care îi lipsește; ListaFlux o păstrează pe dispozitiv și recalculează toate cardurile.
            <form
              className="m-0 mb-3 rounded-[10px] border border-v3-line bg-white p-3"
              onSubmit={(e) => {
                e.preventDefault();
                const n = Number(String(new FormData(e.currentTarget).get("valoare")).replace(/\./g, "").replace(",", "."));
                if (Number.isFinite(n) && n > 0) onValoare(p.valori_lipsa[0], n);
              }}
            >
              <label htmlFor={`${uid}-v`} className="mb-1.5 block text-[14px] font-semibold text-v3-ink">
                {t("Ca să vezi suma,")} {t(v.cere)}:
              </label>
              <div className="flex gap-2">
                <input
                  id={`${uid}-v`}
                  name="valoare"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="lei"
                  className="min-h-11 w-full min-w-0 rounded-[10px] border border-v3-ink-2 px-3 text-[15px]"
                />
                <button type="submit" className="min-h-11 shrink-0 rounded-[10px] bg-v3-ink px-4 font-bold text-white">
                  {t("Calculează")}
                </button>
              </div>
              <p className="mt-1.5 mb-0 text-[12.5px] text-v3-ink-2">{t("Rămâne doar pe acest dispozitiv.")}</p>
            </form>
          ) : (
            v.cere && <p className="m-0 mb-2.5 text-[13.5px] font-semibold text-v3-ink">{t("Ca să calculăm suma:")} {t(v.cere)}.</p>
          )}
          <p className="m-0 mb-3 text-[13.5px] text-v3-ink-2">
            {t("Te privește ca:")}{" "}
            {p.taguri_comune.map((x) => (
              <span key={x} className="mr-1 mb-1 inline-block rounded-lg border border-v3-line bg-white px-[9px] py-0.5 text-[13px] font-semibold">
                {etichetaTagL(limba, x)}
              </span>
            ))}
          </p>

          {a && (
            <div
              className={`mb-3 rounded-[10px] p-3 ${
                dep ? "bg-v3-past-bg text-v3-past" : v.termen?.urgent ? "bg-v3-urg-soft shadow-[inset_3px_0_0_var(--color-v3-urg)]" : "bg-v3-act"
              }`}
            >
              {s.actiuni.map((ac, i) => (
                <ActiuneTipizata key={i} ac={ac} dep={!!dep && ac === a} termenDepasit={v.termen?.text} prima={i === 0} />
              ))}
              {v.economieAn !== null && !dep && (
                <p className="m-0 mb-1.5 text-[14.5px]">
                  {t("Dacă o faci, păstrezi până la")} <b className="whitespace-nowrap">{mii(v.economieAn)} {t("lei/an")}</b>.
                </p>
              )}
              {onBifeaza && !dep && (
                // Planul meu: bifa intră în bara de jos (ListaFlux); economia se adună doar dacă acțiunea are formulă.
                <label className="mb-1.5 flex min-h-11 cursor-pointer items-center gap-2 text-[14.5px] font-semibold">
                  <input type="checkbox" checked={bifata} onChange={onBifeaza} className="size-5 accent-v3-ink" />
                  {bifata ? t("În planul meu") : t("O fac, pune-o în planul meu")}
                </label>
              )}
              {a.one_click && !dep && (
                // Ordinea fixă: întâi comparatorul oficial, apoi furnizorii (business/parteneri.json, Haggy).
                // Aici intră mai târziu comisionul pe client redirecționat (issue #4); acum niciun furnizor nu plătește.
                <a
                  href={cuTracking(a.one_click, s.id)}
                  target="_blank"
                  rel="noopener"
                  className="mt-1.5 inline-flex min-h-[46px] items-center gap-2 rounded-[10px] bg-v3-ink px-[18px] font-bold text-white no-underline"
                >
                  {t("Compară oferte pe comparatorul ANRE")}
                  <Sageata />
                  <span className="sr-only">{t("(se deschide într-un tab nou)")}</span>
                </a>
              )}
              {fz.length > 0 && !dep && (
                <div className="mt-3">
                  <p className="m-0 mb-1 text-[13px] text-v3-ink-2">
                    {t("Sau direct la un furnizor. În ordine alfabetică")}
                    {fz.every((f) => !f.comision) ? t("; nu primim nimic de la ei.") : t("; cei marcați „partener” ne plătesc un comision.")}
                  </p>
                  <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                    {fz.map((f) => (
                      <li key={f.nume}>
                        <a
                          href={cuTracking(f.url, s.id)}
                          target="_blank"
                          rel="noopener"
                          className="inline-flex min-h-11 items-center gap-1.5 rounded-[10px] border border-v3-line bg-white px-3 text-sm font-semibold text-v3-ink no-underline"
                        >
                          {f.nume}
                          {f.comision && <span className="rounded border border-v3-ink-2 px-1 text-[11px] text-v3-ink-2">{t("partener")}</span>}
                          <Sageata />
                          <span className="sr-only">{t("(se deschide într-un tab nou)")}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* și după termen: întrebarea specialistului privește situația de acum */}
              {sp && (
                <div className="mt-3 border-t border-v3-line pt-3">
                  <p className="m-0 mb-1.5 text-[14.5px] font-semibold">{t("Situația ta e mai complicată?")}</p>
                  <button
                    type="button"
                    onClick={() => dialog.current?.showModal()}
                    className="min-h-11 rounded-[10px] border border-v3-ink bg-white px-4 text-sm font-semibold text-v3-ink"
                  >
                    {t("Găsește un")} {t(sp.profesie)}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {n.curios && (
              <button
                type="button"
                aria-expanded={curios}
                aria-controls={`${uid}-c`}
                onClick={() => setCurios(!curios)}
                className="min-h-11 rounded-[10px] border border-v3-line bg-white px-4 text-sm font-semibold text-v3-ink aria-expanded:border-v3-ink"
              >
                {t("De ce?")}
              </button>
            )}
            <button
              type="button"
              aria-expanded={lege}
              aria-controls={`${uid}-e`}
              onClick={() => setLege(!lege)}
              className="min-h-11 rounded-[10px] border border-v3-line bg-white px-4 text-sm font-semibold text-v3-ink aria-expanded:border-v3-ink"
            >
              {t("Arată-mi legea")}
            </button>
          </div>

          {/* Curios */}
          {curios && n.curios && (
            <p id={`${uid}-c`} className="mt-3 mb-0 max-w-[60ch] text-[15px] text-v3-ink" lang="ro">
              {n.curios}
            </p>
          )}

          {/* Expert */}
          {lege && (
            <div id={`${uid}-e`} className="mt-3 rounded-[10px] border border-v3-line bg-white p-3 text-sm">
              <h5 className="m-0 mb-1 text-xs font-bold tracking-[.05em] text-v3-ink-2 uppercase">{t("Sursa legală")}</h5>
              <p className="m-0 mb-1 font-semibold">
                {s.act} · {s.mo_ref}
              </p>
              <p className="m-0 mb-1 text-v3-ink-2" lang="ro">
                {n.expert ?? s.articol}
              </p>
              {modificari.length > 0 && (
                <div className="mt-2 mb-1">
                  <h5 className="m-0 mb-1 text-xs font-bold tracking-[.05em] text-v3-ink-2 uppercase">{t("Forma la zi")}</h5>
                  <p className="m-0 mb-1 text-[12.5px] text-v3-ink-2">
                    {t("Textul de mai sus ține cont de actele care l-au modificat ulterior. Când apare altul, intrarea se reverifică.")}
                  </p>
                  <ul className="m-0 list-none p-0">
                    {modificari.map((m) => (
                      <li key={m.act} className="mb-1">
                        <span className="font-semibold">{m.act}</span>
                        {!eTODO(m.mo_ref) && <span className="text-v3-ink-2"> · {m.mo_ref}</span>}
                        {m.data && <span className="text-v3-ink-2"> · {d(m.data)}</span>}
                        <span className="block text-v3-ink-2" lang="ro">
                          {m.ce}
                        </span>
                        {eTODO(m.sursa_url) ? (
                          <span className="text-[12.5px] text-v3-ink-2">{t("sursa: de găsit (TODO)")}</span>
                        ) : (
                          <a href={m.sursa_url} target="_blank" rel="noopener" className="text-[13px] font-semibold text-v3-accent">
                            {t("Textul modificării")} {"↗︎"}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <a href={s.sursa_url} target="_blank" rel="noopener" className="flex min-h-11 items-center font-semibold text-v3-accent">
                {t(s.sursa_url.includes("legislatie.just.ro") ? "Textul legii pe Portal Legislativ" : "Textul actului")} {"↗︎"}
              </a>
              {surseExtra.map((u) => (
                <a key={u} href={u} target="_blank" rel="noopener" className="flex min-h-11 items-center font-semibold text-v3-accent">
                  {t(eticheteSursa(u))} {"↗︎"}
                </a>
              ))}
              {s.sursa_explicativa && s.sursa_explicativa !== "TODO" && (
                <a href={s.sursa_explicativa} target="_blank" rel="noopener" className="flex min-h-11 items-center font-semibold text-v3-accent">
                  {t("Explicație (ANAF / presă)")} {"↗︎"}
                </a>
              )}
              <span className="block text-[12.5px] text-v3-ink-2">
                {s.verificat_la ? `${t("verificat la")} ${d(s.verificat_la)}` : t("neverificat încă")}
                {s.incredere === "scazuta" && ` ${t("· sursă de încredere scăzută")}`}
              </span>
            </div>
          )}

          <p className="mt-3 mb-0 text-[12.5px] text-v3-ink-2">
            {t("Rezumat generat cu AI")} · {s.verificat_la ? `${t("verificat la")} ${d(s.verificat_la)}` : t("neverificat încă")}
          </p>
        </div>
      )}

      {sp && (
        // Textele din content/modal-specialist.md și business/profesionisti.md (Chris, #5).
        <dialog
          ref={dialog}
          aria-labelledby={`${uid}-t`}
          className="m-auto w-[min(420px,calc(100%-32px))] rounded-2xl border border-v3-line p-5 text-v3-ink backdrop:bg-black/50"
        >
          <h4 id={`${uid}-t`} className="m-0 mb-2 font-head text-xl font-extrabold">
            {t("Când merită un")} {t(sp.profesie)}
          </h4>
          <p className="m-0 mb-3 text-[15px]">
            {t("Pașii de mai sus ajung pentru cei mai mulți oameni. Un")} {t(sp.profesie)}{" "}
            {t("te ajută când răspunsul depinde de cifrele tale și suma e mare.")}
          </p>
          {sp.intrebare && (
            <>
              <p className="m-0 text-[13px] font-bold text-v3-ink-2">{t("Ce să întrebi")}</p>
              <p className="m-0 mb-1.5 text-[15px]" lang="ro">
                {sp.intrebare}
              </p>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(sp.intrebare!).then(() => setCopiat(true), () => {})}
                className="mb-3 min-h-11 rounded-[10px] border border-v3-line bg-white px-3 text-sm font-semibold"
              >
                {copiat ? t("Copiat") : t("Copiază întrebarea")}
              </button>
            </>
          )}
          {sp.documente && (
            <>
              <p className="m-0 text-[13px] font-bold text-v3-ink-2">{t("Ce să ai pregătit")}</p>
              <p className="m-0 mb-3 text-[15px]" lang="ro">
                {sp.documente}
              </p>
            </>
          )}
          <p className="m-0 mb-4 text-[13px] text-v3-ink-2">
            {t("Te trimitem la registrul public al profesiei. Nu primim bani de la specialiști și nu trimitem nimic din profilul tău.")}
          </p>
          {sp.registru && (
            <a
              href={sp.registru.url}
              target="_blank"
              rel="noopener"
              className="mb-2 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[10px] bg-v3-ink font-bold text-white no-underline"
            >
              {t("Deschide registrul")}
              <Sageata />
              <span className="sr-only">({sp.registru.nume}, {t("(se deschide într-un tab nou)")})</span>
            </a>
          )}
          <form method="dialog">
            <button className="min-h-11 w-full rounded-[10px] border border-v3-line bg-white font-semibold">{t("Mă descurc singur")}</button>
          </form>
        </dialog>
      )}
    </li>
  );
}

const CINE: Record<CineAplica, string> = { tu: "tu", angajator: "angajatorul", furnizor: "furnizorul", stat: "statul" };

/**
 * O acțiune tipizată: „fa” = ai ceva de făcut; „verifica” = altcineva aplică legea, tu verifici;
 * „nimic_pana_la” = nimic de făcut până la termen. Destinația vine din lista verificată
 * (data/destinatii.json): buton spre pagina exactă sau numele ghișeului, niciodată un URL inventat.
 */
function ActiuneTipizata({ ac, dep, termenDepasit, prima }: { ac: Actiune; dep: boolean; termenDepasit?: string; prima: boolean }) {
  const { t, limba } = useLimba();
  const dest = destinatie(ac.destinatie);
  const titlu = dep
    ? `${t("Termen depășit:")} ${termenDepasit}`
    : ac.tip === "nimic_pana_la" && ac.termen
      ? `${t("Nu trebuie să faci nimic până la")} ${dataScurta(ac.termen, limba)}`
      : ac.tip === "verifica"
        ? `${t("Ce verifici")}${ac.cine_aplica && ac.cine_aplica !== "tu" ? ` · ${t("aplică")} ${t(CINE[ac.cine_aplica])}` : ""}`
        : ac.termen
          ? `${t("Ce poți face până la")} ${dataScurta(ac.termen, limba)}`
          : t("Ce poți face, oricând:");
  return (
    <div className={prima ? "" : "mt-3 border-t border-v3-line pt-3"}>
      <p className={`m-0 text-[13px] font-bold tracking-[.02em] ${dep ? "text-v3-past" : "text-v3-ink-2"}`}>{titlu}</p>
      <p className="mt-0.5 mb-1.5 font-semibold" lang="ro">
        {ac.text}
      </p>
      {/* butonul one-click duce deja acolo (cu parametrii de tracking), nu îl dublăm */}
      {dest && !dep && !(dest.url && ac.one_click) && (dest.url ? (
        <a
          href={dest.url}
          target="_blank"
          rel="noopener"
          className="mt-0.5 inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-v3-ink bg-white px-3 text-sm font-semibold text-v3-ink no-underline"
        >
          <span lang="ro">{dest.nume}</span>
          <Sageata />
          <span className="sr-only">{t("(se deschide într-un tab nou)")}</span>
        </a>
      ) : (
        <p className="m-0 text-[14px] text-v3-ink">
          <span className="font-semibold">{t("Unde:")}</span> <span lang="ro">{dest.nume}</span>
        </p>
      ))}
    </div>
  );
}

function Sageata() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 flex-none fill-none stroke-current stroke-2">
      <path d="M5 11 11 5M6 5h5v5" />
    </svg>
  );
}

function eticheteSursa(url: string): string {
  if (url.includes("legislatie.just.ro")) return "Act legat, pe Portal Legislativ";
  if (url.includes("anre.ro")) return "Comunicat ANRE";
  if (url.includes("posf.ro")) return "Comparatorul ANRE";
  return new URL(url).hostname.replace(/^www\./, "");
}
