import { describe, expect, it } from 'vitest';
import { solutieScurta } from './solutii';
import date from '@/data/solutii.json';
import catalog from '@/data/catalog.json';
import { esteDestinatie } from './destinatii';

describe('soluții și servicii relevante pentru lege', () => {
  it('asociază numai legi și destinații existente în registre', () => {
    for (const [id, solutie] of Object.entries(date.legi)) {
      expect(catalog.some(lege => lege.id === id), id).toBe(true);
      for (const key of solutie.oficiale) expect(esteDestinatie(key), key).toBe(true);
      for (const key of solutie.consultanti) expect(Object.hasOwn(date.consultanti, key), key).toBe(true);
    }
    for (const id of Object.values(date.aliasuri_v6)) expect(Object.hasOwn(date.legi, id), id).toBe(true);
  });
  it('pune sponsorul primul numai între consultanții relevanți', () => {
    const s = solutieScurta('dividende_16', 'in_vigoare')!;
    expect(s.consultanti[0].nume).toBe('Crowe România');
    expect(s.consultanti[0].sponsorizat).toBe(true);
    expect(s.consultanti.some(c => c.nume === 'BDO România')).toBe(true);
  });

  it('leagă energia de comparator și furnizori, nu de contabili', () => {
    const s = solutieScurta('gaz_plafon', 'in_vigoare')!;
    expect(s).not.toBeNull();
    expect(s.oficiale.some(d => d.url === 'https://posf.ro/comparator')).toBe(true);
    expect(s.consultanti.map(c => c.nume)).toContain('ENGIE România');
    expect(s.consultanti.map(c => c.nume)).not.toContain('BDO România');
  });

  it('direcționează ajutoarele la instituție fără să vândă o consultație', () => {
    const s = solutieScurta('prima_stabilitate', 'in_vigoare')!;
    expect(s).not.toBeNull();
    expect(s.oficiale.some(d => d.url === 'https://www.anofm.ro/')).toBe(true);
    expect(s.consultanti).toEqual([]);
  });

  it('acoperă locuințe, salarii, pensii și auto cu resurse potrivite', () => {
    for (const id of ['tva_locuinta','it_scutire','pilon2_plata','rovinieta_2026','impozit_auto_2026']) {
      expect(solutieScurta(id, 'in_vigoare')?.text).toBeTruthy();
    }
    expect(solutieScurta('impozit_auto_2026', 'in_vigoare')!.consultanti).toEqual([]);
    expect(solutieScurta('pilon2_plata', 'adoptat')!.oficiale.some(d => d.autoritate === 'ASF')).toBe(true);
  });

  it('nu inventează o soluție pentru un proiect sau o lege necunoscută', () => {
    expect(solutieScurta('dividende_16', 'proiect')).toBeNull();
    expect(solutieScurta('necunoscuta', 'in_vigoare')).toBeNull();
  });
});
