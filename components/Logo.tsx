// Logo-ul Buzunar: un buzunar cusut, cu o monedă verde înăuntru, lângă numele aplicației.
// Desenul e același cu cel din lib/marca.tsx (iconițe); aici culorile vin din tokenuri, ca să urmeze tema.

/** Doar semnul (buzunarul). Înălțimea vine din className; lățimea urmează proporția 36:40. */
export function SemnBuzunar({ className = "h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 40" aria-hidden="true" className={`w-auto flex-none ${className}`}>
      <circle cx="22.5" cy="9" r="7" className="fill-v3-pos" />
      <path d="M4 10.5h28v17.2c0 1-.5 1.9-1.3 2.4L18 38l-12.7-7.9C4.5 29.6 4 28.7 4 27.7z" className="fill-v3-logo" />
      <path
        d="M7.5 14v13.1L18 33.6l10.5-6.5V14"
        fill="none"
        strokeWidth="1.5"
        strokeDasharray="2.2 2"
        strokeLinecap="round"
        className="stroke-[var(--fundal)]"
      />
    </svg>
  );
}
