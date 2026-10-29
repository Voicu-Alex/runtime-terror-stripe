/* Soluția apare în legea deschisă. Date comune cu aplicația React. */
function solutieV6(key, status) {
  if (status === 'proiect') return null;
  var id = SOLUTII_DATE.aliasuri_v6[key] || key;
  return Object.hasOwn(SOLUTII_DATE.legi, id) ? SOLUTII_DATE.legi[id] : null;
}
function solutieHtmlV6(key, status) {
  var solutie = solutieV6(key, status);
  if (!solutie) return '';
  var consultanti = solutie.consultanti.filter(function(id){return Object.hasOwn(SOLUTII_DATE.consultanti,id);})
    .map(function(id){return SOLUTII_DATE.consultanti[id];})
    .sort(function(a,b){return Number(b.sponsorizat)-Number(a.sponsorizat)||a.nume.localeCompare(b.nume,'ro');});
  return '<section class="solutie-scurta" aria-label="Soluție și consultanți"><h4>Ce poți face acum</h4><p>'+U.esc(solutie.text)+'</p><p>Poți discuta, de exemplu, cu:</p><ul>'+consultanti.map(function(c){
    return '<li><a href="'+U.esc(c.url)+'" target="_blank" rel="noopener noreferrer'+(c.sponsorizat?' sponsored':'')+'" referrerpolicy="no-referrer">'+(c.sponsorizat?'<span>★ Sponsorizat</span> ':'')+'<strong>'+U.esc(c.nume)+'</strong> · '+U.esc(c.serviciu)+' ↗<span class="sr-only"> (se deschide într-un tab nou)</span></a></li>';
  }).join('')+'</ul><small>Linkuri către site-urile lor. Confirmă serviciul și onorariul direct cu ei. Poți apela și la consultantul tău.</small></section>';
}
