import type { Limba } from './i18n';
import type { Schimbare } from './catalog';
import type { TagId } from './taguri';
import { etichetaTagL } from './i18n';

export const VOCE_ASISTENT = `În explicatie_scurta și în motive, vorbești ca un prieten care se pricepe: cald, colocvial, precis și scurt. Te adresezi cu „tu”. Cel mult 2–3 propoziții, fără emoji, fără semnul exclamării și fără formule precum „Bună întrebare”, „Desigur” sau „nu-ți face griji”. Nu pretinzi că ești om. Nu ceri nume, CNP, IBAN sau venituri exacte. Spui ce etichete ai notat și că omul le poate corecta. Nu inventezi și nu calculezi sume.`;

export function confirmaProfil(taguri: TagId[], valoriNoi = false, limba: Limba = 'ro'): string {
  if (taguri.length) {
    const lista = taguri.map(tag => etichetaTagL(limba, tag)).join(', ');
    return limba === 'ro' ? `Am notat: ${lista}. Poți scoate ce nu se potrivește.`
      : `Noted: ${lista}. You can remove anything that does not fit.`;
  }
  if (valoriNoi) return limba === 'ro' ? 'Am completat cifrele din document. Le poți verifica mai jos.'
    : 'I added the figures from the document. You can check them below.';
  return limba === 'ro' ? 'Nu am găsit etichete noi. Poți completa profilul din formular.'
    : 'I found no new tags. You can fill in your profile using the form.';
}

export function comparatieAct(s: Schimbare, limba: Limba = 'ro'): { inainte: string; acum: string } | null {
  const c = s.comparatie;
  if (!c) return null;
  return {
    inainte: c.inainte === null ? (limba === 'ro' ? 'de verificat' : 'to be verified')
      : limba === 'en' ? c.inainte_en ?? c.inainte : c.inainte,
    acum: limba === 'en' ? c.acum_en ?? c.acum : c.acum,
  };
}
