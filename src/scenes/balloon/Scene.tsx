import type { ReactNode } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import calcul from "../../../sujets/balloon.calcul.json";
import type { SceneProps } from "../../cadre/types";
import { entre, paletteA, pasDecor } from "./temps";

const BX = 600;
const BY = 830;
const BPX = 440;
const SOL = 1230;
const R_TERRE = 6.371e6;
const ROUGE = "#E0413A";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const diametre = (c: number) => calcul.d0_m * Math.pow(calcul.facteur, c / 3);

// Décor rangé par taille : chaque famille n'apparaît que lorsqu'elle tient à l'écran
type Famille = { taille: number; pas: number; dessin: (x: number, s: number, i: number) => ReactNode };
const FAMILLES: Famille[] = [
  {
    taille: 0.1,
    pas: 0.5,
    dessin: (x, s, i) => (
      <g key={`t${i}`}>
        <rect x={x - s * 0.4} y={SOL - s} width={s * 0.8} height={s} rx={s * 0.1} fill={i % 2 ? "#2F6FB0" : "#E8B23A"} />
        <path d={`M ${x + s * 0.4} ${SOL - s * 0.8} q ${s * 0.35} ${s * 0.3} 0 ${s * 0.5}`} fill="none" stroke={i % 2 ? "#2F6FB0" : "#E8B23A"} strokeWidth={s * 0.1} />
      </g>
    ),
  },
  {
    taille: 1,
    pas: 3.2,
    dessin: (x, s, i) => (
      <g key={`c${i}`} fill="#8A5A3A">
        <rect x={x - s * 0.5} y={SOL - s * 0.5} width={s} height={s * 0.1} />
        <rect x={x - s * 0.5} y={SOL - s} width={s * 0.1} height={s} />
        <rect x={x + s * 0.4} y={SOL - s * 0.5} width={s * 0.1} height={s * 0.5} />
      </g>
    ),
  },
  {
    taille: 9,
    pas: 22,
    dessin: (x, s, i) => (
      <g key={`m${i}`}>
        <rect x={x - s * 0.5} y={SOL - s * 0.65} width={s} height={s * 0.65} fill={i % 2 ? "#E9D8B4" : "#D9B98A"} />
        <polygon points={`${x - s * 0.6},${SOL - s * 0.65} ${x},${SOL - s} ${x + s * 0.6},${SOL - s * 0.65}`} fill="#A23B2A" />
        <rect x={x - s * 0.1} y={SOL - s * 0.3} width={s * 0.2} height={s * 0.3} fill="#5A3A22" />
      </g>
    ),
  },
  {
    taille: 120,
    pas: 300,
    dessin: (x, s, i) => <rect key={`i${i}`} x={x - s * 0.2} y={SOL - s * (0.6 + 0.4 * ((i * 7) % 3) / 2)} width={s * 0.4} height={s * (0.6 + 0.4 * ((i * 7) % 3) / 2)} fill="#5D6B7A" />,
  },
  {
    taille: 1500,
    pas: 5000,
    dessin: (x, s, i) => <path key={`h${i}`} d={`M ${x - s * 2} ${SOL} Q ${x} ${SOL - s * 1.4} ${x + s * 2} ${SOL} Z`} fill={i % 2 ? "#5E8F4E" : "#4C7A40"} />,
  },
  {
    taille: 6000,
    pas: 40000,
    dessin: (x, s, i) => (
      <g key={`g${i}`}>
        <polygon points={`${x - s * 1.6},${SOL} ${x},${SOL - s} ${x + s * 1.6},${SOL}`} fill="#6B6F7A" />
        <polygon points={`${x - s * 0.35},${SOL - s * 0.78} ${x},${SOL - s} ${x + s * 0.35},${SOL - s * 0.78}`} fill="#F4F6FF" />
      </g>
    ),
  },
];

const Reference = ({ cle, x, z }: { cle: string; x: number; z: number }) => {
  switch (cle) {
    case "poumons": {
      const s = 0.28 * z;
      return (
        <g transform={`translate(${x} ${SOL - s * 0.55})`}>
          <rect x={-s * 0.04} y={-s * 0.5} width={s * 0.08} height={s * 0.3} fill="#C7576E" />
          <ellipse cx={-s * 0.22} cy={0} rx={s * 0.2} ry={s * 0.4} fill="#E58FA0" />
          <ellipse cx={s * 0.22} cy={0} rx={s * 0.2} ry={s * 0.4} fill="#E58FA0" />
        </g>
      );
    }
    case "piscine":
      return (
        <g>
          <rect x={x - 25 * z} y={SOL} width={50 * z} height={2 * z} fill="#3E9BD6" />
          <rect x={x - 25 * z} y={SOL} width={50 * z} height={Math.max(2, 0.2 * z)} fill="#BFE6F7" />
        </g>
      );
    case "pyramide":
      return <polygon points={`${x - 115 * z},${SOL} ${x},${SOL - 139 * z} ${x + 115 * z},${SOL}`} fill="#D9B46A" stroke="#A9843A" strokeWidth={Math.max(1, 3 * z)} />;
    case "lochness":
      return <path d={`M ${x - 18500 * z} ${SOL} L ${x + 18500 * z} ${SOL} L ${x + 15000 * z} ${SOL + Math.max(3, 230 * z)} L ${x - 15000 * z} ${SOL + Math.max(3, 230 * z)} Z`} fill="#1F4F7A" />;
    case "canyon":
      return <path d={`M ${x - 8000 * z} ${SOL} L ${x - 2000 * z} ${SOL + 1800 * z} L ${x + 2000 * z} ${SOL + 1800 * z} L ${x + 8000 * z} ${SOL} Z`} fill="#C2582B" />;
    case "antarctique":
      return <path d={`M ${x - 2000000 * z} ${SOL} Q ${x} ${SOL - Math.max(10, 4000 * z * 4)} ${x + 2000000 * z} ${SOL} Z`} fill="#F4F8FF" />;
    default:
      return null;
  }
};

