import type { FC } from "react";
import { AbsoluteFill, interpolate, interpolateColors } from "remotion";
import calcul from "../../../sujets/light.calcul.json";
import type { SceneProps } from "../../cadre/types";
import { entre, lisse, paletteA, pasDecor } from "./temps";

const SOL_Y = 1150;
const RAYON_Y = 590;
const RAYON_X = 170;
const RAYON = "#FF9E1B";
const COURSE_Y = 880;
const PLACE_Y = 1096;

// Vitesse visuelle des impulsions : elle s'effondre sans jamais s'annuler, en pixels par seconde
const VITESSE_0 = 2400;
const FREIN = 0.075;
const EMISSION_S = 0.5;

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Appel = () => (
  <g>
    <rect x={-52} y={-34} width={40} height={68} rx={7} fill="#20232A" />
    <rect x={-47} y={-27} width={30} height={50} fill="#6FD0E8" />
    <rect x={12} y={-34} width={40} height={68} rx={7} fill="#20232A" />
    <rect x={17} y={-27} width={30} height={50} fill="#F2C14E" />
    {[-5, 5].map((x) => (
      <circle key={x} cx={x} cy={0} r={3.5} fill="#E2541B" />
    ))}
  </g>
);

const Soleil = () => (
  <g>
    {Array.from({ length: 12 }, (_, i) => (
      <rect key={i} x={-4} y={-54} width={8} height={18} rx={4} fill="#E2541B" transform={`rotate(${i * 30})`} />
    ))}
    <circle cx={0} cy={0} r={32} fill="#FF9E1B" />
  </g>
);

const Sonde = () => (
  <g>
    <rect x={-40} y={-10} width={50} height={20} fill="#BFC6D2" />
    <rect x={-22} y={-40} width={12} height={80} fill="#2F6FB0" />
    <ellipse cx={18} cy={0} rx={12} ry={40} fill="#F2E7CF" stroke="#20232A" strokeWidth={3} />
  </g>
);

const Station = () => (
  <g>
    <rect x={-52} y={-4} width={104} height={8} fill="#BFC6D2" />
    {[-44, 22].map((x) => (
      <g key={x}>
        <rect x={x} y={-42} width={22} height={34} fill="#2F6FB0" stroke="#FFF4D8" strokeWidth={2} />
        <rect x={x} y={8} width={22} height={34} fill="#2F6FB0" stroke="#FFF4D8" strokeWidth={2} />
      </g>
    ))}
    <rect x={-13} y={-12} width={26} height={24} rx={5} fill="#E6E9EF" />
  </g>
);

const Son = () => (
  <g>
    <polygon points="-44,-16 -22,-16 4,-38 4,38 -22,16 -44,16" fill="#E6E9EF" stroke="#20232A" strokeWidth={3} />
    {[20, 34, 48].map((r) => (
      <path key={r} d={`M ${r * 0.7} ${-r * 0.7} A ${r} ${r} 0 0 1 ${r * 0.7} ${r * 0.7}`} fill="none" stroke="#FFD23F" strokeWidth={6} />
    ))}
  </g>
);

const Voiture = () => (
  <g>
    <path d="M -54 18 L -54 0 L -30 -4 L -14 -26 L 22 -26 L 38 -4 L 54 2 L 54 18 Z" fill="#D8352A" />
    <path d="M -10 -21 L 18 -21 L 28 -4 L -24 -4 Z" fill="#BFE4F2" />
    <circle cx={-30} cy={20} r={13} fill="#20232A" />
    <circle cx={30} cy={20} r={13} fill="#20232A" />
    <circle cx={52} cy={8} r={5} fill="#FFD23F" />
  </g>
);

// Un pictogramme de panneau, pas un personnage
const Marcheur = () => (
  <g fill="none" stroke="#FFF4D8" strokeWidth={11} strokeLinecap="round">
    <circle cx={4} cy={-40} r={10} fill="#FFF4D8" stroke="none" />
    <path d="M 2 -24 L -2 8" />
    <path d="M -2 8 L -20 44 M -2 8 L 20 44" />
    <path d="M 2 -18 L -18 2 M 2 -18 L 24 -2" />
  </g>
);

