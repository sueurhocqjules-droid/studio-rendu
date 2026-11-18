import type { FC } from "react";
import { AbsoluteFill, interpolate, random } from "remotion";
import calcul from "../../../sujets/sneeze.calcul.json";
import type { SceneProps } from "../../cadre/types";
import { entre, lisse, paletteA, pasDecor, vitesse } from "./temps";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const CX = 600;
const CY = 790;
const PISTE_Y = 1040;
const NUAGE = "#D9F7E8";
const BORD = "#5FAF8E";

// Le nuage d'éternuement : des gouttes groupées, toujours les mêmes
const GOUTTES = Array.from({ length: 13 }, (_, i) => ({
  dx: (random(`g-x-${i}`) - 0.5) * 170,
  dy: (random(`g-y-${i}`) - 0.5) * 110,
  r: 34 + random(`g-r-${i}`) * 34,
}));

const Nuage = ({ x, y, etire, sx }: { x: number; y: number; etire: number; sx: number }) => (
  <g transform={`translate(${x} ${y}) scale(${sx * (1 + etire)} ${1 / (1 + etire * 0.4)})`}>
    {GOUTTES.map((g, i) => (
      <circle key={`b${i}`} cx={g.dx} cy={g.dy} r={g.r + 6} fill={BORD} />
    ))}
    {GOUTTES.map((g, i) => (
      <circle key={i} cx={g.dx} cy={g.dy} r={g.r} fill={NUAGE} />
    ))}
    {[-60, -20, 30].map((dx, i) => (
      <circle key={`p${i}`} cx={dx + 30} cy={-30 + i * 12} r={9} fill="#FFFFFF" opacity={0.8} />
    ))}
  </g>
);

// Un nez de dessin animé, pas une personne
const Nez = ({ x }: { x: number }) => (
  <g transform={`translate(${x} 0)`}>
    <path d="M -40 520 C 120 560 200 760 250 830 C 270 860 250 900 210 905 L -40 905 Z" fill="#F0B38E" />
    <ellipse cx={170} cy={880} rx={30} ry={16} fill="#B9735A" />
    <path d="M 60 650 C 120 720 150 780 160 820" fill="none" stroke="#D99273" strokeWidth={10} strokeLinecap="round" />
  </g>
);

const Guepard = () => (
  <g>
    <path d="M -60 -6 C -90 -30 -110 -10 -120 -30" fill="none" stroke="#C88A2A" strokeWidth={8} strokeLinecap="round" />
    <ellipse cx={0} cy={0} rx={64} ry={24} fill="#E2A93B" />
    <circle cx={66} cy={-14} r={20} fill="#E2A93B" />
    <circle cx={74} cy={-18} r={3.5} fill="#1C1C1C" />
    {[-36, -14, 10, 32].map((x, i) => (
      <circle key={i} cx={x} cy={(i % 2) * 8 - 6} r={5} fill="#2B2112" />
    ))}
    <path d="M -40 18 L -64 44 M -24 18 L -6 46 M 26 18 L 4 46 M 44 16 L 70 40" stroke="#C88A2A" strokeWidth={9} strokeLinecap="round" />
  </g>
);

const Bolide = () => (
  <g>
    <path d="M -90 10 L -70 -12 L -10 -16 L 10 -34 L 30 -16 L 90 -6 L 96 12 Z" fill="#D8352A" />
    <rect x={-100} y={-34} width={22} height={30} fill="#1C2328" />
    <rect x={88} y={-4} width={16} height={18} fill="#1C2328" />
    <circle cx={-54} cy={16} r={20} fill="#1C2328" />
    <circle cx={56} cy={16} r={20} fill="#1C2328" />
    <circle cx={10} cy={-24} r={9} fill="#F6E3B4" />
  </g>
);

const Son = () => (
  <g>
    <polygon points="-70,-22 -40,-22 -6,-52 -6,52 -40,22 -70,22" fill="#F4F1E6" stroke="#1C2328" strokeWidth={5} />
    {[26, 50, 74].map((r) => (
      <path key={r} d={`M ${r * 0.7} ${-r * 0.7} A ${r} ${r} 0 0 1 ${r * 0.7} ${r * 0.7}`} fill="none" stroke="#F28C28" strokeWidth={10} strokeLinecap="round" />
    ))}
  </g>
);

