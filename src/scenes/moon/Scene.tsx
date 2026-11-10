import React from "react";
import { AbsoluteFill, interpolateColors } from "remotion";
import calcul from "../../../sujets/moon.calcul.json";
import texte from "../../../sujets/moon.json";
import { ANTON } from "../../cadre/polices";
import { longueurLocale, remplir } from "../../cadre/format";
import type { Langue, SceneProps } from "../../cadre/types";
import { entre, lisse, mareeM, paletteA, pasCompteur, pasDecor, pasLune, rayonLunePx } from "./temps";

const LARGEUR = 1080;
const HAUTEUR = 1920;
const CX = 540;
const Y_LUNE = 880;
const Y_SOL = 1640;
const HAUT_EAU = 320;
const MAREE_MIN = 1.2;
const R_DEBRIS = 700;
const ANNEAU_Y = 2350;
const X_MONUMENT = 880;

const hachage = (i: number, k = 0) => {
  let n = Math.imul(i + 1, 374761393) + Math.imul(k + 1, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};

const mix = (a: number, b: number, p: number) => a + (b - a) * p;

const echelle = (n: number) => HAUT_EAU / Math.max(mareeM(n), MAREE_MIN);

const pas = (cle: string) => calcul.paliers.find((p) => p.cle === cle)?.pas ?? 0;

const couleurLune = (n: number) =>
  interpolateColors(Math.min(n, 44), [0, 25, 44], ["#F1ECDD", "#C9C5B8", "#6F6D68"]);

const Etoiles: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {Array.from({ length: 80 }, (_, k) => (
      <circle
        key={k}
        cx={hachage(k, 1) * LARGEUR}
        cy={hachage(k, 2) * 1300}
        r={1.5 + hachage(k, 3) * 2.5}
        fill="#EAF0FF"
        opacity={0.35 + 0.4 * Math.abs(Math.sin(t * 0.8 + k))}
      />
    ))}
  </g>
);

const MERS: [number, number, number, number][] = [
  [-0.32, -0.28, 0.3, 0.22],
  [0.18, -0.36, 0.22, 0.16],
  [0.34, 0.02, 0.2, 0.26],
  [-0.12, 0.2, 0.36, 0.2],
  [-0.48, 0.14, 0.16, 0.14],
  [0.12, 0.5, 0.2, 0.1],
];

const FISSURES: [number, number][][] = [
  [[0, 0], [0.2, -0.16], [0.28, -0.42], [0.5, -0.56], [0.66, -0.76]],
  [[0, 0], [-0.22, -0.1], [-0.42, -0.3], [-0.62, -0.32], [-0.8, -0.52]],
  [[0, 0], [0.26, 0.12], [0.46, 0.08], [0.66, 0.3], [0.88, 0.34]],
  [[0, 0], [-0.12, 0.26], [-0.36, 0.42], [-0.42, 0.66], [-0.6, 0.8]],
  [[0, 0], [0.1, 0.3], [0.08, 0.56], [0.26, 0.74], [0.3, 0.94]],
];

const Lune: React.FC<{ n: number; cx: number; opacite: number }> = ({ n, cx, opacite }) => {
  const R = rayonLunePx(n);
  const couleur = couleurLune(n);
  const sombre = interpolateColors(Math.min(n, 44), [0, 44], ["#BDB8A8", "#4C4A46"]);
  const details = entre(R, 45, 90);
  const feu = entre(n, 56.5, 59.5);
  return (
    <g opacity={opacite}>
      <circle cx={cx} cy={Y_LUNE} r={R * 1.14} fill={couleur} opacity={0.14} />
      <circle cx={cx} cy={Y_LUNE} r={R} fill={couleur} />
      {MERS.map(([u, v, a, b], k) => (
        <ellipse key={k} cx={cx + u * R} cy={Y_LUNE + v * R} rx={a * R} ry={b * R} fill={sombre} opacity={0.75} />
      ))}
      {details > 0
        ? Array.from({ length: 26 }, (_, k) => {
            const angle = hachage(k, 4) * Math.PI * 2;
            const r = Math.sqrt(hachage(k, 5)) * 0.92 * R;
            const taille = (0.02 + hachage(k, 6) * 0.07) * R;
            const x = cx + Math.cos(angle) * r;
            const y = Y_LUNE + Math.sin(angle) * r;
            return (
              <g key={k} opacity={details}>
                <circle cx={x} cy={y} r={taille} fill={sombre} />
                <circle cx={x - taille * 0.16} cy={y - taille * 0.16} r={taille * 0.82} fill={couleur} opacity={0.55} />
              </g>
            );
          })
        : null}
      {feu > 0
        ? FISSURES.map((ligne, k) => (
            <polyline
              key={k}
              points={ligne.map(([u, v]) => `${cx + u * R * Math.min(1, feu * 1.4)},${Y_LUNE + v * R * Math.min(1, feu * 1.4)}`).join(" ")}
              fill="none"
              stroke="#FF8A3D"
              strokeWidth={6 + feu * 18}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={feu}
            />
          ))
        : null}
    </g>
  );
};

