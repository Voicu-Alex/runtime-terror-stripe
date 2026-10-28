import Link from "next/link";
import { FormularProfil } from "@/components/FormularProfil";

export const metadata = { title: "Profilul meu · Ce înseamnă pentru mine" };

export default function PaginaProfil() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="m-0 font-head text-2xl font-extrabold tracking-[-.015em] text-v3-ink">Profilul meu</h1>
        <p className="mt-1 mb-0 text-[15px] text-v3-ink-2">
          Bifează ce te descrie. Profilul e doar etichete și câteva cifre, stă pe dispozitivul tău și nu pleacă nicăieri. Poți
          și să{" "}
          <Link href="/documente" className="text-v3-ink underline decoration-v3-line underline-offset-2">
            încarci un document
          </Link>{" "}
          ca să le completăm noi.
        </p>
      </div>
      <FormularProfil />
    </div>
  );
}
