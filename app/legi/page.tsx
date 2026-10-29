import Link from "next/link";
import { T } from "@/components/Limba";
import { bani, dataScurta, zile, ZILE_URGENT } from "@/lib/card";
import { CATALOG } from "@/lib/catalog";
import { GHID, ordoneaza, type ArticolGhid, type Suma } from "@/lib/ghid";

// Pagina generală, netargetată: toate schimbările din catalog, de la cea care poate salva cei mai mulți bani în jos.
// Personalizarea rămâne în /flux. Aspectul urmează designul de referință (mockup/v3?v=f, ADR 0001).

const AZI_DEMO = "2026-10-28";

export const metadata = { title: "Toate schimbările din lege · Ce înseamnă pentru mine" };

const STARE: Record<string, string> = { proiect: "proiect", adoptat: "adoptat", in_vigoare: "în vigoare" };

function cand(s: Suma): string {
  return s.perioada ?? (s.cand === "o_data" ? "o singură dată" : "pe an");
}

function Bani({ tip, s }: { tip: "salvezi" | "pierzi"; s: Suma | null }) {
  const salvezi = tip === "salvezi";
  return (
    <div className={`rounded-xl border p-3.5 ${salvezi ? "border-v3-pos/30 bg-v3-pos-soft" : "border-v3-neg/20 bg-v3-urg-soft"}`}>
      <p className={`m-0 text-[11px] font-extrabold tracking-[.1em] uppercase ${salvezi ? "text-v3-pos" : "text-v3-neg"}`}>
        {salvezi ? <T k="Poți salva" /> : <T k="Pierzi dacă nu faci nimic" />}
      </p>
      {s ? (
        <>
          <p className={`m-0 mt-1 font-num font-semibold tabular-nums lining-nums text-[30px] leading-none tracking-[-.03em] ${salvezi ? "text-v3-pos" : "text-v3-neg"}`}>
            {salvezi ? "+" : "−"}
            {bani(s.lei)}
            <small className="ml-1.5 font-sans text-[14px] font-semibold tracking-normal text-v3-ink-2">lei {cand(s)}</small>
          </p>
          <p className="m-0 mt-1.5 text-[13px] leading-snug text-v3-ink-2">{s.ipoteza}</p>
        </>
      ) : (
        <p className="m-0 mt-1.5 text-[14px] font-semibold text-v3-ink-2">
          {salvezi ? <T k="Depinde de situația ta; nu avem o sumă cu sursă." /> : <T k="Nu avem o sumă cu sursă." />}
        </p>
      )}
    </div>
  );
}

