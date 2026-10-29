"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { areAcces } from "@/lib/admin";
import { aprobaInterpretare, respingeInterpretare } from "@/lib/aprobare";

export type StareActiune = { eroare?: string; ok?: string };

async function revizor(): Promise<string> {
  const email = (await auth())?.user?.email ?? null;
  if (!areAcces(email, process.env.ADMIN_EMAILS, process.env.NODE_ENV === "production")) throw new Error("Pagina e doar pentru echipă.");
  return email ?? "local-dev";
}

/** Folosit cu useActionState: primul argument e starea anterioară. */
export async function aproba(_anterior: StareActiune, formData: FormData): Promise<StareActiune> {
  try {
    const id = Number(formData.get("id"));
    const schimbari = formData.getAll("schimbare").map(Number).filter(Number.isInteger);
    if (!Number.isInteger(id)) throw new Error("Lipsește id-ul interpretării.");
    if (!schimbari.length) throw new Error("Bifează cel puțin o schimbare de aprobat.");
    const rev = await revizor();
    const r = await aprobaInterpretare(id, { schimbari, revizor: rev, azi: new Date().toISOString().slice(0, 10) });
    revalidatePath("/admin/acte");
    return { ok: `Aprobat: ${r.schimbareIds.join(", ")}` };
  } catch (e) {
    return { eroare: e instanceof Error ? e.message : String(e) };
  }
}

export async function respinge(_anterior: StareActiune, formData: FormData): Promise<StareActiune> {
  try {
    const id = Number(formData.get("id"));
    const nota = String(formData.get("nota") ?? "").trim();
    if (!Number.isInteger(id)) throw new Error("Lipsește id-ul interpretării.");
    if (!nota) throw new Error("Scrie de ce respingi.");
    await respingeInterpretare(id, { nota, revizor: await revizor() });
    revalidatePath("/admin/acte");
    return { ok: "Respins." };
  } catch (e) {
    return { eroare: e instanceof Error ? e.message : String(e) };
  }
}
