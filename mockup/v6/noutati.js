/* Date pentru v6.
   1) Un proiect care îl privește pe Andrei, adăugat în „Pentru tine”.
   2) „Noutăți”: actele recente din data/catalog.json (copiate cu sursele lor) și două proiecte în consultare,
      găsite pe 29 oct 2026. Proiectele au doar surse de presă; textul oficial e TODO. */

ITEMS.push({ id: 'motorina_pr', topic: 'masina', short: 'Motorină, prelungire propusă',
  title: 'Proiect: acciza redusă la motorină s-ar prelungi până la 31 ian 2027',
  act: 'Proiect de hotărâre (Ministerul Finanțelor)', mo: 'anunțat pe 26 oct 2026, încă neadoptat',
  link: 'https://financiarul.ro/economie/finantele-propun-pastrarea-accizei-reduse-pentru-motorina/',
  art: 'prelungește măsurile din Legea 162/2026 pentru 1 nov 2026 – 31 ian 2027; textul oficial: TODO',
  status: 'proiect', effective: '2026-11-01', published: '2026-10-26',
  impact: 3.54, gain: 0, est: true, deadline: null,
  action: 'Nimic de făcut încă. Dacă se adoptă, motorina rămâne cu ≈0,85 lei/l mai ieftină până la 31 ian 2027',
  why: 'Ministerul Finanțelor propune încă trei luni de acciză redusă și adaos comercial plafonat. Fără prelungire, ministerul estimează că litrul de motorină s-ar scumpi cu ≈0,85 lei.',
  note: 'Suma presupune un plin de 50 l pe lună. E un proiect: se poate schimba sau poate să nu fie adoptat.',
  tags: ['șofer'] });

/* etichetele lui Andrei în vocabularul catalogului */
var MY_TAGS = { angajat: 'angajat', angajat_it: 'angajat IT', srl_dividende: 'SRL cu dividende', chirias: 'chiriaș', pilon2: 'Pilon II', masina: 'șofer', transport: 'șofer', consumator_energie: 'consumator energie', consumator_gaz: 'consumator gaz' };
var TAG_LABEL = { micro: 'microîntreprindere', transport: 'transport', elev_student: 'student', salariu_minim: 'salariu minim', caut_primul_job: 'caut primul job', parinte: 'părinte', parinte_singur: 'părinte singur', pfa: 'PFA', proprietar: 'proprietar', agricultura: 'agricultură', locuitor_iasi: 'locuiesc în Iași' };

