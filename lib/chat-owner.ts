import { PERSOANE_DEMO } from "./persoane-demo";
import type { Profil } from "./profil";

/** Same fallback as PentruTine: the empty application page displays the Andrei example. */
export function chatOwner(pathname: string, demoId: string | null, personal: Profil | null): string {
  if (pathname === "/aplicatie" || pathname === "/flux" || pathname === "/profil") {
    if (demoId && Object.hasOwn(PERSOANE_DEMO, demoId)) return `demo:${demoId}`;
    if (pathname === "/aplicatie" && personal && personal.taguri.length === 0) return "demo:andrei";
  }
  return "personal";
}
