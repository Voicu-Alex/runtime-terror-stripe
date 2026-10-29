import { solutieScurta } from '@/lib/solutii';

/** În detaliul legii: un răspuns scurt, apoi linkuri directe. Fără modal sau formular. */
export function SolutieScurta({ id, status }: { id: string; status: string }) {
  const solutie = solutieScurta(id, status);
  if (!solutie) return null;
  return (
    <section lang="ro" aria-label="Soluție și consultanți" className="my-4 border-t border-v3-line pt-3">
      <h3 className="m-0 text-[15px] font-bold">Ce poți face acum</h3>
      <p className="mt-1 mb-3 text-[14.5px] leading-relaxed">{solutie.text}</p>
      <p className="m-0 text-sm text-v3-ink-2">Poți discuta, de exemplu, cu:</p>
      <ul className="my-2 list-none space-y-2 p-0">
        {solutie.consultanti.map(c => <li key={c.url}>
          <a href={c.url} target="_blank" rel={c.sponsorizat ? 'noopener noreferrer sponsored' : 'noopener noreferrer'} referrerPolicy="no-referrer" className="inline-flex min-h-11 flex-wrap items-center gap-2 text-sm underline underline-offset-4">
            {c.sponsorizat && <span className="text-xs font-semibold">★ Sponsorizat</span>}
            <strong>{c.nume}</strong><span>· {c.serviciu} ↗</span>
            <span className="sr-only">(se deschide într-un tab nou)</span>
          </a>
        </li>)}
      </ul>
      <p className="m-0 text-xs text-v3-ink-2">Linkuri către site-urile lor. Confirmă serviciul și onorariul direct cu ei. Poți apela și la consultantul tău.</p>
    </section>
  );
}
