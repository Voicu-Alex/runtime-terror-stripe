"use client";

import { useLimba } from "@/components/Limba";
import { bani, dataScurta, zile, ZILE_URGENT } from "@/lib/card";
import type { ArticolGhid, Suma } from "@/lib/ghid";
import type { Limba } from "@/lib/i18n";
import { ghidPeLimba, sursaAct } from "@/lib/traduceri";

// Un articol din pagina „Toate schimbările” (/legi). E pe client ca să schimbe limba odată cu antetul:
// textele vin din data/ghid.json, iar în engleză din data/traduceri-en.json (lib/traduceri.ts).

const STARE: Record<string, string> = { proiect: "proiect", adoptat: "adoptat", in_vigoare: "în vigoare" };

/** Suma în formatul limbii: 48.000 în română, 48,000 în engleză (cu zecimale, pentru economii punctuale). */
function lei(n: number, limba: Limba): string {
  return limba === "en" ? Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 2 }) : bani(n);
}

function Bani({ tip, s, limba }: { tip: "salvezi" | "pierzi"; s: Suma | null; limba: Limba }) {
  const { t } = useLimba();
  const salvezi = tip === "salvezi";
  const perioada = s && ((s as Suma & { perioada?: string }).perioada ?? t(s.cand === "o_data" ? "o singură dată" : "pe an"));
  return (
    <div className={`rounded-xl border p-3.5 ${salvezi ? "border-v3-pos/30 bg-v3-pos-soft" : "border-v3-neg/20 bg-v3-urg-soft"}`}>
      <p className={`m-0 text-[11px] font-extrabold tracking-[.1em] uppercase ${salvezi ? "text-v3-pos" : "text-v3-neg"}`}>
        {salvezi ? t("Poți salva") : t("Pierzi dacă nu faci nimic")}
      </p>
      {s ? (
        <>
          <p className={`m-0 mt-1 font-num font-semibold tabular-nums lining-nums text-[30px] leading-none tracking-[-.03em] ${salvezi ? "text-v3-pos" : "text-v3-neg"}`}>
            {salvezi ? "+" : "−"}
            {lei(s.lei, limba)}
            <small className="ml-1.5 font-sans text-[14px] font-semibold tracking-normal text-v3-ink-2">lei {perioada}</small>
          </p>
          <p className="m-0 mt-1.5 text-[13px] leading-snug text-v3-ink-2">{s.ipoteza}</p>
        </>
      ) : (
        <p className="m-0 mt-1.5 text-[14px] font-semibold text-v3-ink-2">
          {salvezi ? t("Depinde de situația ta; nu avem o sumă cu sursă.") : t("Nu avem o sumă cu sursă.")}
        </p>
      )}
    </div>
  );
}

