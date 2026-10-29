"use client";

import { useActionState } from "react";
import { aproba, respinge, type StareActiune } from "@/app/admin/acte/actiuni";

const initial: StareActiune = {};
const BUTON = "min-h-11 rounded-[10px] px-[18px] font-bold disabled:cursor-not-allowed disabled:opacity-50";

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

/** Aprobă: bifezi ce schimbări intră (implicit toate). Dezactivat când verificările automate au picat. */
export function FormularAproba({ id, rezumate, verificariOk }: { id: number; rezumate: string[]; verificariOk: boolean }) {
  const [stare, actiune, lucreaza] = useActionState(aproba, initial);
  return (
    <form action={actiune} className="m-0 rounded-[10px] border border-v3-line bg-v3-card p-3">
      <input type="hidden" name="id" value={id} />
      <p className="m-0 mb-2 text-[12px] font-extrabold tracking-[.1em] text-v3-accent uppercase">Schimbări de aprobat</p>
      <div className="grid gap-1.5">
        {rezumate.map((r, i) => (
          <label key={i} className="flex items-start gap-2 text-[14px] text-v3-ink">
            <input type="checkbox" name="schimbare" value={i} defaultChecked className="mt-1 size-4 accent-[var(--color-v3-pos)]" />
            <span>{r}</span>
          </label>
        ))}
      </div>
      <button
        type="submit"
        disabled={!verificariOk || lucreaza}
        title={verificariOk ? undefined : "Verificările automate au picat"}
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
    <form action={actiune} className="m-0 rounded-[10px] border border-v3-line bg-v3-card p-3">
      <input type="hidden" name="id" value={id} />
      <label htmlFor={`nota-${id}`} className="mb-1.5 block text-[12px] font-extrabold tracking-[.1em] text-v3-accent uppercase">
        De ce respingi
      </label>
      <textarea
        id={`nota-${id}`}
        name="nota"
        required
        rows={3}
        className="w-full rounded-[10px] border border-v3-ink-2 bg-transparent p-3 text-[15px] text-v3-ink"
      />
      <button type="submit" disabled={lucreaza} className={`${BUTON} mt-3 border border-v3-urg bg-v3-card text-v3-urg`}>
        {lucreaza ? "Se respinge…" : "Respinge"}
      </button>
      <Mesaj s={stare} />
    </form>
  );
}
