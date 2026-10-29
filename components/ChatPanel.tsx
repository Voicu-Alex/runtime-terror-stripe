"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useAsistent } from "@/components/AsistentProvider";
import { useLimba } from "@/components/Limba";
import { CATALOG } from "@/lib/catalog";
import { arePropuneri } from "@/lib/chat-ui";
import { etichetaTagL } from "@/lib/i18n";

const STARTERS = ["Ce este TVA?", "Explică legea despre dividende", "Vreau să îmi descriu situația"];
const LAW_STARTERS = ["De ce mă privește?", "Ce trebuie să fac?", "Când intră în vigoare?"];

export function ChatPanel({ modal = false, open = true, onClose, action }: { modal?: boolean; open?: boolean; onClose?: () => void; action?: ReactNode }) {
  const { t, limba } = useLimba();
  const { session, send, retry, setDraft, confirm, reject, demoName } = useAsistent();
  const dialog = useRef<HTMLDialogElement>(null);
  const editor = useRef<HTMLTextAreaElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const context = CATALOG.find((a) => a.id === session.contextId);
  const latest = [...session.mesaje].reverse().find((m) => m.raspuns)?.raspuns;
  const suggestions = context && latest?.contextId !== session.contextId ? LAW_STARTERS : latest?.sugestii.length ? latest.sugestii : context ? LAW_STARTERS : STARTERS;

  useEffect(() => {
    const d = dialog.current;
    if (!modal || !d) return;
    if (open && !d.open) {
      previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      d.showModal();
      editor.current?.focus({ preventScroll: true });
    } else if (!open && d.open) {
      d.close();
      previousFocus.current?.focus({ preventScroll: true });
    }
  }, [modal, open]);
  useEffect(() => {
    if (!modal || !open || !window.visualViewport) return;
    const viewport = window.visualViewport;
    const update = () => {
      dialog.current?.style.setProperty("--chat-h", `${viewport.height}px`);
      dialog.current?.style.setProperty("--chat-top", `${viewport.offsetTop}px`);
    };
    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, [modal, open]);
  useEffect(() => {
    if (!modal || !open) return;
    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
    };
  }, [modal, open]);
  useEffect(() => {
    const input = editor.current;
    if (!input || (modal && !open)) return;
    input.style.height = "auto";
    const height = Math.min(Math.max(input.scrollHeight, 44), 128);
    input.style.height = `${height}px`;
    input.style.overflowY = input.scrollHeight > 128 ? "auto" : "hidden";
  }, [session.draft, modal, open]);
  useEffect(() => {
    if (scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight;
  }, [session.mesaje.length, session.seTrimite, open]);

  const inner = <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-v3-line bg-v3-card text-v3-ink">
    <div className="shrink-0 border-b border-v3-line bg-v3-accent-soft px-5 py-4 sm:px-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="m-0 font-head text-[21px] leading-tight font-extrabold">{t(modal ? "Asistentul tău" : "Conversație")}</h2>
          <p className="m-0 mt-1 text-[13px] text-v3-ink-2">{demoName ? `${t("Profil demo:")} ${demoName}` : t("Întreabă despre legi sau spune-mi ce situație ai.")}</p>
        </div>
        {modal ? <button type="button" onClick={onClose} aria-label={t("Închide")} className="grid min-h-11 min-w-11 place-items-center rounded-lg text-xl text-v3-ink-2 hover:bg-v3-line focus-visible:outline-2 focus-visible:outline-v3-ink">×</button> : action}
      </div>
      {context && <p className="m-0 mt-3 rounded-lg border border-v3-line bg-v3-card px-3 py-2 text-[13px] text-v3-ink-2">
        {t("Despre legea:")} <strong className="text-v3-ink">{limba === "en" && context.rezumat_en ? context.rezumat_en : context.rezumat}</strong>
      </p>}
    </div>
    <div ref={scroll} role="log" aria-label={t("Conversația cu asistentul")} aria-live="polite" className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
      {session.mesaje.length === 0 && <div className="max-w-[44rem]">
        <p className="m-0 max-w-[36ch] font-head text-[22px] leading-snug font-bold text-v3-ink">{t("Bună! Ce ai vrea să afli despre banii tăi și legile noi?")}</p>
        <p className="mt-2 mb-0 text-[14px] leading-relaxed text-v3-ink-2">{t("Pot explica un act din catalog, lămuri un termen sau propune etichete pentru profilul tău. Tu confirmi orice schimbare.")}</p>
      </div>}
      {session.mesaje.map((m, i) => <div key={i} className={`flex ${m.rol === "om" ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-[88%] min-w-0 rounded-[14px] px-4 py-3 text-[15px] leading-relaxed sm:max-w-[76%] ${m.rol === "om" ? "bg-v3-ink text-v3-on-ink" : "border border-v3-line bg-v3-accent-soft text-v3-ink"}`}>
          <p className="m-0 break-words whitespace-pre-wrap">{m.text}</p>
          {m.raspuns && <>
            <p className="m-0 mt-2 text-[11px] font-semibold opacity-70">{m.raspuns.mod === "demo" ? t("Răspuns demo · din datele verificate") : t("Explicație generată cu AI · verifică sursele")}</p>
            {m.decision && <p className="m-0 mt-2 text-[12px] font-semibold">{m.decision === "accepted" ? t("Schimbare confirmată în profil") : t("Propunere respinsă")}</p>}
            {m.raspuns.surse.length > 0 && <div className="mt-3 border-t border-v3-line pt-2">
              <p className="m-0 mb-1 text-[12px] font-semibold">{t("Surse")}</p>
              <ul className="m-0 list-none space-y-1.5 p-0">{m.raspuns.surse.map((s, j) => <li key={`${s.id}-${j}`} className="min-w-0 break-words text-[12px]">
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-v3-accent underline underline-offset-2 [overflow-wrap:anywhere]">{s.titlu}{s.articol ? ` · ${s.articol}` : ""} ↗</a>
                {s.verificatLa && <span className="block text-v3-ink-2">{t("verificat la")} {s.verificatLa}</span>}
              </li>)}</ul>
            </div>}
            {arePropuneri(m.raspuns.propuneri) && <div className="mt-3 border-t border-v3-line pt-3">
              <p className="m-0 mb-2 text-[12px] font-semibold">{t("Propunere pentru profil")}</p>
              <div className="flex flex-wrap gap-1.5">{m.raspuns.propuneri.adauga.map((tag) => <span key={`+${tag}`} className="rounded-full border border-v3-line bg-v3-card px-2 py-1 text-[12px]">+ {etichetaTagL(limba, tag)}</span>)}
                {m.raspuns.propuneri.scoate.map((tag) => <span key={`-${tag}`} className="rounded-full border border-v3-line bg-v3-card px-2 py-1 text-[12px]">− {etichetaTagL(limba, tag)}</span>)}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => confirm(i)} className="min-h-11 rounded-lg bg-v3-ink px-3 text-[13px] font-bold text-v3-on-ink">{t("Confirmă")}</button>
                <button type="button" onClick={() => reject(i)} className="min-h-11 rounded-lg border border-v3-line bg-v3-card px-3 text-[13px] font-semibold text-v3-ink">{t("Respinge")}</button>
              </div>
            </div>}
          </>}
          {m.failed && <div className="mt-2 text-[12px]">
            <span>{t("Răspunsul nu a ajuns. Mesajul tău este păstrat.")}</span>{" "}
            <button type="button" onClick={() => retry(i)} className="min-h-11 font-bold underline" disabled={session.seTrimite}>{t("Încearcă din nou")}</button>
          </div>}
        </div>
      </div>)}
      {session.seTrimite && <p role="status" className="m-0 w-fit rounded-[14px] border border-v3-line bg-v3-accent-soft px-4 py-3 text-[14px] text-v3-ink-2">{t("Caut în sursele verificate…")}</p>}
    </div>
    <div className="shrink-0 border-t border-v3-line bg-v3-card px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-6">
      {!session.seTrimite && <div className="mb-3 flex flex-wrap gap-2">{suggestions.slice(0, 3).map((q) => <button key={q} type="button" onClick={() => send(q)} className="min-h-11 max-w-full rounded-full border border-v3-line bg-v3-accent-soft px-3 py-1 text-left text-[13px] font-semibold text-v3-ink hover:border-v3-ink">{t(q)}</button>)}</div>}
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-end gap-2 rounded-[12px] border border-v3-line bg-v3-paper p-1.5 focus-within:border-v3-ink">
        <textarea ref={editor} value={session.draft} onChange={(e) => setDraft(e.target.value)} maxLength={2000} rows={1}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.nativeEvent.keyCode !== 229) { e.preventDefault(); send(); } }}
          aria-label={t("Scrie un mesaj")} placeholder={t("Întreabă despre o lege sau descrie situația ta…")}
          className="max-h-32 min-h-11 min-w-0 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-base text-v3-ink outline-none placeholder:text-v3-ink-2" />
        <button type="submit" disabled={session.seTrimite || !session.draft.trim()} aria-label={t("Trimite")}
          className="grid min-h-11 min-w-11 place-items-center rounded-lg bg-v3-ink text-lg font-bold text-v3-on-ink disabled:opacity-40">↑</button>
      </form>
      <p className="m-0 mt-2 text-[11px] text-v3-ink-2">{t("Informare, nu consultanță financiară sau juridică.")}</p>
    </div>
  </div>;

  return modal ? <dialog ref={dialog} onClose={() => { onClose?.(); previousFocus.current?.focus({ preventScroll: true }); }} aria-label={t("Asistentul tău")}
    className="fixed inset-0 top-[var(--chat-top,0px)] z-50 m-0 h-[var(--chat-h,100dvh)] max-h-none w-full max-w-none overflow-hidden border-0 bg-transparent p-0 backdrop:bg-black/50 sm:inset-auto sm:right-5 sm:bottom-5 sm:h-[min(82dvh,680px)] sm:w-[min(94vw,520px)] sm:rounded-[14px] sm:shadow-2xl">
    {inner}
  </dialog> : <section aria-label={t("Conversația cu asistentul")} className="h-[min(72dvh,760px)] min-h-[460px]">{inner}</section>;
}
