"use client";

import { useActionState, useState } from "react";
import { aproba, respinge, type StareActiune } from "@/app/admin/acte/actiuni";

const initial: StareActiune = {};
const BUTON = "min-h-11 rounded-xl px-[18px] font-bold disabled:cursor-not-allowed disabled:opacity-50";

function Mesaj({ s }: { s: StareActiune }) {
  if (s.eroare)
    return (
      <p role="alert" className="m-0 mt-2 rounded-lg border border-v3-urg bg-v3-urg-soft p-3 text-sm text-v3-urg">
        {s.eroare}
      </p>
    );
  if (s.ok) return <p className="m-0 mt-2 text-sm font-semibold text-v3-pos">{s.ok}</p>;
  return null;
}

export type OptiuneAprobare = { rezumat: string; picate: string[]; cotaLipsa?: boolean };

/**
 * Aprobă, schimbare cu schimbare: una cu verificări picate pe ea e debifată și dezactivată, cu mesajele dedesubt.
 * `blocatAct` = o verificare la nivel de act a picat: tot formularul e dezactivat.
 */
export function FormularAproba({ id, optiuni, blocatAct }: { id: number; optiuni: OptiuneAprobare[]; blocatAct: boolean }) {
  const [stare, actiune, lucreaza] = useActionState(aproba, initial);
  const [bifate, setBifate] = useState<boolean[]>(() => optiuni.map((o) => !o.picate.length));
  const niciuna = !bifate.some((b, i) => b && !optiuni[i].picate.length);
  const blocat = blocatAct || niciuna || lucreaza;
  return (
    <form action={actiune} className="m-0 rounded-[18px] border border-v3-line bg-v3-card p-3">
      <input type="hidden" name="id" value={id} />
      <p className="m-0 mb-2 text-[12px] font-extrabold tracking-[.1em] text-v3-accent uppercase">Schimbări de aprobat</p>
      <div className="grid gap-2">
        {optiuni.map((o, i) => {
          const picat = blocatAct || o.picate.length > 0;
          return (
            <div key={i}>
              <label className={`flex items-start gap-2 text-[14px] ${picat ? "text-v3-ink-2" : "text-v3-ink"}`}>
                <input
                  type="checkbox"
                  name="schimbare"
                  value={i}
                  disabled={picat}
                  checked={!picat && bifate[i]}
                  onChange={(e) => setBifate(bifate.map((b, j) => (j === i ? e.target.checked : b)))}
                  className="mt-1 size-4 accent-[var(--color-v3-pos)]"
                />
                <span>{o.rezumat}</span>
              </label>
              {o.cotaLipsa && !picat && (
                <div className="mt-1.5 ml-6 grid gap-1.5">
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="number"
                      step="0.01"
                      name={`cota_veche_${i}`}
                      disabled={!bifate[i]}
                      aria-label={`cota veche (%), schimbarea ${i + 1}`}
                      placeholder="cota veche (%)"
                      className="min-h-11 w-36 rounded-xl border border-v3-line bg-transparent px-3 text-[14px] text-v3-ink"
                    />
                    <input
                      type="text"
                      name={`sursa_veche_${i}`}
                      disabled={!bifate[i]}
                      aria-label={`sursa cotei vechi (act, articol), schimbarea ${i + 1}`}
                      placeholder="sursa (act, articol)"
                      className="min-h-11 min-w-48 flex-1 rounded-xl border border-v3-line bg-transparent px-3 text-[14px] text-v3-ink"
                    />
                  </div>
                  <p className="m-0 text-[12.5px] text-v3-ink-2">
                    Ambele sunt obligatorii pentru aprobare; sursa trebuie să fie un act și un articol, nu un link de presă.
                  </p>
                </div>
              )}
              {o.picate.map((m, k) => (
                <p key={k} className="m-0 mt-0.5 ml-6 text-[12.5px] text-v3-urg">
                  ✕ {m}
                </p>
              ))}
            </div>
          );
        })}
      </div>
      <button
        type="submit"
        disabled={blocat}
        title={blocatAct ? "Verificările automate au picat" : niciuna ? "Bifează cel puțin o schimbare" : undefined}
        className={`${BUTON} mt-3 bg-v3-ink text-v3-on-ink hover:bg-v3-ink-strong`}
      >
        {lucreaza ? "Se aprobă…" : "Aprobă"}
      </button>
      <Mesaj s={stare} />
    </form>
  );
}

export function FormularRespinge({ id }: { id: number }) {
  const [stare, actiune, lucreaza] = useActionState(respinge, initial);
  return (
    <form action={actiune} className="m-0 rounded-[18px] border border-v3-line bg-v3-card p-3">
      <input type="hidden" name="id" value={id} />
      <label htmlFor={`nota-${id}`} className="mb-1.5 block text-[12px] font-extrabold tracking-[.1em] text-v3-accent uppercase">
        De ce respingi
      </label>
      <textarea
        id={`nota-${id}`}
        name="nota"
        required
        rows={3}
        className="w-full rounded-xl border border-v3-ink-2 bg-transparent p-3 text-[15px] text-v3-ink"
      />
      <button type="submit" disabled={lucreaza} className={`${BUTON} mt-3 border border-v3-urg bg-v3-card text-v3-urg`}>
        {lucreaza ? "Se respinge…" : "Respinge"}
      </button>
      <Mesaj s={stare} />
    </form>
  );
}
