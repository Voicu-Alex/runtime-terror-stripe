import { redirect } from "next/navigation";

/** Landing-ul a stat aici cât timp „/” era aplicația; acum e pagina principală. Linkurile vechi ajung acolo. */
export default function Despre() {
  redirect("/");
}
