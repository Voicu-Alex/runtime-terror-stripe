// Datele se editează în data/solutii.json; v6 și React folosesc aceeași listă.
import { readFileSync, writeFileSync } from 'node:fs';
const date = JSON.parse(readFileSync(new URL('../data/solutii.json', import.meta.url), 'utf8'));
writeFileSync(new URL('../mockup/v6/solutii-date.js', import.meta.url),
  '/* Generat din data/solutii.json; nu edita de mână. */\nwindow.SOLUTII_DATE = ' + JSON.stringify(date, null, 2) + ';\n');
