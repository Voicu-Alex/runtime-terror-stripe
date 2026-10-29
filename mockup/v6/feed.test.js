const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('opening a dividend guide shows a short solution and direct consultant sites',()=>{
  const p=page(), c=p.context;
  c.PREMIUM=true;c.V.open='dividend';c.render();
  const html=p.elements.get('list').innerHTML;
  assert.match(html,/Ce poți face acum/);
  assert.match(html,/★ Sponsorizat/);
  assert.ok(html.indexOf('Crowe România') < html.indexOf('BDO România'));
  assert.match(html,/Poți discuta, de exemplu, cu/);
  assert.match(html,/href="https:\/\/www\.crowe\.com\/ro\/services\/contabilitate"/);
  assert.match(html,/href="https:\/\/www\.bdo\.ro\/ro-ro\/servicii\/consultanta-fiscala"/);
  assert.doesNotMatch(html,/Echipa Contabilă|data-spec="dividend"/);
  c.V.open=null;c.render();
  assert.doesNotMatch(p.elements.get('list').innerHTML,/Poți discuta, de exemplu, cu/);
});

test('locked guides and unrelated laws do not expose the consultant solution',()=>{
  const p=page(),c=p.context;
  c.V.open='dividend';c.render();
  assert.doesNotMatch(p.elements.get('list').innerHTML,/crowe\.com|bdo\.ro/);
  c.PREMIUM=true;c.V.open='gaz';c.render();
  assert.doesNotMatch(p.elements.get('list').innerHTML,/crowe\.com|bdo\.ro/);
});

test('an unlocked micro-company law in news has the same short solution',()=>{
  const p=page(),c=p.context;
  c.PREMIUM=true;c.V.tab='nou';c.V.nopen='micro';c.render();
  assert.match(p.elements.get('nlist').innerHTML,/Ce poți face acum/);
  assert.match(p.elements.get('nlist').innerHTML,/crowe\.com/);
  c.PREMIUM=false;c.render();
  assert.doesNotMatch(p.elements.get('nlist').innerHTML,/crowe\.com/);
});

test('browser solution data matches the shared registry and proposals have no referral',()=>{
  const p=page(),c=p.context;
  const data=JSON.parse(fs.readFileSync(path.join(__dirname,'../../data/solutii.json'),'utf8'));
  assert.deepEqual(JSON.parse(JSON.stringify(c.SOLUTII_DATE)),data);
  assert.equal(c.solutieHtmlV6('dividend','proiect'),'');
  assert.equal(c.solutieHtmlV6('necunoscut','in_vigoare'),'');
  assert.match(c.solutieHtmlV6('dividend','in_vigoare'),/rel="noopener noreferrer" referrerpolicy="no-referrer"/);
});

test('energy, pensions and benefits show relevant routes and sponsorship labels',()=>{
  const p=page(),c=p.context;
  c.PREMIUM=true;c.V.open='gaz';c.render();
  const gas=p.elements.get('list').innerHTML;
  assert.match(gas,/https:\/\/posf.ro\/comparator/);
  assert.match(gas,/https:\/\/www.engie.ro\/gaze-naturale\//);
  assert.match(gas,/★ Sponsorizat/);
  assert.ok(gas.indexOf('https://posf.ro/comparator') < gas.indexOf('https://www.engie.ro/gaze-naturale/'));
  assert.doesNotMatch(c.solutieHtmlV6('gaz','in_vigoare'),/demo|simulat|crowe|bdo/i);
  assert.match(c.solutieHtmlV6('pilon2','adoptat'),/asfromania.ro/);
  assert.doesNotMatch(c.solutieHtmlV6('pilon2','adoptat'),/sponsored|Sponsorizat/);
  c.V.open='prima_stabilitate';c.render();
  assert.match(p.elements.get('list').innerHTML,/aria-label="Soluție și servicii"/);
  c.PREMIUM=false;c.render();
  assert.doesNotMatch(p.elements.get('list').innerHTML,/aria-label="Soluție și servicii"/);
});

test('news service links remain inside unlocked details for each added category',()=>{
  const p=page(),c=p.context;
  for(const [id,site] of [['rovinieta','https://pint.ro/rovinieta-online'],['sal_min','https://www.crowe.com/ro/services/salarizare'],['prima','https://www.anofm.ro/']]) {
    c.PREMIUM=true;c.V.tab='nou';c.V.nopen=id;c.render();
    assert.ok(p.elements.get('nlist').innerHTML.includes(site),id);
    c.PREMIUM=false;c.render();
    assert.doesNotMatch(p.elements.get('nlist').innerHTML,/aria-label="Soluție și servicii"/,id);
  }
  assert.doesNotMatch(c.solutieHtmlV6('imp_auto','in_vigoare'),/href="null"|Sponsorizat|pint.ro/);
});

function page() {
  const elements = new Map();
  const listeners = {};
  const storage = new Map();
  const document = {
    getElementById(id) {
      if (id === 'profile-details' || id === 'prima-details') return null;
      if (!elements.has(id)) elements.set(id, {innerHTML:'',hidden:false,value:'',open:false});
      return elements.get(id);
    },
    querySelectorAll() { return []; },
    addEventListener(type, fn) { listeners[type] = fn; }
  };
  const context = {document, location:{search:''}, URLSearchParams, console, Date,
    localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
    scrollTo(){}, scrollY:0, requestAnimationFrame:fn=>fn()};
  context.window = context;
  vm.createContext(context);
  for (const file of ['../v4/data.js','../v5/common.js','noutati.js','continut.js','solutii-date.js','solutii.js','freemium.js','prima.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8'),context,{filename:file});
  }
  const html = fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
  const inline = html.match(/<script>\s*([\s\S]*?)<\/script>\s*<\/body>/);
  assert.ok(inline,'page inline script exists');
  vm.runInContext(inline[1],context,{filename:'index.html'});
  return {context,elements,listeners,html};
}

