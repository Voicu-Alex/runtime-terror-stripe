"use client";

import { createContext, Suspense, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLimba } from "@/components/Limba";
import { useProfil } from "@/components/useProfil";
import { CATALOG } from "@/lib/catalog";
import { PERSOANE_DEMO, type PersoanaDemo } from "@/lib/persoane-demo";
import { profilCurent, salveazaProfil, type Profil } from "@/lib/profil";
import type { RaspunsChat } from "@/lib/chat-asistent";
import { aplicaPropuneri, istoricLimitat, pregatesteRetry, valideazaRaspunsChat, type MesajChat } from "@/lib/chat-ui";
import { chatOwner } from "@/lib/chat-owner";
import { ChatPanel } from "@/components/ChatPanel";

type Session = { mesaje: MesajChat[]; draft: string; contextId?: string; seTrimite: boolean; eroare: boolean };
const gol = (): Session => ({ mesaje: [], draft: "", seTrimite: false, eroare: false });
type ChatContext = {
  key: string; profil: Profil | null; session: Session; isDemo: boolean; demoName?: string;
  openChat: (contextId?: string, owner?: string) => void; closeChat: () => void; setDraft: (text: string) => void;
  send: (text?: string) => void; retry: (index: number) => void; confirm: (index: number) => void; reject: (index: number) => void;
  setProfile: (profil: Profil, owner?: string) => void;
};
const Context = createContext<ChatContext | null>(null);
export function useAsistent(): ChatContext {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("AsistentProvider lipsește");
  return ctx;
}

function RouteIdentity({ onChange, personal }: { onChange: (key: string) => void; personal: Profil | null }) {
  const params = useSearchParams();
  const pathname = usePathname();
  useEffect(() => {
    const p = params.get("p");
    onChange(chatOwner(pathname, p, personal));
  }, [params, pathname, onChange, personal]);
  return null;
}

