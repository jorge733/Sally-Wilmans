type P = { className?: string };
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

export const IconoCalendario = ({ className = "size-5" }: P) => (
  <svg {...base} className={className}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);
export const IconoReloj = ({ className = "size-5" }: P) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
export const IconoLugar = ({ className = "size-5" }: P) => (
  <svg {...base} className={className}>
    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);
export const IconoNinos = ({ className = "size-5" }: P) => (
  <svg {...base} className={className}>
    <circle cx="9" cy="7" r="3" />
    <path d="M3 21v-1a6 6 0 0 1 12 0v1" />
    <circle cx="17.5" cy="9.5" r="2.2" />
    <path d="M16 21v-.5a4.5 4.5 0 0 1 5-4.4" />
  </svg>
);
export const IconoMochila = ({ className = "size-5" }: P) => (
  <svg {...base} className={className}>
    <path d="M8 6V5a4 4 0 0 1 8 0v1" />
    <rect x="5" y="6" width="14" height="15" rx="4" />
    <path d="M9 13h6v4H9z" />
  </svg>
);
export const IconoCheck = ({ className = "size-5" }: P) => (
  <svg {...base} className={className}>
    <path d="M5 12.5 10 17 19 7" />
  </svg>
);
export const IconoFlecha = ({ className = "size-4" }: P) => (
  <svg {...base} className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const IconoCorreo = ({ className = "size-5" }: P) => (
  <svg {...base} className={className}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);
export const IconoInstagram = ({ className = "size-5" }: P) => (
  <svg {...base} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
);
export const IconoEscudo = ({ className = "size-6" }: P) => (
  <svg {...base} className={className}>
    <path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3Z" />
    <path d="m8.5 12 2.5 2.5 4.5-5" />
  </svg>
);
export const IconoGrupo = ({ className = "size-6" }: P) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="8" r="3" />
    <circle cx="5" cy="10" r="2" />
    <circle cx="19" cy="10" r="2" />
    <path d="M7 20a5 5 0 0 1 10 0M1.5 19a3.5 3.5 0 0 1 5-3.2M22.5 19a3.5 3.5 0 0 0-5-3.2" />
  </svg>
);
export const IconoCorazon = ({ className = "size-6" }: P) => (
  <svg {...base} className={className}>
    <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20Z" />
    <path d="M8 12h2.5l1-2 2 4 1-2H16" />
  </svg>
);
export const IconoSendero = ({ className = "size-6" }: P) => (
  <svg {...base} className={className}>
    <path d="m3 20 6-12 4 6 3-4 5 10Z" />
    <path d="M9 8 7.5 5" />
  </svg>
);
export const IconoWhatsapp = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.05c-.24.68-1.42 1.3-1.95 1.35-.5.05-.97.23-3.26-.68-2.75-1.08-4.5-3.9-4.64-4.08-.13-.18-1.1-1.47-1.1-2.8 0-1.33.7-1.98.95-2.25.24-.27.53-.34.71-.34l.51.01c.16 0 .38-.06.6.46.23.54.77 1.87.84 2 .07.14.11.3.02.48-.09.18-.13.29-.27.45-.13.16-.28.35-.4.47-.13.13-.27.28-.12.55.16.27.7 1.15 1.5 1.86 1.03.92 1.9 1.2 2.17 1.34.27.13.43.11.58-.07.16-.18.67-.78.85-1.05.18-.27.36-.22.6-.13.25.09 1.57.74 1.84.88.27.13.45.2.52.31.07.11.07.65-.17 1.33Z" />
  </svg>
);
