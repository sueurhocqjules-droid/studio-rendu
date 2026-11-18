import type { FC } from "react";
import { AbsoluteFill, interpolate, random } from "remotion";
import calcul from "../../../sujets/rope.calcul.json";
import type { SceneProps } from "../../cadre/types";
import { entre, lisse, paletteA, pasEchelle } from "./temps";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Le lacet garde toujours la même taille à l'écran : c'est le monde qui rapetisse de moitié chaque seconde
const X = 300;
const BAS = 1180;
const HAUT_PX = 680;
const LACET = "#E8442E";
const OBJ_X = 640;

type Dessin = FC<{ k: number }>;

const Lacet = ({ haut, couleur = LACET }: { haut: number; couleur?: string }) => {
  const points = Array.from({ length: 25 }, (_, i) => {
    const y = BAS - (i / 24) * (BAS - haut);
    return `${X + Math.sin(i * 0.9) * 9} ${y}`;
  });
  return (
    <g>
      <path d={`M ${points.join(" L ")}`} fill="none" stroke="#1F1B16" strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M ${points.join(" L ")}`} fill="none" stroke={couleur} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={X - 9} y={haut - 34} width={18} height={40} rx={4} fill="#1F1B16" />
    </g>
  );
};

// Une basket stylisée, sans marque
const Basket = ({ x, y, longueur }: { x: number; y: number; longueur: number }) => {
  const s = longueur / 300;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -150 0 L -150 -60 C -150 -110 -100 -120 -60 -110 L 20 -60 C 80 -40 150 -40 150 -10 L 150 0 Z" fill="#F4F1E6" stroke="#1F1B16" strokeWidth={8} />
      <rect x={-156} y={-14} width={312} height={22} rx={8} fill="#1F1B16" />
      <path d="M -90 -105 L 10 -55" stroke={LACET} strokeWidth={10} />
      {[-70, -40, -10].map((dx) => (
        <line key={dx} x1={dx} y1={-90 + (dx + 70) * 0.5} x2={dx + 26} y2={-104 + (dx + 70) * 0.5} stroke={LACET} strokeWidth={8} />
      ))}
    </g>
  );
};

const Bus: Dessin = ({ k }) => {
  const w = k * 12;
  const h = w * 0.27;
  return (
    <g>
      <rect x={OBJ_X - 60} y={BAS - h - w * 0.04} width={w} height={h} rx={w * 0.03} fill="#F2B632" />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={OBJ_X - 60 + w * (0.08 + i * 0.14)} y={BAS - h * 0.95} width={w * 0.1} height={h * 0.38} fill="#3A4A5A" />
      ))}
      <circle cx={OBJ_X - 60 + w * 0.2} cy={BAS - w * 0.04} r={w * 0.05} fill="#1F1B16" />
      <circle cx={OBJ_X - 60 + w * 0.8} cy={BAS - w * 0.04} r={w * 0.05} fill="#1F1B16" />
    </g>
  );
};

const Terrain: Dessin = ({ k }) => {
  const w = k * 105;
  const h = k * 68;
  const x = OBJ_X - 120;
  const y = BAS - h - 20;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#3E9B4F" stroke="#FFFFFF" strokeWidth={Math.max(2, w * 0.006)} />
      <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#FFFFFF" strokeWidth={Math.max(2, w * 0.006)} />
      <circle cx={x + w / 2} cy={y + h / 2} r={h * 0.13} fill="none" stroke="#FFFFFF" strokeWidth={Math.max(2, w * 0.006)} />
      <rect x={x} y={y + h * 0.2} width={w * 0.16} height={h * 0.6} fill="none" stroke="#FFFFFF" strokeWidth={Math.max(2, w * 0.006)} />
      <rect x={x + w * 0.84} y={y + h * 0.2} width={w * 0.16} height={h * 0.6} fill="none" stroke="#FFFFFF" strokeWidth={Math.max(2, w * 0.006)} />
    </g>
  );
};

const Burj: Dessin = ({ k }) => {
  const h = k * 828;
  const b = h * 0.09;
  return (
    <path
      d={`M ${OBJ_X - b} ${BAS} L ${OBJ_X - b * 0.6} ${BAS - h * 0.35} L ${OBJ_X - b * 0.35} ${BAS - h * 0.62} L ${OBJ_X - b * 0.12} ${BAS - h * 0.82} L ${OBJ_X} ${BAS - h} L ${OBJ_X + b * 0.12} ${BAS - h * 0.82} L ${OBJ_X + b * 0.35} ${BAS - h * 0.62} L ${OBJ_X + b * 0.6} ${BAS - h * 0.35} L ${OBJ_X + b} ${BAS} Z`}
      fill="#6F8FA6"
    />
  );
};

const Everest: Dessin = ({ k }) => {
  const h = k * 8848.86;
  return (
    <g>
      <path d={`M ${OBJ_X - h * 1.1} ${BAS} L ${OBJ_X} ${BAS - h} L ${OBJ_X + h * 1.1} ${BAS} Z`} fill="#6A7684" />
      <path d={`M ${OBJ_X - h * 0.28} ${BAS - h * 0.75} L ${OBJ_X} ${BAS - h} L ${OBJ_X + h * 0.28} ${BAS - h * 0.75} L ${OBJ_X + h * 0.1} ${BAS - h * 0.8} L ${OBJ_X - h * 0.08} ${BAS - h * 0.72} Z`} fill="#FFFFFF" />
    </g>
  );
};

// Paris en bas, Londres en haut : une petite tour en treillis et une tour d'horloge
const ParisLondres: Dessin = ({ k }) => {
  const d = k * 344000;
  return (
    <g>
      <line x1={OBJ_X} y1={BAS - 20} x2={OBJ_X} y2={BAS - d + 30} stroke="#0F1E28" strokeWidth={5} strokeDasharray="14 12" />
      <g transform={`translate(${OBJ_X} ${BAS})`}>
        <path d="M -34 0 L -6 -90 L 6 -90 L 34 0 L 20 0 L 0 -50 L -20 0 Z" fill="#5B4A3A" />
        <rect x={-22} y={-40} width={44} height={8} fill="#5B4A3A" />
      </g>
      <g transform={`translate(${OBJ_X} ${BAS - d})`}>
        <rect x={-16} y={-30} width={32} height={110} fill="#B08A4E" />
        <circle cx={0} cy={-6} r={11} fill="#F4F1E6" />
        <path d="M -20 -30 L 0 -64 L 20 -30 Z" fill="#5B4A3A" />
      </g>
    </g>
  );
};

const Globe = ({ x, y, r }: { x: number; y: number; r: number }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="#2C7DA0" />
    <path d={`M ${x - r * 0.5} ${y - r * 0.6} C ${x - r * 0.1} ${y - r * 0.7} ${x + r * 0.1} ${y - r * 0.2} ${x - r * 0.2} ${y + r * 0.1} C ${x - r * 0.5} ${y + r * 0.3} ${x - r * 0.8} ${y - r * 0.1} ${x - r * 0.5} ${y - r * 0.6} Z`} fill="#4E9A5B" />
    <path d={`M ${x + r * 0.3} ${y + r * 0.1} C ${x + r * 0.7} ${y} ${x + r * 0.8} ${y + r * 0.5} ${x + r * 0.4} ${y + r * 0.7} C ${x + r * 0.2} ${y + r * 0.5} ${x + r * 0.1} ${y + r * 0.3} ${x + r * 0.3} ${y + r * 0.1} Z`} fill="#4E9A5B" />
  </g>
);

const Tour: Dessin = ({ k }) => {
  const r = (k * 2 * Math.PI * 6378137) / (2 * Math.PI);
  return (
    <g>
      <Globe x={OBJ_X + 60} y={BAS - r - 40} r={r} />
      <circle cx={OBJ_X + 60} cy={BAS - r - 40} r={r + 7} fill="none" stroke={LACET} strokeWidth={9} />
    </g>
  );
};

const Lune: Dessin = ({ k }) => {
  const d = k * 384400000;
  return (
    <g>
      <Globe x={OBJ_X} y={BAS - 10} r={Math.max(10, k * 6371000)} />
      <circle cx={OBJ_X} cy={BAS - d} r={Math.max(12, k * 1737400)} fill="#C9C6BC" />
    </g>
  );
};

const Soleil: Dessin = ({ k }) => {
  const d = k * 149597870700;
  return (
    <g>
      <circle cx={OBJ_X} cy={BAS - 10} r={7} fill="#2C7DA0" />
      <circle cx={OBJ_X} cy={BAS - d} r={Math.max(26, k * 696340000) + 14} fill="#FFB23F" opacity={0.35} />
      <circle cx={OBJ_X} cy={BAS - d} r={Math.max(26, k * 696340000)} fill="#FFC94A" />
    </g>
  );
};

const Voyager: Dessin = ({ k }) => {
  const d = k * 299792458 * 86400;
  return (
    <g>
      <circle cx={OBJ_X} cy={BAS - 10} r={9} fill="#FFC94A" />
      <g transform={`translate(${OBJ_X} ${BAS - d})`}>
        <path d="M -40 -6 A 40 40 0 0 0 40 -6 Z" fill="#E6E2D6" />
        <rect x={-6} y={-6} width={12} height={34} fill="#BFC6D2" />
        <line x1={0} y1={28} x2={70} y2={60} stroke="#BFC6D2" strokeWidth={4} />
        <line x1={0} y1={20} x2={-60} y2={50} stroke="#BFC6D2" strokeWidth={4} />
      </g>
    </g>
  );
};

const DESSINS: Record<string, Dessin> = {
  bus: Bus,
  terrain: Terrain,
  burj: Burj,
  everest: Everest,
  parislondres: ParisLondres,
  tour: Tour,
  lune: Lune,
  soleil: Soleil,
  voyager: Voyager,
};

const Etoiles = ({ opacite }: { opacite: number }) => (
  <g opacity={opacite}>
    {Array.from({ length: 50 }, (_, i) => (
      <circle key={i} cx={random(`s-x-${i}`) * 1080} cy={500 + random(`s-y-${i}`) * 760} r={1.5 + random(`s-r-${i}`) * 2.5} fill="#FFF3E2" />
    ))}
  </g>
);

const Sol = ({ opacite }: { opacite: number }) => <rect x={0} y={BAS} width={1080} height={140} fill="#8C857A" opacity={opacite} />;

// Une horloge qui tourne à toute vitesse pendant que la lumière rampe le long du lacet
const Horloge = ({ t }: { t: number }) => {
  const a = (t - calcul.t_coupe) * 720;
  return (
    <g transform="translate(720 820)">
      <circle cx={0} cy={0} r={110} fill="#FFF3E2" stroke="#FF8A4C" strokeWidth={12} />
      <line x1={0} y1={0} x2={0} y2={-80} stroke="#1F1B16" strokeWidth={10} strokeLinecap="round" transform={`rotate(${a})`} />
      <line x1={0} y1={0} x2={0} y2={-55} stroke="#1F1B16" strokeWidth={14} strokeLinecap="round" transform={`rotate(${a / 12})`} />
      <circle cx={0} cy={0} r={10} fill="#1F1B16" />
    </g>
  );
};

const Epilogue = ({ t }: { t: number }) => {
  const zoom = lisse(entre(t, calcul.t_patte, calcul.t_patte + 0.8));
  const progres = (t - calcul.t_coupe) / (calcul.heures * 3600);
  const yLumiere = BAS - 30 - progres * HAUT_PX;
  const pointe = t >= calcul.t_qui && zoom === 0;
  if (zoom > 0) {
    return (
      <g>
        <Etoiles opacite={1} />
        <g opacity={zoom}>
          <path d={`M 470 1010 C 520 800 380 640 470 420 C 520 300 470 200 500 0`} fill="none" stroke="#1F1B16" strokeWidth={30} strokeLinecap="round" />
          <path d={`M 470 1010 C 520 800 380 640 470 420 C 520 300 470 200 500 0`} fill="none" stroke={LACET} strokeWidth={20} strokeLinecap="round" />
          <Basket x={540} y={1150} longueur={620} />
        </g>
      </g>
    );
  }
  return (
    <g>
      <Etoiles opacite={1} />
      <Lacet haut={BAS - HAUT_PX} />
      <circle cx={X} cy={yLumiere} r={26} fill="#FFF6C8" opacity={0.4} />
      <circle cx={X} cy={yLumiere} r={13} fill="#FFF6C8" />
      {!pointe && <Horloge t={t} />}
      {pointe && (
        <g>
          {[0, 1, 2, 3, 4].map((i) => {
            const y = BAS - HAUT_PX - 60 - (((t - calcul.t_qui) * 900 + i * 70) % 340);
            return <rect key={i} x={X - 4 + (i % 2 ? 16 : -16)} y={y} width={8} height={50} rx={4} fill="#FF8A4C" opacity={0.8} />;
          })}
          <circle cx={X} cy={BAS - HAUT_PX - 14} r={30 + Math.sin(t * 20) * 6} fill="#FF8A4C" opacity={0.35} />
        </g>
      )}
    </g>
  );
};

export const SceneRope = ({ t }: SceneProps) => {
  const palette = paletteA(t);

  if (t >= calcul.t_coupe && t < calcul.t_retour) {
    return (
      <AbsoluteFill style={{ backgroundColor: palette.fond }}>
        <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
          <Epilogue t={t} />
        </svg>
      </AbsoluteFill>
    );
  }

  const pas = pasEchelle(t);
  const k = HAUT_PX / (calcul.l0_m * Math.pow(calcul.facteur, pas));
  const manche = calcul.paliers.find((p) => p.cle === "parislondres")?.pas ?? 0;
  const espace = entre(pas, manche + 1, manche + 2);
  const flash = t >= calcul.t_retour ? interpolate(t, [calcul.t_retour, calcul.t_retour + 0.35], [1, 0], borne) : 0;
  const chaussure = k * calcul.chaussure_m;

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <defs>
          <clipPath id="rope-cadre">
            <rect x={0} y={500} width={1080} height={820} />
          </clipPath>
        </defs>
        <g clipPath="url(#rope-cadre)">
          {espace > 0 && <Etoiles opacite={espace} />}
          <Sol opacite={1 - espace} />
          {calcul.paliers.map((p) => {
            const taille = k * p.m;
            if (taille < HAUT_PX * 0.03 || taille > HAUT_PX * 2.6) {
              return null;
            }
            const Dessin = DESSINS[p.cle];
            return (
              <g key={p.cle} opacity={interpolate(taille, [HAUT_PX * 0.03, HAUT_PX * 0.08], [0, 1], borne)}>
                <Dessin k={k} />
              </g>
            );
          })}
          <Lacet haut={BAS - HAUT_PX} />
          {chaussure > 6 && <Basket x={X + chaussure * 0.15} y={BAS} longueur={chaussure} />}
        </g>
        {flash > 0 && <rect x={0} y={0} width={1080} height={1920} fill="#FFFFFF" opacity={flash} />}
      </svg>
    </AbsoluteFill>
  );
};
