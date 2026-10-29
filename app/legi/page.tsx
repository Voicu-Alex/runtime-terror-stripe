import Link from "next/link";
import { T } from "@/components/Limba";
import { CATALOG } from "@/lib/catalog";
import { GHID, ordoneaza } from "@/lib/ghid";
import { ArticolLegi, DataLegi } from "@/components/ArticolLegi";

// Pagina generală, netargetată: toate schimbările din catalog, de la cea care poate salva cei mai mulți bani în jos.
// Personalizarea rămâne în /flux. Aspectul urmează designul de referință (mockup/v3?v=f, ADR 0001).

const AZI_DEMO = "2026-10-28";

export const metadata = { title: "Toate schimbările din lege · Ce înseamnă pentru mine" };

export default function PaginaLegi() {
  const { active, expirate } = ordoneaza(GHID, CATALOG, AZI_DEMO);
  const cuBani = active.filter((a) => a.salvezi).length;
  const deschise = active.filter((a) => a.zile !== null && a.zile >= 0).length;

  return (
    <div className="mx-auto max-w-[860px]">
      <header className="mb-2 rounded-2xl border border-v3-tintb bg-linear-135 from-v3-tint1 via-v3-tint2 via-45% to-v3-card px-[18px] py-6 lg:px-[34px] lg:py-[30px]">
        <p className="m-0 mb-2 text-xs font-extrabold tracking-[.12em] text-v3-accent uppercase">
          <T k="Toate schimbările din lege" /> · <DataLegi iso={AZI_DEMO} />
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
              <b className="block font-head text-[26px] font-extrabold">{n}</b>
              <span className="mt-0.5 block text-[11px] font-extrabold tracking-[.08em] text-v3-ink-2 uppercase">
                <T k={t as string} />
              </span>
            </li>
          ))}
        </ul>
      </header>

      <section aria-label="Schimbările, după cât poți salva">
        {active.map((a, i) => (
          <ArticolLegi key={a.id} a={a} loc={i + 1} />
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
            <ArticolLegi key={a.id} a={a} loc={null} />
          ))}
        </section>
      )}

      <p className="mt-6 text-[13px] text-v3-ink-2">
        <T k="Soluțiile sunt instrumente oficiale sau gratuite; pe pagina asta nu primim bani de la nicio firmă." />
      </p>
    </div>
  );
}
