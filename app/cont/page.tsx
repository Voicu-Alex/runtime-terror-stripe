import { Conectare } from "@/components/Conectare";
import { T } from "@/components/Limba";

export const metadata = { title: "Contul tău · Ce înseamnă pentru mine" };

/** Pagina de conectare (și ținta lui Auth.js pentru „signIn”). ?dupa= spune unde te întorci după. */
export default async function PaginaCont({ searchParams }: { searchParams: Promise<{ dupa?: string; callbackUrl?: string }> }) {
  const { dupa, callbackUrl } = await searchParams;
  // Doar căi din aplicație, ca linkul să nu poată trimite pe alt site după conectare.
  const inapoi = [dupa, callbackUrl].find((x) => x?.startsWith("/") && !x.startsWith("//")) ?? "/flux";
  return (
    <div className="mx-auto max-w-[460px]">
      <h1 className="m-0 font-head text-[clamp(28px,6.6vw,36px)] leading-[1.12] font-extrabold tracking-[-.015em] text-v3-ink">
        <T k="Conectează-te" />
      </h1>
      <p className="m-0 mt-2 mb-6 text-[15px] text-v3-ink-2">
        <T k="Contul ține abonamentul Pro, ca să te urmeze pe orice telefon. Profilul rămâne pe dispozitivul tău." />
      </p>
      <Conectare dupa={inapoi} />
    </div>
  );
}
