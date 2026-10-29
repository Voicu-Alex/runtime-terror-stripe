import Asistent from "@/components/Asistent";
import { T } from "@/components/Limba";

export const metadata = { title: "Profilul meu · Ce înseamnă pentru mine" };

export default function PaginaProfil() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="m-0 font-head text-[clamp(26px,6.6vw,34px)] leading-[1.16] font-extrabold tracking-[-.015em] text-v3-ink">
          <T k="Profilul meu" />
        </h1>
        <p className="mt-1 mb-0 text-[15px] text-v3-ink-2">
          <T k="Răspunzi la 6 întrebări scurte, cu o atingere sau în cuvintele tale, și vezi ce legi te privesc. Preferi un formular? E mai jos." />
        </p>
      </div>
      <Asistent mod="profil" />
    </div>
  );
}