const LuneFantome: React.FC<{ n: number; cx: number }> = ({ n, cx }) => {
  const nc = pas("double");
  const opacite = entre(n, nc - 1.5, nc - 0.5) * (1 - entre(n, nc + 2, nc + 3));
  if (opacite <= 0) {
    return null;
  }
  return <circle cx={cx} cy={Y_LUNE} r={34} fill="none" stroke="#1B1430" strokeWidth={4} strokeDasharray="8 7" opacity={opacite} />;
};

const OrbiteRapide: React.FC<{ n: number; cx: number; t: number }> = ({ n, cx, t }) => {
  const nc = pas("mois");
  const opacite = entre(n, nc - 1.5, nc - 0.5) * (1 - entre(n, nc + 2, nc + 3));
  if (opacite <= 0) {
    return null;
  }
  const R = rayonLunePx(n) * 1.32;
  return (
    <g opacity={opacite} transform={`rotate(${t * 220} ${cx} ${Y_LUNE})`}>
      <circle cx={cx} cy={Y_LUNE} r={R} fill="none" stroke="#FFD27A" strokeWidth={8} strokeDasharray={`${R * 1.1} ${R * 5.2}`} strokeLinecap="round" />
    </g>
  );
};

const Satellites: React.FC<{ n: number; cx: number }> = ({ n, cx }) => {
  const nc = pas("geo");
  const opacite = entre(n, nc - 3, nc - 2) * (1 - entre(n, nc + 2, nc + 3));
  if (opacite <= 0) {
    return null;
  }
  const R = rayonLunePx(n);
  return (
    <g opacity={opacite}>
      {[-2.6, -1.9, -1.1, -0.45].map((angle, k) => (
        <g key={k} transform={`translate(${cx + Math.cos(angle) * (R + 110)} ${Y_LUNE + Math.sin(angle) * (R + 110)}) rotate(${k * 34})`}>
          <rect x={-46} y={-11} width={34} height={22} fill="#7FB6E8" />
          <rect x={12} y={-11} width={34} height={22} fill="#7FB6E8" />
          <rect x={-12} y={-14} width={24} height={28} fill="#E8D39A" />
        </g>
      ))}
    </g>
  );
};

const Chateau: React.FC<{ n: number }> = ({ n }) => {
  const s = echelle(n);
  const h = 0.6 * s;
  const l = 0.72 * s;
  const x = 620 - l / 2;
  const y = Y_SOL - h;
  const sable = "#D9B676";
  const tours = [0, 0.38, 0.76];
  return (
    <g>
      {tours.map((u, k) => (
        <g key={k}>
          <rect x={x + u * l} y={y + (k === 1 ? 0 : h * 0.18)} width={l * 0.24} height={h} fill={sable} />
          {[0, 1, 2].map((c) => (
            <rect key={c} x={x + u * l + (c * l * 0.24) / 2.6} y={y + (k === 1 ? -h * 0.1 : h * 0.08)} width={l * 0.07} height={h * 0.12} fill={sable} />
          ))}
        </g>
      ))}
      <rect x={x} y={y + h * 0.5} width={l} height={h * 0.5} fill="#C6A263" />
      <path d={`M${x + l * 0.42} ${Y_SOL} v${-h * 0.26} a${l * 0.08} ${l * 0.08} 0 0 1 ${l * 0.16} 0 v${h * 0.26} Z`} fill="#7A5C32" />
      <line x1={x + l / 2} y1={y} x2={x + l / 2} y2={y - h * 0.34} stroke="#3C2A22" strokeWidth={Math.max(3, h * 0.03)} />
      <polygon points={`${x + l / 2},${y - h * 0.34} ${x + l / 2 + h * 0.2},${y - h * 0.27} ${x + l / 2},${y - h * 0.2}`} fill="#E5533D" />
    </g>
  );
};

