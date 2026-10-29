import { auth } from "@/auth";
import { Conectare } from "@/components/Conectare";
import { caleSigura, mesajEroareAuth } from "@/lib/conectare";

export const metadata = { title: "Contul meu · Buzunar" };

type Parametri = Promise<{ inapoi?: string; callbackUrl?: string; error?: string }>;

export default async function PaginaConectare({ searchParams }: { searchParams: Parametri }) {
  const p = await searchParams;
  const email = (await auth())?.user?.email ?? null;
  return (
    <div className="mx-auto max-w-md">
      <Conectare email={email} inapoi={caleSigura(p.inapoi ?? p.callbackUrl)} eroare={p.error ? mesajEroareAuth(p.error) : null} />
    </div>
  );
}
