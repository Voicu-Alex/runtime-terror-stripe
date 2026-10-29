/* Comun pentru variantele v5. Datele vin din ../v4/data.js (copiate din v3, persona Andrei).
   Data demo e 28 oct 2026, ca în F, ca să se poată compara direct. */
window.TODAY = '2026-10-28';

var FAM = { motorina: 'Altele', cei_d: 'Venit', pilon3: 'Venit', pilon2: 'Altele', gaz: 'Locuință', it: 'Domeniul meu', dividend: 'Venit', tva: 'Venit', curent: 'Locuință' };
var FAMS = ['Venit', 'Domeniul meu', 'Locuință', 'Altele'];
var S = { f: 'all', open: null, sim: {} };

var IC = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  news: '<path d="M5 6h14M5 12h14M5 18h9"/>',
  chart: '<path d="M4 19h16"/><path d="m5 15 4-4 4 3 6-7"/>',
  doc: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>'
};
function ic(n) { return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + IC[n] + '</svg>'; }

function shell() {
  document.getElementById('hdr').innerHTML =
    '<div class="srch">' + '<span>Caută în actele care te privesc</span><i>' + ic('search') + '</i></div>' +
    '<button class="menu" aria-label="Meniu">' + ic('menu') + '</button>' +
    '<div class="brand"><b>Ce înseamnă pentru mine</b><small>LEGEA, PE BANII TĂI</small></div>' +
    '<div class="hr"><span class="demo">demo · azi 28 oct 2026</span><span class="av" aria-label="Profil">' + ic('user') + '</span></div>';
  document.getElementById('nav').innerHTML = '<a class="on" href="#">NOUTĂȚI</a><a href="#">PLANUL MEU</a><a href="#">PROFILUL MEU</a>';
  document.getElementById('bnav').innerHTML = '<a class="on" href="#">' + ic('news') + 'Noutăți</a><a href="#">' + ic('chart') + 'Planul meu</a><a href="#">' + ic('user') + 'Profil</a>';
}

function wd(s) { var x = U.d(s); return U.DAYS[x.getDay()] + ', ' + x.getDate() + ' ' + U.MONTHS[x.getMonth()]; }
function openDl(i) { return i.deadline && U.days(i.deadline) >= 0; }
function left(n) { return n === 0 ? 'azi e ultima zi' : n === 1 ? 'mai ai o zi' : 'mai ai ' + n + ' zile'; }
function visible() { return ITEMS.filter(function (i) { return S.f === 'all' || FAM[i.id] === S.f; }); }
function totalNow() { return ITEMS.filter(U.inForce).reduce(function (s, i) { return s + i.impact; }, 0); }
function gainAll() { return ITEMS.filter(function (i) { return i.status !== 'termen_depasit'; }).reduce(function (s, i) { return s + i.gain; }, 0); }
function simGain() { return ITEMS.reduce(function (s, i) { return s + (S.sim[i.id] ? i.gain : 0); }, 0); }
function lei0(n) { return U.num(n); }