// Chaque monument arrive par la droite cinq secondes avant d'être noyé
const entree = (n: number, de: number) => (1 - entre(n, de, de + 1)) * 760;

const Cabane: React.FC<{ s: number; decale: number }> = ({ s, decale }) => {
  const h = 3 * s;
  const l = 2.4 * s;
  const x = X_MONUMENT + decale - l / 2;
  const y = Y_SOL - h;
  return (
    <g>
      <rect x={x} y={y + h * 0.28} width={l} height={h * 0.72} fill="#D6E2E8" />
      {[0.1, 0.42, 0.74].map((u) => (
        <rect key={u} x={x + u * l} y={y + h * 0.28} width={l * 0.16} height={h * 0.72} fill="#E5533D" />
      ))}
      <polygon points={`${x - l * 0.08},${y + h * 0.3} ${x + l / 2},${y} ${x + l * 1.08},${y + h * 0.3}`} fill="#8C3A2A" />
      <rect x={x + l * 0.38} y={y + h * 0.58} width={l * 0.24} height={h * 0.42} fill="#16213D" />
    </g>
  );
};

const Rocher: React.FC<{ s: number; decale: number }> = ({ s, decale }) => {
  const h = 8.15 * s;
  const l = 4.4 * s;
  const x = X_MONUMENT + decale;
  const y = Y_SOL - h;
  return (
    <g>
      <polygon points={`${x - l * 0.34},${Y_SOL} ${x - l * 0.28},${y + h * 0.45} ${x - l * 0.56},${y + h * 0.1} ${x - l * 0.3},${y} ${x + l * 0.32},${y} ${x + l * 0.54},${y + h * 0.14} ${x + l * 0.26},${y + h * 0.48} ${x + l * 0.32},${Y_SOL}`} fill="#7D5E43" />
      <ellipse cx={x} cy={y} rx={l * 0.42} ry={h * 0.08} fill="#3E7A4A" />
      <rect x={x - l * 0.34} y={y + h * 0.62} width={l * 0.66} height={h * 0.38} fill="#5E4632" />
    </g>
  );
};

const Phare: React.FC<{ s: number; decale: number; t: number }> = ({ s, decale, t }) => {
  const h = 67.5 * s;
  const b = 14 * s;
  const x = X_MONUMENT + decale;
  const y = Y_SOL - h;
  const rayon = Math.sin(t * 2.2);
  return (
    <g>
      <polygon points={`${x},${y + h * 0.05} ${x - 900},${y + h * 0.05 - 200 + rayon * 260} ${x - 900},${y + h * 0.05 + 120 + rayon * 260}`} fill="#FFE7A0" opacity={0.28} />
      <polygon points={`${x - b / 2},${Y_SOL} ${x - b * 0.26},${y + h * 0.1} ${x + b * 0.26},${y + h * 0.1} ${x + b / 2},${Y_SOL}`} fill="#EFE6D6" />
      {[0.2, 0.48, 0.76].map((u) => {
        const yb = y + h * u;
        const demi = mix(b * 0.26, b / 2, (yb - (y + h * 0.1)) / (h * 0.9));
        return <rect key={u} x={x - demi} y={yb} width={demi * 2} height={h * 0.12} fill="#B5301A" />;
      })}
      <rect x={x - b * 0.34} y={y + h * 0.1} width={b * 0.68} height={h * 0.02} fill="#3C2A22" />
      <rect x={x - b * 0.2} y={y + h * 0.03} width={b * 0.4} height={h * 0.07} fill="#FFD27A" />
      <polygon points={`${x - b * 0.26},${y + h * 0.03} ${x},${y} ${x + b * 0.26},${y + h * 0.03}`} fill="#3C2A22" />
    </g>
  );
};

const Eiffel: React.FC<{ s: number; decale: number }> = ({ s, decale }) => {
  const h = 330 * s;
  const b = 125 * s;
  const x = X_MONUMENT + decale;
  const y = Y_SOL - h;
  const coul = "#B08A52";
  const niveau = (u: number) => y + h * u;
  const demi = (u: number) => (b / 2) * Math.pow(1 - u, 2.2) + b * 0.018;
  const pied = (u: number) => demi(1 - u);
  return (
    <g>
      <polygon
        points={[0, 0.2, 0.42, 0.65, 0.85, 1].map((u) => `${x - demi(u)},${niveau(1 - u)}`).concat([1, 0.85, 0.65, 0.42, 0.2, 0].map((u) => `${x + demi(u)},${niveau(1 - u)}`)).join(" ")}
        fill={coul}
      />
      <path d={`M${x - pied(0.97) * 0.6} ${Y_SOL} Q${x} ${niveau(0.9)} ${x + pied(0.97) * 0.6} ${Y_SOL} Z`} fill="#1B1430" />
      {[0.72, 0.44].map((u) => (
        <rect key={u} x={x - demi(1 - u) - b * 0.05} y={niveau(u)} width={(demi(1 - u) + b * 0.05) * 2} height={h * 0.018} fill="#E8C08A" />
      ))}
    </g>
  );
};