export function AsistentProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { limba, t } = useLimba();
  const personal = useProfil();
  const [key, setKey] = useState("personal");
  const [sessions, setSessions] = useState<Record<string, Session>>({});
  const sessionsRef = useRef<Record<string, Session>>({});
  const [demoProfiles, setDemoProfiles] = useState<Record<string, Profil>>({});
  const demoRef = useRef<Record<string, Profil>>({});
  const [opened, setOpened] = useState(false);
  const abortRef = useRef<Record<string, AbortController | undefined>>({});
  const versionRef = useRef<Record<string, number>>({});
  const profileRef = useRef<Profil | null>(personal);
  const routeKey = useRef("personal");
  const keyRef = useRef(key);
  keyRef.current = key;
  const isDemo = key.startsWith("demo:");
  const slug = isDemo ? key.slice(5) as PersoanaDemo : null;
  const profil = slug ? demoProfiles[slug] ?? PERSOANE_DEMO[slug]?.profil ?? null : personal;
  profileRef.current = profil;
  const session = sessions[key] ?? gol();

  const mutate = useCallback((owner: string, change: (s: Session) => Session) => {
    const next = { ...sessionsRef.current, [owner]: change(sessionsRef.current[owner] ?? gol()) };
    sessionsRef.current = next;
    setSessions(next);
  }, []);
  const switchKey = useCallback((next: string) => {
    if (keyRef.current !== next) {
      const previous = keyRef.current;
      abortRef.current[previous]?.abort();
      versionRef.current[previous] = (versionRef.current[previous] ?? 0) + 1;
      mutate(previous, (s) => ({ ...s, seTrimite: false, mesaje: s.mesaje.map((m) => m.pending ? { ...m, pending: false, failed: true } : m) }));
      setOpened(false);
      keyRef.current = next;
      setKey(next);
    }
  }, [mutate]);
  const switchRoute = useCallback((next: string) => { routeKey.current = next; switchKey(next); }, [switchKey]);
  const setProfile = useCallback((next: Profil, ownerGuard?: string) => {
    const owner = keyRef.current;
    if (ownerGuard && ownerGuard !== owner) return;
    if (owner.startsWith("demo:")) {
      const slug = owner.slice(5);
      demoRef.current = { ...demoRef.current, [slug]: next };
      setDemoProfiles(demoRef.current);
    } else salveazaProfil(next);
  }, []);

  function openChat(contextId?: string, owner?: string) {
    const nextOwner = owner ?? routeKey.current;
    if (nextOwner === "personal" || (nextOwner.startsWith("demo:") && Object.hasOwn(PERSOANE_DEMO, nextOwner.slice(5)))) switchKey(nextOwner);
    if (contextId && CATALOG.some((item) => item.id === contextId)) {
      const owner = keyRef.current;
      const prior = sessionsRef.current[owner]?.contextId;
      if (prior !== contextId) {
        abortRef.current[owner]?.abort();
        versionRef.current[owner] = (versionRef.current[owner] ?? 0) + 1;
        mutate(owner, (s) => ({ ...s, contextId, seTrimite: false, eroare: false,
          mesaje: s.mesaje.map((m) => m.pending ? { ...m, pending: false, failed: true } : m) }));
      }
    }
    setOpened(true);
  }
  function closeChat() {
    const owner = keyRef.current;
    if (sessionsRef.current[owner]?.seTrimite) {
      abortRef.current[owner]?.abort();
      versionRef.current[owner] = (versionRef.current[owner] ?? 0) + 1;
      mutate(owner, (s) => ({ ...s, seTrimite: false, eroare: true,
        draft: s.draft || s.mesaje.findLast((m) => m.pending)?.text || "",
        mesaje: s.mesaje.map((m) => m.pending ? { ...m, pending: false, failed: true } : m) }));
    }
    setOpened(false);
    switchKey(routeKey.current);
  }
  function setDraft(text: string) { mutate(keyRef.current, (s) => ({ ...s, draft: text.slice(0, 2000) })); }

  async function execute(owner: string, index: number, message: string, history: MesajChat[], contextId?: string) {
    const controller = new AbortController();
    abortRef.current[owner] = controller;
    const version = (versionRef.current[owner] ?? 0) + 1;
    versionRef.current[owner] = version;
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    try {
      const selected = owner.startsWith("demo:")
        ? demoRef.current[owner.slice(5)] ?? PERSOANE_DEMO[owner.slice(5) as PersoanaDemo]?.profil
        : profilCurent() ?? profileRef.current;
      if (!selected) throw new Error("profile");
      const response = await fetch("/api/asistent", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
        body: JSON.stringify({ mod: "chat", mesaj: message, istoric: istoricLimitat(history), profil: selected, contextId, limba }),
      });
      if (!response.ok) throw new Error(String(response.status));
      const result = valideazaRaspunsChat(await response.json());
      if (!result) throw new Error("invalid response");
      if (controller.signal.aborted || versionRef.current[owner] !== version) return;
      mutate(owner, (s) => ({ ...s, seTrimite: false, eroare: false, contextId: result.contextId,
        mesaje: s.mesaje.flatMap((m, i) => i === index
          ? [{ ...m, pending: false, failed: false }, { rol: "asistent" as const, text: result.text, raspuns: result }]
          : [m]) }));
    } catch {
      if (versionRef.current[owner] !== version) return;
      mutate(owner, (s) => ({ ...s, seTrimite: false, eroare: true,
        draft: s.draft || message,
        mesaje: s.mesaje.map((m, i) => i === index ? { ...m, pending: false, failed: true } : m) }));
    } finally {
      window.clearTimeout(timeout);
      if (abortRef.current[owner] === controller) delete abortRef.current[owner];
    }
  }

  function send(text?: string) {
    const owner = keyRef.current;
    const current = sessionsRef.current[owner] ?? gol();
    const message = (text ?? current.draft).trim().slice(0, 2000);
    if (!message || current.seTrimite) return;
    const last = current.mesaje.length - 1;
    if (current.mesaje[last]?.failed && current.mesaje[last]?.text === message) { retry(last); return; }
    const index = current.mesaje.length;
    mutate(owner, (s) => ({ ...s, draft: "", eroare: false, seTrimite: true,
      mesaje: [...s.mesaje, { rol: "om", text: message, contextId: current.contextId, pending: true }] }));
    void execute(owner, index, message, current.mesaje, current.contextId);
  }
  function retry(index: number) {
    const owner = keyRef.current;
    const current = sessionsRef.current[owner] ?? gol();
    if (current.seTrimite) return;
    const selected = pregatesteRetry(current.mesaje, index);
    if (!selected) return;
    const { message, history, contextId } = selected;
    mutate(owner, (s) => ({ ...s, draft: s.draft === message ? "" : s.draft, seTrimite: true, eroare: false,
      mesaje: s.mesaje.map((m, i) => i === index ? { ...m, pending: true, failed: false } : m) }));
    void execute(owner, index, message, history, contextId);
  }
  function resolve(index: number, accept: boolean) {
    const current = sessionsRef.current[keyRef.current];
    const answer = current?.mesaje[index]?.raspuns;
    if (!answer) return;
    if (accept) {
      const latest = keyRef.current.startsWith("demo:")
        ? demoRef.current[keyRef.current.slice(5)] ?? PERSOANE_DEMO[keyRef.current.slice(5) as PersoanaDemo]?.profil
        : profilCurent() ?? profileRef.current;
      if (latest) setProfile(aplicaPropuneri(latest, answer.propuneri));
    }
    mutate(keyRef.current, (s) => ({ ...s, mesaje: s.mesaje.map((m, i) => i === index ? { ...m, decision: accept ? "accepted" : "rejected", raspuns: { ...answer, propuneri: { adauga: [], scoate: [] } } } : m) }));
  }

  useEffect(() => () => { Object.values(abortRef.current).forEach((c) => c?.abort()); }, []);
  useEffect(() => { if (pathname === "/profil") setOpened(false); }, [pathname]);
  const value: ChatContext = { key, profil, session, isDemo, demoName: slug ? PERSOANE_DEMO[slug]?.nume : undefined,
    openChat, closeChat, setDraft, send, retry, confirm: (i) => resolve(i, true), reject: (i) => resolve(i, false), setProfile };
  return <Context.Provider value={value}>
    <Suspense fallback={null}><RouteIdentity personal={personal} onChange={switchRoute} /></Suspense>
    {children}
    {["/", "/legi", "/flux", "/profil"].includes(pathname) && <button type="button" onClick={() => openChat()} aria-label={t("Deschide asistentul")}
      className={`fixed right-4 z-30 flex min-h-12 items-center gap-2 rounded-full bg-v3-ink px-4 text-sm font-bold text-v3-on-ink shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v3-ink ${pathname === "/flux" ? "bottom-[calc(10rem+env(safe-area-inset-bottom))]" : "bottom-[calc(1rem+env(safe-area-inset-bottom))]"}`}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px] fill-none stroke-current stroke-[1.8]" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-3 2v-5.5A7.5 7.5 0 0 1 11.5 4h1A7.5 7.5 0 0 1 20 11.5Z" />
        <path d="M8 11.5h8M8 14.5h5" />
      </svg> {t("Asistent")}
    </button>}
    <ChatPanel modal open={opened} onClose={closeChat} />
  </Context.Provider>;
}
