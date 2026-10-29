import { PERSOANE_DEMO } from "./persoane-demo";
import type { Profil } from "./profil";

/** Same fallback as PentruTine: the empty home page displays the Andrei example. */
export function chatOwner(pathname: string, demoId: string | null, personal: Profil | null): string {
  if (pathname === "/" || pathname === "/flux") {
    if (demoId && Object.hasOwn(PERSOANE_DEMO, demoId)) return `demo:${demoId}`;
    if (pathname === "/" && personal && personal.taguri.length === 0) return "demo:andrei";
  }
  return "personal";
}