const GrandeTour: React.FC<{ s: number; decale: number }> = ({ s, decale }) => {
  const h = 828 * s;
  const b = 150 * s;
  const x = X_MONUMENT + decale;
  const y = Y_SOL - h;
  const etages: [number, number][] = [[1, 0], [0.74, 0.22], [0.5, 0.44], [0.3, 0.64], [0.14, 0.8], [0.05, 0.92]];
  return (
    <g>
      {etages.map(([l, u], k) => (
        <rect key={k} x={x - (b * l) / 2} y={y + h * (1 - (k === 5 ? 1 : etages[k + 1][1]))} width={b * l} height={h * ((k === 5 ? 1 : etages[k + 1][1]) - u)} fill={k % 2 === 0 ? "#AFC2D8" : "#8FA6C0"} />
      ))}
      <polygon points={`${x - b * 0.02},${y + h * 0.08} ${x},${y} ${x + b * 0.02},${y + h * 0.08}`} fill="#AFC2D8" />
    </g>
  );
};

const Monuments: React.FC<{ n: number; t: number }> = ({ n, t }) => {
  if (t >= calcul.t_limite) {
    return null;
  }
  const s = echelle(n);
  const decale = (cle: string) => entree(n, pas(cle) - 5);
  const vu = (cle: string) => n >= pas(cle) - 5 && n <= pas(cle) + 1.5;
  return (
    <g>
      {vu("cabane") ? <Cabane s={s} decale={decale("cabane")} /> : null}
      {vu("fundy") ? <Rocher s={s} decale={decale("fundy")} /> : null}
      {vu("phare") ? <Phare s={s} decale={decale("phare")} t={t} /> : null}
      {vu("eiffel") ? <Eiffel s={s} decale={decale("eiffel")} /> : null}
      {vu("tour") ? <GrandeTour s={s} decale={decale("tour")} /> : null}
    </g>
  );
};

const Mer: React.FC<{ n: number; t: number; cx: number; lueur: number }> = ({ n, t, cx, lueur }) => {
  const h = mareeM(n);
  const surface = Y_SOL - h * echelle(n);
  const ampleur = 8 + entre(n, 20, 50) * 16;
  const points = Array.from({ length: 28 }, (_, k) => {
    const x = (k / 27) * (LARGEUR + 40) - 20;
    return `${x},${surface + Math.sin(x / 90 + t * 2.1) * ampleur + Math.sin(x / 37 - t * 1.4) * ampleur * 0.4}`;
  });
  const R = rayonLunePx(pasLune(t));
  return (
    <g>
      <polygon points={`-20,${HAUTEUR} ${points.join(" ")} ${LARGEUR + 20},${HAUTEUR}`} fill="#123D5C" opacity={0.74} />
      {Array.from({ length: 7 }, (_, k) => {
        const y = surface + 40 + k * 44;
        const large = R * (0.7 - k * 0.06) + 40;
        return <rect key={k} x={cx - large + Math.sin(t * 2 + k) * 24} y={y} width={large * 2} height={8} rx={4} fill="#EDE9DC" opacity={0.3 * lueur} />;
      })}
    </g>
  );
};