function Articol({ a }: { a: ArticolGhid }) {
  const s = a.schimbare;
  const urgent = a.zile !== null && a.zile >= 0 && a.zile < ZILE_URGENT;
  const portal = s.sursa_url.includes("legislatie.just.ro");
  return (
    <article id={a.id} className="scroll-mt-20 border-b border-v3-line py-8">
      <div className="min-w-0">
        <div>
          <p className="m-0 mb-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[12.5px] text-v3-ink-2">
            <span
              className={`rounded-full border px-[9px] py-px font-semibold ${
                a.expirat ? "border-v3-past-line bg-v3-past-bg text-v3-past" : "border-v3-line bg-v3-accent-soft text-v3-ink-2"
              }`}
            >
              {a.expirat ? "termen depășit" : STARE[s.status]}
            </span>
            <span className="font-semibold text-v3-ink">{s.act}</span>
            {a.termen && a.zile !== null && (
              <span
                className={`rounded-full px-2.5 py-0.5 font-bold ${
                  a.expirat ? "bg-v3-past-bg text-v3-past" : urgent ? "bg-v3-urg text-v3-on-ink" : "bg-v3-accent-soft text-v3-ink"
                }`}
              >
                {a.expirat ? `a expirat pe ${dataScurta(a.termen)}` : `până pe ${dataScurta(a.termen)} · mai ai ${zile(a.zile)}`}
              </span>
            )}
          </p>

          <h2 className="m-0 font-head text-[clamp(21px,4.6vw,28px)] leading-[1.18] font-extrabold tracking-[-.01em] text-v3-ink">
            <span className="text-v3-accent">{a.pentru}:</span> {a.ce}
          </h2>

          {/* Arătăm doar sumele pe care le avem; fără niciuna, o singură casetă care spune de ce. */}
          <div className={`mt-4 grid gap-2.5 ${a.salvezi && a.pierzi ? "sm:grid-cols-2" : ""}`}>
            {(a.salvezi || !a.pierzi) && <Bani tip="salvezi" s={a.salvezi} />}
            {a.pierzi && <Bani tip="pierzi" s={a.pierzi} />}
          </div>

          <div className="mt-4 rounded-xl bg-v3-act p-4">
            <h3 className="m-0 mb-2 text-[12px] font-extrabold tracking-[.1em] text-v3-ink uppercase">
              {a.expirat ? (
                <T k="Ce mai poți face" />
              ) : a.pierzi ? (
                <T k="Cum reduci pierderea, pas cu pas" />
              ) : a.salvezi ? (
                <T k="Cum iei banii, pas cu pas" />
              ) : (
                <T k="Ce poți face, pas cu pas" />
              )}
            </h3>
            <ol className="m-0 list-none space-y-2 p-0">
              {a.pasi.map((p, i) => (
                <li key={i} className="grid grid-cols-[26px_1fr] gap-2 text-[15px] leading-[1.5] text-v3-ink" lang="ro">
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
                <p className="m-0 text-[11px] font-extrabold tracking-[.1em] text-v3-accent uppercase">
                  <T k="Unde o faci cu cei mai puțini bani" />
                </p>
                <p className="m-0 mt-0.5 text-[17px] font-bold text-v3-ink">{a.solutie.nume}</p>
                <p className="m-0 mt-0.5 text-[14px] text-v3-ink-2" lang="ro">
                  {a.solutie.ce}
                </p>
              </div>
              {a.solutie.url && (
                <a
                  href={a.solutie.url}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex min-h-[46px] items-center gap-2 rounded-[10px] bg-v3-ink px-[18px] font-bold text-v3-on-ink no-underline"
                >
                  <T k="Deschide" /> <span aria-hidden="true">↗︎</span>
                  <span className="sr-only">
                    <T k="(se deschide într-un tab nou)" />
                  </span>
                </a>
              )}
            </div>
          )}

          {a.nota && (
            <p className="m-0 mt-3 text-[13.5px] text-v3-ink-2" lang="ro">
              {a.nota}
            </p>
          )}

          <p className="m-0 mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-v3-ink-2">
            <span>
              <b className="text-v3-ink">§ {s.act}</b> · {s.mo_ref} · <span lang="ro">{s.articol}</span>
            </span>
            <a href={s.sursa_url} target="_blank" rel="noopener" className="font-semibold text-v3-accent">
              {portal ? <T k="Textul legii pe Portal Legislativ" /> : <T k="Textul actului" />} ↗︎
            </a>
            {s.sursa_explicativa && (
              <a href={s.sursa_explicativa} target="_blank" rel="noopener" className="font-semibold text-v3-accent">
                <T k="Explicație (ANAF / presă)" /> ↗︎
              </a>
            )}
            <span>
              {s.verificat_la ? `verificat la ${dataScurta(s.verificat_la)}` : "neverificat încă"}
              {s.incredere === "scazuta" && " · sursă de încredere scăzută"}
            </span>
          </p>
        </div>
      </div>
    </article>
  );
}

export default function PaginaLegi() {
  const { active, expirate } = ordoneaza(GHID, CATALOG, AZI_DEMO);
  const cuBani = active.filter((a) => a.salvezi).length;
  const deschise = active.filter((a) => a.zile !== null && a.zile >= 0).length;

  return (
    <div className="mx-auto max-w-[860px]">
      <header className="mb-2 rounded-2xl border border-v3-tintb bg-linear-135 from-v3-tint1 via-v3-tint2 via-45% to-v3-card px-[18px] py-6 lg:px-[34px] lg:py-[30px]">
        <p className="m-0 mb-2 text-xs font-extrabold tracking-[.12em] text-v3-accent uppercase">
          <T k="Toate schimbările din lege" /> · 28 octombrie 2026
        </p>
        <h1 className="m-0 font-head text-[clamp(28px,6.6vw,40px)] leading-[1.12] font-extrabold tracking-[-.015em] text-v3-ink">
          <T k="Cât poți salva din legile noi, de la cea mai mare sumă în jos" />
        </h1>
        <p className="m-0 mt-3 max-w-[62ch] text-[17px] leading-[1.6] text-v3-ink-soft">
          <T k="Pagina nu e personalizată. Fiecare articol spune pentru cine e și calculează pe un caz de referință, scris sub sumă: e calculul nostru, nu o cifră din lege. Pentru sumele tale, vezi" />{" "}
          <Link href="/flux" className="font-semibold text-v3-ink underline decoration-v3-tintb underline-offset-2">
            <T k="Fluxul meu" />
          </Link>
          .
        </p>
        <ul className="m-0 mt-5 grid list-none grid-cols-3 gap-3 border-t border-v3-tintb p-0 pt-4">
          {[
            [active.length + expirate.length, "schimbări în vigoare sau adoptate"],
            [cuBani, "cu bani pe care îi poți salva"],
            [deschise, "cu termen încă deschis"],
          ].map(([n, t]) => (
            <li key={t as string} className="before:mb-2 before:block before:h-0.5 before:w-4 before:bg-v3-logo">
              <b className="block font-num font-semibold tabular-nums lining-nums text-[26px] tracking-[-.03em]">{n}</b>
              <span className="mt-0.5 block text-[11px] font-extrabold tracking-[.08em] text-v3-ink-2 uppercase">
                <T k={t as string} />
              </span>
            </li>
          ))}
        </ul>
      </header>

      <section aria-label="Schimbările, după cât poți salva">
        {active.map((a) => (
          <Articol key={a.id} a={a} />
        ))}
      </section>

      {expirate.length > 0 && (
        <section aria-labelledby="expirate" className="mt-6">
          <h2
            id="expirate"
            className="m-0 border-b border-v3-line pb-2.5 text-xs font-extrabold tracking-[.12em] text-v3-accd uppercase"
          >
            <T k="Termenul a trecut · bine de știut pentru data viitoare" />
          </h2>
          {expirate.map((a) => (
            <Articol key={a.id} a={a} />
          ))}
        </section>
      )}

      <p className="mt-6 text-[13px] text-v3-ink-2">
        <T k="Soluțiile sunt instrumente oficiale sau gratuite; pe pagina asta nu primim bani de la nicio firmă." />
      </p>
    </div>
  );
}
