(function (root) {
  'use strict';
  root.PRIMA_STABILITATE_V6 = {
    id: 'prima_stabilitate',
    teaserCategory: 'Sprijin pentru angajare',
    detailTitle: 'Prima de stabilitate pentru primul loc de muncă',
    tags: ['caut primul job', 'angajare'],
    act: 'OUG 11/2026 · MO 181 / 9 mar 2026 · art. I pct. 15, Legea 76/2002 art. 76⁵',
    article: 'art. 76⁵ alin. (1)–(7)',
    sources: [
      { label: 'ANAF · text PDF OUG 11/2026', url: 'https://static.anaf.ro/static/10/Anaf/legislatie/OUG_11_2026.pdf' }
    ],
    checked: '2026-10-29',
    sourceVerified: true,
    verified: true,
    lawInForce: true,
    actionAvailable: true,
    deadline: null,
    requiredAnswers: ['age_16_to_29', 'neet_now', 'not_yet_signed', 'ajofm_before_signing', 'first_full_time_indefinite', 'eligible_employer', 'no_incompatible_premium'],
    facts: [
      { key:'age_16_to_29', prompt:'Ai între 16 ani împliniți și sub 30 de ani?', help:'Condiția legală este între 16 ani și împlinirea vârstei de 30.' },
      { key:'neet_now', prompt:'În prezent nu lucrezi și nu urmezi școală sau formare profesională?', help:'Aceasta este definiția NEET folosită de act.' },
      { key:'not_yet_signed', prompt:'Nu ai semnat încă primul contract vizat?', help:'Înregistrarea la AJOFM trebuie să fie înainte de angajarea eligibilă.' },
      { key:'ajofm_before_signing', prompt:'Te vei înregistra la AJOFM înainte să semnezi contractul?', help:'Ordinea este esențială; înregistrarea după semnare nu confirmă condiția.' },
      { key:'first_full_time_indefinite', prompt:'Contractul va fi prima ta angajare cu normă întreagă, pe durată nedeterminată?', help:'Condiția din art. 76⁵ privește prima încadrare de acest tip.' },
      { key:'eligible_employer', prompt:'Angajatorul planificat nu se află în niciuna dintre categoriile excluse mai jos?', help:'Dacă nu poți stabili categoria angajatorului, alege „Nu sunt sigur(ă)” și întreabă AJOFM înainte de semnare.' },
      { key:'no_incompatible_premium', prompt:'Nu vei cumula această primă cu prima de inserție, activare, mobilitate sau relocare?', help:'Aceste prime nu se cumulează potrivit art. 76⁵ alin. (7).' }
    ],
    excludedEmployers: [
      'Instituții și autorități publice, indiferent de finanțare sau subordonare.',
      'Operatori economici: regii autonome înființate de stat; societăți/companii naționale; societăți la care statul este acționar unic sau majoritar; regii autonome înființate de unități administrativ-teritoriale; societăți la care unitățile administrativ-teritoriale sunt acționari unici sau majoritari.',
      'Autorități, agenții și instituții publice autonome aflate în coordonarea sau subordonarea Parlamentului României.',
      'Institute naționale de cercetare-dezvoltare aflate sub autoritatea, coordonarea sau subordonarea ministerelor ori a autorităților publice centrale și locale competente.',
      'Institute, institute naționale, comisii și comisii de specialitate aflate în coordonarea, autoritatea sau subordonarea administrației publice centrale ori locale, finanțate din fonduri publice, cu conducători ordonatori de credite, chiar dacă au autonomie funcțională și financiară.'
    ],
    teaser: {
      conditions: 'Vârsta 16–sub 30 și NEET; înregistrare AJOFM înainte de primul contract full-time pe durată nedeterminată; fără cumul cu primele excluse. Angajatorul nu poate fi instituție/autoritate publică; operator economic regie autonomă de stat/UAT, companie națională sau societate cu stat/UAT acționar unic ori majoritar; autoritate autonomă sub coordonarea/subordonarea Parlamentului; institut național de cercetare-dezvoltare sub autoritate/coordonare/subordonare publică; ori institut/comisie public finanțat sub administrația publică, cu conducător ordonator de credite.',
      amount: '1.000 lei/lună în primele 12 luni, apoi 1.250 lei/lună în următoarele 12, proporțional cu timpul lucrat și concediul anual.',
      certainty: 'Cuantum prevăzut de lege; eligibilitatea și acordarea trebuie confirmate de AJOFM. Nu este venit personal garantat.',
      action: 'Înregistrarea la AJOFM trebuie să fie făcută înainte de semnarea primului contract.'
    },
    guide: [
      'Înainte să semnezi primul contract eligibil, înregistrează-te la agenția județeană pentru ocuparea forței de muncă (AJOFM).',
      'Confirmă cu AJOFM că situația ta și angajatorul îndeplinesc condițiile; instituțiile publice și entitățile cu capital majoritar de stat/UAT sunt excluse.',
      'Semnează primul contract cu normă întreagă și pe durată nedeterminată numai după înregistrare.',
      'După angajare, cere AJOFM procedura și termenul exact pentru solicitare. OUG 11/2026 nu stabilește aici un termen de 90 de zile; acesta nu este prezentat ca regulă verificată.'
    ],
    limits: 'Cuantumul din lege este 1.000 lei/lună pentru primele 12 luni și 1.250 lei/lună pentru următoarele 12. Nu calculăm suma ta și nu promitem aprobarea. Plata este neimpozabilă și fără contribuții sociale obligatorii. Dacă raportul de muncă încetează în primele 24 de luni prin acordul părților, concediere disciplinară ori demisie, poate exista obligația de restituire integrală. Mutarea la alt angajator în maximum 60 de zile poate păstra dreptul dacă sunt respectate condițiile legale.',
    notAdvice: 'Acesta este un rezumat educativ al actului, nu o decizie de eligibilitate sau consultanță financiară. Răspunsurile declarate aici nu sunt verificate de AJOFM.'
  };
})(typeof window !== 'undefined' ? window : globalThis);
if (typeof module === 'object' && module.exports) module.exports = globalThis.PRIMA_STABILITATE_V6;
