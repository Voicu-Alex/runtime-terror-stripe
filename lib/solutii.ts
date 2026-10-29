import date from '@/data/solutii.json';

export function solutieScurta(id: string, status: string) {
  if (status === 'proiect' || !Object.hasOwn(date.legi, id)) return null;
  const solutie = date.legi[id as keyof typeof date.legi];
  return {
    text: solutie.text,
    consultanti: solutie.consultanti
      .filter((key): key is keyof typeof date.consultanti => Object.hasOwn(date.consultanti, key))
      .map(key => date.consultanti[key])
      .sort((a, b) => Number(b.sponsorizat) - Number(a.sponsorizat) || a.nume.localeCompare(b.nume, 'ro')),
  };
}
