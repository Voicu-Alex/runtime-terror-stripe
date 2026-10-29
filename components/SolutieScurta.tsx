import { solutieScurta } from '@/lib/solutii';

/** În detaliul legii: un răspuns scurt, apoi linkuri directe. Fără modal sau formular. */
export function SolutieScurta({ id, status }: { id: string; status: string }) {
  const solutie = solutieScurta(id, status);
  if (!solutie) return null;
  return (
    <section lang="ro" aria-label="Soluție și servicii" className="my-4 border-t border-v3-line pt-3">
      <h3 className="m-0 text-[15px] font-bold">Ce poți face acum</h3>
      <p className="mt-1 mb-3 text-[14.5px] leading-relaxed">{solutie.text}</p>
      {solutie.oficiale.length > 0 && <ul className="my-2 list-none p-0 text-sm">
        {solutie.oficiale.map(d => <li key={d.nume}>{d.url
          ? <a href={d.url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className="inline-flex min-h-11 items-center underline underline-offset-4">{d.nume} ↗<span className="sr-only"> (se deschide într-un tab nou)</span></a>
          : <span className="inline-flex min-h-11 items-center">{d.nume}</span>}</li>)}
      </ul>}
      {solutie.consultanti.length > 0 && <>
      <p className="m-0 text-sm text-v3-ink-2">{solutie.introducere}</p>
      <ul className="my-2 list-none space-y-2 p-0">
        {solutie.consultanti.map(c => <li key={c.url}>
          <a href={c.url} target="_blank" rel={c.sponsorizat ? 'noopener noreferrer sponsored' : 'noopener noreferrer'} referrerPolicy="no-referrer" className="inline-flex min-h-11 flex-wrap items-center gap-2 text-sm underline underline-offset-4">
            {c.sponsorizat && <span className="rounded border border-v3-line px-1.5 py-0.5 text-xs font-semibold">★ Sponsorizat</span>}
            <strong>{c.nume}</strong><span>· {c.serviciu} ↗</span>
            <span className="sr-only">(se deschide într-un tab nou)</span>
          </a>
        </li>)}
      </ul>
      <p className="m-0 text-xs text-v3-ink-2">Linkuri către site-urile lor. Verifică serviciul, costul și condițiile direct cu ei.</p>
      </>}
    </section>
  );
}
