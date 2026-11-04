/**
 * Ilustración de montañas que se usa mientras no hay fotos reales.
 * `variante` cambia la paleta para que cada salida se vea distinta.
 */
const PALETAS = [
  { cielo: ["#f4d9b8", "#e9b48a"], sol: "#fff3dd", capas: ["#8aa3b4", "#4f7287", "#2a4d63", "#14324a"] },
  { cielo: ["#d6e6ef", "#a9c7d8"], sol: "#ffffff", capas: ["#9fb7a2", "#6b917a", "#3f6b59", "#2f5d50"] },
  { cielo: ["#f3c9b1", "#d98b6a"], sol: "#ffe8cf", capas: ["#b98a7a", "#8f5f55", "#5c3d3c", "#3a2a2f"] },
  { cielo: ["#e4ecf1", "#c2d3de"], sol: "#ffffff", capas: ["#c7d4dc", "#91a9b8", "#5d7d92", "#33536b"] },
];

export function Paisaje({
  variante = 0,
  className = "",
  conNieve = false,
}: {
  variante?: number;
  className?: string;
  conNieve?: boolean;
}) {
  const p = PALETAS[Math.abs(variante) % PALETAS.length];
  const id = `p${variante}`;
  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
      className={className}
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
      <circle cx="590" cy="150" r="56" fill={p.sol} opacity="0.9" />
      <path
        d="M0 300 L120 190 L210 250 L330 120 L430 220 L520 160 L640 240 L720 180 L800 230 L800 500 L0 500 Z"
        fill={p.capas[0]}
      />
      {conNieve && (
        <path d="M300 148 L330 120 L362 152 L345 160 L330 150 L316 162 Z" fill="#fff" opacity="0.9" />
      )}
      <path
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
