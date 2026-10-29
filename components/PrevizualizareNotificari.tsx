'use client';

import Link from 'next/link';
import { useLimba } from './Limba';
import { notificariLa } from '@/lib/notificari';
import type { Potrivire } from '@/lib/potrivire';
import { PERSOANE_DEMO, type PersoanaDemo } from '@/lib/persoane-demo';

export function PrevizualizareNotificari({ id, azi, potriviri }: { id: PersoanaDemo; azi: string; potriviri: Potrivire[] }) {
  const { limba } = useLimba();
  const en = limba === 'en';
  const notificari = notificariLa(potriviri, azi, limba);
  return <div className="max-w-[650px]">
    <h1 className="font-head text-3xl font-extrabold">{en ? 'Notification preview' : 'Previzualizare notificări'}</h1>
    <p className="text-sm text-v3-ink-2">{en ? 'Simulation using fictional profiles. No push notifications are sent.' : 'Simulare cu profiluri fictive. Nu se trimit notificări push.'}</p>
    <form className="my-5 flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-sm">{en ? 'Demo profile' : 'Profil demo'}
        <select name="p" defaultValue={id} className="min-h-11 rounded-lg border border-v3-line bg-v3-card px-3">
          {Object.entries(PERSOANE_DEMO).map(([cheie, p]) => <option key={cheie} value={cheie}>{p.nume}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">{en ? 'Simulation date' : 'Data simulării'}
        <input type="date" name="data" required defaultValue={azi} className="min-h-11 min-w-0 rounded-lg border border-v3-line bg-v3-card px-3" />
      </label>
      <input type="hidden" name="lang" value={limba} />
      <button className="min-h-11 rounded-lg bg-v3-ink px-4 text-v3-on-ink">{en ? 'Preview' : 'Vezi mesajele'}</button>
    </form>
    {!notificari.length ? <p role="status" className="rounded-xl border border-v3-line p-5">{en ? 'No notification to send on this date.' : 'Nicio notificare de trimis la această dată.'}</p>
      : <ul className="list-none space-y-4 p-0">{notificari.map(n => <li key={n.id} className="rounded-xl border border-v3-line bg-v3-card p-5">
        <h2 className="m-0 font-head text-xl font-bold">{n.titlu}</h2>
        <p>{n.mesaj}</p>
        <p className="break-words text-xs text-v3-ink-2"><a href={n.sursa_url} target="_blank" rel="noreferrer" className="underline">{n.act} · {n.articol}</a> · {en ? 'verified' : 'verificat'} {n.verificat_la ?? (en ? 'pending' : 'de verificat')}</p>
        <Link href={`/flux?p=${id}#c-${n.id}`} className="text-sm font-bold underline">{en ? 'See the act and actions' : 'Vezi actul și acțiunile'}</Link>
      </li>)}</ul>}
    <p className="mt-6 text-sm"><Link href={`/flux?p=${id}`} className="underline">{en ? 'Back to the feed' : 'Înapoi la flux'}</Link></p>
  </div>;
}
