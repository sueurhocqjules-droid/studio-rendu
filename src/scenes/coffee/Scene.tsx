import React from "react";
import { AbsoluteFill, interpolate, interpolateColors } from "remotion";
import calcul from "../../../sujets/coffee.calcul.json";
import type { Palette, SceneProps } from "../../cadre/types";
import { corpsNoir, paletteA, pasChaleur, secondeDe, temperature } from "./temps";

const LARGEUR = 1080;
const HAUTEUR = 1920;
const TABLE_Y = 1130;
const TASSE_X = 470;
const TASSE_L = 300;
const TASSE_H = 320;
const BOULE_Y = 830;

const N_BOUT = secondeDe("ebullition");
const N_PAPIER = secondeDe("papier");
const N_PLOMB = secondeDe("plomb");
const N_ALU = secondeDe("alu");
const N_LAVE = secondeDe("lave");
const N_TUNGSTENE = secondeDe("tungstene");
const N_SOLEIL = secondeDe("soleil");
const N_RIGEL = secondeDe("rigel");
const N_FOUDRE = secondeDe("foudre");

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

const hachage = (i: number, k = 0) => {
  let n = Math.imul(i + 1, 374761393) + Math.imul(k + 1, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};

type Decor = { t: number; n: number; feu: string; palette: Palette };

const Mur: React.FC<Decor> = ({ palette }) => (
  <g stroke={palette.accent} strokeWidth={3} opacity={0.16}>
    {Array.from({ length: 7 }, (_, k) => (
      <line key={`h${k}`} x1={0} y1={TABLE_Y - k * 180} x2={LARGEUR} y2={TABLE_Y - k * 180} />
    ))}
    {Array.from({ length: 7 }, (_, k) => (
      <line key={`v${k}`} x1={k * 180} y1={0} x2={k * 180} y2={TABLE_Y} />
    ))}
  </g>
);

const Table: React.FC<Decor> = ({ n }) => {
  const brule = entre(n, N_ALU, N_LAVE + 2);
  const bois = interpolateColors(brule, [0, 1], ["#8A5A33", "#2A1710"]);
  const dessus = interpolateColors(brule, [0, 1], ["#A87245", "#3A2015"]);
  return (
    <g>
      <rect x={0} y={TABLE_Y} width={LARGEUR} height={HAUTEUR - TABLE_Y} fill={bois} />
      <rect x={0} y={TABLE_Y} width={LARGEUR} height={26} fill={dessus} />
    </g>
  );
};

const Flamme: React.FC<{ x: number; y: number; h: number; t: number; graine: number }> = ({ x, y, h, t, graine }) => {
  const haut = h * (1 + Math.sin(t * 18 + graine * 7) * 0.14);
  const l = h * 0.34;
  return (
    <g>
      <path d={`M${x - l} ${y} Q${x - l * 0.9} ${y - haut * 0.55} ${x} ${y - haut} Q${x + l * 0.9} ${y - haut * 0.55} ${x + l} ${y} Z`} fill="#F2761B" />
      <path d={`M${x - l * 0.5} ${y} Q${x - l * 0.4} ${y - haut * 0.3} ${x} ${y - haut * 0.55} Q${x + l * 0.4} ${y - haut * 0.3} ${x + l * 0.5} ${y} Z`} fill="#FFD84A" />
    </g>
  );
};

// Une pile de feuilles à gauche de la tasse : elle prend feu, puis il reste la cendre
const Papier: React.FC<Decor> = ({ t, n }) => {
  const feu = entre(n, N_PAPIER - 1, N_PAPIER);
  const brule = entre(n, N_PAPIER + 0.5, N_PAPIER + 3);
  const h = 44 * (1 - brule);
  const x = 70;
  const l = 210;
  return (
    <g>
      <rect x={x} y={TABLE_Y - h} width={l} height={h} fill="#FBF6E9" stroke="#6B5A48" strokeWidth={3} />
      {h > 16 ? <line x1={x + 10} y1={TABLE_Y - h / 2} x2={x + l - 10} y2={TABLE_Y - h / 2} stroke="#B9AD98" strokeWidth={3} /> : null}
      <ellipse cx={x + l / 2} cy={TABLE_Y} rx={l * 0.55 * brule} ry={16 * brule} fill="#3E3A38" />
      {feu > 0 && brule < 1
        ? [0.15, 0.4, 0.65, 0.88].map((p, k) => (
            <Flamme key={p} x={x + l * p} y={TABLE_Y - h} h={(120 + k * 28) * feu * (1 - brule * 0.7)} t={t} graine={k} />
          ))
        : null}
    </g>
  );
};

// Un plomb de pêche à droite : il s'affaisse jusqu'à la flaque
const Plomb: React.FC<Decor> = ({ n }) => {
  const fonte = entre(n, N_PLOMB - 0.6, N_PLOMB + 1.2);
  return (
    <g transform={`translate(860 ${TABLE_Y}) scale(${1 + fonte * 1.3} ${1 - fonte * 0.88})`}>
      <circle cx={0} cy={-128} r={13} fill="none" stroke="#50585F" strokeWidth={7} />
      <path d="M0 -118 C26 -92 62 -56 62 -32 C62 -8 34 0 0 0 C-34 0 -62 -8 -62 -32 C-62 -56 -26 -92 0 -118 Z" fill="#6E7780" stroke="#3E454B" strokeWidth={4} />
      <path d="M-34 -36 Q-30 -56 -16 -72" fill="none" stroke="#A6AFB7" strokeWidth={7} strokeLinecap="round" />
    </g>
  );
};

const Cuillere: React.FC<Decor & { x: number; haut: number }> = ({ n, x, haut }) => {
  const fonte = entre(n, N_ALU - 1.8, N_ALU + 0.8);
  const bout = entre(n, N_ALU + 0.2, N_ALU + 1.6);
  const finX = x + 120 + 110 * (1 - fonte) + fonte * 70;
  const finY = haut - 230 * (1 - fonte) + fonte * 110;
  const controleY = haut - 110 - fonte * 50;
  const goutte = fonte > 0.2 && bout < 1;
  return (
    <g opacity={1 - bout}>
      <path d={`M${x + 60} ${haut + 14} Q${x + 150} ${controleY} ${finX} ${finY}`} fill="none" stroke="#C5CCD2" strokeWidth={20} strokeLinecap="round" />
      <path d={`M${x + 60} ${haut + 14} Q${x + 150} ${controleY} ${finX} ${finY}`} fill="none" stroke="#EEF1F3" strokeWidth={6} strokeLinecap="round" />
      {goutte ? <ellipse cx={finX} cy={finY + 20 + fonte * 34} rx={11} ry={17} fill="#D9DFE4" /> : null}
    </g>
  );
};

const Vapeur: React.FC<Decor> = ({ t, n }) => {
  const force = interpolate(n, [0, N_BOUT, N_PAPIER], [0.35, 1, 1], borne) * (1 - entre(n, N_ALU, N_ALU + 3));
  if (force <= 0) {
    return null;
  }
  const hauteur = 300 * force;
  return (
    <g fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeWidth={16}>
      {[-80, 0, 80].map((dx, k) => {
        const y0 = TABLE_Y - TASSE_H - 30;
        const pts = Array.from({ length: 9 }, (_, i) => {
          const y = y0 - (i / 8) * hauteur;
          const x = TASSE_X + dx + Math.sin(t * 3 + i * 0.8 + k * 2) * (8 + i * 4);
          return `${x} ${y}`;
        });
        return <polyline key={dx} points={pts.join(" ")} opacity={0.75} />;
      })}
    </g>
  );
};

const Tasse: React.FC<Decor> = (d) => {
  const { t, n, feu } = d;
  const fonte = entre(n, N_LAVE - 3, N_LAVE + 2);
  if (fonte >= 1) {
    return null;
  }
  const rouge = entre(n, N_ALU - 4, N_LAVE);
  const corps = interpolateColors(rouge, [0, 1], ["#F4EFE6", feu]);
  const bande = interpolateColors(rouge, [0, 1], ["#C8443A", feu]);
  const liquide = interpolateColors(entre(n, N_PLOMB, N_ALU), [0, 1], ["#3B2013", feu]);
  const tremble = Math.sin(t * 34) * Math.min(n / 8, 5);
  const h = TASSE_H * (1 - fonte);
  const l = TASSE_L * (1 + fonte * 0.3);
  const x = TASSE_X - l / 2 + tremble;
  const haut = TABLE_Y - h;
  const bouillons = entre(n, N_BOUT - 2, N_BOUT);
  return (
    <g>
      <path
        d={`M${x + l - 6} ${haut + h * 0.2} C${x + l + 110} ${haut + h * 0.14} ${x + l + 110} ${haut + h * 0.76} ${x + l - 6} ${haut + h * 0.7}`}
        fill="none"
        stroke={corps}
        strokeWidth={34}
        opacity={1 - fonte}
      />
      <Cuillere {...d} x={x + l / 2} haut={haut} />
      <path d={`M${x} ${haut} L${x + 12} ${TABLE_Y - 8} Q${x + 14} ${TABLE_Y} ${x + 30} ${TABLE_Y} L${x + l - 30} ${TABLE_Y} Q${x + l - 14} ${TABLE_Y} ${x + l - 12} ${TABLE_Y - 8} L${x + l} ${haut} Z`} fill={corps} />
      <rect x={x + 8} y={haut + h * 0.55} width={l - 16} height={h * 0.13} fill={bande} />
      <ellipse cx={x + l / 2} cy={haut} rx={l / 2} ry={38 * (1 - fonte)} fill={corps} />
      <ellipse cx={x + l / 2} cy={haut + 4} rx={l / 2 - 16} ry={28 * (1 - fonte)} fill={liquide} />
      {bouillons > 0
        ? Array.from({ length: 9 }, (_, k) => {
            const cycle = (t * 2.4 + hachage(k, 1)) % 1;
            return (
              <circle
                key={k}
                cx={x + 50 + hachage(k, 2) * (l - 100)}
                cy={haut - 8 + hachage(k, 3) * 22}
                r={(4 + cycle * 14) * bouillons}
                fill="none"
                stroke={interpolateColors(rouge, [0, 1], ["#C89B6B", "#FFF4CC"])}
                strokeWidth={4}
                opacity={1 - cycle}
              />
            );
          })
        : null}
    </g>
  );
};

const Flaque: React.FC<Decor> = ({ n, feu }) => {
  const fonte = entre(n, N_LAVE - 2, N_LAVE + 2);
  const monte = entre(n, N_TUNGSTENE - 4, N_TUNGSTENE);
  if (fonte <= 0 || monte >= 1) {
    return null;
  }
  return <ellipse cx={TASSE_X} cy={TABLE_Y + 6} rx={(160 + fonte * 300) * (1 - monte * 0.6)} ry={(12 + fonte * 26) * (1 - monte * 0.6)} fill={feu} />;
};

// La flaque met le feu à la table, du centre vers les bords
const Incendie: React.FC<Decor> = ({ t, n }) => {
  const part = entre(n, N_LAVE + 0.5, N_TUNGSTENE - 3);
  const fin = entre(n, N_TUNGSTENE + 0.6, N_SOLEIL - 1);
  if (part <= 0 || fin >= 1) {
    return null;
  }
  return (
    <g>
      {Array.from({ length: 15 }, (_, k) => {
        const x = 20 + k * 74;
        const seuil = Math.abs(x - TASSE_X) / 620;
        const force = interpolate(part, [seuil, seuil + 0.2], [0, 1], borne);
        if (force <= 0) {
          return null;
        }
        return <Flamme key={k} x={x} y={TABLE_Y + 6} h={(130 + hachage(k, 8) * 170) * force} t={t} graine={k} />;
      })}
    </g>
  );
};

const Ampoule: React.FC<Decor> = ({ t, n }) => {
  const x = 860;
  const y = 500;
  const casse = entre(n, N_TUNGSTENE - 0.4, N_TUNGSTENE + 0.3);
  const chaleur = entre(n, N_LAVE, N_TUNGSTENE);
  const filament = interpolateColors(chaleur, [0, 1], ["#E0902B", "#FFFDF0"]);
  return (
    <g>
      <line x1={x} y1={0} x2={x} y2={y - 86} stroke="#2A1A10" strokeWidth={7} />
      <rect x={x - 24} y={y - 92} width={48} height={40} fill="#50585F" />
      {casse < 1 ? (
        <g>
          <circle cx={x} cy={y} r={62} fill="#FFF3C4" stroke="#B48A3C" strokeWidth={4} opacity={0.9} />
          <path d={`M${x - 24} ${y + 4} l12 -22 l12 22 l12 -22 l12 22`} fill="none" stroke={filament} strokeWidth={7} />
        </g>
      ) : null}
      {casse > 0 && casse < 1
        ? Array.from({ length: 12 }, (_, k) => {
            const a = hachage(k, 4) * Math.PI * 2;
            const r = 60 + casse * 260;
            return <rect key={k} x={x + Math.cos(a) * r} y={y + Math.sin(a) * r + casse * 90} width={18} height={10} fill="#FFF3C4" transform={`rotate(${t * 300 + k * 40} ${x + Math.cos(a) * r} ${y + Math.sin(a) * r})`} />;
          })
        : null}
    </g>
  );
};

// La pièce disparaît dans un cercle qui part de la tasse
const Balayage: React.FC<Decor> = ({ n, feu, palette }) => {
  const part = entre(n, N_TUNGSTENE + 0.6, N_SOLEIL - 0.4);
  if (part <= 0) {
    return null;
  }
  const r = 1900 * part * part;
  return <circle cx={TASSE_X} cy={BOULE_Y + 100} r={r} fill={palette.fond} stroke={feu} strokeWidth={70} />;
};

const Astres: React.FC<Decor> = ({ t, n }) => {
  const soleil = entre(n, N_SOLEIL - 1.2, N_SOLEIL) * (1 - entre(n, N_RIGEL - 3, N_RIGEL - 1));
  const etoile = entre(n, N_RIGEL - 1.5, N_RIGEL) * (1 - entre(n, N_FOUDRE - 3, N_FOUDRE - 1));
  const y = 560;
  const x = 860;
  return (
    <g>
      {soleil > 0 ? (
        <g transform={`translate(${x + 260 * (1 - soleil)} ${y})`}>
          {Array.from({ length: 12 }, (_, k) => {
            const a = (k / 12) * Math.PI * 2 + t * 0.2;
            return <line key={k} x1={Math.cos(a) * 112} y1={Math.sin(a) * 112} x2={Math.cos(a) * 150} y2={Math.sin(a) * 150} stroke="#FFC53D" strokeWidth={12} strokeLinecap="round" />;
          })}
          <circle r={96} fill="#FFC53D" />
          <circle r={72} fill="#FFE9A3" />
        </g>
      ) : null}
      {etoile > 0 ? (
        <g transform={`translate(${x + 260 * (1 - etoile)} ${y}) rotate(${t * 12})`}>
          <path d="M0 -150 L18 -18 L150 0 L18 18 L0 150 L-18 18 L-150 0 L-18 -18 Z" fill="#9CC6FF" />
          <circle r={46} fill="#E6F1FF" />
        </g>
      ) : null}
    </g>
  );
};

const Tours: React.FC<{ t: number }> = ({ t }) => {
  const monte = interpolate(t, [calcul.t_reacteur, calcul.t_reacteur + 0.5], [0, 1], borne) * interpolate(t, [calcul.t_souffle, calcul.t_souffle + 0.4], [1, 0], borne);
  if (monte <= 0) {
    return null;
  }
  const tour = (x: number, l: number, h: number) => (
    <g key={x}>
      <path d={`M${x - l} 0 Q${x - l * 0.46} ${-h * 0.55} ${x - l * 0.62} ${-h} L${x + l * 0.62} ${-h} Q${x + l * 0.46} ${-h * 0.55} ${x + l} 0 Z`} fill="#46505B" />
      <path d={`M${x - l * 0.62} ${-h} L${x + l * 0.62} ${-h} L${x + l * 0.68} ${-h + 26} L${x - l * 0.68} ${-h + 26} Z`} fill="#6E7A86" />
      {[0, 1, 2].map((k) => (
        <circle key={k} cx={x + k * 34 + Math.sin(t * 2 + k) * 8} cy={-h - 44 - k * 46} r={38 + k * 12} fill="#DDE3E8" opacity={0.85 - k * 0.2} />
      ))}
    </g>
  );
  return <g transform={`translate(0 ${1210 + (1 - monte) * 620})`}>{[tour(100, 130, 300), tour(900, 150, 380)]}</g>;
};

const Boule: React.FC<Decor> = ({ t, n, feu }) => {
  const monte = entre(n, N_TUNGSTENE - 4, N_TUNGSTENE);
  if (monte <= 0) {
    return null;
  }
  const r = monte * 190 + entre(n, N_SOLEIL, N_FOUDRE) * 90 + Math.sin(t * 13) * 5 * monte;
  const y = interpolate(monte, [0, 1], [TABLE_Y, BOULE_Y]);
  return (
    <g>
      <circle cx={TASSE_X} cy={y} r={r * 1.5} fill={feu} opacity={0.14} />
      <circle cx={TASSE_X} cy={y} r={r * 1.24} fill={feu} opacity={0.3} />
      <circle cx={TASSE_X} cy={y} r={r} fill={feu} />
      <circle cx={TASSE_X} cy={y} r={r * 0.62} fill="#FFFFFF" opacity={0.85} />
    </g>
  );
};

const Eclairs: React.FC<Decor> = ({ t, n }) => {
  const force = entre(n, N_FOUDRE - 2, N_FOUDRE);
  if (force <= 0) {
    return null;
  }
  const tirage = Math.floor(t * 12);
  return (
    <g fill="none" stroke="#E6F1FF" strokeLinejoin="bevel">
      {Array.from({ length: 6 }, (_, k) => {
        // Sur les côtés seulement : ni dans le compteur, ni dans la légende
        const cote = k % 2 === 0 ? 0 : Math.PI;
        const a = cote + (Math.floor(k / 2) - 1) * 0.42 + (hachage(tirage, k) - 0.5) * 0.25;
        const pts = Array.from({ length: 7 }, (_, i) => {
          const r = 290 + i * 70 * force;
          const ecart = (hachage(tirage * 7 + i, k) - 0.5) * 90;
          return `${TASSE_X + Math.cos(a) * r - Math.sin(a) * ecart} ${BOULE_Y + Math.sin(a) * r + Math.cos(a) * ecart}`;
        });
        return <polyline key={k} points={pts.join(" ")} strokeWidth={12} />;
      })}
    </g>
  );
};

const Souffle: React.FC<{ t: number }> = ({ t }) => {
  const age = t - calcul.t_souffle + 0.15;
  if (age < 0 || age > calcul.souffle_s + 0.3) {
    return null;
  }
  return (
    <g stroke="#FFFFFF" strokeLinecap="round" strokeWidth={14}>
      {Array.from({ length: 11 }, (_, k) => {
        const y = 560 + hachage(k, 5) * 620;
        const x = -260 + ((age * 1700 + hachage(k, 6) * 900) % 1500);
        const l = 160 + hachage(k, 7) * 240;
        return <line key={k} x1={x} y1={y} x2={x + l} y2={y} opacity={0.8} />;
      })}
    </g>
  );
};

export const SceneCoffee: React.FC<SceneProps> = ({ t }) => {
  const n = pasChaleur(t);
  const d: Decor = { t, n, feu: corpsNoir(temperature(n) + 273.15), palette: paletteA(t) };
  return (
    <AbsoluteFill>
      <svg width={LARGEUR} height={HAUTEUR} viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`} style={{ position: "absolute" }}>
        <Mur {...d} />
        <Ampoule {...d} />
        <Table {...d} />
        <Papier {...d} />
        <Plomb {...d} />
        <Vapeur {...d} />
        <Tasse {...d} />
        <Flaque {...d} />
        <Incendie {...d} />
        <Balayage {...d} />
        <Astres {...d} />
        <Tours t={t} />
        <Boule {...d} />
        <Eclairs {...d} />
        <Souffle t={t} />
      </svg>
    </AbsoluteFill>
  );
};
