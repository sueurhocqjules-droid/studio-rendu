import React from "react";
import { AbsoluteFill, interpolate, interpolateColors } from "remotion";
import calcul from "../../../sujets/mosquito.calcul.json";
import texte from "../../../sujets/mosquito.json";
import type { SceneProps } from "../../cadre/types";
import { echelle, entre, longueur, paletteA, pasDecor, taillePx } from "./temps";

const LARGEUR = 1080;
const HAUTEUR = 1920;
const CX = 540;
// La surface du bras, sous les pattes, reste à cette hauteur d'écran
const Y0 = 1120;
const SOL_M = -0.75;
const RAYON_TERRE = 6371e3;
const UA = texte.references.ua.m;
const SOLEIL_R = texte.references.soleil.m / 2;
const VOYAGER = texte.references.voyager.m;
const LUNE_D = 384400e3;
const LUNE_R = 1737e3;
const JUPITER = 778.5e9;
const NEPTUNE = 4.5e12;
const OORT = 1.5e15;
const N_LUMIERE = calcul.paliers.find((p) => p.cle === "lumiere")?.pas ?? 28;

const hachage = (i: number, k = 0) => {
  let n = Math.imul(i + 1, 374761393) + Math.imul(k + 1, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};

const teinte = (n: number, etapes: [number, string][]) =>
  interpolateColors(
    Math.min(Math.max(n, etapes[0][0]), etapes[etapes.length - 1][0]),
    etapes.map(([p]) => p),
    etapes.map(([, c]) => c),
  );

// Conversion du monde (mètres, y vers le haut, origine sous les pattes) vers l'écran
type Vue = { s: number; x: (m: number) => number; y: (m: number) => number };

const vueDe = (n: number): Vue => {
  const s = echelle(n);
  return { s, x: (m) => CX + m * s, y: (m) => Y0 - m * s };
};

const Pave: React.FC<{ v: Vue; x1: number; y1: number; x2: number; y2: number; fill: string; rx?: number }> = ({ v, x1, y1, x2, y2, fill, rx = 0 }) => (
  <rect x={v.x(x1)} y={v.y(y2)} width={(x2 - x1) * v.s} height={(y2 - y1) * v.s} rx={rx * v.s} fill={fill} />
);

const Etoiles: React.FC<{ n: number }> = ({ n }) => {
  const opacite = entre(n, 21, 25);
  if (opacite <= 0) {
    return null;
  }
  // Lentes tant qu'on reste près de la Terre, puis la vraie fuite quand le moustique dépasse le système solaire
  const zoom = Math.min(n - 22, 30) * 0.25 + Math.max(n - 52, 0);
  return (
    <g opacity={opacite}>
      {Array.from({ length: 90 }, (_, k) => {
        const u = (hachage(k, 1) + zoom / 6) % 1;
        const r = 1500 * Math.pow(2, -6 * u);
        const angle = hachage(k, 2) * Math.PI * 2;
        const lumiere = Math.min(1, u * 8, (1 - u) * 8);
        return <circle key={k} cx={CX + Math.cos(angle) * r} cy={860 + Math.sin(angle) * r} r={2 + hachage(k, 3) * 3} fill="#EAF0FF" opacity={lumiere} />;
      })}
    </g>
  );
};

const Sol: React.FC<{ n: number; t: number; v: Vue }> = ({ n, t, v }) => {
  const rayon = RAYON_TERRE * v.s;
  const couleur = teinte(n, [[0, "#6E4526"], [8, "#6E4526"], [11, "#24332E"], [20, "#2E4A3C"], [26, "#1F6FA8"]]);
  if (rayon > 3e5) {
    return <rect x={-10} y={v.y(SOL_M)} width={LARGEUR + 20} height={HAUTEUR} fill={couleur} />;
  }
  const r = Math.max(rayon, 3);
  const cy = Y0 + r;
  const continents = Array.from({ length: 7 }, (_, k) => {
    const x = (((hachage(k, 4) * 2 + t * 0.02) % 2) - 1) * r;
    const y = (hachage(k, 5) * 1.6 - 0.8) * r;
    return <ellipse key={k} cx={CX + x} cy={cy + y} rx={r * (0.18 + hachage(k, 6) * 0.2)} ry={r * (0.12 + hachage(k, 7) * 0.14)} fill="#4F9A5A" />;
  });
  return (
    <g>
      <defs>
        <clipPath id="terre">
          <circle cx={CX} cy={cy} r={r} />
        </clipPath>
      </defs>
      <circle cx={CX} cy={cy} r={r + Math.min(r * 0.02, 12)} fill="#8CCBE8" opacity={0.5} />
      <circle cx={CX} cy={cy} r={r} fill={couleur} />
      {rayon < 4000 ? <g clipPath="url(#terre)" opacity={entre(rayon, 2500, 3800) * -1 + 1}>{continents}</g> : null}
    </g>
  );
};

const Nuages: React.FC<{ n: number; v: Vue }> = ({ n, v }) => {
  const opacite = entre(n, 16, 17) * (1 - entre(n, 22, 23));
  if (opacite <= 0) {
    return null;
  }
  return (
    <g opacity={opacite}>
      {Array.from({ length: 16 }, (_, k) => {
        const x = (hachage(k, 8) - 0.5) * 16000;
        const y = 1600 + hachage(k, 9) * 1400;
        const large = 700 + hachage(k, 10) * 1100;
        return <ellipse key={k} cx={v.x(x)} cy={v.y(y)} rx={large * v.s} ry={large * 0.22 * v.s} fill="#D8E0EC" />;
      })}
    </g>
  );
};

const Montagnes: React.FC<{ n: number; v: Vue }> = ({ n, v }) => {
  const opacite = entre(n, 17, 18) * (1 - entre(n, 25, 26.5));
  if (opacite <= 0) {
    return null;
  }
  const pics: [number, number][] = [[-34000, 6000], [-15000, 7000], [24000, 7200], [40000, 5500], [6000, texte.references.everest.m]];
  return (
    <g opacity={opacite}>
      {pics.map(([x, h], k) => {
        const large = h * 1.15;
        const neige = 0.32;
        return (
          <g key={k}>
            <polygon points={`${v.x(x - large)},${v.y(0)} ${v.x(x)},${v.y(h)} ${v.x(x + large)},${v.y(0)}`} fill={k === 4 ? "#46526E" : "#36415A"} />
            <polygon
              points={`${v.x(x - large * neige)},${v.y(h * (1 - neige))} ${v.x(x)},${v.y(h)} ${v.x(x + large * neige)},${v.y(h * (1 - neige))} ${v.x(x + large * 0.1)},${v.y(h * 0.76)} ${v.x(x - large * 0.08)},${v.y(h * 0.8)}`}
              fill="#EEF3FA"
            />
          </g>
        );
      })}
    </g>
  );
};

const Ville: React.FC<{ n: number; v: Vue }> = ({ n, v }) => {
  const opacite = entre(n, 9.5, 11) * (1 - entre(n, 19, 20.5));
  if (opacite <= 0) {
    return null;
  }
  const maisons = Array.from({ length: 30 }, (_, k) => {
    const i = k - 15;
    if (i === 0) {
      return null;
    }
    const x = i * 14 + (hachage(k, 11) - 0.5) * 3;
    const large = 3.2 + hachage(k, 12) * 1.6;
    const haut = 3.5 + hachage(k, 13) * 2.5;
    const mur = ["#8A7A66", "#6F7F8C", "#7F6A5C", "#5F7464"][k % 4];
    return (
      <g key={`m${k}`}>
        <Pave v={v} x1={x - large} y1={SOL_M} x2={x + large} y2={SOL_M + haut} fill={mur} />
        <polygon points={`${v.x(x - large - 0.5)},${v.y(SOL_M + haut)} ${v.x(x)},${v.y(SOL_M + haut + 2.4)} ${v.x(x + large + 0.5)},${v.y(SOL_M + haut)}`} fill="#3C2A22" />
        <Pave v={v} x1={x - 1} y1={SOL_M + 1.4} x2={x + 1} y2={SOL_M + 2.8} fill="#FFD27A" />
      </g>
    );
  });
  const tours = Array.from({ length: 70 }, (_, k) => {
    const signe = k % 2 === 0 ? 1 : -1;
    const x = signe * (260 + hachage(k, 14) * hachage(k, 14) * 7000);
    const large = 14 + hachage(k, 15) * 26;
    const haut = 40 + hachage(k, 16) * hachage(k, 16) * 300;
    return (
      <g key={`t${k}`}>
        <Pave v={v} x1={x - large} y1={SOL_M} x2={x + large} y2={haut} fill={["#2E3C5C", "#35456A", "#283450"][k % 3]} />
        {[0.3, 0.5, 0.7, 0.88].map((part) => (
          <Pave key={part} v={v} x1={x - large * 0.6} y1={haut * part} x2={x + large * 0.6} y2={haut * part + 3.5} fill="#FFD27A" />
        ))}
      </g>
    );
  });
  return (
    <g opacity={opacite}>
      {tours}
      {maisons}
    </g>
  );
};

const Maison: React.FC<{ n: number; v: Vue }> = ({ n, v }) => {
  if (n > 16) {
    return null;
  }
  const envol = entre(n, 8.7, 10.2);
  const hausse = 2 + 90 * envol * envol * envol;
  const axeX = v.x(0.4);
  const axeY = v.y(1.75);
  return (
    <g>
      <Pave v={v} x1={-2.6} y1={SOL_M} x2={3.4} y2={1.75} fill="#C9B18C" />
      <Pave v={v} x1={-2.4} y1={SOL_M} x2={3.2} y2={1.75} fill="#7FB7A6" />
      <Pave v={v} x1={-2.4} y1={SOL_M - 0.12} x2={3.2} y2={SOL_M} fill="#8A5A3A" />
      {/* Fenêtre, lampe et cadre : la chambre */}
      <Pave v={v} x1={1.35} y1={0.45} x2={2.5} y2={1.35} fill="#16213D" />
      <circle cx={v.x(2.2)} cy={v.y(1.1)} r={0.1 * v.s} fill="#F4EFE6" />
      <Pave v={v} x1={1.9} y1={0.45} x2={1.95} y2={1.35} fill="#E9DCC3" />
      <Pave v={v} x1={1.35} y1={0.87} x2={2.5} y2={0.93} fill="#E9DCC3" />
      <Pave v={v} x1={-0.5} y1={0.75} x2={0.2} y2={1.3} fill="#E9DCC3" />
      <Pave v={v} x1={-0.44} y1={0.81} x2={0.14} y2={1.24} fill="#C96B4A" />
      <Pave v={v} x1={-2.1} y1={SOL_M} x2={-1.45} y2={-0.2} fill="#6E4526" />
      <Pave v={v} x1={-1.8} y1={-0.2} x2={-1.74} y2={0.15} fill="#3C2A22" />
      <polygon points={`${v.x(-1.97)},${v.y(0.1)} ${v.x(-1.77)},${v.y(0.45)} ${v.x(-1.57)},${v.y(0.1)}`} fill="#FFD27A" />
      {/* Plafond et toit : ils partent ensemble quand il cogne dessus */}
      {n < 12 ? (
        <g transform={`rotate(${envol * 14} ${axeX} ${axeY}) translate(0 ${-(hausse - 2) * v.s})`}>
          <Pave v={v} x1={-2.6} y1={1.75} x2={3.4} y2={1.95} fill="#E9DCC3" />
          <polygon points={`${v.x(-3.2)},${v.y(1.95)} ${v.x(0.4)},${v.y(4.2)} ${v.x(4)},${v.y(1.95)}`} fill="#7A2E22" />
        </g>
      ) : null}
    </g>
  );
};

const Lit: React.FC<{ n: number; v: Vue }> = ({ n, v }) => {
  if (n > 13) {
    return null;
  }
  const peau = teinte(n, [[6, "#E8B48A"], [7.2, "#C9CCD2"]]);
  const poils = 1 - entre(n, 3.5, 5);
  return (
    <g>
      <Pave v={v} x1={-1.2} y1={SOL_M} x2={-1.12} y2={0.12} fill="#6E4526" />
      <Pave v={v} x1={-1.15} y1={-0.52} x2={1.15} y2={-0.46} fill="#6E4526" />
      <Pave v={v} x1={-1.1} y1={SOL_M} x2={-1.02} y2={-0.5} fill="#6E4526" />
      <Pave v={v} x1={1.02} y1={SOL_M} x2={1.1} y2={-0.5} fill="#6E4526" />
      <Pave v={v} x1={-1.15} y1={-0.46} x2={1.15} y2={-0.24} fill="#EDE3CF" rx={0.04} />
      <ellipse cx={v.x(-0.92)} cy={v.y(-0.19)} rx={0.21 * v.s} ry={0.075 * v.s} fill="#F7F1E4" />
      <circle cx={v.x(-0.86)} cy={v.y(-0.03)} r={0.11 * v.s} fill={peau} />
      <path d={`M${v.x(-0.97)} ${v.y(-0.03)} A${0.11 * v.s} ${0.11 * v.s} 0 0 1 ${v.x(-0.76)} ${v.y(0.04)} Z`} fill="#4A2C17" />
      <Pave v={v} x1={-0.72} y1={-0.3} x2={1.08} y2={-0.06} fill="#33508C" rx={0.06} />
      {/* Le bras posé sur la couverture, et la peau tout près au tout début */}
      <Pave v={v} x1={-0.62} y1={-0.07} x2={0.26} y2={0} fill={peau} rx={0.03} />
      <ellipse cx={v.x(0.28)} cy={v.y(-0.04)} rx={0.07 * v.s} ry={0.04 * v.s} fill={peau} />
      {poils > 0 ? (
        <g opacity={poils}>
          {Array.from({ length: 26 }, (_, k) => (
            <ellipse key={`p${k}`} cx={v.x((hachage(k, 17) - 0.5) * 0.09)} cy={v.y(-hachage(k, 18) * 0.04 - 0.002)} rx={0.0009 * v.s} ry={0.00045 * v.s} fill="#CF9468" />
          ))}
          {Array.from({ length: 34 }, (_, k) => {
            const x = (hachage(k, 19) - 0.5) * 0.07;
            const long = 0.0012 + hachage(k, 20) * 0.0016;
            return <line key={`h${k}`} x1={v.x(x)} y1={v.y(0)} x2={v.x(x + long * 0.5)} y2={v.y(long)} stroke="#8A5A3A" strokeWidth={Math.max(0.00012 * v.s, 1.5)} strokeLinecap="round" />;
          })}
        </g>
      ) : null}
    </g>
  );
};

const Avion: React.FC<{ n: number; v: Vue }> = ({ n, v }) => {
  if (n < 11.5 || n > 16.5) {
    return null;
  }
  const px = texte.references.avion.m * v.s;
  const x = interpolate(n, [11.5, 16.5], [1700, -700]);
  const y = 640;
  return (
    <g transform={`translate(${x} ${y}) scale(${px / 100})`}>
      <path d="M-50 2 Q-50 -7 -38 -7 L38 -7 L52 -22 L56 -22 L52 -6 Q54 0 50 3 L-42 7 Q-50 7 -50 2 Z" fill="#F4EFE6" />
      <path d="M-46 4 L50 2 L50 3.2 L-42 7 Q-45 7 -46 4 Z" fill="#B5301A" />
      <polygon points="-6,1 16,1 34,16 26,16" fill="#C9CDD6" />
      {Array.from({ length: 16 }, (_, k) => (
        <rect key={k} x={-38 + k * 4.6} y={-4} width={2.4} height={2.4} fill="#16213D" />
      ))}
    </g>
  );
};

const Lune: React.FC<{ n: number; v: Vue }> = ({ n, v }) => {
  const opacite = entre(n, 34.5, 35.5) * (1 - entre(n, 40, 41));
  if (opacite <= 0) {
    return null;
  }
  const r = LUNE_D * v.s;
  const cy = Y0 + Math.max(RAYON_TERRE * v.s, 3);
  const angle = -0.9;
  return (
    <g opacity={opacite}>
      <circle cx={CX} cy={cy} r={r} fill="none" stroke="#9FB3C8" strokeWidth={3} strokeDasharray="10 12" />
      <circle cx={CX + Math.cos(angle) * r} cy={cy + Math.sin(angle) * r} r={Math.max(LUNE_R * v.s, 5)} fill="#D8D8D0" />
    </g>
  );
};

// Le Soleil arrive à sa vraie taille à côté du moustique, puis rejoint sa vraie distance à la seconde de l'unité astronomique
const positionSoleil = (n: number, v: Vue) => {
  const r = SOLEIL_R * v.s;
  const cote = CX + taillePx(n) / 2 + r + 30 + 900 * (1 - entre(n, 34, 35.6));
  const reel = CX + UA * v.s;
  return { x: Math.min(cote, reel < cote ? cote : reel) === cote && n < 45 ? cote : reel, y: interpolate(n, [41, 45], [860, Y0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), r };
};

const Soleil: React.FC<{ n: number; v: Vue }> = ({ n, v }) => {
  if (n < 34) {
    return null;
  }
  const { x, y, r } = positionSoleil(n, v);
  const coeur = Math.max(r, 5);
  return (
    <g>
      <circle cx={x} cy={y} r={coeur * 1.1 + 4} fill="#FF8A3D" opacity={0.6} />
      <circle cx={x} cy={y} r={coeur} fill="#FFC24A" />
    </g>
  );
};

const Orbites: React.FC<{ n: number; v: Vue }> = ({ n, v }) => {
  if (n < 44 || n > 56) {
    return null;
  }
  const soleil = positionSoleil(n, v);
  const anneaux: [number, string][] = [[UA, "#7FD3FF"], [JUPITER, "#E8C08A"], [NEPTUNE, "#9FB8E8"]];
  return (
    <g fill="none" strokeWidth={4}>
      {anneaux.map(([m, couleur]) => {
        const r = m * v.s;
        if (r > 3000 || r < 6) {
          return null;
        }
        return <circle key={m} cx={soleil.x} cy={soleil.y} r={r} stroke={couleur} opacity={entre(n, 44.4, 45) * entre(r, 6, 30)} />;
      })}
      <circle cx={CX} cy={Y0} r={7} fill="#7FD3FF" stroke="none" opacity={entre(n, 44.4, 45)} />
    </g>
  );
};

const Sonde: React.FC<{ n: number; v: Vue }> = ({ n, v }) => {
  const opacite = entre(n, 50.5, 51.5) * (1 - entre(n, 55.5, 56.5));
  if (opacite <= 0) {
    return null;
  }
  const d = VOYAGER * v.s;
  const x = CX + Math.cos(-0.55) * d;
  const y = Y0 + Math.sin(-0.55) * d;
  return (
    <g opacity={opacite} transform={`translate(${x} ${y}) rotate(-20) scale(1.5)`}>
      <path d="M-30 -8 Q-14 0 -30 8 L-34 8 Q-24 0 -34 -8 Z" fill="#F4EFE6" />
      <rect x={-22} y={-3} width={24} height={6} fill="#C9CDD6" />
      <rect x={-6} y={-8} width={12} height={16} fill="#E8C08A" />
      <line x1={2} y1={0} x2={34} y2={-14} stroke="#C9CDD6" strokeWidth={2.5} />
      <line x1={2} y1={0} x2={30} y2={12} stroke="#C9CDD6" strokeWidth={2.5} />
    </g>
  );
};

const Oort: React.FC<{ n: number; v: Vue }> = ({ n, v }) => {
  const opacite = entre(n, 54.5, 56) * (1 - entre(n, 60.5, 61.5));
  if (opacite <= 0) {
    return null;
  }
  return (
    <g opacity={opacite}>
      {Array.from({ length: 150 }, (_, k) => {
        const r = OORT * (0.7 + hachage(k, 21) * 0.6) * v.s;
        const angle = hachage(k, 22) * Math.PI * 2;
        return <circle key={k} cx={CX + Math.cos(angle) * r} cy={Y0 + Math.sin(angle) * r} r={3 + hachage(k, 23) * 3} fill="#B8C4D8" />;
      })}
    </g>
  );
};

const POINTE_REPOS = { x: 38, y: 0 };
const POINTE_LEVEE = { x: 54, y: -36 };

const Proxima: React.FC<{ n: number; t: number }> = ({ n, t }) => {
  if (n < 60.5) {
    return null;
  }
  const px = taillePx(n) / 100;
  const x = CX + POINTE_LEVEE.x * px + 14 + (Math.pow(2, calcul.n_max - n) - 1) * 300;
  const y = Y0 + POINTE_LEVEE.y * px;
  const age = t - calcul.t_limite;
  const onde = age > 0 ? entre(age, 0, 1) : 0;
  return (
    <g>
      {onde > 0 && onde < 1 ? <circle cx={x} cy={y} r={30 + onde * 420} fill="none" stroke="#FF8A3D" strokeWidth={10 * (1 - onde)} /> : null}
      <circle cx={x} cy={y} r={30} fill="#FF8A3D" opacity={0.5} />
      <circle cx={x} cy={y} r={18} fill="#FFB36B" />
    </g>
  );
};

const Moustique: React.FC<{ n: number; t: number; dx: number; dy: number }> = ({ n, t, dx, dy }) => {
  const px = taillePx(n) / 100;
  const corps = teinte(n, [[0, "#23252E"], [9, "#23252E"], [11, "#8E97AC"], [30, "#AEB5C6"]]);
  const raie = teinte(n, [[0, "#F4EFE6"], [9, "#F4EFE6"], [11, "#23252E"]]);
  const plein = entre(n, 3.5, 7);
  const ventre = interpolateColors(plein, [0, 1], [corps, "#B3201A"]);
  const levee = entre(n, 54, 60);
  const pointe = {
    x: POINTE_REPOS.x + (POINTE_LEVEE.x - POINTE_REPOS.x) * levee,
    y: POINTE_REPOS.y + (POINTE_LEVEE.y - POINTE_REPOS.y) * levee,
  };
  const image = Math.round(t * 30);
  // Battement à chaque image ; il faiblit quand le corps devient immense, sauf à la seconde de la lumière
  const ampleur = interpolate(n, [0, 26, 40], [13, 13, 5], { extrapolateRight: "clamp" });
  const battement = (image % 2 === 0 ? 1 : -1) * ampleur;
  const feu = entre(n, N_LUMIERE - 1, N_LUMIERE) * (1 - entre(n, N_LUMIERE + 3, N_LUMIERE + 4));
  const aile = interpolateColors(feu, [0, 1], ["#CFE6F5", "#FF8A3D"]);
  const trait = 1.5;
  const pattes: [number, number, number, number, number, number][] = [
    [10, -34, 24, -50, 28, 0],
    [4, -34, -2, -54, -8, 0],
    [-2, -34, -24, -58, -42, -2],
    [8, -34, 18, -48, 20, 0],
    [2, -34, -10, -50, -18, 0],
  ];
  return (
    <g transform={`translate(${CX + dx} ${Y0 + dy}) scale(${px})`}>
      {feu > 0
        ? [-34, -14, 6].map((angle, k) => (
            <path key={k} d={`M4 -50 L${-44 * Math.cos((angle * Math.PI) / 180) - 8} ${-50 - 62 * Math.sin(((angle + 40) * Math.PI) / 180)}`} stroke="#FFC24A" strokeWidth={3 * feu} strokeLinecap="round" opacity={0.8} />
          ))
        : null}
      {[battement, -battement * 0.6].map((angle, k) => (
        <g key={k} transform={`rotate(${angle + 18 + k * 12} 4 -48)`}>
          <ellipse cx={-22} cy={-48} rx={27} ry={7} fill={aile} opacity={0.72} stroke={corps} strokeWidth={0.5} />
          <line x1={2} y1={-48} x2={-46} y2={-48} stroke={corps} strokeWidth={0.5} opacity={0.6} />
        </g>
      ))}
      {pattes.map(([a, b, c, d, e, f], k) => (
        <path key={k} d={`M${a} ${b} L${c} ${d} L${e} ${f}`} fill="none" stroke={corps} strokeWidth={trait} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      <g transform="rotate(-6 -22 -38)">
        <ellipse cx={-22} cy={-38} rx={27 + plein * 3} ry={7.5 + plein * 6.5} fill={ventre} />
        {[-40, -31, -22, -13, -4].map((x) => (
          <rect key={x} x={x} y={-52} width={2.6} height={28} fill={raie} opacity={(1 - plein * 0.6) * (Math.abs(x + 22) > 16 ? 0.7 : 1)} />
        ))}
      </g>
      <ellipse cx={7} cy={-43} rx={13} ry={10.5} fill={corps} />
      <ellipse cx={5} cy={-46} rx={6} ry={3} fill={raie} opacity={0.75} />
      <circle cx={23} cy={-40} r={6.5} fill={corps} />
      <circle cx={25} cy={-41} r={3.6} fill="#B5301A" />
      <path d={`M27 -37 L${pointe.x} ${pointe.y}`} stroke={corps} strokeWidth={1.8} strokeLinecap="round" />
      <path d="M24 -45 Q34 -54 40 -50" fill="none" stroke={corps} strokeWidth={1} strokeLinecap="round" />
      <path d="M26 -44 Q38 -48 43 -42" fill="none" stroke={corps} strokeWidth={1} strokeLinecap="round" />
    </g>
  );
};

const Main: React.FC<{ t: number }> = ({ t }) => {
  const descente = entre(t, calcul.t_bras + 0.28, calcul.t_claque);
  const remontee = entre(t, calcul.t_claque + 0.55, calcul.t_claque + 0.9);
  const y = -2100 * (1 - descente * descente) - 2100 * remontee * remontee;
  if (descente <= 0 || remontee >= 1) {
    return null;
  }
  const doigts = [90, 330, 570, 810];
  return (
    <g transform={`translate(0 ${y})`}>
      <rect x={-20} y={560} width={1120} height={1300} rx={150} fill="#D69A6E" />
      {doigts.map((x, k) => (
        <rect key={x} x={x} y={k === 0 || k === 3 ? 120 : 40} width={190} height={700} rx={95} fill="#D69A6E" />
      ))}
      {[820, 980, 1140].map((ligne) => (
        <path key={ligne} d={`M180 ${ligne} Q540 ${ligne + 90} 900 ${ligne}`} fill="none" stroke="#B97E55" strokeWidth={14} strokeLinecap="round" />
      ))}
    </g>
  );
};

export const SceneMosquito: React.FC<SceneProps> = ({ t }) => {
  const palette = paletteA(t);
  const n = pasDecor(t);
  const v = vueDe(n);
  const apresClaque = t - calcul.t_claque;
  const secousse = apresClaque >= 0 && apresClaque < 0.3 ? (1 - apresClaque / 0.3) * 26 : 0;
  const sx = (hachage(Math.round(t * 30), 24) - 0.5) * secousse;
  const sy = (hachage(Math.round(t * 30), 25) - 0.5) * secousse;
  const visible = t < calcul.t_claque || t >= calcul.t_autre;
  const vol = 1 - Math.pow(entre(t, calcul.t_autre, calcul.t_fin), 2);
  const volX = t >= calcul.t_autre ? vol * 760 + Math.sin(t * 9) * 50 * vol : 0;
  const volY = t >= calcul.t_autre ? -vol * 520 + Math.cos(t * 7) * 40 * vol : 0;
  const eclair = apresClaque >= 0 ? (1 - entre(apresClaque, 0, 0.14)) * 0.65 : 0;
  void longueur;

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg width={LARGEUR} height={HAUTEUR} viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`}>
        <g transform={`translate(${sx} ${sy})`}>
          <Etoiles n={n} />
          <Lune n={n} v={v} />
          <Montagnes n={n} v={v} />
          <Sol n={n} t={t} v={v} />
          <Ville n={n} v={v} />
          <Maison n={n} v={v} />
          <Lit n={n} v={v} />
          <Nuages n={n} v={v} />
          <Soleil n={n} v={v} />
          <Orbites n={n} v={v} />
          <Sonde n={n} v={v} />
          <Oort n={n} v={v} />
          <Proxima n={n} t={t} />
          {visible ? <Moustique n={n} t={t} dx={volX} dy={volY} /> : null}
          <Avion n={n} v={v} />
          <Main t={t} />
        </g>
        {eclair > 0 ? <rect width={LARGEUR} height={HAUTEUR} fill="#FFFFFF" opacity={eclair} /> : null}
      </svg>
    </AbsoluteFill>
  );
};