const Debris: React.FC<{ t: number }> = ({ t }) => {
  if (t < calcul.t_limite || t >= calcul.t_naissance + 0.7) {
    return null;
  }
  const p = lisse(entre(t, calcul.t_limite + 0.15, calcul.t_anneaux));
  const q = lisse(entre(t, calcul.t_anneaux + 1.4, calcul.t_naissance));
  const fin = 1 - entre(t, calcul.t_naissance + 0.25, calcul.t_naissance + 0.7);
  const bande = p * (1 - q);
  return (
    <g opacity={fin}>
      <circle cx={CX} cy={ANNEAU_Y} r={1580} fill="none" stroke="#CFCABC" strokeWidth={170} opacity={0.26 * bande} />
      <circle cx={CX} cy={ANNEAU_Y} r={1700} fill="none" stroke="#E8E1CF" strokeWidth={36} opacity={0.42 * bande} />
      <circle cx={CX} cy={ANNEAU_Y} r={1470} fill="none" stroke="#A7A293" strokeWidth={30} opacity={0.4 * bande} />
      {Array.from({ length: 190 }, (_, k) => {
        const a = hachage(k, 7) * Math.PI * 2;
        const r = Math.sqrt(hachage(k, 8)) * R_DEBRIS;
        const sx = CX + Math.cos(a) * r;
        const sy = Y_LUNE + Math.sin(a) * r;
        const theta = (hachage(k, 9) - 0.5) * 1.15 + (t - calcul.t_limite) * 0.03;
        const rayon = 1460 + hachage(k, 10) * 250;
        const rx = CX + Math.sin(theta) * rayon;
        const ry = ANNEAU_Y - Math.cos(theta) * rayon;
        const x = mix(mix(sx, rx, p), sx, q);
        const y = mix(mix(sy, ry, p), sy, q);
        const taille = 4 + hachage(k, 11) * hachage(k, 11) * 26;
        return <circle key={k} cx={x} cy={y} r={taille} fill={k % 3 === 0 ? "#8F8C83" : "#BDB8A8"} />;
      })}
    </g>
  );
};

const Maree: React.FC<{ n: number; langue: Langue; encre: string; fond: string }> = ({ n, langue, encre, fond }) => {
  const L = texte[langue];
  const m = longueurLocale(mareeM(Math.floor(n + 1e-9)), L.unites_maree, L.separateurs);
  const ligne = remplir(L.maree, { v: m.nombre, u: m.unite });
  const large = ligne.length * 30 + 44;
  return (
    <g>
      <rect x={70} y={506} width={large} height={92} fill={encre} />
      <text x={92} y={578} fontFamily={ANTON} fontSize={66} fill={fond}>
        {ligne}
      </text>
    </g>
  );
};

export const SceneMoon: React.FC<SceneProps> = ({ t, langue }) => {
  const palette = paletteA(t);
  const n = pasDecor(t);
  const nLune = pasLune(t);
  const derive = t < calcul.t_limite ? Math.sin(t / 9) * 220 * (1 - entre(nLune, 38, 44)) : 0;
  const cx = CX + derive;
  const avantRupture = t < calcul.t_limite;
  const apresNaissance = t >= calcul.t_naissance;
  const opaciteLune = avantRupture ? 1 : apresNaissance ? entre(t, calcul.t_naissance, calcul.t_naissance + 0.5) : 0;
  const lueur = avantRupture || apresNaissance ? 1 : 0.2;
  const age = t - calcul.t_limite;
  const secousse = age >= 0 && age < 0.5 ? (1 - age / 0.5) * 34 : avantRupture ? entre(n, 54, 59.5) * 9 : 0;
  const image = Math.round(t * 30);
  const sx = (hachage(image, 12) - 0.5) * secousse;
  const sy = (hachage(image, 13) - 0.5) * secousse;
  const eclair = age >= 0 ? (1 - entre(age, 0, 0.16)) * 0.75 : 0;
  const montreMaree = t < calcul.t_anneaux;

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg width={LARGEUR} height={HAUTEUR} viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`}>
        <g transform={`translate(${sx} ${sy})`}>
          <Etoiles t={t} />
          {opaciteLune > 0 ? <Lune n={nLune} cx={cx} opacite={opaciteLune} /> : null}
          {avantRupture ? <LuneFantome n={nLune} cx={cx} /> : null}
          {avantRupture ? <OrbiteRapide n={nLune} cx={cx} t={t} /> : null}
          {avantRupture ? <Satellites n={nLune} cx={cx} /> : null}
          <Debris t={t} />
          <rect x={-20} y={Y_SOL} width={LARGEUR + 40} height={HAUTEUR - Y_SOL + 20} fill="#6E5A3C" />
          <Chateau n={n} />
          <Monuments n={n} t={t} />
          <Mer n={n} t={t} cx={cx} lueur={lueur} />
        </g>
        {montreMaree ? <Maree n={pasCompteur(t)} langue={langue} encre={palette.encre} fond={palette.fond} /> : null}
        {eclair > 0 ? <rect width={LARGEUR} height={HAUTEUR} fill="#FFFFFF" opacity={eclair} /> : null}
      </svg>
    </AbsoluteFill>
  );
};
