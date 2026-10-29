import { ButonAsistent } from "@/components/ButonAsistent";
import { FormularProfil } from "@/components/FormularProfil";
import { T } from "@/components/Limba";
import { PlanulMeu } from "@/components/PlanulMeu";

export const metadata = { title: "Profilul meu · Buzunar" };

// Profilul (din document sau manual) și, dedesubt, Planul meu: ce ai bifat și ghidurile deschise.
export default function PaginaProfil() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-5">
        <div>
          <h1 className="m-0 font-head text-[clamp(26px,6.6vw,34px)] leading-[1.16] font-extrabold tracking-[-.015em] text-v3-ink">
            <T k="Profilul meu" />
          </h1>
          <p className="mt-1 mb-0 text-[15px] text-v3-ink-2">
            <T k="Poți completa profilul manual sau prin analiza unui document cu AI." />
          </p>
        </div>
        <ButonAsistent />
        <FormularProfil />
      </div>
      <PlanulMeu />
    </div>
  );
}