window.NEWS = [
  { id: 'n_iasi', status: 'proiect', date: '2026-10-28', from: 'Primăria Municipiului Iași',
    title: 'Iași: taxele locale pe 2027 ar crește cu inflația (7,3%); cota pentru casele persoanelor fizice rămâne 0,08%',
    body: 'Proiect de hotărâre în dezbatere publică. Valorile de bază s-ar indexa cu 7,3%. Observațiile se trimit în 30 de zile lucrătoare de la publicare. Nu e încă o hotărâre.',
    act: 'Proiect de hotărâre a Consiliului Local Iași', ref: 'textul oficial: TODO (pe site-ul Primăriei Iași)',
    url: 'https://www.stireadeiasi.ro/stiri-locale/impozite-taxe-locale-iasi-2027/', srcName: 'Știrea de Iași, 28 oct 2026', conf: 'presă', tags: ['proprietar', 'locuitor_iasi'] },
  { id: 'n_motorina_pr', status: 'proiect', date: '2026-10-26', from: 'Ministerul Finanțelor', feed: 'motorina_pr',
    title: 'Acciza redusă la motorină și adaosul plafonat s-ar prelungi de la 1 nov 2026 până la 31 ian 2027',
    body: 'Proiect de hotărâre anunțat de minister. Trebuie adoptat și publicat înainte de 31 oct, altfel măsurile se opresc. Ministerul estimează ≈0,85 lei/l în plus fără prelungire.',
    act: 'Proiect de hotărâre a Guvernului', ref: 'textul oficial: TODO',
    url: 'https://financiarul.ro/economie/finantele-propun-pastrarea-accizei-reduse-pentru-motorina/', srcName: 'Financiarul, 26 oct 2026', conf: 'presă', tags: ['masina', 'transport'] },
  { id: 'cei_d', status: 'adoptat', date: '2026-10-15', eff: '2027-01-01', from: 'Parlamentul', feed: 'cei_d',
    title: 'Cont de investiții pentru pensie (CEI-D): din 2027, ce depui îți scade impozitul cu 10%',
    act: 'Legea 202/2026', ref: 'MO 865 / 15 oct 2026', url: 'https://www.infodosar.ro/monitorul-oficial/parlamentul/368610-lege-202-2026', srcName: 'text publicat', conf: 'medie', tags: ['angajat'] },
  { id: 'burse', status: 'in_vigoare', date: '2026-09-30', eff: '2026-09-30', from: 'Ministerul Educației și Cercetării',
    title: 'Burse studenți 2026–2027: bursa socială minimă 925 lei, doctorat 3.700 lei',
    act: 'Ordinul MEC nr. 5.732/2026', ref: 'MO 831 / 30 sep 2026', url: 'https://legislatie.just.ro/Public/DetaliiDocument/314940', srcName: 'Portal Legislativ', conf: 'ridicată', tags: ['elev_student'] },
  { id: 'rovinieta', status: 'in_vigoare', date: '2026-09-25', eff: '2026-10-01', from: 'Ministerul Transporturilor',
    title: 'Rovinieta depinde acum de norma Euro: 228–330 lei pe an pentru autoturisme',
    act: 'Ordinul MTI 888/2026', ref: 'MO 818 / 25 sep 2026', url: 'https://legislatie.just.ro/Public/DetaliiDocument/314861', srcName: 'Portal Legislativ', conf: 'ridicată', tags: ['masina', 'transport'],
    gap: 'Nu știm norma Euro a mașinii tale, deci nu e încă în bilanț.' },
  { id: 'motorina', status: 'in_vigoare', date: '2026-08-04', eff: '2026-08-07', from: 'Parlamentul', feed: 'motorina',
    title: 'Motorina e cu aproximativ 0,85 lei/l mai ieftină până la 31 oct 2026 (acciză redusă cu 25%)',
    act: 'Legea 162/2026', ref: 'MO 642 / 4 aug 2026', url: 'https://www.monitoruljuridic.ro/monitorul-oficial/642/2026-08-04/', srcName: 'Monitorul Juridic', conf: 'medie', tags: ['masina', 'transport'] },
  { id: 'sal_min', status: 'in_vigoare', date: '2026-03-13', eff: '2026-07-01', from: 'Guvernul',
    title: 'Salariul minim brut crește la 4.325 lei de la 1 iulie 2026',
    act: 'HG 146/2026', ref: 'MO 196 / 13 mar 2026', url: 'https://legislatie.just.ro/Public/DetaliiDocument/308231', srcName: 'Portal Legislativ', conf: 'ridicată', tags: ['salariu_minim'] },
  { id: 'prima', status: 'in_vigoare', date: '2026-03-09', eff: '2026-03-09', from: 'Guvernul',
    title: 'Primul job pe durată nedeterminată: statul îți plătește 27.000 lei în 2 ani, dacă te înregistrezi la AJOFM înainte',
    act: 'OUG 11/2026 (modifică Legea 76/2002)', ref: 'MO 181 / 9 mar 2026', url: 'https://static.anaf.ro/static/10/Anaf/legislatie/OUG_11_2026.pdf', srcName: 'ANAF', conf: 'ridicată', tags: ['caut_primul_job'] },
  { id: 'cm_zi1', status: 'in_vigoare', date: '2025-12-31', eff: '2026-02-01', from: 'Guvernul',
    title: 'Prima zi de concediu medical nu se plătește până la final de 2027',
    act: 'OUG 91/2025', ref: 'MO 1223 / 31 dec 2025', url: 'https://ms.ro/media/documents/NF_OUG_compl._OUG_91_2025_site.pdf', srcName: 'Ministerul Sănătății', conf: 'medie', tags: ['angajat'],
    gap: 'Te privește doar dacă iei concediu medical, deci nu intră în bilanț.' },
  { id: 'micro', status: 'in_vigoare', date: '2025-12-24', eff: '2026-01-01', from: 'Guvernul',
    title: 'Microîntreprindere: cotă unică 1% din 2026',
    act: 'OUG 89/2025', ref: 'MO 1203 / 24 dec 2025', url: 'https://legislatie.just.ro/Public/DetaliiDocument/305817', srcName: 'Portal Legislativ', conf: 'medie', tags: ['micro', 'srl_dividende'],
    gap: 'Fără efect estimat pe profilul tău.' },
  { id: 'netax', status: 'in_vigoare', date: '2025-12-24', eff: '2026-01-01', from: 'Guvernul',
    title: '200 lei netaxabili la salariul minim, doar până la 31 dec 2026',
    act: 'OUG 89/2025', ref: 'MO 1203 / 24 dec 2025', url: 'https://legislatie.just.ro/Public/DetaliiDocument/305817', srcName: 'Portal Legislativ', conf: 'ridicată', tags: ['salariu_minim'] },
  { id: 'imp_auto', status: 'in_vigoare', date: '2025-12-15', eff: '2026-01-01', from: 'Parlamentul',
    title: 'Impozitul auto din 2026 depinde de cilindree și de norma Euro: mașinile mici pe benzină sau motorină plătesc până la dublu',
    act: 'Legea 239/2025 (modificată prin OUG 78/2025)', ref: 'MO 1160 / 15 dec 2025', url: 'https://legislatie.just.ro/Public/DetaliiDocument/305208', srcName: 'Portal Legislativ', conf: 'medie', tags: ['masina'],
    gap: 'Nu știm cilindreea mașinii tale, deci nu e încă în bilanț.' }
];
