// Emailurile conturilor (confirmare, resetarea parolei), prin Resend (https://resend.com). Doar pe server.
// Fără RESEND_API_KEY, în dezvoltare linkul se scrie în consola serverului, ca fluxul să se poată testa local;
// în producție, fără cheie, trimiterea eșuează.

type Email = { catre: string; subiect: string; text: string; link: string; buton: string };

function html({ text, link, buton }: Email): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  return `<!doctype html><html lang="ro"><body style="margin:0;padding:24px;background:#f5f5f4;font-family:Inter,Segoe UI,Arial,sans-serif;color:#111827">
<div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:28px">
<p style="margin:0 0 4px;font-weight:800;font-size:18px;color:#44403c">Ce înseamnă pentru mine</p>
<p style="margin:0 0 20px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#4b5563">Legea, pe banii tăi</p>
<p style="margin:0 0 20px;font-size:16px;line-height:1.5">${esc(text)}</p>
<a href="${esc(link)}" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:12px">${esc(buton)}</a>
<p style="margin:20px 0 0;font-size:13px;color:#4b5563">Dacă nu tu ai cerut asta, ignoră emailul.</p>
</div></body></html>`;
}

export async function trimiteEmail(e: Email): Promise<void> {
  const cheie = process.env.RESEND_API_KEY;
  if (!cheie) {
    if (process.env.NODE_ENV === "production") throw new Error("Emailurile nu sunt configurate: lipsește RESEND_API_KEY.");
    console.info(`[email de test, fără RESEND_API_KEY] către ${e.catre}: ${e.subiect}\n${e.link}`);
    return;
  }
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${cheie}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      // Până la un domeniu verificat în Resend, adresa de test onboarding@resend.dev trimite doar spre contul tău Resend.
      from: process.env.EMAIL_DE_LA ?? "Ce înseamnă pentru mine <onboarding@resend.dev>",
      to: [e.catre],
      subject: e.subiect,
      text: `${e.text}\n\n${e.link}`,
      html: html(e),
    }),
  });
  if (!r.ok) throw new Error(`Resend: ${r.status} ${await r.text()}`);
}
