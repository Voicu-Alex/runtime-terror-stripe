import { redirect } from "next/navigation";

/** „Azi” arăta același act ca articolul principal din flux, deci a fost scos. Linkurile vechi ajung în flux. */
export default async function PaginaNotificare({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { p } = await searchParams;
  redirect(p ? `/flux?p=${encodeURIComponent(p)}` : "/flux");
}