/* suma afișată pe rând: efectul legii, sau ce aduce acțiunea când efectul e 0 */
function amount(i) {
  var past = i.status === 'termen_depasit';
  if (i.impact) return '<b class="' + (past ? '' : U.cls(i.impact)) + '">' + (i.impact > 0 ? '+' : '−') + U.num(i.impact) + '</b><small>lei/lună</small>';
  if (i.gain) return '<b class="pos">+' + U.num(i.gain) + '</b><small>lei/lună dacă vrei</small>';
  return '<b class="zero">0</b><small>lei/lună</small>';
}
function meta(i) {
  var s = '';
  if (openDl(i)) { var n = U.days(i.deadline); s += '<span class="dl' + (n < 30 ? ' urg' : '') + '">' + left(n) + ' · până ' + wd(i.deadline) + '</span>'; }
  else if (!U.inForce(i)) s += '<span class="dl">din ' + U.date(i.effective) + '</span>';
  s += '<span class="st ' + i.status + '">' + STATUS[i.status] + '</span><span>' + i.act + '</span>';
  if (i.isNew) s += '<span>nou în Monitorul Oficial</span>';
  return s;
}
function detail(i) {
  var past = i.status === 'termen_depasit', s = '<div class="det" id="d-' + i.id + '">';
  s += '<p>' + U.esc(i.why) + '</p>';
  if (i.est) s += '<p class="est">Suma e calculul nostru pe profilul tău, nu o cifră scrisă în lege. ' + U.esc(i.note) + '</p>';
  if (i.action) {
    s += '<div class="act' + (openDl(i) && U.days(i.deadline) < 30 ? ' urg' : '') + '"><b>Ce poți face</b>' + U.esc(i.action) + '.';
    s += '<div class="row"><span>' + (i.deadline ? (past ? 'Termenul a trecut pe ' + U.date(i.deadline) + '. Ai fi economisit ' + U.lei(i.gain) + '.' : 'Până ' + wd(i.deadline) + ' ' + U.d(i.deadline).getFullYear()) : 'Fără termen') + '</span>';
    if (i.gain && !past) s += '<button class="sim" data-sim="' + i.id + '" aria-pressed="' + !!S.sim[i.id] + '"><i></i>Simulează: +' + U.num(i.gain) + ' lei/lună</button>';
    s += '</div></div>';
  }
  s += '<div class="tags">' + i.tags.map(function (t) { return '<span class="tag">te privește ca ' + t + '</span>'; }).join('') + '</div>';
  s += '<div class="src">' + ic('doc') + '<span><a href="' + i.link + '" target="_blank" rel="noopener">' + i.act + '</a>, ' + i.mo + ', ' + U.esc(i.art) + '. Verificat la 28 oct 2026.</span></div>';
  return s + '</div>';
}
function row(i, max) {
  var o = S.open === i.id, past = i.status === 'termen_depasit';
  var s = '<div class="it' + (past ? ' past' : '') + '"><button class="rh" data-open="' + i.id + '" aria-expanded="' + o + '" aria-controls="d-' + i.id + '">';
  s += '<span class="tt">' + U.esc(i.title) + '</span><span class="amt">' + amount(i) + '</span><span class="mt">' + meta(i) + '</span>';
  if (max) { var v = Math.abs(i.impact || i.gain); s += '<span class="bar"><i style="width:' + Math.max(2, v / max * 100) + '%;background:' + (i.impact < 0 && !past ? 'var(--neg)' : past ? 'var(--past)' : 'var(--pos)') + '"></i></span>'; }
  s += '</button>' + (o ? detail(i) : '') + '</div>';
  return s;
}
function filters() {
  var b = function (f, label, n) { return '<button class="fbtn' + (S.f === f ? ' on' : '') + '" data-f="' + f + '">' + label + ' <em>' + n + '</em></button>'; };
  var s = b('all', 'Toate', ITEMS.length);
  FAMS.forEach(function (f) { s += b(f, f, ITEMS.filter(function (i) { return FAM[i.id] === f; }).length); });
  return s;
}
function aside() {
  var ev = ITEMS.filter(function (i) { return i.status !== 'proiect' && (openDl(i) || !U.inForce(i)); }).map(function (i) { return { i: i, d: openDl(i) ? i.deadline : i.effective, t: openDl(i) }; });
  ev.sort(function (a, b) { return a.d < b.d ? -1 : 1; });
  return '<h3>Termene și ce urmează</h3><p class="note">Calculate față de azi.</p>' + ev.map(function (e) {
    var x = U.d(e.d), n = U.days(e.d);
    return '<button class="dt" data-open="' + e.i.id + '"><span class="d' + (e.t && n < 30 ? ' urg' : '') + '"><b>' + x.getDate() + '</b><small>' + U.MONTHS[x.getMonth()] + ' ' + x.getFullYear() + '</small></span><span class="w">' + U.esc(e.t ? e.i.action : 'Se aplică: ' + e.i.title) + '<span>' + left(n) + (e.i.gain ? ' · <b class="pos">+' + U.num(e.i.gain) + ' lei/lună</b>' : '') + '</span></span></button>';
  }).join('');
}
function bind(render) {
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-open],[data-sim],[data-f]'); if (!t) return;
    if (t.dataset.sim) { S.sim[t.dataset.sim] = !S.sim[t.dataset.sim]; render(); return; }
    if (t.dataset.f) { S.f = t.dataset.f; render(); return; }
    var id = t.dataset.open; S.open = S.open === id ? null : id; render();
    if (S.open && t.classList.contains('dt')) { var el = document.querySelector('[data-open="' + id + '"].rh'); if (el) el.scrollIntoView({ block: 'center' }); }
  });
  var q = new URLSearchParams(location.search); if (q.get('open')) S.open = q.get('open');
}