const Paresseux = () => (
  <g>
    <rect x={-56} y={-40} width={112} height={10} rx={5} fill="#7A5A26" />
    <path d="M -24 -32 C -28 -6 -14 22 12 20 C 34 18 40 -8 28 -32" fill="none" stroke="#C89B6B" strokeWidth={14} strokeLinecap="round" />
    <ellipse cx={4} cy={6} rx={26} ry={22} fill="#C89B6B" />
    <circle cx={22} cy={18} r={12} fill="#E3C39A" />
    <circle cx={26} cy={16} r={2.5} fill="#20232A" />
  </g>
);

const Escargot = () => (
  <g>
    <path d="M -50 32 C -40 18 30 18 50 28 L 46 36 L -48 38 Z" fill="#D9C7A0" />
    <circle cx={-2} cy={0} r={32} fill="#E8A43A" />
    <circle cx={-2} cy={0} r={20} fill="none" stroke="#9A5F16" strokeWidth={5} />
    <circle cx={-2} cy={0} r={7} fill="#9A5F16" />
    <path d="M 40 26 L 50 2 M 48 28 L 60 8" stroke="#D9C7A0" strokeWidth={5} strokeLinecap="round" />
  </g>
);

const ICONES: Record<string, FC> = {
  appel: Appel,
  soleil: Soleil,
  sonde: Sonde,
  station: Station,
  son: Son,
  voiture: Voiture,
  marcheur: Marcheur,
  paresseux: Paresseux,
  escargot: Escargot,
};

const Lampe = ({ allume }: { allume: boolean }) => (
  <g>
    <rect x={0} y={RAYON_Y - 90} width={40} height={180} fill="#3A3F49" />
    <path d={`M 40 ${RAYON_Y - 52} L ${RAYON_X - 20} ${RAYON_Y - 34} L ${RAYON_X - 20} ${RAYON_Y + 34} L 40 ${RAYON_Y + 52} Z`} fill="#20232A" />
    <circle cx={RAYON_X - 16} cy={RAYON_Y} r={24} fill={allume ? "#FFF4C2" : "#555"} />
  </g>
);

const Eclair = ({ t }: { t: number }) => {
  const opacite = interpolate(t, [calcul.t_fin, calcul.t_fin + 0.3], [1, 0], borne);
  return opacite > 0 ? <rect x={0} y={0} width={1080} height={1920} fill="#FFFFFF" opacity={opacite} /> : null;
};

// Épilogue : l'écran du spectateur, ses yeux, et la lumière qui rampe entre les deux
const Epilogue = ({ t }: { t: number }) => {
  const eteint = t >= calcul.t_patte;
  const lente = interpolate(t, [calcul.t_coupe, calcul.t_retour], [0, 0.32], borne);
  const progres = t < calcul.t_retour ? lente : 0.32 + 0.68 * lisse(entre(t, calcul.t_retour, calcul.t_fin));
  const xImpulsion = interpolate(progres, [0, 1], [700, 350]);
  const flash = interpolate(t, [calcul.t_patte, calcul.t_patte + 0.3], [1, 0], borne);
  const Y = 830;
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1920} fill="#08090D" />
      <rect x={0} y={SOL_Y} width={1080} height={1920 - SOL_Y} fill="#13131A" />

      <path d={`M 90 ${Y} Q 225 ${Y - 130} 360 ${Y} Q 225 ${Y + 130} 90 ${Y} Z`} fill="#F4F1E6" />
      <circle cx={245} cy={Y} r={58} fill="#2F7FA8" />
      <circle cx={255} cy={Y} r={28} fill="#08090D" />
      <circle cx={235} cy={Y - 18} r={10} fill="#FFFFFF" />

      <rect x={710} y={Y - 240} width={260} height={480} rx={36} fill="#2C2F38" />
      <rect x={728} y={Y - 214} width={224} height={428} rx={14} fill={eteint ? "#050507" : "#FFE9A8"} />

      <rect x={xImpulsion - 34} y={Y - 12} width={68} height={24} rx={12} fill={RAYON} />
      <circle cx={xImpulsion - 34} cy={Y} r={18} fill="#FFF4C2" />

      {eteint && flash > 0 && <rect x={0} y={0} width={1080} height={1920} fill="#FFFFFF" opacity={flash * 0.8} />}
    </g>
  );
};

