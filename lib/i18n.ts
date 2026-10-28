// Interfața în română (implicit) sau engleză. Se traduce doar interfața și titlurile actelor
// (`rezumat_en`, scrise de noi). Textele verificate pe lege (zero/curios/expert, acțiuni) rămân în română.
import type { CampValoare } from "./profil";
import { FAMILII, TAGURI, type Familie, type TagId } from "./taguri";

export type Limba = "ro" | "en";

export const LIMBI: Limba[] = ["ro", "en"];
const CHEIE = "cipm.limba.v1";

export function esteLimba(x: unknown): x is Limba {
  return x === "ro" || x === "en";
}

export function incarcaLimba(): Limba {
  if (typeof window === "undefined") return "ro";
  try {
    const l = window.localStorage.getItem(CHEIE);
    return esteLimba(l) ? l : "ro";
  } catch {
    return "ro";
  }
}

export function salveazaLimba(l: Limba): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHEIE, l);
  } catch {
    // storage blocat
  }
}

/** Cheia e textul românesc. Ce lipsește aici rămâne în română (nu inventăm traduceri la runtime). */
const EN: Record<string, string> = {
  // meniu, subsol
  Flux: "Feed",
  Profil: "Profile",
  "Analiză generată cu AI, verifică etichetele. Informare, nu consultanță financiară sau juridică. Profilul rămâne pe dispozitivul tău.":
    "AI-generated analysis, check the tags. Information, not financial or legal advice. Your profile stays on your device.",
  "Textele legilor sunt în română.": "Legal texts are in Romanian.",

  // acasă
  "Fiecare lege nouă, tradusă în lei pe lună pentru tine.": "Every new law, translated into lei per month for you.",
  "Încarcă un document și profilul se completează singur": "Upload a document and your profile fills itself in",
  "Contract de muncă, fluturaș, cupon de pensie, factură. Claude citește documentul, etichetele și cifrele intră în profil, tu scoți ce nu e cazul. Apoi vezi fluxul tău: fiecare act care te privește, în lei pe lună.":
    "Employment contract, payslip, pension slip, utility bill. Claude reads the document, the tags and figures go into your profile, you remove what does not apply. Then you see your feed: every act that affects you, in lei per month.",
  "Completează profilul": "Fill in your profile",
  "Fluxul meu": "My feed",
  "Exemple fictive:": "Fictional examples:",

  // flux
  "Profil demo:": "Demo profile:",
  "acte care te privesc": "acts that affect you",
  "profilul meu": "my profile",
  "Profilul tău:": "Your profile:",
  modifică: "edit",
  "Se încarcă profilul de pe dispozitiv…": "Loading your profile from this device…",
  "Profilul tău e gol": "Your profile is empty",
  "Încarcă un contract, un fluturaș sau o factură și profilul se completează singur. Rămâne pe dispozitivul tău.":
    "Upload a contract, a payslip or a bill and your profile fills itself in. It stays on your device.",
  "Sau vezi un exemplu:": "Or see an example:",
  "Toate actele care te privesc": "All the acts that affect you",
  "după impact": "by impact",
  "cele mai noi": "newest first",
  "Niciun act din catalog nu se potrivește cu etichetele tale deocamdată.": "No act in the catalogue matches your tags yet.",
  "Planul meu": "My plan",
  "Acum:": "Now:",
  "Cu ce ai bifat:": "With what you ticked:",
  păstrezi: "you keep",
  "lei/an": "lei/year",
  "Sumele din acțiuni se adună aici.": "Savings from actions add up here.",
  "Bifează „O fac” la actele cu economie și vezi cât păstrezi.": "Tick “I’ll do it” on the acts with savings and see how much you keep.",

  // card
  "de calculat": "to be calculated",
  Detalii: "Details",
  Închide: "Close",
  "lei/lună acum": "lei/month now",
  "lei/lună": "lei/month",
  "termen depășit:": "deadline passed:",
  "până la": "by",
  "mai ai": "you have",
  urgent: "urgent",
  "la zi:": "up to date:",
  proiect: "draft",
  adoptat: "adopted",
  "în vigoare": "in force",
  "termen depășit": "deadline passed",
  "Pentru tine:": "For you:",
  "Suma e calculul nostru pe profilul tău, nu o cifră scrisă în lege.": "The amount is our calculation on your profile, not a figure written in the law.",
  "Ca să calculăm suma:": "To calculate the amount:",
  "spune-ne pensia ta": "tell us your pension",
  "spune-ne dividendele tale": "tell us your dividends",
  "spune-ne cât cheltui pe lună": "tell us how much you spend per month",
  "spune-ne salariul brut": "tell us your gross salary",
  "spune-ne salariul net": "tell us your net salary",
  "Te privește ca:": "Applies to you as:",
  "Termen depășit:": "Deadline passed:",
  "Ce poți face până la": "What you can do by",
  "Ce poți face, oricând:": "What you can do, any time:",
  "Ce verifici": "What to check",
  aplică: "applied by",
  angajatorul: "your employer",
  furnizorul: "your supplier",
  statul: "the state",
  "Nu trebuie să faci nimic până la": "Nothing to do until",
  "Unde:": "Where:",
  "lei/lună brut": "lei/month gross",
  "Ca să vezi suma,": "To see the amount,",
  Calculează: "Calculate",
  "Rămâne doar pe acest dispozitiv.": "It stays on this device only.",
  "spune-ne impozitul pe clădire de pe decizia de impunere": "tell us the building tax on your tax notice",
  "Ce poți face": "What you can do",
  "Dacă o faci, păstrezi până la": "If you do it, you keep up to",
  "În planul meu": "In my plan",
  "O fac, pune-o în planul meu": "I’ll do it, add it to my plan",
  "Compară oferte pe comparatorul ANRE": "Compare offers on the ANRE comparator",
  "Compară oferte": "Compare offers",
  "(se deschide într-un tab nou)": "(opens in a new tab)",
  "Sau direct la un furnizor. În ordine alfabetică": "Or straight to a supplier. In alphabetical order",
  "; nu primim nimic de la ei.": "; we receive nothing from them.",
  "; cei marcați „partener” ne plătesc un comision.": "; those marked “partner” pay us a commission.",
  partener: "partner",
  "Situația ta e mai complicată?": "Is your situation more complicated?",
  "Găsește un": "Find an",
  "De ce?": "Why?",
  "Arată-mi legea": "Show me the law",
  "Sursa legală": "Legal source",
  "Forma la zi": "Current version",
  "Textul de mai sus ține cont de actele care l-au modificat ulterior. Când apare altul, intrarea se reverifică.":
    "The text above takes into account the acts that later amended it. When another one appears, the entry is re-checked.",
  "sursa: de găsit (TODO)": "source: to be found (TODO)",
  "Textul modificării": "Text of the amendment",
  "Textul legii pe Portal Legislativ": "Text of the law on the Legislative Portal",
  "Textul actului": "Text of the act",
  // antet și blocurile revistei (mockup/v3?v=f)
  "Legea, pe banii tăi": "The law, in your money",
  Secțiuni: "Sections",
  "Următorul lucru care contează": "The next thing that matters",
  "Nimic nou care să te privească": "Nothing new that affects you",
  "Ce poți face:": "What you can do:",
  peste: "in",
  "se aplică de la": "applies from",
  "Se aplică:": "Applies:",
  "Vezi ce înseamnă și sursa": "See what it means and the source",
  "pentru tine, în cifre": "for you, in numbers",
  "pe an, dacă le faci pe toate": "per year, if you do them all",
  "termene deschise": "open deadlines",
  "acțiuni pe care legea le permite": "actions the law allows",
  "Termene · ce urmează": "Deadlines · what is next",
  Termene: "Deadlines",
  "Calculate față de azi, din datele din lege.": "Counted from today, using the dates in the law.",
  "Niciun termen deschis.": "No open deadlines.",
  "Temă închisă": "Dark theme",
  "Treci la tema deschisă": "Switch to the light theme",
  "Treci la tema închisă": "Switch to the dark theme",
  // pagina generală /legi
  "Toate legile": "All laws",
  "Toate schimbările din lege": "Every change in the law",
  "Cât poți salva din legile noi, de la cea mai mare sumă în jos": "How much you can save from the new laws, biggest amount first",
  "Pagina nu e personalizată. Fiecare articol spune pentru cine e și calculează pe un caz de referință, scris sub sumă: e calculul nostru, nu o cifră din lege. Pentru sumele tale, vezi":
    "This page is not personalised. Each article says who it is for and uses a reference case, written under the amount: it is our calculation, not a figure from the law. For your own amounts, see",
  "schimbări în vigoare sau adoptate": "changes in force or adopted",
  "cu bani pe care îi poți salva": "with money you can save",
  "cu termen încă deschis": "with a deadline still open",
  "Poți salva": "You can save",
  "Pierzi dacă nu faci nimic": "You lose if you do nothing",
  "Depinde de situația ta; nu avem o sumă cu sursă.": "Depends on your situation; we have no sourced amount.",
  "Nu avem o sumă cu sursă.": "We have no sourced amount.",
  "Cum reduci pierderea, pas cu pas": "How to cut the loss, step by step",
  "Ce mai poți face": "What you can still do",
  "Cum iei banii, pas cu pas": "How to get the money, step by step",
  "Ce poți face, pas cu pas": "What you can do, step by step",
  "Unde o faci cu cei mai puțini bani": "Where to do it for the least money",
  Deschide: "Open",
  "Termenul a trecut · bine de știut pentru data viitoare": "Deadline passed · good to know next time",
  "Soluțiile sunt instrumente oficiale sau gratuite; pe pagina asta nu primim bani de la nicio firmă.":
    "The solutions are official or free tools; we take no money from any company on this page.",
  "Act legat, pe Portal Legislativ": "Related act, on the Legislative Portal",
  "Comunicat ANRE": "ANRE press release",
  "Comparatorul ANRE": "ANRE comparator",
  "Explicație (ANAF / presă)": "Explanation (ANAF / press)",
  "verificat la": "verified on",
  "neverificat încă": "not verified yet",
  "· sursă de încredere scăzută": "· low-confidence source",
  "Rezumat generat cu AI": "AI-generated summary",
  "Când merită un": "When it is worth seeing an",
  "Pașii de mai sus ajung pentru cei mai mulți oameni. Un": "The steps above are enough for most people. An",
  "te ajută când răspunsul depinde de cifrele tale și suma e mare.": "helps when the answer depends on your figures and the amount is large.",
  "Ce să întrebi": "What to ask",
  Copiat: "Copied",
  "Copiază întrebarea": "Copy the question",
  "Ce să ai pregătit": "What to have ready",
  "Te trimitem la registrul public al profesiei. Nu primim bani de la specialiști și nu trimitem nimic din profilul tău.":
    "We send you to the profession’s public register. We take no money from specialists and send nothing from your profile.",
  "Deschide registrul": "Open the register",
  "Mă descurc singur": "I can manage on my own",
  contabil: "accountant",
  "consultant fiscal": "tax advisor",
  notar: "notary",
  "o zi": "one day",
  zile: "days",
  "de zile": "days",

  // profil
  "Profilul meu": "My profile",
  "Încarcă documentele pe care le ai deja și profilul se completează singur: etichete și câteva cifre, nimic altceva. Rămâne pe dispozitivul tău.":
    "Upload the documents you already have and your profile fills itself in: tags and a few figures, nothing else. It stays on your device.",
  "Claude citește": "Claude is reading",
  "Mai adaugă un document": "Add another document",
  "Contract de muncă, fluturaș de salariu, cupon de pensie, factură de curent sau gaz, contract de chirie, hotărâre de dividende. PDF, JPG sau PNG, maximum 10 MB. Poți alege mai multe deodată.":
    "Employment contract, payslip, pension slip, electricity or gas bill, rental contract, dividend resolution. PDF, JPG or PNG, up to 10 MB. You can pick several at once.",
  "Documentul e trimis o dată pentru citire și nu îl păstrăm. Acoperă CNP-ul și IBAN-ul înainte, nu avem nevoie de ele.":
    "The document is sent once for reading and we do not keep it. Cover your personal ID number and IBAN first; we do not need them.",
  "acceptăm doar PDF, JPG sau PNG.": "we only accept PDF, JPG or PNG.",
  "peste 10 MB.": "over 10 MB.",
  "eroare la analiză": "analysis error",
  "Am citit": "We read",
  "contract de muncă": "employment contract",
  "factură de utilități": "utility bill",
  "fluturaș de salariu": "payslip",
  document: "document",
  documentul: "the document",
  "generat cu AI": "AI-generated",
  "mod demo": "demo mode",
  "În profil au intrat:": "Added to your profile:",
  "Nimic nou față de ce aveai.": "Nothing new compared with what you had.",
  "Nesigur, bifezi tu dacă e cazul:": "Uncertain, tick it yourself if it applies:",
  "Profilul tău": "Your profile",
  "Gol deocamdată. Încarcă un document sau bifează manual mai jos.": "Empty for now. Upload a document or tick manually below.",
  Scoate: "Remove",
  "Adaugă o cifră pe care documentele nu o au:": "Add a figure the documents do not have:",
  "alege…": "choose…",
  "Ascunde bifatul manual": "Hide manual ticking",
  "Nu ai documentul la îndemână? Bifează manual": "Don’t have the document handy? Tick manually",
  etichete: "tags",
  "acte te privesc": "acts affect you",
  "salvat pe dispozitiv": "saved on this device",
  "Vezi fluxul tău →": "See your feed →",
  "Șterge profilul": "Delete profile",
  lei: "lei",
  ani: "years",

  // Pro (abonamentul)
  "Ce înseamnă pentru mine": "Ce înseamnă pentru mine",
  "Upgrade la": "Upgrade to",
  "Upgrade la Pro": "Upgrade to Pro",
  "legi te privesc. Vezi cât te costă fiecare.": "laws affect you. See what each one costs you.",
  "Cu Pro vezi suma pe profilul tău, termenele, ce poți face și Planul meu.":
    "With Pro you see the amount for your profile, the deadlines, what you can do and My plan.",
  "Anulezi oricând.": "Cancel anytime.",
  "Te conectezi cu Google, apoi plătești prin Stripe. Anulezi oricând.": "Sign in with Google, then pay through Stripe. Cancel anytime.",
  "Pro e deschis pentru demo.": "Pro is open for the demo.",
  "Vezi abonamentul": "See the subscription",
  "Vezi cât te costă fiecare lege": "See what each law costs you",
  "Cât te costă sau îți aduce fiecare lege, în lei pe lună, pe profilul tău": "What each law costs or brings you, in lei per month, for your profile",
  "Cât păstrezi pe an dacă faci ce permite legea": "How much you keep per year if you do what the law allows",
  "Planul meu: bifezi ce faci și vezi totalul": "My plan: tick what you do and see the total",
  "Abonamentul te urmează pe orice telefon, cu contul Google": "Your subscription follows you on any phone, with your Google account",
  "Se verifică contul…": "Checking your account…",
  "Pasul 1 din 2: conectează-te": "Step 1 of 2: sign in",
  "Continuă cu Google": "Continue with Google",
  "Folosim doar emailul, ca abonamentul să te urmeze pe orice telefon. Profilul rămâne pe dispozitivul tău.":
    "We only use your email, so the subscription follows you on any phone. Your profile stays on your device.",
  "Ai Pro.": "You have Pro.",
  "Se oprește pe": "Ends on",
  "Se reînnoiește pe": "Renews on",
  "Gestionează sau anulează": "Manage or cancel",
  "Pasul 2 din 2: plata": "Step 2 of 2: payment",
  "Te ducem la plată…": "Taking you to payment…",
  "Plata se face pe pagina Stripe; noi nu vedem datele cardului. Anulezi oricând, Pro rămâne activ până la finalul lunii plătite.":
    "You pay on the Stripe page; we never see your card details. Cancel anytime, Pro stays active until the end of the paid month.",
  "Conectat ca": "Signed in as",
  "Deconectează-te": "Sign out",
  "Verificăm plata la Stripe…": "Checking the payment with Stripe…",
  "Plata a reușit": "Payment successful",
  "Gata: ai Pro.": "Done: you have Pro.",
  "Fluxul tău arată acum cât te costă fiecare lege și Planul meu.": "Your feed now shows what each law costs you, and My plan.",
  "Nu am putut confirma plata": "We could not confirm the payment",
  "Dacă ai plătit, confirmarea poate dura câteva minute. Reîncarcă pagina; dacă tot nu merge, încearcă din nou de pe pagina Pro.":
    "If you paid, confirmation can take a few minutes. Reload the page; if it still does not work, try again from the Pro page.",
  "Înapoi la Pro": "Back to Pro",
};

