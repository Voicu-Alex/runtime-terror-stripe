"use client";

import { useEffect, useState } from "react";

// SPIKE (29 oct): trei direcții vizuale pentru aplicație, de comparat pe viu înainte să alegem una.
// Stilul e pe <html data-stil="a|b|c">; CSS-ul e în app/globals.css, blocul „[data-stil]”.
// Se alege din ?stil=a|b|c (sau ?stil=0 ca să revii la actual) ori din comutatorul de jos-stânga, și rămâne în localStorage.

export type Stil = "a" | "b" | "c";
const CHEIE = "cipm.stil.v1";
const EVENIMENT = "cipm-stil";

export const SCRIPT_STIL = `(function(){try{var q=new URLSearchParams(location.search).get("stil");if(q==="0")localStorage.removeItem("${CHEIE}");else if(q&&/^[abc]$/.test(q))localStorage.setItem("${CHEIE}",q);var s=localStorage.getItem("${CHEIE}");if(s&&/^[abc]$/.test(s))document.documentElement.dataset.stil=s}catch(e){}})()`;

function curent(): Stil | null {
  const s = document.documentElement.dataset.stil;
  return s === "a" || s === "b" || s === "c" ? s : null;
}

export function seteazaStil(s: Stil | null) {
  try {
    if (s) window.localStorage.setItem(CHEIE, s);
    else window.localStorage.removeItem(CHEIE);
  } catch {}
  if (s) document.documentElement.dataset.stil = s;
  else delete document.documentElement.dataset.stil;
  window.dispatchEvent(new Event(EVENIMENT));
}

export function useStil(): Stil | null {
  const [s, setS] = useState<Stil | null>(null);
  useEffect(() => {
    const citeste = () => setS(curent());
    citeste();
    window.addEventListener(EVENIMENT, citeste);
    return () => window.removeEventListener(EVENIMENT, citeste);
  }, []);
  return s;
}

/** Comutatorul spike-ului: Actual · A · B · C, jos-stânga, doar pe „Pentru tine”. */
export function ComutatorStil() {
  const stil = useStil();
  const optiuni: { v: Stil | null; text: string }[] = [
    { v: null, text: "Actual" },
    { v: "a", text: "A · Aer" },
    { v: "b", text: "B · Panou" },
    { v: "c", text: "C · Tipo" },
  ];
  return (
    <div role="group" aria-label="Stil (spike)" className="fixed bottom-20 left-1/2 z-40 sm:bottom-4 flex -translate-x-1/2 gap-0.5 rounded-full border border-v3-line bg-v3-card p-1 shadow-[0_12px_32px_-12px_rgba(0,0,0,.35)]">
      {optiuni.map((o) => (
        <button
          key={o.text}
          type="button"
          aria-pressed={stil === o.v}
          onClick={() => seteazaStil(o.v)}
          className="min-h-9 rounded-full px-3 text-[12.5px] font-semibold text-v3-ink-2 aria-pressed:bg-v3-ink aria-pressed:text-v3-on-ink"
        >
          {o.text}
        </button>
      ))}
    </div>
  );
}
