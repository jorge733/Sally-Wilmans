/**
 * Ilustración de montañas que se usa mientras no hay fotos reales.
 * `variante` cambia la paleta para que cada salida se vea distinta.
 */
const PALETAS = [
  { cielo: ["#f6dcb0", "#eaa877"], sol: "#fff1d6", capas: ["#a9b98f", "#748e5f", "#4a6640", "#2f4a34"] },
  { cielo: ["#dbe8e4", "#a9cbc6"], sol: "#ffffff", capas: ["#b4c5a3", "#86a06f", "#5c7a3c", "#3b5530"] },
  { cielo: ["#f5cfa8", "#d98a5c"], sol: "#ffe6c2", capas: ["#c3a07e", "#937355", "#6b5a3e", "#3f3a28"] },
  { cielo: ["#efe6d2", "#d8c9a8"], sol: "#ffffff", capas: ["#c9cfae", "#9aa87c", "#6c7f50", "#44573a"] },
];

export function Paisaje({
  variante = 0,
  className = "",
  conNieve = false,
  animado = false,
}: {
  variante?: number;
  className?: string;
  conNieve?: boolean;
  /** El sol brilla y los cerros se mueven suavemente (para la portada). */
  animado?: boolean;
}) {
  const p = PALETAS[Math.abs(variante) % PALETAS.length];
  const id = `p${variante}`;
  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
      className={`${animado ? "paisaje-animado " : ""}${className}`}
      role="img"
      aria-label="Ilustración de montañas"
    >
      <defs>
        <linearGradient id={`${id}-cielo`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.cielo[1]} />
          <stop offset="1" stopColor={p.cielo[0]} />
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill={`url(#${id}-cielo)`} />
      <circle className="paisaje-sol" cx="590" cy="150" r="56" fill={p.sol} opacity="0.9" />
      <g className="paisaje-capa-1">
        <path
          d="M0 300 L120 190 L210 250 L330 120 L430 220 L520 160 L640 240 L720 180 L800 230 L800 500 L0 500 Z"
          fill={p.capas[0]}
        />
        {conNieve && (
          <path d="M300 148 L330 120 L362 152 L345 160 L330 150 L316 162 Z" fill="#fff" opacity="0.9" />
        )}
      </g>
      <path
        className="paisaje-capa-2"
        d="M0 350 L90 280 L180 330 L290 230 L400 320 L500 260 L610 330 L700 280 L800 320 L800 500 L0 500 Z"
        fill={p.capas[1]}
      />
      <path
        d="M0 410 L130 330 L250 390 L360 340 L470 400 L590 350 L700 400 L800 370 L800 500 L0 500 Z"
        fill={p.capas[2]}
      />
      <path
        d="M0 460 Q120 420 240 450 T480 445 T720 450 T800 440 L800 500 L0 500 Z"
        fill={p.capas[3]}
      />
      {[60, 95, 640, 690, 735].map((x, i) => (
        <path
          key={x}
          d={`M${x} ${455 - (i % 2) * 8} l14 -38 l14 38 Z`}
          fill={p.capas[3]}
          opacity="0.95"
        />
      ))}
    </svg>
  );
}
