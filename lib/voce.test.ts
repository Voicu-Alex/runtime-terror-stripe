import { describe, expect, it } from 'vitest';
import { CATALOG, valideazaCatalog } from './catalog';
import { niveluri } from './continut';
import { comparatieAct, confirmaProfil } from './voce';

const act = (id: string) => CATALOG.find(s => s.id === id)!;

describe('vocile alese', () => {
  it('asistentul confirmă etichetele cu tu, fără să ceară date personale', () => {
    expect(confirmaProfil(['angajat', 'it'])).toBe('Am notat: salariu, IT. Poți scoate ce nu se potrivește.');
    expect(confirmaProfil([], true)).toBe('Am completat cifrele din document. Le poți verifica mai jos.');
    expect(confirmaProfil([], false, 'en')).toBe('I found no new tags. You can fill in your profile using the form.');
  });

  it('rezumatele actelor folosesc tu inclusiv în conținutul editorial', () => {
    expect(niveluri(act('dividende_16')).zero).toContain('dividendele tale');
    expect(niveluri(act('cass_pensii')).zero).toContain('pensia ta');
    expect(act('horeca_tva_11').actiuni[0].text).toMatch(/^Actualizează/);
  });

  it('arată înainte și acum numai cu valorile documentate', () => {
    expect(comparatieAct(act('tva_21'))).toEqual({ inainte: '19% (cota standard)', acum: '21% (cota standard)' });
    expect(comparatieAct(act('horeca_tva_11'))).toEqual({ inainte: 'de verificat', acum: '11% (cota redusă)' });
    expect(comparatieAct(act('horeca_tva_11'), 'en')?.inainte).toBe('to be verified');
    expect(comparatieAct(act('pilon2_plata'))).toBeNull();
  });

  it('respinge o comparație cu sursă lipsă sau diferită de act', () => {
    const s = act('tva_21');
    expect(() => valideazaCatalog([{ ...s, comparatie: { ...s.comparatie, sursa_url: '' } }])).toThrow(/comparație/);
    expect(() => valideazaCatalog([{ ...s, comparatie: { ...s.comparatie, verificat_la: null } }])).toThrow(/comparație/);
  });
});
