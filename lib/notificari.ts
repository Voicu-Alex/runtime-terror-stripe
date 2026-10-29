import type { Limba } from './i18n';
import type { Potrivire } from './potrivire';
import { cuSemn } from './card';

export type Notificare = {
  id: string; tip: 'act_nou' | 'termen' | 'in_vigoare'; titlu: string; mesaj: string;
  termen: string | null; act: string; articol: string; sursa_url: string; verificat_la: string | null;
};

/** Previzualizare deterministă, fără livrare push sau istoric de trimiteri. */
export function notificariLa(potriviri: Potrivire[], azi: string, limba: Limba = 'ro'): Notificare[] {
  const en = limba === 'en';
  const peste14 = new Date(Date.parse(`${azi}T00:00:00Z`) + 14 * 86400000).toISOString().slice(0, 10);
  return potriviri.flatMap(p => {
    const s = p.schimbare;
    if (s.publicat_la > azi || (s.expira_la && s.expira_la < azi)) return [];
    const termen = [s.termen_actiune, ...s.actiuni.filter(a => a.tip !== 'nimic_pana_la').map(a => a.termen)].find(d => d === peste14) ?? null;
    const tip = s.publicat_la === azi ? 'act_nou' : termen ? 'termen'
      : s.status !== 'proiect' && s.in_vigoare_de_la === azi ? 'in_vigoare' : null;
    if (!tip) return [];
    const titlu = tip === 'act_nou' ? (en ? 'A new act may affect you' : 'A apărut un act care te poate privi')
      : tip === 'termen' ? (en ? 'You have 14 days left' : 'Mai ai 14 zile')
      : (en ? 'The rule applies from today' : 'De azi, regula se aplică');
    const impact = p.impact_lei_luna == null ? (p.valori_lipsa.length
      ? (en ? 'Complete your profile to see the impact.' : 'Completează profilul ca să vezi impactul.')
      : (en ? 'The annual impact is not calculated yet.' : 'Impactul anual nu este calculat încă.'))
      : p.impact_lei_luna === 0 ? (en ? 'No annual change calculated for your profile.' : 'Pentru profilul tău nu rezultă o schimbare anuală.')
      : `${en ? 'For you' : 'Pentru tine'}: ${cuSemn(p.impact_lei_luna * 12)} ${en ? 'lei/year' : 'lei/an'}${s.estimare ? (en ? ', estimate' : ', estimare') : ''}.`;
    const mesaj = [s.act + '.',
      s.in_vigoare_de_la > azi ? `${s.status === 'proiect' ? (en ? 'Proposed start' : 'Aplicare propusă') : (en ? 'Applies from' : 'Se aplică din')} ${s.in_vigoare_de_la}.` : '', impact,
      p.stare === 'posibil' ? (en ? 'This may apply; check your profile.' : 'Te poate privi; verifică profilul.') : '',
      s.status === 'proiect' ? (en ? 'This is a draft and can change.' : 'Este proiect și se poate schimba.') : '',
      termen && tip === 'termen' ? `${en ? 'Check what you can do by' : 'Vezi ce poți face până pe'} ${termen}.` : '',
    ].filter(Boolean).join(' ');
    return [{ id: s.id, tip, titlu, mesaj, termen, act: s.act, articol: s.articol, sursa_url: s.sursa_url, verificat_la: s.verificat_la }];
  });
}
