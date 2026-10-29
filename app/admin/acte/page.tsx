import { auth, signIn } from "@/auth";
import { AdminActe, StareGoala } from "@/components/AdminActe";
import { areAcces } from "@/lib/admin";
import { interpretariDemo } from "@/lib/interpretari-demo";
import { interpretariPropuse } from "@/lib/supabase-server";

export const metadata = { title: "Interpretări de aprobat · Buzunar" };
export const dynamic = "force-dynamic";

export default async function PaginaAdminActe({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const demo = (await searchParams).demo === "1";
  const email = (await auth())?.user?.email ?? null;

  if (!areAcces(email, process.env.ADMIN_EMAILS, process.env.NODE_ENV === "production")) {
    return (
      <div className="rounded-[18px] border border-v3-line bg-v3-card p-5">
        <h1 className="m-0 font-head text-[24px] font-extrabold text-v3-ink">Pagina e doar pentru echipă.</h1>
        <form
          className="m-0 mt-3"
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/admin/acte" });
          }}
        >
          <button type="submit" className="min-h-11 rounded-xl bg-v3-ink px-[18px] font-bold text-v3-on-ink hover:bg-v3-ink-strong">
            Continuă cu Google
          </button>
        </form>
      </div>
    );
  }

  if (demo) return <AdminActe randuri={interpretariDemo()} demo />;

  const r = await interpretariPropuse();
  if (r.tabeleLipsa)
    return <StareGoala titlu="Interpretări de aprobat" text="Tabelele nu există încă. Rulează" cod="npm run legi:migreaza" />;
  if (r.eroare) return <StareGoala titlu="Interpretări de aprobat" text={`Nu am putut citi interpretările: ${r.eroare}`} />;
  return <AdminActe randuri={r.randuri} demo={false} />;
}