/** Are textul intrare în dicționarul EN (chiar dacă traducerea e identică, ca un nume propriu). */
export function areTraducere(text: string): boolean {
  return Object.hasOwn(EN, text);
}

export function traduce(limba: Limba, text: string): string {
  return limba === "en" ? (EN[text] ?? text) : text;
}

const FAMILIE_EN: Record<Familie, string> = {
  venit: "How I earn",
  detin: "What I own",
  familie: "Who depends on me",
  conduc: "What I run",
  locuinta: "Where I live",
  domeniu: "My field",
  statut: "My situation",
};

const TAG_EN: Record<TagId, string> = {
  angajat: "salary",
  bugetar: "public sector salary",
  pfa: "sole trader (PFA)",
  pfa_norma: "sole trader on income norm",
  srl_dividende: "SRL dividends",
  pensionar: "pension",
  masina: "car",
  pilon2: "Pillar II",
  pilon3: "Pillar III",
  parinte: "children",
  parinte_singur: "raising children alone",
  intretin_parinti: "supporting my parents",
  intretin_sot: "supporting my spouse",
  intretin_handicap: "dependant with a disability",
  micro: "SRL micro-company",
  chirias: "renting",
  proprietar: "homeowner",
  ipoteca: "mortgage",
  cumpar_locuinta: "planning to buy a home",
  consumator_gaz: "gas heating",
  consumator_energie: "electricity bill in my name",
  rural: "in a village (rural)",
  it: "IT",
  constructii: "construction",
  horeca: "HoReCa",
  transport: "transport",
  sanatate: "healthcare",
  agricultura: "agriculture",
  elev_student: "pupil or student",
  somer: "unemployed",
  caut_primul_job: "looking for my first job",
  persoana_handicap: "person with a disability",
  concediu_crestere: "on parental leave",
  salariu_minim: "on minimum wage",
};

