import { PrevizualizareNotificari } from '@/components/PrevizualizareNotificari';
import { CATALOG } from '@/lib/catalog';
import { persoanaDemo, idPersoana } from '@/lib/persoane-demo';
import { potriveste } from '@/lib/potrivire';

export const metadata = { title: 'Previzualizare notificări · Buzunar' };

export default async function PaginaNotificare({ searchParams }: { searchParams: Promise<{ p?: string; data?: string }> }) {
  const params = await searchParams;
  const id = idPersoana(params.p);
  const candidat = params.data ?? '';
  const dataValida = /^\d{4}-\d{2}-\d{2}$/.test(candidat) && Number.isFinite(Date.parse(candidat))
    && new Date(candidat).toISOString().slice(0, 10) === candidat;
  const azi = dataValida ? candidat : '2026-10-28';
  return <PrevizualizareNotificari id={id} azi={azi} potriviri={potriveste(persoanaDemo(id).profil, CATALOG, azi)} />;
}
