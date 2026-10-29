// =========================================================================
// DATE REALE: PERSONAS & LEGI REALE CU IMPACT FINANCIAR ȘI SOLUȚII CONCRETE
// =========================================================================

const PERSONAS = {
  radu: {
    id: "radu",
    name: "Radu Munteanu",
    age: 24,
    avatar: "🎓",
    role: "Proaspăt Absolvent & Programator Junior",
    location: "București",
    tags: ["absolvent", "student", "munca", "tineri", "chirie", "energie_curent"],
    bio: "A terminat facultatea în această vară și s-a angajat full-time ca dezvoltator junior. Nu deține mașină, stă în chirie."
  },
  elena: {
    id: "elena",
    name: "Elena Vasilescu",
    age: 34,
    avatar: "💼",
    role: "Fondator SRL Micro (Software) & Părinte",
    location: "Cluj-Napoca",
    tags: ["srl", "srl_micro", "dividende", "firme", "copil", "energie_curent", "proprietar"],
    bio: "Conduce o firmă de IT cu cifră de afaceri în jurul a 110.000 EUR. Trăiește din dividende și este proprietar de locuință."
  },
  mihai: {
    id: "mihai",
    name: "Mihai Damian",
    age: 41,
    avatar: "🚗",
    role: "PFA Consultanță & Posesor Auto Euro 3",
    location: "Timișoara",
    tags: ["pfa", "freelancer", "masina_euro3", "auto", "proprietar_auto", "incalzire_gaz"],
    bio: "Oferă servicii de consultanță în marketing ca PFA în sistem real. Conduce un autoturism diesel Euro 3 și locuiește la casă cu centrală pe gaz."
  },
  maria: {
    id: "maria",
    name: "Maria Popa",
    age: 67,
    avatar: "👵",
    role: "Pensionară (Pensie 4.500 lei)",
    location: "Iași",
    tags: ["pensie_peste_3000", "pensionari", "incalzire_gaz", "proprietar", "energie_curent"],
    bio: "Fost cadru didactic cu o pensie de 4.500 lei. Locuiește în apartament proprietate personală încălzit cu centrală de bloc pe gaz."
  }
};