const CAMP_EN: Record<CampValoare, string> = {
  salariu_net: "net salary per month",
  salariu_brut: "gross salary per month",
  pensie_lunara: "pension per month",
  dividende_anuale: "dividends per year",
  cheltuieli_lunare: "spending per month",
  venit_net_pe_membru: "net income per family member",
  an_nastere: "year of birth",
  nr_copii: "number of children",
  varsta_copil_mic: "age of the youngest child",
  persoane_intretinere: "dependants",
  impozit_cladiri_anual: "building tax per year",
};

export function etichetaTagL(limba: Limba, tag: TagId): string {
  return limba === "en" ? TAG_EN[tag] : TAGURI[tag].eticheta;
}

export function familieL(limba: Limba, f: Familie): string {
  return limba === "en" ? FAMILIE_EN[f] : FAMILII[f];
}

export function campL(limba: Limba, c: CampValoare, etichetaRo: string): string {
  return limba === "en" ? CAMP_EN[c] : etichetaRo;
}

const LUNI_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LUNI_RO = ["ian", "feb", "mar", "apr", "mai", "iun", "iul", "aug", "sep", "oct", "noi", "dec"];

export function lunaScurta(limba: Limba, index0: number): string {
  return (limba === "en" ? LUNI_EN : LUNI_RO)[index0];
}