const Balle = () => (
  <g>
    <rect x={-70} y={-16} width={80} height={32} fill="#C9962E" />
    <path d="M 10 -16 L 40 -16 C 70 -12 84 -4 90 0 C 84 4 70 12 40 16 L 10 16 Z" fill="#B66A2C" />
    <rect x={-76} y={-18} width={8} height={36} fill="#8A6A22" />
  </g>
);

const Fusee = () => (
  <g>
    <path d="M -110 0 L -70 -14 L -70 14 Z" fill="#FFB23F" />
    <rect x={-70} y={-22} width={110} height={44} rx={8} fill="#F4F1E6" />
    <path d="M 40 -22 C 80 -18 96 -4 100 0 C 96 4 80 18 40 22 Z" fill="#C8322B" />
    <path d="M -70 -22 L -86 -44 L -40 -22 Z M -70 22 L -86 44 L -40 22 Z" fill="#C8322B" />
    <circle cx={10} cy={0} r={10} fill="#3B7BB4" />
  </g>
);

const Sonde = () => (
  <g>
    <rect x={-60} y={-14} width={70} height={28} fill="#BFC6D2" />
    <rect x={-40} y={-54} width={14} height={108} fill="#2F6FB0" />
    <ellipse cx={34} cy={0} rx={16} ry={58} fill="#F2E7CF" stroke="#1C2328" strokeWidth={4} />
  </g>
);

const Etoile = () => (
  <g>
    <path d="M -140 -10 L 0 -30 L 0 30 L -140 10 Z" fill="#FFE9A8" opacity={0.5} />
    <circle cx={0} cy={0} r={44} fill="#FFE9A8" />
    <circle cx={0} cy={0} r={30} fill="#FFFFFF" />
  </g>
);

const Globe = ({ r }: { r: number }) => (
  <g>
    <circle cx={0} cy={0} r={r} fill="#2C7DA0" />
    <path d={`M ${-r * 0.5} ${-r * 0.6} C ${-r * 0.1} ${-r * 0.7} ${r * 0.1} ${-r * 0.2} ${-r * 0.2} ${r * 0.1} C ${-r * 0.5} ${r * 0.3} ${-r * 0.8} ${-r * 0.1} ${-r * 0.5} ${-r * 0.6} Z`} fill="#4E9A5B" />
    <path d={`M ${r * 0.3} ${r * 0.1} C ${r * 0.7} ${0} ${r * 0.8} ${r * 0.5} ${r * 0.4} ${r * 0.7} C ${r * 0.2} ${r * 0.5} ${r * 0.1} ${r * 0.3} ${r * 0.3} ${r * 0.1} Z`} fill="#4E9A5B" />
  </g>
);

const Tour = () => (
  <g>
    <Globe r={60} />
    <ellipse cx={0} cy={0} rx={96} ry={30} fill="none" stroke="#8DF0C4" strokeWidth={6} />
  </g>
);

const Lune = () => (
  <g>
    <circle cx={0} cy={0} r={70} fill="#C9C6BC" />
    <circle cx={-22} cy={-18} r={14} fill="#A9A59A" />
    <circle cx={24} cy={20} r={20} fill="#A9A59A" />
    <circle cx={30} cy={-30} r={8} fill="#A9A59A" />
  </g>
);

const RIVAUX: Record<string, FC> = {
  guepard: Guepard,
  f1: Bolide,
  son: Son,
  balle: Balle,
  liberation: Fusee,
  sonde: Sonde,
  etoile: Etoile,
  tour: Tour,
  lune: Lune,
};

const defile = (t: number, vitessePx: number, periode: number) => -((t * vitessePx) % periode);

