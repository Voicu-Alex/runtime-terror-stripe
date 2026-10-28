import { redirect } from "next/navigation";

/** Documentele se încarcă acum direct în profil. Linkurile vechi spre /documente ajung acolo. */
export default function PaginaDocumente() {
  redirect("/profil");
}
