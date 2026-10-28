"use client";

import { useLimba } from "@/components/Limba";
import { ETICHETA_STARE, cuSemn, dataScurta, mii, vedere, zile, type VedereCard } from "@/lib/card";
import { lunaScurta, type Limba } from "@/lib/i18n";
import type { Potrivire } from "@/lib/potrivire";
import type { Valori } from "@/lib/profil";

// Blocurile de deasupra listei din mockup/v3/index.html?v=f (ADR 0001): articolul principal
// (următorul lucru care contează), „pentru tine, în cifre” și „Termene · ce urmează”.

const ZILE_SAPT: Record<Limba, string[]> = {
  ro: ["duminică", "luni", "marți", "miercuri", "joi", "vineri", "sâmbătă"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};
const LUNI_L: Record<Limba, string[]> = {
  ro: ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

function msUTC(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function dataLunga(iso: string, limba: Limba): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${ZILE_SAPT[limba][new Date(msUTC(iso)).getUTCDay()]}, ${d} ${LUNI_L[limba][m - 1]} ${y}`;
}

function zileIntre(deLa: string, panaLa: string): number {
  return Math.round((msUTC(panaLa) - msUTC(deLa)) / 86_400_000);
}

function culoare(n: number | null): string {
  return n === null || n === 0 ? "text-v3-ink" : n < 0 ? "text-v3-neg" : "text-v3-pos";
}

type Eveniment = { iso: string; zile: number; text: string; p: Potrivire; v: VedereCard; termen: boolean };

/** Termenele deschise și datele de aplicare care urmează, în ordine. */
export function evenimente(potriviri: Potrivire[], valori: Valori, azi: string, limba: Limba): Eveniment[] {
  const ev: Eveniment[] = [];
  for (const p of potriviri) {
    const s = p.schimbare;
    const v = vedere(p, valori, limba);
    const a = s.actiuni.find((x) => x.termen);
    if (v.termen && !v.termen.depasit && a?.termen) ev.push({ iso: a.termen, zile: v.termen.zile, text: a.text, p, v, termen: true });
    else if (s.in_vigoare_de_la > azi)
      ev.push({ iso: s.in_vigoare_de_la, zile: zileIntre(azi, s.in_vigoare_de_la), text: v.titlu, p, v, termen: false });
  }
  return ev.sort((a, b) => a.iso.localeCompare(b.iso));
}

export function TitluSectiune({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-[22px] mb-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-v3-line pb-2.5 text-xs font-extrabold tracking-[.12em] text-v3-accd uppercase">
      {children}
    </h2>
  );
}

export function Termene({ ev }: { ev: Eveniment[] }) {
  const { t, limba } = useLimba();
  if (!ev.length) return <p className="mt-1.5 text-[13px] text-v3-ink-2">{t("Niciun termen deschis.")}</p>;
  return (
    <ul className="m-0 list-none p-0">
      {ev.map((x) => {
        const [y, m, d] = x.iso.split("-").map(Number);
        const urgent = x.termen && x.v.termen?.urgent;
        const suma = x.termen
          ? x.v.economieAn
            ? <b className="text-v3-pos">+{mii(x.v.economieAn)} {t("lei/an")}</b>
            : null
          : x.v.suma
            ? <b className={culoare(x.v.suma)}>{cuSemn(x.v.suma)} {t("lei/lună")}</b>
            : null;
        return (
          <li key={x.p.schimbare.id + x.iso} className="grid grid-cols-[46px_1fr] gap-2.5 border-b border-v3-line py-3.5">
            <div className="text-center leading-none">
              <b className={`block font-head text-2xl font-extrabold ${urgent ? "text-v3-urg" : ""}`}>{d}</b>
              <span className="mt-[3px] block text-[11px] font-extrabold tracking-[.1em] text-v3-accent uppercase">{lunaScurta(limba, m - 1)}</span>
              <small className="mt-0.5 block text-[10.5px] text-v3-ink-2">{y}</small>
            </div>
            <div>
              <a href={`#c-${x.p.schimbare.id}`} className="text-[15px] leading-[1.3] font-bold text-v3-ink no-underline hover:underline">
                {x.termen ? <span lang="ro">{x.text}</span> : <>{t("Se aplică:")} {x.text}</>}
              </a>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14.5px] font-bold">
                {urgent ? (
                  <span className="rounded-full bg-v3-urg px-2.5 py-0.5 text-[13px] text-white">
                    {t("mai ai")} {zile(x.zile, limba)}
                  </span>
                ) : (
                  <span>
                    {x.termen ? t("mai ai") : t("peste")} {zile(x.zile, limba)}
                  </span>
                )}
                {suma && <>· {suma}</>}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

const CUTIE =
  "mb-3.5 rounded-2xl border border-v3-tintb bg-linear-135 from-v3-tint1 via-v3-tint2 via-45% to-white px-[18px] py-5 lg:px-[34px] lg:py-[30px]";

export function ArticolPrincipal({ p, valori, azi }: { p: Potrivire | null; valori: Valori; azi: string }) {
  const { t, limba } = useLimba();
  if (!p)
    return (
      <section className={CUTIE}>
        <h2 className="m-0 font-head text-[clamp(25px,6.6vw,36px)] leading-[1.16] font-extrabold">{t("Nimic nou care să te privească")}</h2>
      </section>
    );
  const s = p.schimbare;
  const v = vedere(p, valori, limba);
  const a = s.actiuni.find((x) => x.termen) ?? s.actiuni[0];
  const deschis = v.termen && !v.termen.depasit;
  // acțiunea contează dacă termenul e deschis sau dacă n-are termen, dar aduce bani (prima de stabilitate)
  const actiune = !v.termen?.depasit && (deschis || !!v.economieAn);
  const urgent = deschis && v.termen!.urgent;
  const urmeaza = s.in_vigoare_de_la > azi ? zileIntre(azi, s.in_vigoare_de_la) : null;

  return (
    <section aria-label={t("Următorul lucru care contează")} className={CUTIE}>
      <p className="m-0 mb-3 flex flex-wrap items-center gap-x-2.5 gap-y-2">
        <span className="rounded-full border border-v3-accent bg-v3-accent-soft px-[9px] py-px text-[11px] font-semibold tracking-[.08em] text-v3-accent uppercase">
          {t(ETICHETA_STARE[v.stare])}
        </span>
        <span className="text-xs font-extrabold tracking-[.12em] uppercase">{dataLunga(azi, limba)}</span>
        {urgent && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-v3-urg px-2.5 py-0.5 text-[12.5px] font-bold text-white">
            <span aria-hidden="true" className="size-[7px] rounded-full bg-white" />
            {t("urgent")}
          </span>
        )}
      </p>
      <span className="mb-2 block text-xs font-extrabold tracking-[.12em] text-v3-accent uppercase">{v.kicker}</span>
      <h2 className="m-0 mb-2.5 font-head text-[clamp(25px,6.6vw,36px)] leading-[1.16] font-extrabold tracking-[-.015em]">{v.titlu}</h2>
      {actiune && v.economieAn ? (
        <p className="m-0 mb-3 font-head text-[clamp(30px,8vw,40px)] font-extrabold tracking-[-.02em] text-v3-pos">
          <span className="font-sans text-[15px] font-semibold tracking-normal">{limba === "en" ? "up to" : "până la"}</span> +{mii(v.economieAn)}
          <small className="ml-1.5 font-sans text-[15px] font-semibold tracking-normal text-v3-ink-2">{t("lei/an")}</small>
        </p>
      ) : v.suma !== null ? (
        <p className={`m-0 mb-3 font-head text-[clamp(30px,8vw,40px)] font-extrabold tracking-[-.02em] ${culoare(v.suma)}`}>
          {cuSemn(v.suma)}
          <small className="ml-1.5 font-sans text-[15px] font-semibold tracking-normal text-v3-ink-2">
            {v.suma === 0 ? t("lei/lună acum") : t("lei/lună")}
          </small>
        </p>
      ) : null}
      <p className="m-0 mb-4 max-w-[62ch] text-[17px] leading-[1.6] text-[#1F2937]" lang="ro">
        {actiune && a ? (
          <>
            <b>{t("Ce poți face:")}</b> {a.text}.
          </>
        ) : (
          s.niveluri.zero
        )}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-3.5 border-t border-v3-tintb pt-3.5">
        {(deschis || urmeaza !== null) && (
          <div className={`border-l-[3px] pl-2.5 ${urgent ? "border-v3-urg" : "border-v3-accent"}`}>
            <b className={`block font-head text-[22px] leading-[1.15] font-extrabold ${urgent ? "text-v3-urg" : ""}`}>
              {deschis ? `${t("mai ai")} ${zile(v.termen!.zile, limba)}` : `${t("peste")} ${zile(urmeaza!, limba)}`}
            </b>
            <span className="mt-0.5 block text-sm font-semibold text-v3-ink-2">
              {deschis ? `${t("până la")} ${v.termen!.text}` : `${t("se aplică de la")} ${dataScurta(s.in_vigoare_de_la, limba)}`}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2.5">
          <i aria-hidden="true" className="inline-flex size-9 flex-none items-center justify-center rounded-full bg-v3-ink font-extrabold text-white not-italic">
            §
          </i>
          <span>
            <b className="block text-[13px] font-extrabold tracking-[.06em] uppercase">{s.act}</b>
            <span className="block text-[13px] text-v3-ink-2">
              {s.mo_ref}
              {s.verificat_la && ` · ${t("verificat la")} ${dataScurta(s.verificat_la, limba)}`}
            </span>
          </span>
        </div>
      </div>
      <a
        href={`#c-${s.id}`}
        className="mt-4 inline-flex min-h-[46px] items-center justify-center rounded-[10px] bg-v3-ink px-[18px] font-bold text-white no-underline"
      >
        {t("Vezi ce înseamnă și sursa")}
      </a>
    </section>
  );
}

export function Cifre({ potriviri, valori, ev, azi }: { potriviri: Potrivire[]; valori: Valori; ev: Eveniment[]; azi: string }) {
  const { t, limba } = useLimba();
  const vederi = potriviri.map((p) => ({ p, v: vedere(p, valori, limba) }));
  const acum = vederi.reduce((s, x) => s + (x.p.moment === "in_vigoare" ? (x.v.suma ?? 0) : 0), 0);
  const actiuni = vederi.filter((x) => x.v.economieAn && !x.v.termen?.depasit).length;
  const cifre: [React.ReactNode, string][] = [
    [potriviri.length, t("acte care te privesc")],
    [<span key="a" className={culoare(acum)}>{cuSemn(acum)} lei</span>, t("pe lună, din actele în vigoare")],
    [ev.filter((x) => x.termen).length, t("termene deschise")],
    [actiuni, t("acțiuni pe care legea le permite")],
  ];
  return (
    <section
      aria-label={t("pentru tine, în cifre")}
      className="mb-[18px] grid overflow-hidden rounded-2xl border border-v3-line bg-linear-135 from-v3-stats to-white to-70% lg:grid-cols-[190px_1fr]"
    >
      <div className="flex items-baseline gap-2.5 border-b border-v3-line px-[18px] py-4 lg:flex-col lg:justify-center lg:border-r lg:border-b-0">
        <b className="font-head text-[30px] font-extrabold text-v3-accd">{azi.slice(0, 4)}</b>
        <span className="text-[11.5px] font-extrabold tracking-[.1em] text-v3-ink-2 uppercase">{t("pentru tine, în cifre")}</span>
      </div>
      <ul className="m-0 grid list-none grid-cols-2 gap-x-3.5 gap-y-4 px-[18px] py-3.5 lg:grid-cols-4 lg:gap-x-[22px]">
        {cifre.map(([b, text]) => (
          <li key={text} className="before:mb-2 before:block before:h-0.5 before:w-4 before:bg-v3-logo">
            <b className="block font-head text-[22px] font-extrabold tracking-[-.01em] whitespace-nowrap lg:text-xl">{b}</b>
            <span className="mt-0.5 block text-[11px] font-extrabold tracking-[.08em] text-v3-ink-2 uppercase">{text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
