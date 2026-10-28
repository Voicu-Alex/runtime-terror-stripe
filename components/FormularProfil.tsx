"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CATALOG } from "@/lib/catalog";
import type { AnalizaDocument, TipDocument } from "@/lib/analiza-document";
import { MARIME_MAXIMA, TIPURI_FISIER_ACCEPTATE } from "@/lib/analiza-document";
import {
  adaugaInProfil,
  CAMPURI_VALORI,
  incarcaProfil,
  PROFIL_GOL,
  salveazaProfil,
  scoateDinProfil,
  stergeProfil,
  type CampValoare,
  type Profil,
  type Valori,
} from "@/lib/profil";
import { aziISO, potriveste } from "@/lib/potrivire";
import { FAMILII, tagurileFamiliei, TAGURI, type Familie, type TagId } from "@/lib/taguri";
import { useLimba } from "@/components/Limba";
import { campL, etichetaTagL, familieL } from "@/lib/i18n";

/**
 * Profilul se completează din documente: încarci, Claude citește, etichetele și cifrele intră
 * direct în profil (salvat pe dispozitiv). Omul vede ce a intrat și poate scoate cu un click.
 * Bifatul manual rămâne, strâns într-un rând pliat, pentru cine nu are documentul la îndemână.
 */

const NUME_TIP: Record<TipDocument, string> = {
  contract_munca: "contract de muncă",
  factura_utilitati: "factură de utilități",
  fluturas_salariu: "fluturaș de salariu",
  altul: "document",
};

/** Sub acest prag eticheta nu intră singură în profil; o arătăm ca propunere. */
const PRAG_AUTOMAT = 0.5;

type Citire = {
  fisier: string;
  tip: TipDocument;
  mod: AnalizaDocument["mod"];
  adaugate: TagId[];
  valori: CampValoare[];
  propuse: { tag: TagId; incredere: number; motiv: string }[];
};

type Stare = { pas: "liber" } | { pas: "analiza"; fisier: string } | { pas: "eroare"; mesaj: string };

