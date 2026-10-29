import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as checkout } from "@/app/api/abonament/checkout/route";
import { POST as portal } from "@/app/api/abonament/portal/route";

const { creeazaCheckout, creeazaPortal } = vi.hoisted(() => ({
  creeazaCheckout: vi.fn(async () => ({ url: "https://checkout.stripe.com/test" })),
  creeazaPortal: vi.fn(async () => ({ url: "https://billing.stripe.com/test" })),
}));

vi.mock("@/auth", () => ({ auth: async () => ({ user: { email: "test@example.com" } }) }));
vi.mock("@/lib/stripe", () => ({
  FARA_CHEIE: "",
  stripe: () => ({
    checkout: { sessions: { create: creeazaCheckout } },
    billingPortal: { sessions: { create: creeazaPortal } },
  }),
  clientDupaEmail: async () => ({ id: "cus_test" }),
  stareDupaEmail: async () => ({ activ: false }),
}));

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllEnvs());

describe("întoarcerea din Stripe", () => {
  for (const [authUrl, origine] of [
    ["https://descriere.andreidobrin.com", "https://descriere.andreidobrin.com"],
    [undefined, "http://localhost:3000"],
  ] as const) {
    it(`checkout folosește ${origine}, inclusiv în spatele proxy-ului`, async () => {
      vi.stubEnv("AUTH_URL", authUrl);
      await checkout(new Request("http://localhost:3000/api/abonament/checkout", { method: "POST" }));
      expect(creeazaCheckout).toHaveBeenCalledWith(expect.objectContaining({
        success_url: `${origine}/abonament/gata`,
        cancel_url: `${origine}/abonament`,
      }));
    });

    it(`portalul folosește ${origine}, inclusiv în spatele proxy-ului`, async () => {
      vi.stubEnv("AUTH_URL", authUrl);
      await portal(new Request("http://localhost:3000/api/abonament/portal", { method: "POST" }));
      expect(creeazaPortal).toHaveBeenCalledWith(expect.objectContaining({ return_url: `${origine}/abonament` }));
    });
  }
});