export function ArticolLegi({ a: ro }: { a: ArticolGhid }) {
  const { t, limba } = useLimba();
  const a = ghidPeLimba(ro, limba);
  const s = a.schimbare;
  const sursa = sursaAct(s, limba);
  const d = (iso: string) => dataScurta(iso, limba);
  const urgent = a.zile !== null && a.zile >= 0 && a.zile < ZILE_URGENT;
  const portal = s.sursa_url.includes("legislatie.just.ro");
  return (
    <article id={a.id} className="scroll-mt-20 border-b border-v3-line py-8">
      <div className="min-w-0">
        <div lang={a.limba}>
          <p className="m-0 mb-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[12.5px] text-v3-ink-2">
            <span
              className={`rounded-full border px-[9px] py-px font-semibold ${
                a.expirat ? "border-v3-past-line bg-v3-past-bg text-v3-past" : "border-v3-line bg-v3-accent-soft text-v3-ink-2"
              }`}
            >
              {t(a.expirat ? "termen depășit" : STARE[s.status])}
            </span>
            <span className="font-semibold text-v3-ink">{sursa.act.text}</span>
            {a.termen && a.zile !== null && (
              <span
                className={`rounded-full px-2.5 py-0.5 font-bold ${
                  a.expirat ? "bg-v3-past-bg text-v3-past" : urgent ? "bg-v3-urg text-v3-on-ink" : "bg-v3-accent-soft text-v3-ink"
                }`}
              >
                {a.expirat ? `${t("a expirat pe")} ${d(a.termen)}` : `${t("până pe")} ${d(a.termen)} · ${t("mai ai")} ${zile(a.zile, limba)}`}
              </span>
            )}
          </p>

          <h2 className="m-0 font-head text-[clamp(21px,4.6vw,28px)] leading-[1.18] font-extrabold tracking-[-.01em] text-v3-ink">
            <span className="text-v3-accent">{a.pentru}:</span> {a.ce}
          </h2>

          {/* Arătăm doar sumele pe care le avem; fără niciuna, o singură casetă care spune de ce. */}
          <div className={`mt-4 grid gap-2.5 ${a.salvezi && a.pierzi ? "sm:grid-cols-2" : ""}`}>
            {(a.salvezi || !a.pierzi) && <Bani tip="salvezi" s={a.salvezi} limba={limba} />}
            {a.pierzi && <Bani tip="pierzi" s={a.pierzi} limba={limba} />}
          </div>

          <div className="mt-4 rounded-xl bg-v3-act p-4">
            <h3 className="m-0 mb-2 text-[12px] font-extrabold tracking-[.1em] text-v3-ink uppercase">
              {a.expirat
                ? t("Ce mai poți face")
                : a.pierzi
                  ? t("Cum reduci pierderea, pas cu pas")
                  : a.salvezi
                    ? t("Cum iei banii, pas cu pas")
                    : t("Ce poți face, pas cu pas")}
            </h3>
            <ol className="m-0 list-none space-y-2 p-0">
              {a.pasi.map((p, i) => (
                <li key={i} className="grid grid-cols-[26px_1fr] gap-2 text-[15px] leading-[1.5] text-v3-ink">
                  <span className="mt-px inline-flex size-[22px] items-center justify-center rounded-full bg-v3-ink text-[12px] font-bold text-v3-on-ink">
                    {i + 1}
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ol>
          </div>

          {a.solutie && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-v3-line bg-v3-card p-4">
              <div className="min-w-0 flex-1 basis-64">
                <p className="m-0 text-[11px] font-extrabold tracking-[.1em] text-v3-accent uppercase">{t("Unde o faci cu cei mai puțini bani")}</p>
                <p className="m-0 mt-0.5 text-[17px] font-bold text-v3-ink">{a.solutie.nume}</p>
                <p className="m-0 mt-0.5 text-[14px] text-v3-ink-2">{a.solutie.ce}</p>
              </div>
              {a.solutie.url && (
                <a
                  href={a.solutie.url}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex min-h-[46px] items-center gap-2 rounded-[10px] bg-v3-ink px-[18px] font-bold text-v3-on-ink no-underline"
                >
                  {t("Deschide")} <span aria-hidden="true">↗︎</span>
                  <span className="sr-only">{t("(se deschide într-un tab nou)")}</span>
                </a>
              )}
            </div>
          )}

          {a.nota && <p className="m-0 mt-3 text-[13.5px] text-v3-ink-2">{a.nota}</p>}

          <p className="m-0 mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-v3-ink-2">
            <span>
              <b className="text-v3-ink">§ {sursa.act.text}</b> · {sursa.mo_ref.text} · <span lang={sursa.articol.limba}>{sursa.articol.text}</span>
            </span>
            <a href={s.sursa_url} target="_blank" rel="noopener" className="font-semibold text-v3-accent">
              {portal ? t("Textul legii pe Portal Legislativ") : t("Textul actului")} ↗︎
            </a>
            {s.sursa_explicativa && (
              <a href={s.sursa_explicativa} target="_blank" rel="noopener" className="font-semibold text-v3-accent">
                {t("Explicație (ANAF / presă)")} ↗︎
              </a>
            )}
            <span>
              {s.verificat_la ? `${t("verificat la")} ${d(s.verificat_la)}` : t("neverificat încă")}
              {s.incredere === "scazuta" && ` ${t("· sursă de încredere scăzută")}`}
            </span>
          </p>
        </div>
      </div>
    </article>
  );
}

/** Data paginii, în limba aleasă. */
export function DataLegi({ iso }: { iso: string }) {
  const { limba } = useLimba();
  return <>{limba === "en" ? dataScurta(iso, "en") : dataLunga(iso)}</>;
}

const LUNI = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];
function dataLunga(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${LUNI[m - 1]} ${y}`;
}
