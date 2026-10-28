import { T } from "@/components/Limba";
import { Notificare } from "@/components/Notificare";
import { NotificareMea } from "@/components/NotificareMea";
import { CATALOG } from "@/lib/catalog";
import { PERSOANE_DEMO, persoanaDemo } from "@/lib/persoane-demo";
import { alegeNotificarea } from "@/lib/plan";
import { potriveste } from "@/lib/potrivire";

const AZI_DEMO = "2026-10-28";

export const metadata = { title: "Notificare · Ce înseamnă pentru mine" };

/** Primul ecran: un singur act, cele 5 elemente. Profilul real pe dispozitiv; ?p= pentru persoanele demo. */
export default async function PaginaNotificare({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { p } = await searchParams;
  const demo = p && p in PERSOANE_DEMO ? persoanaDemo(p) : null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="m-0 font-head text-[clamp(26px,6.6vw,34px)] leading-[1.16] font-extrabold tracking-[-.015em] text-v3-ink">
        <T k="Ce înseamnă pentru tine azi" />
      </h1>
      {demo ? <NotificareDemo id={p!} /> : <NotificareMea />}
    </div>
  );
}

function NotificareDemo({ id }: { id: string }) {
  const persoana = persoanaDemo(id);
  const potriviri = potriveste(persoana.profil, CATALOG, AZI_DEMO);
  const aleasa = alegeNotificarea(potriviri, persoana.profil.valori);
  return (
    <>
      <p className="mt-1 mb-4 text-sm text-v3-ink-2">
        <T k="Profil demo:" /> <b className="text-v3-ink">{persoana.nume}</b> · {potriviri.length}{" "}
        <T k="acte; ăsta e cel cu termenul cel mai aproape sau cu suma cea mai mare." />
      </p>
      {aleasa ? (
        <Notificare p={aleasa} valori={persoana.profil.valori} baza={`/flux?p=${id}`} />
      ) : (
        <p>
          <T k="Nimic de arătat." />
        </p>
      )}
    </>
  );
}
