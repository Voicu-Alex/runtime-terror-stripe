import { describe, expect, it } from 'vitest';
import { CATALOG } from './catalog';
import { potriveste } from './potrivire';
import { persoanaDemo } from './persoane-demo';
import { notificariLa } from './notificari';

const pentru = (azi: string) => potriveste(persoanaDemo('andrei').profil, CATALOG, azi);

describe('notificări în vocea B', () => {
  it.each([
    ['ro', '−1.440 lei/an'],
    ['en', '−1.440 lei/year'],
  ] as const)('afișează impactul anual în %s', (limba, suma) => {
    const p = pentru('2026-10-28').find(p => p.schimbare.id === 'dividende_16')!;
    const schimbare = { ...p.schimbare, publicat_la: '2026-10-28' };
    const n = notificariLa([{ ...p, schimbare }], '2026-10-28', limba)[0];
    expect(n.mesaj).toContain(suma);
  });

  it('nu produce un mesaj de umplutură într-o zi fără evenimente', () => {
    expect(notificariLa(pentru('2026-10-28'), '2026-10-28')).toEqual([]);
  });
  it('anunță termenul doar cu 14 zile înainte, inclusiv termenul unei acțiuni secundare', () => {
    const p = pentru('2026-10-17')[0];
    const schimbare = { ...p.schimbare, publicat_la: '2026-01-01', in_vigoare_de_la: '2026-01-01', expira_la: null,
      termen_actiune: null, actiuni: [{ ...p.schimbare.actiuni[0], termen: null }, { ...p.schimbare.actiuni[0], termen: '2026-10-31' }] };
    expect(notificariLa([{ ...p, schimbare }], '2026-10-17')[0]).toMatchObject({ tip: 'termen', titlu: 'Mai ai 14 zile', termen: '2026-10-31' });
    expect(notificariLa([{ ...p, schimbare }], '2026-10-18')).toEqual([]);
  });
  it('anunță publicarea sau intrarea în vigoare o singură dată și păstrează sursa', () => {
    const p = pentru('2026-10-28')[0];
    const schimbare = { ...p.schimbare, publicat_la: '2026-10-28', in_vigoare_de_la: '2026-10-28', expira_la: null };
    const n = notificariLa([{ ...p, schimbare, impact_lei_luna: null, valori_lipsa: ['salariu_brut'] }], '2026-10-28');
    expect(n).toHaveLength(1);
    expect(n[0]).toMatchObject({ tip: 'act_nou', sursa_url: schimbare.sursa_url });
    expect(n[0].mesaj).toContain('Completează profilul');
    expect(n[0].mesaj).not.toMatch(/null|NaN|undefined/);
    expect(notificariLa([{ ...p, schimbare }], '2026-10-27')).toEqual([]);
  });
  it('nu cere completarea unui profil complet și precizează data aplicării viitoare', () => {
    const p = pentru('2026-10-28')[0];
    const schimbare = { ...p.schimbare, publicat_la: '2026-10-28', in_vigoare_de_la: '2027-01-01', expira_la: null };
    const n = notificariLa([{ ...p, schimbare, impact_lei_luna: null, valori_lipsa: [] }], '2026-10-28')[0];
    expect(n.mesaj).not.toContain('Completează profilul');
    expect(n.mesaj).toContain('nu este calculat');
    expect(n.mesaj).toContain('2027-01-01');
  });
  it('marchează estimarea, potrivirea posibilă și proiectul, inclusiv în engleză', () => {
    const p = pentru('2026-10-28')[0];
    const schimbare = { ...p.schimbare, publicat_la: '2026-10-28', status: 'proiect' as const, estimare: true, expira_la: null };
    const n = notificariLa([{ ...p, schimbare, stare: 'posibil', impact_lei_luna: -123 }], '2026-10-28', 'en')[0];
    expect(n.mesaj).toContain('estimate');
    expect(n.mesaj).toContain('may apply');
    expect(n.mesaj).toContain('can change');
  });
});