const LAWS = [
  {
    id: "absolvent-prima-insertie",
    category: "munca",
    category_label: "Muncă & Salarii",
    headline: "PENTRU ABSOLVENȚII DE LICEU SAU FACULTATE: PRIMĂ NERAMBURSABILĂ DE 1.980 LEI DE LA STAT (3 × ISR)",
    act: "Legea nr. 76/2002 privind sistemul asigurărilor pentru șomaj, art. 73^1",
    mo: "Monitorul Oficial nr. 103/2002, valoare ISR actualizată 2025-2026",
    status: "in_force",
    status_label: "În Vigoare",
    link: "https://legislatie.just.ro/Public/DetaliiDocument/34293",
    tags: ["absolvent", "student", "munca", "tineri"],
    direction: "gain",
    amount_label: "+1.980 lei",
    amount_monthly: 165, // amortizat pe 12 luni
    impact_unit: "sumă fixă acordată în 2 tranșe",
    summary: "Dacă ai absolvit o facultate sau un liceu (promoția curentă) și te angajezi cu normă întreagă pe o perioadă de cel puțin 12 luni, statul român îți plătește o primă neimpozabilă de inserție egală cu de 3 ori Indicatorul Social de Referință (3 × 660 lei = 1.980 lei).",
    steps: [
      "Înregistrează-te la Agenția Județeană pentru Ocuparea Forței de Muncă (AJOFM) în termen strict de 60 de zile calendaristice de la data absolvirii (pe baza adeverinței sau diplomei).",
      "În momentul angajării (contract individual de muncă pe durată nedeterminată sau determinată de peste 12 luni), depune cererea și dosarul la AJOFM în termen de maximum 60 de zile de la încadrare.",
      "Încasează prima tranșă de 50% (990 lei) imediat după angajare, iar restul de 50% (990 lei) după finalizarea celor 12 luni de activitate continuă."
    ],
    best_solution: "Agenția Județeană pentru Ocuparea Forței de Muncă (AJOFM)",
    solution_desc: "Procedură 100% gratuită realizată direct la ghișeul AJOFM sau online prin platforma ANOFM. Nu apela la intermediari privați care solicită comisioane din primă.",
    solution_url: "https://www.anofm.ro/",
    mitigation_benefit_annual: 1980,
    mitigation_action_name: "Solicită prima de inserție la AJOFM (1.980 lei)"
  },
  {
    id: "masini-euro3-impozit",
    category: "auto",
    category_label: "Auto & Mediu",
    headline: "PENTRU DEȚINĂTORII DE MAȘINI POLUANTE (EURO 3 SAU MAI VECHI): CREȘTERI DE PÂNĂ LA 35% ÎN IMPOZITUL AUTO ȘI ASIGURĂRI",
    act: "Codul Fiscal (Legea 227/2015, Titlul IX) & Normele de Mediu privind Taxarea Auto",
    mo: "Monitorul Oficial nr. 688/2015 cu modificările anuale privind coeficienții locali",
    status: "in_force",
    status_label: "În Vigoare",
    link: "https://legislatie.just.ro/Public/DetaliiDocument/171282",
    tags: ["masina_euro3", "auto", "proprietar_auto"],
    direction: "cost",
    amount_label: "−450 lei / an",
    amount_monthly: -38,
    impact_unit: "taxe locale majorate & RCA penalizat",
    summary: "Consiliile locale aplică coeficienți de poluare majorați pentru normele de poluare vechi (Non-Euro, Euro 1, 2 și 3), iar asigurătorii aplică franșize mai mari de risc pentru vehiculele de peste 15 ani. Costul anual de menținere pe drumuri crește considerabil.",
    steps: [
      "Verifică dacă primăria localității tale derulează programul 'Rabla Local' (fără obligația de a cumpăra o mașină nouă).",
      "Pentru polița RCA obligatorie: nu accepta oferta de reînnoire automată! Folosește un comparator de prețuri pentru a identifica asigurătorul cu cea mai mică încărcare pe clasa de vechime.",
      "Dacă vehiculul are capacitate cilindrică mare (peste 2.000 cmc), casarea sau trecerea pe o motorizare hibridă scade impozitul anual cu până la 90%."
    ],
    best_solution: "Programul Rabla Local (AFM) + Comparator Pint.ro",
    solution_desc: "Primești 3.000 lei cash de la primărie/AFM pentru casarea rablei fără să cumperi alt autoturism. Pentru RCA, comparatorul online Pint.ro găsește cea mai mică primă de pe piață în sub 2 minute.",
    solution_url: "https://www.afm.ro/",
    mitigation_benefit_annual: 3450, // 3000 rabla + 450 impozit salvat
    mitigation_action_name: "Casare prin Rabla Local (+3.000 lei) & RCA optimizat"
  },
  {
    id: "dividende-16-procent",
    category: "firme",
    category_label: "Firme & SRL",
    headline: "PENTRU ASOCIAȚII ÎN SRL-URI: IMPOZITUL PE DIVIDENDE CREȘTE DE LA 10% LA 16% (LEGEA 141/2025)",
    act: "Legea nr. 141/2025 pentru modificarea Codului Fiscal (art. 97 alin. 7)",
    mo: "Monitorul Oficial nr. 1334/2025",
    status: "adopted",
    status_label: "Adoptat · În Vigoare de la 1 Ian",
    link: "https://legislatie.just.ro/Public/DetaliiDocument/276541",
    tags: ["srl", "dividende", "firme"],
    direction: "cost",
    amount_label: "−1.200 lei / lună",
    amount_monthly: -1200,
    impact_unit: "calculat la retrageri medii de 20.000 lei / lună",
    summary: "Cota de impozitare a dividendelor distribuite crește cu 60% (de la 10% la 16%). La fiecare 100.000 lei profit distribuit, asociații pierd 6.000 lei net plătiți în plus la bugetul de stat.",
    steps: [
      "Convoacă Adunarea Generală a Asociaților (AGA) înainte de sfârșitul anului fiscal curent.",
      "Solicită contabilului întocmirea unei balanțe și a situațiilor financiare interimare pe trimestrul 3 sau 4.",
      "Distribuie și virează efectiv dividendele interimare înainte de termenul de aplicare a noii cote de 16%, beneficiind legal de cota veche de 10%."
    ],
    best_solution: "Distribuire Dividende Interimare prin Contabil CECCAR",
    solution_desc: "Depunerea bilanțului interimar și plata anticipată a dividendelor salvează exact 6% din profitul net al firmei. Costul întocmirii documentației (300–500 lei) este recuperat din prima lună.",
    solution_url: "https://ceccar.ro/",
    mitigation_benefit_annual: 14400,
    mitigation_action_name: "Bilanț interimar & distribuire dividende înainte de termen"
  },
  {
    id: "microintreprinderi-plafon-100k",
    category: "firme",
    category_label: "Firme & SRL",
    headline: "PENTRU MICROÎNTREPRINDERI: PLAFON REDUS LA 100.000 EUR — RISC DE TRECERE LA IMPOZIT PE PROFIT 16%",
    act: "OUG nr. 156/2024 & Legea 141/2025 (modificare art. 47 Cod Fiscal)",
    mo: "Monitorul Oficial nr. 1334/31 dec 2024",
    status: "in_force",
    status_label: "În Vigoare",
    link: "https://legislatie.just.ro/Public/DetaliiDocument/293214",
    tags: ["srl_micro", "srl", "firme"],
    direction: "cost",
    amount_label: "−1.800 lei / lună",
    amount_monthly: -1800,
    impact_unit: "diferență impozit dacă depășești plafonul",
    summary: "Plafonul de venituri pentru a rămâne microîntreprindere (1% pe venit) scade la 100.000 EUR. Dacă depășești pragul, treci obligatoriu la impozit pe profit de 16%, ceea ce penalizează grav afacerile de servicii și IT cu cheltuieli mici.",
    steps: [
      "Monitorizează lunar cifra de afaceri cumulată de la 1 ianuarie calculată la cursul oficial BNR.",
      "Dacă depășirea plafonului este inevitabilă, optimizează cheltuielile deductibile (investiții în tehnică IT, traininguri, abonamente software, sponsorizări deductibile).",
      "Structurează activitățile pe linii de business distincte sau analizează eșalonarea contractelor plurianuale."
    ],
    best_solution: "Optimizare Deductibilitate Fiscală & Audit Cheltuieli",
    solution_desc: "Un audit cu un consultant fiscal autorizat maximizează cheltuielile deductibile conform art. 25 Cod Fiscal, recuperând până la 40% din impactul trecerii la regimul de 16% pe profit.",
    solution_url: "https://ceccar.ro/",
    mitigation_benefit_annual: 12500,
    mitigation_action_name: "Audit fiscal și optimizare cheltuieli deductibile"
  },
  {
    id: "pfa-plafon-cass-60",
    category: "firme",
    category_label: "PFA & Freelancing",
    headline: "PENTRU PFA-URILE ÎN SISTEM REAL: CASS RECALCULAT CU PLAFON MAXIM DE 60 DE SALARII MINIME",
    act: "OUG nr. 115/2023 & Legea nr. 296/2023 privind măsurile fiscal-bugetare",
    mo: "Monitorul Oficial nr. 1139/2023",
    status: "in_force",
    status_label: "În Vigoare",
    link: "https://legislatie.just.ro/Public/DetaliiDocument/277320",
    tags: ["pfa", "freelancer", "firme"],
    direction: "cost",
    amount_label: "−850 lei / lună",
    amount_monthly: -850,
    impact_unit: "creștere contribuție sănătate",
    summary: "Contribuția CASS (10%) la PFA în sistem real nu se mai oprește la plafonul de 24 de salarii, ci urcă până la 60 de salarii minime brute pe economie (22.200 lei/an la un salariu de 3.700 lei). PFA-urile cu venituri medii și mari plătesc aproape triplu.",
    steps: [
      "Calculează venitul net estimat pe anul în curs (Venituri brute − Cheltuieli deductibile).",
      "Compară sarcina fiscală PFA (10% impozit + CAS plafonat + CASS plafonat la 60 salarii) cu un SRL micro.",
      "Dacă venitul net depășește 140.000 lei/an, închide PFA-ul și migrează portofoliul de clienți pe un SRL nou înființat."
    ],
    best_solution: "Înființare SRL prin ONRC Online / Platforme Digitale (StartCo)",
    solution_desc: "La un venit net de 200.000 lei, mutarea de pe PFA pe SRL microeconomisește peste 11.000 lei/an în contribuții sociale (CASS la dividende e plafonat la max. 24 salarii).",
    solution_url: "https://myportal.onrc.ro/",
    mitigation_benefit_annual: 10200,
    mitigation_action_name: "Tranziție PFA $\\rightarrow$ SRL Micro (salvează contribuțiile CASS)"
  },
  {
    id: "energie-electrica-deplafonare",
    category: "utilitati",
    category_label: "Utilități & Energie",
    headline: "PENTRU CONSUMATORII CASNICI DE ELECTRICITATE: PLAFONAREA PREȚURILOR DISPARE DE LA 1 IULIE 2025",
    act: "OUG nr. 27/2022 modificată prin OUG nr. 32/2024",
    mo: "Monitorul Oficial nr. 271/2024",
    status: "adopted",
    status_label: "Termen: 1 Iulie 2025",
    link: "https://legislatie.just.ro/Public/DetaliiDocument/253401",
    tags: ["energie_curent", "locuinta", "proprietar", "chirie"],
    direction: "cost",
    amount_label: "−95 lei / lună",
    amount_monthly: -95,
    impact_unit: "creștere estimată pe factură la 200 kWh",
    summary: "Plafonarea prețurilor la energia electrică încetează la 1 iulie 2025. Utilizatorii care au contracte cu tarife mari de piață liberă riscă să plătească de la 0,68–0,80 lei/kWh până la 1,20–1,40 lei/kWh.",
    steps: [
      "Verifică pe ultima factură de energie electrică ce preț contractual unitar ai pentru componenta de energie activă.",
      "Accesează comparatorul oficial de prețuri al ANRE pentru a vedea cel mai mic preț concurențial garantat.",
      "Semnează online schimbarea gratuită de furnizor în maximum 24 de ore prin platforma POSF (nu există întrerupere de alimentare și nu schimbi contorul)."
    ],
    best_solution: "Hidroelectrica (Furnizor de stat cu cel mai mic tarif concurențial)",
    solution_desc: "Oferă un tarif de energie activă de ~0,28 lei/kWh (preț final ~0,72–0,78 lei/kWh), fiind de departe cel mai ieftin furnizor din România. Schimbarea e 100% gratuită online.",
    solution_url: "https://client.hidroelectrica.ro/",
    mitigation_benefit_annual: 1140,
    mitigation_action_name: "Schimbă furnizorul la Hidroelectrica (economie 95 lei/lună)"
  },
  {
    id: "gaz-plafonare-prelungita",
    category: "utilitati",
    category_label: "Utilități & Energie",
    headline: "PENTRU LOCUINȚELE CU ÎNCĂLZIRE PE GAZ: PRELUNGIRE A PLAFONĂRII LA 0,25 LEI/KWH PÂNĂ ÎN 2027 (OUG 12/2026)",
    act: "Ordonanța de Urgență a Guvernului nr. 12/2026",
    mo: "Monitorul Oficial nr. 198/2026",
    status: "in_force",
    status_label: "În Vigoare până în 2027",
    link: "https://legislatie.just.ro/Public/DetaliiDocument/295101",
    tags: ["incalzire_gaz", "proprietar", "locuinta"],
    direction: "gain",
    amount_label: "+180 lei / lună",
    amount_monthly: 180,
    impact_unit: "economie garantată în sezonul rece",
    summary: "Guvernul a prelungit plafonul de preț la gaze naturale pentru clienții casnici la maximum 0,25377 lei/kWh (TVA inclus) până la 31 martie 2027. Facturile de căldură din timpul iernii rămân sub control strict.",
    steps: [
      "Verifică ca factura emisă de furnizorul tău actual (Engie, E.ON etc.) să conțină tariful plafonat conform OUG 12/2026.",
      "Instalează un termostat inteligent conectat la centrala termică pentru a optimiza ciclurile de ardere (economie adițională de 15%).",
      "Nu semna oferte de piață liberă pe termen lung care încearcă să elimine clauza de plafonare legală."
    ],
    best_solution: "Păstrare contract furnizor actual sub OUG 12/2026 + Termostat",
    solution_desc: "Furnizorii sunt obligați legal să aplice prețul minim. Nu este nevoie să schimbi furnizorul, ci doar să controlezi consumul din termostat.",
    solution_url: "https://www.engie.ro/gaz-energie/",
    mitigation_benefit_annual: 2160,
    mitigation_action_name: "Activează protecția OUG 12/2026 & optimizează centrala"
  },
  {
    id: "pensii-cass-peste-3000",
    category: "pensii",
    category_label: "Pensii & Sănătate",
    headline: "PENTRU PENSIONARII CU PENSII PESTE 3.000 LEI: CASS DE 10% PE SUMA CE DEPĂȘEȘTE PLAFONUL (LEGEA 141/2025)",
    act: "Legea nr. 141/2025 (modificare art. 154 Cod Fiscal)",
    mo: "Monitorul Oficial nr. 1334/2025",
    status: "in_force",
    status_label: "În Vigoare",
    link: "https://legislatie.just.ro/Public/DetaliiDocument/276541",
    tags: ["pensie_peste_3000", "pensionari"],
    direction: "cost",
    amount_label: "−150 lei / lună",
    amount_monthly: -150,
    impact_unit: "reținere directă din pensia de 4.500 lei",
    summary: "Se reintroduce contribuția de asigurări de sănătate (10%) pentru partea din pensie care depășește 3.000 lei net lunar. La o pensie de 4.500 lei, se reține automat 10% din 1.500 lei (adică 150 lei/lună reținuți la sursă de Casa de Pensii).",
    steps: [
      "Verifică noul cupon de pensie pentru a valida că reținerea de 10% se aplică doar sumei peste 3.000 lei, nu întregii pensii.",
      "Verifică dacă te încadrezi în scutirile prevăzute la art. 154 (veterani, persoane persecutate politic, handicap grav/accentuat).",
      "Pentru a compensa pierderea: solicită medicului de familie înscrierea în programele naționale de decontare 100% a medicamentelor compensate."
    ],
    best_solution: "Decontare Integrală Medicamente prin CNAS",
    solution_desc: "Fiind plătitor de CASS, beneficiezi de pachetul complet asigurat CNAS. Rețetele compensate la medicamente cronice economisesc în medie 200–350 lei/lună la farmacie.",
    solution_url: "https://cnas.ro/",
    mitigation_benefit_annual: 1800,
    mitigation_action_name: "Solicită compensarea integrală a rețetelor CNAS"
  }
];