export function FormularProfil() {
  const [profil, setProfil] = useState<Profil | null>(null);
  const [stare, setStare] = useState<Stare>({ pas: "liber" });
  const [citiri, setCitiri] = useState<Citire[]>([]);
  const [manual, setManual] = useState(false);
  const { t, limba } = useLimba();
  const eticheta = (x: TagId) => etichetaTagL(limba, x);
  const camp = (c: CampValoare) => campL(limba, c, CAMPURI_VALORI[c].eticheta);

  useEffect(() => setProfil(incarcaProfil()), []);

  const nrActe = useMemo(() => (profil ? potriveste(profil, CATALOG, aziISO()).length : 0), [profil]);

  if (profil === null) return <p className="text-sm text-v3-ink-2">{t("Se încarcă profilul de pe dispozitiv…")}</p>;

  function pune(nou: Profil) {
    salveazaProfil(nou);
    setProfil(nou);
  }

  async function citeste(fisiere: FileList | null) {
    if (!fisiere) return;
    let curent = profil!;
    for (const f of Array.from(fisiere)) {
      if (!TIPURI_FISIER_ACCEPTATE.includes(f.type as (typeof TIPURI_FISIER_ACCEPTATE)[number])) {
        setStare({ pas: "eroare", mesaj: `${f.name}: ${t("acceptăm doar PDF, JPG sau PNG.")}` });
        continue;
      }
      if (f.size > MARIME_MAXIMA) {
        setStare({ pas: "eroare", mesaj: `${f.name}: ${t("peste 10 MB.")}` });
        continue;
      }
      setStare({ pas: "analiza", fisier: f.name });
      const form = new FormData();
      form.append("fisier", f);
      try {
        const r = await fetch("/api/analiza-document", { method: "POST", body: form });
        const json = await r.json();
        // mesajele serverului sunt în română; t() le traduce pe cele din dicționar
        if (!r.ok) throw new Error(json.eroare ? t(json.eroare) : `Eroare ${r.status}`);
        const analiza = json as AnalizaDocument;
        const sigure = analiza.etichete_propuse.filter((e) => e.incredere >= PRAG_AUTOMAT).map((e) => e.tag);
        const valori: Valori = {};
        for (const k of Object.keys(CAMPURI_VALORI) as CampValoare[]) {
          const x = analiza.valori[k];
          if (typeof x === "number") valori[k] = x;
        }
        const adaugate = sigure.filter((t) => !curent.taguri.includes(t));
        curent = adaugaInProfil(curent, sigure, valori);
        pune(curent);
        setCitiri((c) => [
          {
            fisier: f.name,
            tip: analiza.tip_document,
            mod: analiza.mod,
            adaugate,
            valori: Object.keys(valori) as CampValoare[],
            propuse: analiza.etichete_propuse.filter((e) => e.incredere < PRAG_AUTOMAT),
          },
          ...c,
        ]);
        setStare({ pas: "liber" });
      } catch (e) {
        setStare({ pas: "eroare", mesaj: `${f.name}: ${e instanceof Error ? e.message : t("eroare la analiză")}` });
      }
    }
  }

  function comuta(tag: TagId) {
    pune(profil!.taguri.includes(tag) ? scoateDinProfil(profil!, tag) : adaugaInProfil(profil!, [tag]));
  }

  function schimbaValoare(camp: CampValoare, text: string) {
    const valori = { ...profil!.valori };
    const n = Number(text.replace(/\s/g, "").replace(",", "."));
    if (text.trim() === "" || !Number.isFinite(n)) delete valori[camp];
    else valori[camp] = n;
    pune({ ...profil!, valori });
  }

  const campuriLipsa = (Object.keys(CAMPURI_VALORI) as CampValoare[]).filter((c) => profil.valori[c] == null);
  const gol = profil.taguri.length === 0 && Object.keys(profil.valori).length === 0;

  return (
    <div className="space-y-6">
      {/* 1. Documentele: intrarea principală */}
      <label
        className={`block cursor-pointer rounded-2xl border-2 border-dashed bg-v3-card p-6 text-center ${
          stare.pas === "analiza" ? "border-v3-ink" : "border-v3-line hover:border-v3-ink"
        }`}
      >
        <span className="block text-[17px] font-bold text-v3-ink">
          {stare.pas === "analiza" ? `${t("Claude citește")} ${stare.fisier}…` : gol ? t("Încarcă un document și profilul se completează singur") : t("Mai adaugă un document")}
        </span>
        <span className="mt-1 block text-sm text-v3-ink-2">
          {t("Contract de muncă, fluturaș de salariu, cupon de pensie, factură de curent sau gaz, contract de chirie, hotărâre de dividende. PDF, JPG sau PNG, maximum 10 MB. Poți alege mai multe deodată.")}
        </span>
        <input
          type="file"
          multiple
          accept=".pdf,image/jpeg,image/png"
          className="sr-only"
          disabled={stare.pas === "analiza"}
          onChange={(e) => {
            void citeste(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
      <p className="-mt-3 text-[12.5px] text-v3-ink-2">
        {t("Documentul e trimis o dată pentru citire și nu îl păstrăm. Acoperă CNP-ul și IBAN-ul înainte, nu avem nevoie de ele.")}
      </p>

      {stare.pas === "eroare" && (
        <p role="alert" className="rounded-[10px] border border-v3-neg/30 bg-v3-urg-soft p-3 text-sm text-v3-neg">
          {stare.mesaj}
        </p>
      )}

      {/* 2. Ce a intrat din fiecare document, cu propunerile nesigure de bifat */}
      {citiri.length > 0 && (
        <ul className="m-0 list-none space-y-2 p-0" aria-live="polite">
          {citiri.map((c, i) => (
            <li key={`${c.fisier}-${i}`} className="rounded-[10px] border border-v3-line bg-v3-card p-3 text-sm">
              <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1">
                <b className="text-v3-ink">{t("Am citit")} {t(NUME_TIP[c.tip] ?? "documentul")}</b>
                <span className="text-v3-ink-2">({c.fisier})</span>
                <span className="rounded-full border border-v3-line px-2 py-px text-[11.5px] text-v3-ink-2">{t("generat cu AI")}</span>
                {c.mod === "demo" && (
                  <span className="rounded-full border border-v3-accent bg-v3-act px-2 py-px text-[11.5px] text-v3-accent" title="Răspuns pregătit, fără apel la model. Pune ANTHROPIC_API_KEY în .env.local pentru citire reală.">
                    {t("mod demo")}
                  </span>
                )}
              </p>
              <p className="mt-1 mb-0 text-v3-ink-2">
                {c.adaugate.length > 0 || c.valori.length > 0 ? (
                  <>
                    {t("În profil au intrat:")}{" "}
                    <b className="text-v3-ink">{[...c.adaugate.map(eticheta), ...c.valori.map(camp)].join(", ")}</b>
                    .
                  </>
                ) : (
                  t("Nimic nou față de ce aveai.")
                )}
              </p>
              {c.propuse.length > 0 && (
                <p className="mt-1.5 mb-0 flex flex-wrap items-center gap-1.5 text-v3-ink-2">
                  {t("Nesigur, bifezi tu dacă e cazul:")}
                  {c.propuse.map((e) => {
                    const are = profil.taguri.includes(e.tag);
                    return (
                      <button
                        key={e.tag}
                        type="button"
                        aria-pressed={are}
                        title={e.motiv}
                        onClick={() => comuta(e.tag)}
                        className={`min-h-8 rounded-lg border px-2.5 text-[13px] font-semibold ${are ? "border-v3-ink bg-v3-ink text-v3-on-ink" : "border-v3-line bg-v3-card text-v3-ink"}`}
                      >
                        {are ? "✓ " : "+ "}
                        {eticheta(e.tag)}
                      </button>
                    );
                  })}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* 3. Profilul, așa cum e acum: etichetele cu × și cifrele editabile */}
      <section className="rounded-[10px] border border-v3-line bg-v3-card p-4">
        <h2 className="m-0 text-[13px] font-extrabold tracking-[.08em] text-v3-ink uppercase">{t("Profilul tău")}</h2>
        {gol ? (
          <p className="mt-2 mb-0 text-[15px] text-v3-ink-2">{t("Gol deocamdată. Încarcă un document sau bifează manual mai jos.")}</p>
        ) : (
          <>
            {profil.taguri.length > 0 && (
              <ul className="mt-2 mb-0 flex list-none flex-wrap gap-2 p-0">
                {profil.taguri.map((tag) => (
                  <li key={tag} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-v3-line bg-v3-accent-soft pl-3 text-sm font-semibold text-v3-ink">
                    <span className="text-[11px] font-bold tracking-[.06em] text-v3-ink-2 uppercase">{familieL(limba, TAGURI[tag].familie)}</span>
                    {eticheta(tag)}
                    <button type="button" onClick={() => comuta(tag)} aria-label={`${t("Scoate")} ${eticheta(tag)}`} className="min-h-9 px-2.5 text-v3-ink-2 hover:text-v3-neg">
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {Object.keys(profil.valori).length > 0 && (
              <dl className="mt-3 mb-0 grid gap-2 sm:grid-cols-2">
                {(Object.keys(profil.valori) as CampValoare[]).map((c) => (
                  <div key={c} className="flex items-center justify-between gap-2 rounded-lg border border-v3-line px-3 py-1.5 text-sm">
                    <dt className="text-v3-ink-2">{camp(c)}</dt>
                    <dd className="m-0 flex items-center gap-1">
                      <input
                        type="text"
                        inputMode="numeric"
                        aria-label={camp(c)}
                        value={profil.valori[c] ?? ""}
                        onChange={(e) => schimbaValoare(c, e.target.value)}
                        className="w-24 rounded border border-v3-line px-2 py-1 text-right font-semibold tabular-nums"
                      />
                      <span className="text-v3-ink-2">{t(CAMPURI_VALORI[c].unitate)}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </>
        )}
        {campuriLipsa.length > 0 && (
          <label className="mt-3 block text-sm text-v3-ink-2">
            {t("Adaugă o cifră pe care documentele nu o au:")}{" "}
            <select
              className="min-h-9 rounded-lg border border-v3-line bg-v3-card px-2 text-v3-ink"
              value=""
              onChange={(e) => {
                const c = e.target.value as CampValoare;
                if (c) pune({ ...profil, valori: { ...profil.valori, [c]: 0 } });
              }}
            >
              <option value="">{t("alege…")}</option>
              {campuriLipsa.map((c) => (
                <option key={c} value={c}>
                  {camp(c)}
                </option>
              ))}
            </select>
          </label>
        )}
      </section>

      {/* 4. Manual, pliat: aceleași criterii, pentru cine nu are documentul */}
      <section>
        <button
          type="button"
          aria-expanded={manual}
          onClick={() => setManual(!manual)}
          className="min-h-11 text-sm font-semibold text-v3-ink underline decoration-v3-line underline-offset-2"
        >
          {manual ? t("Ascunde bifatul manual") : t("Nu ai documentul la îndemână? Bifează manual")}
        </button>
        {manual && (
          <div className="mt-3 space-y-4">
            {(Object.keys(FAMILII) as Familie[]).map((f) => (
              <fieldset key={f} className="m-0 border-0 p-0">
                <legend className="mb-1.5 text-[12px] font-extrabold tracking-[.08em] text-v3-ink-2 uppercase">{familieL(limba, f)}</legend>
                <div className="flex flex-wrap gap-1.5">
                  {tagurileFamiliei(f).map((tag) => {
                    const ales = profil.taguri.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        aria-pressed={ales}
                        onClick={() => comuta(tag)}
                        className={`min-h-9 rounded-lg border px-2.5 text-[13px] font-semibold ${ales ? "border-v3-ink bg-v3-ink text-v3-on-ink" : "border-v3-line bg-v3-card text-v3-ink"}`}
                      >
                        {eticheta(tag)}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        )}
      </section>

      {/* 5. Bara: profilul se salvează singur la fiecare schimbare */}
      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t-2 border-v3-ink bg-[var(--fundal)] px-4 py-3">
        <span className="text-sm text-v3-ink-2">
          {profil.taguri.length} {t("etichete")} · <b className="text-v3-ink">{nrActe} {t("acte te privesc")}</b> · {t("salvat pe dispozitiv")}
        </span>
        {!gol && (
          <Link href="/flux" className="inline-flex min-h-11 items-center rounded-[10px] bg-v3-ink px-[18px] font-bold text-v3-on-ink no-underline">
            {t("Vezi fluxul tău →")}
          </Link>
        )}
        {!gol && (
          <button
            type="button"
            onClick={() => {
              stergeProfil();
              setProfil(PROFIL_GOL);
              setCitiri([]);
            }}
            className="ml-auto min-h-11 text-sm text-v3-ink-2 underline underline-offset-2"
          >
            {t("Șterge profilul")}
          </button>
        )}
      </div>
    </div>
  );
}