// Le décor du moment : un lieu par étape, de la savane à la Lune
const Decor = ({ zone, t }: { zone: number; t: number }) => {
  const v = 260 + zone * 220;
  if (zone === 0) {
    const d = defile(t, v, 540);
    return (
      <g>
        <rect x={0} y={PISTE_Y - 40} width={1080} height={300} fill="#D9B65E" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${d + i * 540 + 200} ${PISTE_Y - 40})`}>
            <rect x={-8} y={-150} width={16} height={150} fill="#6B4A2A" />
            <ellipse cx={0} cy={-160} rx={110} ry={34} fill="#6E8B3D" />
          </g>
        ))}
      </g>
    );
  }
  if (zone === 1) {
    const d = defile(t, v * 2, 120);
    return (
      <g>
        <rect x={0} y={PISTE_Y - 70} width={1080} height={300} fill="#4A4E55" />
        {Array.from({ length: 11 }, (_, i) => (
          <rect key={i} x={d + i * 120} y={PISTE_Y - 70} width={60} height={22} fill={i % 2 ? "#FFFFFF" : "#C8322B"} />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={`l${i}`} x={d * 2 + i * 240} y={PISTE_Y + 70} width={120} height={10} fill="#F4F1E6" />
        ))}
      </g>
    );
  }
  if (zone <= 3) {
    const d = defile(t, v, 1400);
    return (
      <g>
        {[0, 1].map((k) =>
          [
            [200, 600, 1.2],
            [760, 680, 0.9],
            [1100, 560, 1],
            [480, 1080, 1.3],
            [1250, 1000, 0.8],
          ].map(([x, y, s], i) => (
            <g key={`${k}-${i}`} transform={`translate(${d + k * 1400 + x} ${y}) scale(${s})`} opacity={0.85}>
              <ellipse cx={0} cy={0} rx={110} ry={34} fill="#FFFFFF" />
              <ellipse cx={-30} cy={-24} rx={50} ry={34} fill="#FFFFFF" />
              <ellipse cx={40} cy={-18} rx={44} ry={28} fill="#FFFFFF" />
            </g>
          )),
        )}
      </g>
    );
  }
  if (zone === 4) {
    return (
      <g>
        <circle cx={540} cy={2600} r={1500} fill="#2C7DA0" />
        <circle cx={540} cy={2600} r={1500} fill="none" stroke="#BFE4F2" strokeWidth={30} opacity={0.5} />
      </g>
    );
  }
  const etoiles = (longueur: number) =>
    Array.from({ length: 40 }, (_, i) => {
      const y = 500 + random(`e-y-${i}`) * 720;
      const x = ((random(`e-x-${i}`) * 1400 - t * v * (0.5 + random(`e-v-${i}`))) % 1400 + 1400) % 1400 - 160;
      return <rect key={i} x={x} y={y} width={longueur} height={4} rx={2} fill="#FFF2DC" opacity={0.7} />;
    });
  if (zone === 5) {
    return (
      <g>
        {etoiles(8)}
        <circle cx={60} cy={760} r={330} fill="#FF8A1F" opacity={0.35} />
        <circle cx={60} cy={760} r={260} fill="#FFB23F" />
      </g>
    );
  }
  if (zone === 6) {
    return <g>{etoiles(120)}</g>;
  }
  if (zone === 7) {
    return (
      <g>
        {etoiles(30)}
        <g transform="translate(540 1220)">
          <Globe r={300} />
        </g>
      </g>
    );
  }
  return (
    <g>
      {etoiles(20)}
      <g transform="translate(130 1080)">
        <Globe r={90} />
      </g>
      {zone >= 9 && (
        <g transform="translate(930 620) scale(1.1)">
          <Lune />
        </g>
      )}
    </g>
  );
};

const Traits = ({ t, pas }: { t: number; pas: number }) => {
  const longueur = Math.min(520, 30 + pas * 12);
  const v = 600 + pas * 120;
  return (
    <g>
      {Array.from({ length: 9 }, (_, i) => {
        const y = CY - 150 + random(`t-y-${i}`) * 300;
        const x = ((random(`t-x-${i}`) * 1300 - t * v) % 1300 + 1300) % 1300 - 200;
        return <rect key={i} x={x} y={y} width={longueur} height={8} rx={4} fill={BORD} opacity={0.55} />;
      })}
    </g>
  );
};

// Épilogue : un mur de lumière que l'éternuement ne peut pas franchir, puis un mouchoir
const Epilogue = ({ t }: { t: number }) => {
  const arrivee = lisse(entre(t, calcul.t_coupe, calcul.t_coupe + 1.2));
  const ecrase = lisse(entre(t, calcul.t_qui, calcul.t_qui + 0.4));
  const mouchoir = lisse(entre(t, calcul.t_patte, calcul.t_patte + 0.8));
  const xNuage = interpolate(arrivee, [0, 1], [300, 640]) + ecrase * 60;
  const tremble = ecrase > 0 && mouchoir === 0 ? Math.sin(t * 60) * 6 : 0;
  return (
    <g>
      <Decor zone={9} t={t} />
      <rect x={760} y={480} width={320} height={760} fill="#FFF6C8" opacity={0.25} />
      <rect x={760} y={480} width={46} height={760} fill="#FFF6C8" />
      <Nuage x={xNuage + tremble} y={CY} etire={0.6} sx={1 - ecrase * 0.45} />
      {ecrase > 0 && mouchoir < 1 && (
        <g transform="translate(540 600)" opacity={ecrase * (1 - mouchoir)}>
          <circle cx={0} cy={0} r={70} fill="none" stroke="#E2412F" strokeWidth={18} />
          <line x1={-50} y1={50} x2={50} y2={-50} stroke="#E2412F" strokeWidth={18} />
        </g>
      )}
      {mouchoir > 0 && (
        <g transform={`translate(${xNuage} ${interpolate(mouchoir, [0, 1], [-300, CY])}) rotate(${interpolate(mouchoir, [0, 1], [-25, -6])})`}>
          <rect x={-190} y={-170} width={380} height={340} rx={30} fill="#FFFFFF" />
          <path d="M -190 -60 C -60 -90 60 -30 190 -60 M -190 50 C -60 20 60 80 190 50" fill="none" stroke="#DCE6E8" strokeWidth={10} />
        </g>
      )}
    </g>
  );
};

export const SceneSneeze = ({ t }: SceneProps) => {
  const palette = paletteA(t);
  const pas = pasDecor(t);

  if (t >= calcul.t_coupe && t < calcul.t_retour) {
    return (
      <AbsoluteFill style={{ backgroundColor: palette.fond }}>
        <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
          <Epilogue t={t} />
        </svg>
      </AbsoluteFill>
    );
  }

  const zone = t >= calcul.t_retour ? 0 : calcul.paliers.filter((p) => t >= p.arrivee_s + 1.5).length;
  const depart = t >= calcul.t_retour ? 0 : lisse(entre(t, 0.05, 0.9));
  const xNez = t >= calcul.t_retour ? interpolate(t, [calcul.t_retour, calcul.t_retour + 0.6], [-320, 0], borne) : interpolate(t, [0.9, 2], [0, -340], borne);
  const nuageVisible = t < calcul.t_retour;
  const etire = Math.min(0.9, Math.log(vitesse(pas) / calcul.v0_m_s) / 60);
  const flash = t >= calcul.t_retour ? interpolate(t, [calcul.t_retour, calcul.t_retour + 0.35], [1, 0], borne) : 0;
  const mach = pas >= (calcul.paliers.find((p) => p.cle === "son")?.pas ?? 99) && zone < 4;

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <Decor zone={zone} t={t} />
        {nuageVisible && pas > 1 && <Traits t={t} pas={pas} />}

        {calcul.paliers.map((p) => {
          const age = t - p.arrivee_s;
          if (age < -2.4 || age > 2.4 || t >= calcul.t_retour) {
            return null;
          }
          const Rival = RIVAUX[p.cle];
          const x = interpolate(age, [-2.4, -0.4, 0, 2.4], [1350, 760, 620, -380], borne);
          return (
            <g key={p.cle} transform={`translate(${x} ${PISTE_Y - 30}) scale(1.7)`}>
              <Rival />
            </g>
          );
        })}

        {mach && (
          <path d={`M ${CX + 130} ${CY} L ${CX - 260} ${CY - 260} M ${CX + 130} ${CY} L ${CX - 260} ${CY + 260}`} stroke={palette.encre} strokeWidth={6} opacity={0.5} />
        )}
        {nuageVisible && (
          <Nuage x={interpolate(depart, [0, 1], [250, CX])} y={interpolate(depart, [0, 1], [880, CY])} etire={etire} sx={interpolate(depart, [0, 1], [0.35, 1])} />
        )}
        <Nez x={xNez} />
        {flash > 0 && <rect x={0} y={0} width={1080} height={1920} fill="#FFFFFF" opacity={flash} />}
      </svg>
    </AbsoluteFill>
  );
};