export const SceneBalloon = ({ t }: SceneProps) => {
  const palette = paletteA(t);
  const c = pasDecor(t);
  const d = diametre(c);
  const z = BPX / d;
  const eclate = t >= calcul.t_qui && t < calcul.t_patte;
  const ageEclat = t - calcul.t_qui;
  const sansAir = t >= calcul.t_limite + 1 && t < calcul.t_qui + 0.3;
  const rTerre = R_TERRE * z;
  const atmosphere = 100000 * z;

  const decor: ReactNode[] = [];
  FAMILLES.forEach((f, fi) => {
    const s = f.taille * z;
    if (s < 4 || s > 1200) {
      return;
    }
    const pasPx = f.pas * z;
    const debut = Math.floor((0 - BX) / pasPx) - 1;
    const fin = Math.ceil((1080 - BX) / pasPx) + 1;
    for (let k = debut; k <= fin; k++) {
      const x = BX + k * pasPx + pasPx * 0.37 * fi;
      if (Math.abs(x - BX) < BPX * 0.45 + s * 0.6 && f.taille > d * 0.8) {
        continue;
      }
      decor.push(f.dessin(x, s, k + fi * 100));
    }
  });

  const references = calcul.paliers.filter((p) => p.cle !== "atmosphere" && t >= p.arrivee_s - 0.4 && t < calcul.t_retour);

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        {(c > 38 || sansAir) &&
          Array.from({ length: 40 }, (_, i) => (
            <circle key={i} cx={(i * 263) % 1080} cy={500 + ((i * 397) % 700)} r={2} fill="#F4F6FF" opacity={sansAir ? 0.9 : entre(c, 38, 42) * 0.7} />
          ))}

        {/* Le sol, puis la Terre et son atmosphère quand on recule assez */}
        {rTerre > 3e5 ? (
          <rect x={0} y={SOL} width={1080} height={1920 - SOL} fill={c < 9 ? "#B88B5E" : "#5E8F4E"} />
        ) : (
          <g>
            {!sansAir && <circle cx={BX} cy={SOL + rTerre} r={rTerre + Math.max(atmosphere, 3)} fill="#7FC3EA" opacity={0.45} />}
            <circle cx={BX} cy={SOL + rTerre} r={rTerre} fill="#2F6FB0" />
            <circle cx={BX - rTerre * 0.2} cy={SOL + rTerre * 0.6} r={rTerre * 0.55} fill="#4E8A3C" />
          </g>
        )}

        {decor}
        {references.map((p) => (
          <Reference key={p.cle} cle={p.cle} x={BX - BPX * 0.5 - Math.max(80, 0.6 * p.diametre_m * z)} z={z} />
        ))}

        {/* Le ballon et sa ficelle */}
        {!eclate ? (
          <g>
            <path d={`M ${BX} ${BY + BPX * 0.55} q -30 ${(SOL - BY) * 0.4} 0 ${SOL - BY - BPX * 0.55}`} fill="none" stroke="#2A1B12" strokeWidth={4} />
            <polygon points={`${BX - 16},${BY + BPX * 0.55} ${BX + 16},${BY + BPX * 0.55} ${BX},${BY + BPX * 0.5}`} fill={ROUGE} />
            <ellipse cx={BX} cy={BY} rx={BPX * 0.48} ry={BPX * 0.55} fill={ROUGE} />
            <ellipse cx={BX - BPX * 0.2} cy={BY - BPX * 0.25} rx={BPX * 0.08} ry={BPX * 0.14} fill="#FFFFFF" opacity={0.55} />
          </g>
        ) : (
          <g>
            {Array.from({ length: 10 }, (_, i) => {
              const a = (i * Math.PI * 2) / 10;
              const r = 60 + 700 * Math.min(1, ageEclat * 1.4);
              return <polygon key={i} points="-30,-20 40,-10 10,30" fill={ROUGE} transform={`translate(${BX + Math.cos(a) * r} ${BY + Math.sin(a) * r}) rotate(${i * 70 + ageEclat * 200})`} opacity={interpolate(ageEclat, [0, 2.4], [1, 0], borne)} />;
            })}
            <circle cx={BX} cy={BY} r={40 + ageEclat * 900} fill="none" stroke="#FFFFFF" strokeWidth={30 * Math.max(0, 1 - ageEclat)} opacity={Math.max(0, 1 - ageEclat)} />
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
