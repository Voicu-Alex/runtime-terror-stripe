import { FormularProfil } from "@/components/FormularProfil";
import { T } from "@/components/Limba";

export const metadata = { title: "Profilul meu · Ce înseamnă pentru mine" };

export default function PaginaProfil() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="m-0 font-head text-2xl font-extrabold tracking-[-.015em] text-v3-ink">
          <T k="Profilul meu" />
        </h1>
        <p className="mt-1 mb-0 text-[15px] text-v3-ink-2">
          <T k="Încarcă documentele pe care le ai deja și profilul se completează singur: etichete și câteva cifre, nimic altceva. Rămâne pe dispozitivul tău." />
        </p>
      </div>
      <FormularProfil />
    </div>
  );
}
