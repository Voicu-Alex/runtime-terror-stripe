import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

// Parolele conturilor cu email (docs/adr/0003-conturi-email.md). Doar pe server.
// scrypt din Node: fără dependențe, cu sare aleatoare pe fiecare parolă. Formatul păstrat:
// "scrypt$<N>$<sare base64>$<hash base64>", ca parametrii să poată crește fără să invalideze conturile vechi.

const scryptAsync = promisify(scrypt) as (parola: string, sare: Buffer, lungime: number, opt: { N: number }) => Promise<Buffer>;
const N = 16384;
const LUNGIME = 64;

export { PAROLA_MINIM, emailValid, parolaValida } from "./parola-reguli";

export async function cripteaza(parola: string): Promise<string> {
  const sare = randomBytes(16);
  const hash = await scryptAsync(parola, sare, LUNGIME, { N });
  return `scrypt$${N}$${sare.toString("base64")}$${hash.toString("base64")}`;
}

export async function verifica(parola: string, salvat: string): Promise<boolean> {
  const [alg, n, sare, hash] = salvat.split("$");
  if (alg !== "scrypt" || !n || !sare || !hash) return false;
  const asteptat = Buffer.from(hash, "base64");
  const calculat = await scryptAsync(parola, Buffer.from(sare, "base64"), asteptat.length, { N: Number(n) });
  return calculat.length === asteptat.length && timingSafeEqual(calculat, asteptat);
}