// =========================================================================
// STARE APLICAȚIE (STATE)
// =========================================================================

let appState = {
  activeTab: "profile", // "profile" sau "all_laws"
  activePersona: "radu",
  activeMitigations: {}, // { [lawId]: boolean }
  searchTerm: "",
  activeCategoryFilter: "all"
};

// =========================================================================
// FUNCȚII DE CALCUL ȘI RANDARE
// =========================================================================

function getFilteredLawsForPersona(personaId) {
  const persona = PERSONAS[personaId];
  if (!persona) return [];
  
  return LAWS.filter(law => {
    return law.tags.some(tag => persona.tags.includes(tag));
  });
}

function calculatePersonaMetrics(personaId) {
  const laws = getFilteredLawsForPersona(personaId);
  
  let rawMonthly = 0;
  let mitigatedMonthly = 0;
  let totalSavedAnnual = 0;
  
  laws.forEach(law => {
    rawMonthly += law.amount_monthly;
    
    const isMitigated = !!appState.activeMitigations[law.id];
    if (isMitigated) {
      if (law.direction === "cost") {
        // Pierderea a fost atenuată sau compensată
        totalSavedAnnual += law.mitigation_benefit_annual;
      } else {
        // Beneficiul a fost încasat
        mitigatedMonthly += law.amount_monthly;
      }
    } else {
      // Fără mitigare
      if (law.direction === "cost") {
        mitigatedMonthly += law.amount_monthly;
      }
    }
  });
  
  return {
    rawMonthly,
    mitigatedMonthly,
    totalSavedAnnual,
    lawsCount: laws.length
  };
}