export const SceneLight = ({ t }: SceneProps) => {
  const n = pasDecor(t);
  const palette = paletteA(t);

  if (t >= calcul.t_coupe && t < calcul.t_fin) {
    return (
      <AbsoluteFill style={{ backgroundColor: "#08090D" }}>
        <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
          <Epilogue t={t} />
        </svg>
      </AbsoluteFill>
    );
  }

  const sol = interpolateColors(n, [0, 12, 17.4, 17.9, 37, 62], ["#E8B04A", "#C98F2C", "#C98F2C", "#1A3B4E", "#0A2A38", "#13131A"]);
  const temps = t >= calcul.t_fin ? 0 : Math.min(t, calcul.t_limite);
  const plein = 1 - entre(n, 2, 6);
  const espacement = EMISSION_S * VITESSE_0 * Math.exp(-FREIN * temps);
  const largeur = Math.min(Math.max(14, espacement * 0.55), 160);

  const impulsions: { x: number; i: number }[] = [];
  for (let i = 0; i * EMISSION_S <= temps; i++) {
    const x = RAYON_X + (VITESSE_0 / FREIN) * (Math.exp(-FREIN * i * EMISSION_S) - Math.exp(-FREIN * temps));
    if (x < 1040) {
      impulsions.push({ x, i });
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <rect x={0} y={SOL_Y} width={1080} height={1920 - SOL_Y} fill={sol} />
        <rect x={1040} y={RAYON_Y - 90} width={40} height={180} fill="#3A3F49" />

        {plein > 0 && <rect x={RAYON_X} y={RAYON_Y - 17} width={1040 - RAYON_X} height={34} fill={RAYON} opacity={plein} />}
        {t < calcul.t_fin &&
          impulsions.map(({ x, i }) => <rect key={i} x={x - largeur} y={RAYON_Y - 17} width={largeur} height={34} rx={10} fill={RAYON} opacity={1 - plein} />)}
        <Lampe allume />

        {/* Ce qui a dépassé la lumière reste affiché le long du sol */}
        {calcul.paliers.map((p, i) => {
          const age = t - p.arrivee_s;
          if (age < 3 || t >= calcul.t_fin) {
            return null;
          }
          const Icone = ICONES[p.cle];
          return (
            <g key={p.cle} transform={`translate(${130 + i * 102} ${PLACE_Y}) scale(0.72)`}>
              <circle cx={0} cy={0} r={62} fill="#FFF4D8" opacity={0.16} />
              <Icone />
            </g>
          );
        })}

        {/* Chaque palier dépasse le rayon, de gauche à droite */}
        {calcul.paliers.map((p) => {
          const age = t - p.arrivee_s;
          if (age < 0 || age >= 3) {
            return null;
          }
          const Icone = ICONES[p.cle];
          const x = interpolate(age, [0, 0.35, 2.3, 3], [-260, 470, 640, 1340], borne);
          return (
            <g key={p.cle} transform={`translate(${x} ${COURSE_Y}) scale(2.5)`}>
              <circle cx={0} cy={0} r={72} fill="#FFF4D8" opacity={0.18} />
              <Icone />
            </g>
          );
        })}

        {t >= calcul.t_fin && <Eclair t={t} />}
      </svg>
    </AbsoluteFill>
  );
};