test('the verified Prima is an unlockable feed row and legacy scenario rows have visible blur with readable sources',()=>{
  const p=page(), list=p.elements.get('list').innerHTML;
  assert.match(list,/id="r-prima_stabilitate"/);
  assert.doesNotMatch(p.html,/id="prima-candidate"/);
  assert.match(list,/class="[^\"]*masked-copy[^\"]*"[^>]*aria-hidden="true"[^>]*>Motorina e/);
  p.context.V.open='motorina';p.context.render();
  assert.match(p.elements.get('list').innerHTML,/Sursa consultată/);
  p.context.V.open='motorina_pr';p.context.render();
  assert.match(p.elements.get('list').innerHTML,/Sursă de presă/);
  assert.match(p.html,/\.masked-copy\s*\{[^}]*filter:\s*blur\(/);
  assert.match(list,/Acțiune: termen depășit/);
  const gas=list.match(/id="r-gaz"[\s\S]*?<\/button>/)?.[0];
  assert.match(gas,/<span class="st in_vigoare">în vigoare<\/span>/);
  assert.doesNotMatch(list,/Oportunitate · Locuință/);
  assert.match(p.elements.get('aside').innerHTML,/class="masked-copy"/);
});

test('profile tags change feed relevance without treating illustrative Andrei amounts as personal',()=>{
  const p=page(), c=p.context;
  const answers=Object.fromEntries(Array.from(c.FreemiumV6.categories,k=>[k,'not_applicable']));
  assert.equal(c.F.completeProfile(answers,true,['caut_primul_job']).ok,true);
  c.render();
  const list=p.elements.get('list').innerHTML;
  assert.match(list,/id="r-prima_stabilitate"/);
  assert.doesNotMatch(list,/id="r-it"/);
  assert.match(p.elements.get('bil').innerHTML,/exemplului Andrei/);
  assert.doesNotMatch(p.elements.get('bil').innerHTML,/−600/);
});

test('news relevance follows the confirmed profile while news itself stays public',()=>{
  const p=page(), c=p.context;
  const answers=Object.fromEntries(Array.from(c.FreemiumV6.categories,k=>[k,'not_applicable']));
  c.F.completeProfile(answers,true,['caut_primul_job']);
  assert.equal(c.mine({tags:['angajat_it']}),null);
  assert.equal(c.mine({tags:['caut_primul_job']}),'caut primul job');
  c.V.tab='nou';c.render();
  assert.match(p.elements.get('nlist').innerHTML,/class="nw"/);
});

test('profile and plan navigation are keyboard reachable and plan shows honest access state',()=>{
  const p=page(), c=p.context;
  assert.match(p.elements.get('nav').innerHTML,/href="#[^\"]+" data-tab="plan"/);
  assert.match(p.elements.get('nav').innerHTML,/href="#[^\"]+" data-profile/);
  c.V.tab='plan';c.render();
  assert.equal(p.elements.get('p-tine').hidden,false);
  assert.match(p.elements.get('list').innerHTML,/Nu ai deschis încă un ghid complet/);
});

test('guest can verify the in-feed guide and open it once, while the reward remains available for a later guide',()=>{
  const p=page(), c=p.context;
  c.V.open='prima_stabilitate';c.render();
  assert.doesNotMatch(p.elements.get('list').innerHTML,/Înainte să semnezi primul contract eligibil/);
  const facts=Object.fromEntries(Array.from(c.PRIMA.requiredAnswers,k=>[k,'yes']));
  c.CANDIDATE_DRAFT=facts;
  assert.equal(c.F.confirmEligibility(c.PRIMA,facts).eligible,true);
  c.render();
  assert.match(p.elements.get('list').innerHTML,/data-unlock="prima_stabilitate"/);
  assert.equal(c.F.unlock(c.PRIMA,new Date('2026-10-29T10:00:00Z'),facts).slot,'initial');
  c.render();
  assert.match(p.elements.get('list').innerHTML,/Înainte să semnezi primul contract eligibil/);
  assert.equal(c.F.unlock(c.PRIMA).alreadyUnlocked,true);
  assert.equal(c.F.credits(),0);
  const answers=Object.fromEntries(Array.from(c.FreemiumV6.categories,k=>[k,'prefer_not_to_say']));
  c.F.completeProfile(answers,true,['caut_primul_job']);
  c.F.claimProfileReward('Cont demo');
  c.render();
  assert.match(p.elements.get('freemium').innerHTML,/Următorul ghid complet e din partea noastră/);
  assert.match(p.elements.get('list').innerHTML,/Înainte să semnezi primul contract eligibil/);
  assert.equal(c.F.credits(),1);
});