function formatMoney(amount, showSign = true) {
  const prefix = showSign && amount > 0 ? "+" : "";
  return `${prefix}${amount.toLocaleString("ro-RO")} lei`;
}

// =========================================================================
// RANDARE PAGINI
// =========================================================================

function renderApp() {
  const appContainer = document.getElementById("app-root");
  
  if (appState.activeTab === "profile") {
    renderProfileView(appContainer);
  } else {
    renderAllLawsView(appContainer);
  }
  
  updateHeaderTabs();
}

function updateHeaderTabs() {
  document.querySelectorAll(".nav-tab-btn").forEach(btn => {
    const tab = btn.dataset.tab;
    btn.classList.toggle("active", tab === appState.activeTab);
  });
  
  const personaLaws = getFilteredLawsForPersona(appState.activePersona);
  const badgeProfile = document.getElementById("badge-profile-count");
  if (badgeProfile) badgeProfile.textContent = personaLaws.length;
}

// -------------------------------------------------------------------------
// 1. RANDARE: PAGINA PROFILUL MEU PERSONALIZAT
// -------------------------------------------------------------------------
function renderProfileView(container) {
  const persona = PERSONAS[appState.activePersona];
  const laws = getFilteredLawsForPersona(appState.activePersona);
  const metrics = calculatePersonaMetrics(appState.activePersona);
  
  container.innerHTML = `
    <!-- PERSONA SWITCHER -->
    <section class="persona-section">
      <div class="section-label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        Selectează un Profil Mockup de Test:
      </div>
      <div class="persona-chips">
        ${Object.values(PERSONAS).map(p => `
          <button class="persona-chip ${p.id === persona.id ? 'active' : ''}" onclick="selectPersona('${p.id}')">
            <span class="persona-avatar">${p.avatar}</span>
            <div>
              <div class="persona-name">${p.name} (${p.age} ani)</div>
              <div class="persona-desc">${p.role}</div>
            </div>
          </button>
        `).join("")}
      </div>
    </section>

    <!-- DASHBOARD SUMMARY HERO -->
    <div class="dashboard-hero">
      <div class="hero-profile-bar">
        <div>
          <h2 style="font-size:22px; font-weight:800; margin-bottom:4px;">Profil Activ: ${persona.name}</h2>
          <p style="font-size:13.5px; opacity:0.8;">${persona.bio}</p>
        </div>
        <div class="profile-tag-list">
          ${persona.tags.map(t => `<span class="profile-tag-badge">#${t}</span>`).join("")}
        </div>
      </div>
      
      <div class="metrics-grid">
        <div class="metric-box">
          <div class="metric-box-label">Impact Lunar Fără Măsuri</div>
          <div class="metric-value ${metrics.rawMonthly < 0 ? 'neg' : (metrics.rawMonthly > 0 ? 'pos' : 'neutral')}">
            ${formatMoney(metrics.rawMonthly)}
          </div>
          <div class="metric-sub">efectul brut al noilor legi</div>
        </div>

        <div class="metric-box">
          <div class="metric-box-label">Bani Salvați / Încasați pe An</div>
          <div class="metric-value pos">
            +${metrics.totalSavedAnnual.toLocaleString("ro-RO")} lei
          </div>
          <div class="metric-sub">prin soluțiile aplicate mai jos</div>
        </div>

        <div class="metric-box">
          <div class="metric-box-label">Legi Relevante Identificate</div>
          <div class="metric-value neutral">
            ${metrics.lawsCount} modificări
          </div>
          <div class="metric-sub">strict pe etichetele tale</div>
        </div>
      </div>
    </div>

    <!-- CARDS FEED -->
    <div class="cards-feed-header">
      <div>
        <h3 class="feed-title">Legi care te privesc direct</h3>
        <p class="feed-subtitle">Fiecare lege tradusă în bani și pași de acțiune pentru situația ta</p>
      </div>
    </div>

    <div class="feed-container">
      ${laws.length === 0 ? `
        <div style="background:#fff; border:1px dashed var(--line-color); padding:40px; text-align:center; border-radius:16px;">
          <p style="font-weight:700; font-size:16px;">Nu există modificări legislative active pe aceste etichete.</p>
        </div>
      ` : laws.map(law => renderLawCard(law, true)).join("")}
    </div>
  `;
}

// -------------------------------------------------------------------------
// 2. RANDARE: TOATE SCHIMBĂRILE RECENTE DIN LEGE (CATALOG COMPLET)
// -------------------------------------------------------------------------
function renderAllLawsView(container) {
  let filtered = LAWS;
  
  if (appState.activeCategoryFilter !== "all") {
    filtered = filtered.filter(l => l.category === appState.activeCategoryFilter);
  }
  
  if (appState.searchTerm.trim() !== "") {
    const q = appState.searchTerm.toLowerCase();
    filtered = filtered.filter(l => 
      l.headline.toLowerCase().includes(q) ||
      l.summary.toLowerCase().includes(q) ||
      l.act.toLowerCase().includes(q) ||
      l.tags.some(t => t.toLowerCase().includes(q))
    );
  }
  
  container.innerHTML = `
    <div style="margin:28px 0 20px;">
      <h2 style="font-size:26px; font-weight:800; letter-spacing:-0.02em; margin-bottom:6px;">
        Toate Schimbările Recente din Lege
      </h2>
      <p style="color:var(--text-secondary); font-size:15px; margin-bottom:20px;">
        Monitorul Oficial tradus în impact financiar exact: ce s-a schimbat, ce pași să faci și ce soluție îți salvează cei mai mulți bani.
      </p>

      <!-- SEARCH & FILTER BAR -->
      <div class="search-filter-bar">
        <div class="search-input-wrap">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input 
            type="text" 
            class="search-input" 
            placeholder="Caută după cuvinte cheie: mașină, dividende, energie, absolvent, PFA, pensie..." 
            value="${appState.searchTerm}"
            oninput="handleSearch(this.value)"
          />
        </div>

        <div class="category-chips">
          <button class="cat-chip ${appState.activeCategoryFilter === 'all' ? 'active' : ''}" onclick="setCategoryFilter('all')">Toate (${LAWS.length})</button>
          <button class="cat-chip ${appState.activeCategoryFilter === 'munca' ? 'active' : ''}" onclick="setCategoryFilter('munca')">Muncă & Salarii</button>
          <button class="cat-chip ${appState.activeCategoryFilter === 'firme' ? 'active' : ''}" onclick="setCategoryFilter('firme')">Firme & SRL / PFA</button>
          <button class="cat-chip ${appState.activeCategoryFilter === 'auto' ? 'active' : ''}" onclick="setCategoryFilter('auto')">Auto & Mediu</button>
          <button class="cat-chip ${appState.activeCategoryFilter === 'utilitati' ? 'active' : ''}" onclick="setCategoryFilter('utilitati')">Energie & Gaz</button>
          <button class="cat-chip ${appState.activeCategoryFilter === 'pensii' ? 'active' : ''}" onclick="setCategoryFilter('pensii')">Pensii & Sănătate</button>
        </div>
      </div>

      <!-- CARDS FEED -->
      <div class="feed-container">
        ${filtered.length === 0 ? `
          <div style="background:#fff; border:1px dashed var(--line-color); padding:40px; text-align:center; border-radius:16px;">
            <p style="font-weight:700; font-size:16px;">Nu a fost găsit niciun act legislativ pentru căutarea introdusă.</p>
          </div>
        ` : filtered.map(law => renderLawCard(law, false)).join("")}
      </div>
    </div>
  `;
}

// -------------------------------------------------------------------------
// COMPONENTĂ: CARD DE LEGE (FORMAT IDENTIC CU CERINȚA USERULUI)
// -------------------------------------------------------------------------
function renderLawCard(law, isPersonalizedView) {
  const isMitigated = !!appState.activeMitigations[law.id];
  const isCost = law.direction === "cost";
  
  return `
    <article class="law-card" id="card-${law.id}">
      <div class="card-top-bar">
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="badge-pill badge-${law.status}">${law.status_label}</span>
          <span class="law-citation">${law.act}</span>
        </div>
        <a href="${law.link}" target="_blank" rel="noopener" style="font-size:12.5px; font-weight:700; color:var(--accent); text-decoration:none;">
          Text oficial în lege ↗
        </a>
      </div>

      <!-- HEADLINE PROEMINENT (WORDING EXACT CERUT) -->
      <h3 class="law-card-headline">${law.headline}</h3>

      <p class="law-summary-p">${law.summary}</p>

      <!-- IMPACT ROW -->
      <div class="impact-row ${isCost ? 'cost' : 'gain'}">
        <div class="impact-amount">${law.amount_label}</div>
        <div class="impact-explanation">
          ${isCost ? `Impact negativ lunar (${law.impact_unit})` : `Beneficiu financiar net (${law.impact_unit})`}
        </div>
      </div>

      <!-- SECȚIUNEA: CE POȚI FACE & CUM ATENUEZI PIERDEREA -->
      <div class="mitigation-box">
        <div class="mitigation-header">
          <div class="mitigation-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            ${isCost ? "Pași Concreți pentru a Atenua Pierderea" : "Pași Concreți pentru a încasa Banii"}
          </div>

          ${isPersonalizedView ? `
            <label class="toggle-switch-wrap" title="Activează simularea măsurii">
              <span class="switch-label">${isMitigated ? "Măsură Activată" : "Aplică Soluția"}</span>
              <input type="checkbox" class="switch-input" ${isMitigated ? 'checked' : ''} onchange="toggleMitigation('${law.id}')">
              <span class="switch-control"></span>
            </label>
          ` : ""}
        </div>

        <ul class="steps-list">
          ${law.steps.map((s, idx) => `
            <li class="step-item">
              <span class="step-number">${idx + 1}</span>
              <div>${s}</div>
            </li>
          `).join("")}
        </ul>

        <!-- SOLUȚIA CARE ÎȚI SALVEAZĂ CEI MAI MULȚI BANI -->
        <div class="best-solution-card">
          <div class="solution-info">
            <div class="solution-tag">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              Soluția / Furnizorul care îți salvează cei mai mulți bani:
            </div>
            <div class="solution-title">${law.best_solution}</div>
            <div class="solution-sub">${law.solution_desc}</div>
          </div>
          <a href="${law.solution_url}" target="_blank" rel="noopener" class="solution-action-btn">
            Accesează Soluția ↗
          </a>
        </div>
      </div>
    </article>
  `;
}

// =========================================================================
// HANDLERS INTERACTIVI
// =========================================================================

function switchTab(tabName) {
  appState.activeTab = tabName;
  renderApp();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function selectPersona(personaId) {
  appState.activePersona = personaId;
  appState.activeMitigations = {}; // reset simulări la schimbare de persoană
  renderApp();
}

function toggleMitigation(lawId) {
  appState.activeMitigations[lawId] = !appState.activeMitigations[lawId];
  renderApp();
}

function handleSearch(term) {
  appState.searchTerm = term;
  renderApp();
}

function setCategoryFilter(cat) {
  appState.activeCategoryFilter = cat;
  renderApp();
}

// Inițializare automată la încărcarea paginii
document.addEventListener("DOMContentLoaded", () => {
  renderApp();
});
