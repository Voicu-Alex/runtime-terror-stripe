import { NextResponse } from "next/server";

// Ce au în comun rutele din app/api/cont: secretul pentru linkuri și răspunsurile de eroare.

export function secret(): string | null {
  return process.env.AUTH_SECRET ?? null;
}

export function eroare(mesaj: string, status: number) {
  return NextResponse.json({ eroare: mesaj }, { status });
}

export async function corpJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const j: unknown = await req.json();
    return j && typeof j === "object" ? (j as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
