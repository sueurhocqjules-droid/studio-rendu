import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import calcul from "../../../sujets/ice.calcul.json";
import type { SceneProps } from "../../cadre/types";
import { entre, kelvin, paletteA, pasDecor, teinte } from "./temps";

const LARGEUR = 1080;
const HAUTEUR = 1920;
const CX = 540;
const HORIZON = 800;
const TABLE = 1130;
const CUBE_Y = 880;
const COTE = 170;

const seuil = (cle: string) => {
  const palier = calcul.paliers.find((p) => p.cle === cle);
  if (!palier) {
    throw new Error(`Palier inconnu : ${cle}`);
  }
  return palier;
};

const N_MERCURE = seuil("mercure").pas;
const MARS = seuil("mars").arrivee_s;
const PLUTON = seuil("pluton").arrivee_s;
const VISIBLE_S = 2.6;

const hachage = (i: number, k = 0) => {
  let n = Math.imul(i + 1, 374761393) + Math.imul(k + 1, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};

const Soleil: React.FC<{ n: number }> = ({ n }) => {
  const y = interpolate(n, [0, 22], [590, 960], { extrapolateRight: "clamp" });
  return <circle cx={800} cy={y} r={96} fill={teinte(n, [[0, "#FF8A3D"], [12, "#FFD9A0"], [22, "#E8E4D8"]])} />;
};

const Etoiles: React.FC<{ opacite: number }> = ({ opacite }) => (
  <g opacity={opacite}>
    {Array.from({ length: 60 }, (_, k) => (
      <circle key={k} cx={hachage(k, 1) * LARGEUR} cy={hachage(k, 2) * HORIZON} r={2.5 + hachage(k, 3) * 3} fill="#EAF6FF" />
    ))}
  </g>
);

const Mer: React.FC<{ t: number; n: number }> = ({ t, n }) => {
  const couleur = teinte(n, [[0, "#1FA6A0"], [8, "#7CC9CC"], [14, "#E4F3F6"], [24, "#7FA3BE"], [53, "#4D6478"]]);
  const hauteur = 14 * (1 - entre(n, 7, 13));
  const lignes = [HORIZON + 40, HORIZON + 110, HORIZON + 200];
  return (
    <g>
      <rect y={HORIZON} width={LARGEUR} height={TABLE - HORIZON + 40} fill={couleur} />
      {lignes.map((y, k) => {
        const decale = (t * 90 * (1 - entre(n, 7, 13)) + k * 170) % 240;
        const points = Array.from({ length: 8 }, (_, i) => `q60 ${i % 2 === 0 ? -hauteur : hauteur} 120 0`).join(" ");
        return <path key={k} d={`M${-240 - decale} ${y} ${points} ${points}`} fill="none" stroke={teinte(n, [[0, "#6FD6CC"], [14, "#CFE6EC"], [24, "#93B5CC"], [53, "#5E7890"]])} strokeWidth={9} strokeLinecap="round" />;
      })}
    </g>
  );
};

const Parasol: React.FC<{ n: number }> = ({ n }) => {
  const chute = entre(n, 30, 31);
  const neige = 34 * entre(n, 13, 24);
  const rouge = teinte(n, [[0, "#D5402B"], [14, "#B58C96"], [24, "#5E7890"]]);
  const clair = teinte(n, [[0, "#FFF4DD"], [14, "#E6EEF2"], [24, "#93B5CC"]]);
  return (
    <g transform={`rotate(${-chute * chute * 84} 210 ${TABLE + 60})`}>
      <rect x={202} y={640} width={16} height={TABLE - 580} fill={teinte(n, [[0, "#7A4E2C"], [24, "#3C5068"]])} />
      <path d="M30 700 Q210 500 390 700 Z" fill={rouge} />
      <path d="M150 700 Q210 500 270 700 Z" fill={clair} />
      {neige > 0 ? <path d={`M60 ${672} Q210 ${500 - neige * 1.5} 360 672 Q210 ${520} 60 672 Z`} fill="#F7FCFD" /> : null}
      {n >= 14
        ? Array.from({ length: 8 }, (_, k) => {
            const x = 44 + k * 46;
            const long = (28 + hachage(k, 9) * 46) * entre(n, 14, 21);
            return <path key={k} d={`M${x} 698 L${x + 18} 698 L${x + 9} ${700 + long} Z`} fill="#CFEFFA" />;
          })
        : null}
    </g>
  );
};

const Thermometre: React.FC<{ n: number }> = ({ n }) => {
  const x = 830;
  const haut = interpolate(n, [0, N_MERCURE], [640, 990], { extrapolateRight: "clamp" });
  const gele = n >= N_MERCURE;
  const eclat = entre(n, N_MERCURE + 1.2, N_MERCURE + 1.9);
  const metal = gele ? "#8C96A0" : "#D5301F";
  return (
    <g>
      {eclat < 1 ? (
        <g transform={`translate(${eclat * 90} ${eclat * eclat * 420}) rotate(${eclat * 40} ${x} 760)`} opacity={1 - eclat * 0.3}>
          <rect x={x - 26} y={590} width={52} height={370} rx={26} fill="#FFFFFF" opacity={0.85} />
          {[650, 720, 790, 860, 930].map((y) => (
            <rect key={y} x={x + 8} y={y} width={18} height={7} fill="#3A1A08" />
          ))}
        </g>
      ) : null}
      <path d={`M${x - 26} 950 L${x - 26} 1040 L${x + 26} 1040 L${x + 26} 945 L${x + 8} 965 L${x - 8} 938 Z`} fill="#FFFFFF" opacity={0.85} />
      {eclat < 1 ? <rect x={x - 12} y={haut} width={24} height={1060 - haut} fill={metal} /> : <rect x={x - 12} y={990} width={24} height={70} fill={metal} />}
      <circle cx={x} cy={1072} r={48} fill="#FFFFFF" opacity={0.85} />
      <circle cx={x} cy={1072} r={34} fill={metal} />
      {gele && eclat === 0 ? <path d={`M${x - 26} 800 L${x - 4} 826 L${x - 18} 846 L${x + 12} 872 L${x + 2} 900`} fill="none" stroke="#3A1A08" strokeWidth={6} /> : null}
    </g>
  );
};

const Table: React.FC<{ n: number }> = ({ n }) => {
  const bois = teinte(n, [[0, "#A8743F"], [14, "#D6E4EA"], [24, "#7893AA"], [53, "#5E7890"]]);
  const neige = 26 * entre(n, 13, 24);
  return (
    <g>
      <rect x={510} y={TABLE + 30} width={60} height={700} fill={teinte(n, [[0, "#7A4E2C"], [14, "#B9CCD6"], [24, "#5E7890"]])} />
      <rect x={120} y={TABLE} width={840} height={36} rx={14} fill={bois} />
      {neige > 0 ? <rect x={110} y={TABLE - neige + 4} width={860} height={neige} rx={12} fill="#F7FCFD" /> : null}
      {n >= 8
        ? Array.from({ length: 12 }, (_, k) => {
            const x = 150 + k * 66;
            const long = (30 + hachage(k, 11) * 70) * entre(n, 8, 18);
            return <path key={k} d={`M${x} ${TABLE + 34} L${x + 24} ${TABLE + 34} L${x + 12} ${TABLE + 36 + long} Z`} fill="#CFEFFA" />;
          })
        : null}
    </g>
  );
};

const Sol: React.FC<{ n: number }> = ({ n }) => (
  <rect y={TABLE + 40} width={LARGEUR} height={HAUTEUR} fill={teinte(n, [[0, "#D9A066"], [10, "#F1F7F9"], [24, "#BFD5E4"], [53, "#7A8CA0"]])} />
);

const Cube: React.FC<{ y: number; n: number }> = ({ y, n }) => {
  const face = teinte(n, [[0, "#D6F2FB"], [40, "#A8E2F7"], [62, "#7FD3FF"]]);
  const dessus = teinte(n, [[0, "#F2FCFF"], [40, "#D6F2FB"], [62, "#BFE9FF"]]);
  const cote = teinte(n, [[0, "#A8DCEF"], [40, "#7FC4E6"], [62, "#4BA6DC"]]);
  const c = COTE / 2;
  return (
    <g transform={`translate(${CX} ${y}) rotate(-7)`}>
      <path d={`M${-c} ${-c} L${-c + 46} ${-c - 40} L${c + 46} ${-c - 40} L${c} ${-c} Z`} fill={dessus} />
      <path d={`M${c} ${-c} L${c + 46} ${-c - 40} L${c + 46} ${c - 40} L${c} ${c} Z`} fill={cote} />
      <rect x={-c} y={-c} width={COTE} height={COTE} fill={face} />
      <path d={`M${-c + 26} ${c - 40} L${-c + 26} ${-c + 26} L${-c + 62} ${-c + 26}`} fill="none" stroke="#F7FEFF" strokeWidth={13} strokeLinecap="round" />
    </g>
  );
};

// Le verre éclate en trois morceaux, le bloc de glace reste debout
const MORCEAUX = [
  { d: "M392 700 L414 1130", sens: -1 },
  { d: "M688 700 L666 1130", sens: 1 },
  { d: "M392 700 L688 700 M414 1130 L666 1130", sens: 0.4 },
];

const Aurore: React.FC<{ t: number; opacite: number }> = ({ t, opacite }) => (
  <g opacity={opacite}>
    {[
      { y: 600, couleur: "#49E0A0", vitesse: 0.9 },
      { y: 680, couleur: "#7FE8D0", vitesse: 1.3 },
    ].map(({ y, couleur, vitesse }, k) => {
      const points = Array.from({ length: 10 }, (_, i) => {
        const x = i * 130 - 60;
        return `${x} ${y + 46 * Math.sin(t * vitesse + i * 0.8 + k)}`;
      });
      return <path key={k} d={`M${points.join(" L")} L1180 ${y + 90} L-60 ${y + 90} Z`} fill={couleur} opacity={0.55} />;
    })}
  </g>
);

const Verre: React.FC<{ t: number; n: number; cubeY: number }> = ({ t, n, cubeY }) => {
  const gel = entre(n, 2, 6);
  const eclat = entre(n, 36, 37);
  const niveau = 790 + 5 * Math.sin(t * 2.4) * (1 - gel);
  const eau = teinte(n, [[0, "#BDE7F2"], [6, "#E2F4F9"], [24, "#C2DDEA"]]);
  return (
    <g>
      <path d={`M400 ${niveau} L680 ${niveau} L662 1122 L418 1122 Z`} fill={eau} opacity={0.82} />
      <Cube y={cubeY} n={n} />
      <path d={`M400 ${niveau} L680 ${niveau} L662 1122 L418 1122 Z`} fill="#FFFFFF" opacity={gel * 0.32} />
      {eclat < 1
        ? MORCEAUX.map(({ d, sens }, k) => (
            <path key={k} d={d} fill="none" stroke="#FFFFFF" strokeWidth={13} strokeLinecap="round" opacity={0.9} transform={`translate(${sens * eclat * 190} ${eclat * eclat * 620}) rotate(${sens * eclat * 34} 540 900)`} />
          ))
        : null}
      {n >= 14 && eclat === 0 ? <path d="M655 790 L620 850 L640 900 L590 960 L606 1040 L570 1110" fill="none" stroke="#FFFFFF" strokeWidth={7} /> : null}
    </g>
  );
};

const Neige: React.FC<{ t: number; force: number }> = ({ t, force }) => (
  <g opacity={force}>
    {Array.from({ length: 34 }, (_, k) => {
      const v = 140 + hachage(k, 13) * 160;
      const y = (hachage(k, 14) * 1500 + t * v) % 1500;
      const x = hachage(k, 15) * LARGEUR + Math.sin(t * 1.3 + k) * 26;
      return <circle key={k} cx={x} cy={y - 60} r={7 + hachage(k, 16) * 8} fill="#FFFFFF" />;
    })}
  </g>
);

const Manchot: React.FC<{ n: number; t: number }> = ({ n, t }) => {
  if (n < 22 || n >= 33) {
    return null;
  }
  const x = interpolate(n, [22, 33], [1180, -180]);
  const pas = Math.sin(t * 9) * 7;
  return (
    <g transform={`translate(${x} ${TABLE + 10}) rotate(${pas}) scale(-1 1)`}>
      <path d="M-44 0 Q-66 -110 -34 -170 Q0 -214 34 -170 Q66 -110 44 0 Z" fill="#101A26" />
      <path d="M-22 -8 Q-38 -90 -14 -146 Q18 -168 28 -128 Q40 -70 22 -8 Z" fill="#F2F6F8" />
      <circle cx={16} cy={-168} r={7} fill="#F2F6F8" />
      <path d="M32 -166 L64 -158 L32 -148 Z" fill="#FFB02E" />
      <path d="M-32 -2 L-4 -2 L-14 12 L-40 12 Z" fill="#FFB02E" />
      <path d="M8 -2 L36 -2 L44 12 L18 12 Z" fill="#FFB02E" />
    </g>
  );
};

const Planete: React.FC<{ opacite: number; monte: number; fond: string; marque: React.ReactNode }> = ({ opacite, monte, fond, marque }) => (
  <g opacity={opacite} transform={`translate(790 ${720 - monte * 110})`}>
    <circle r={150} fill={fond} />
    {marque}
  </g>
);

const Pluie: React.FC<{ t: number; force: number; couleur: string }> = ({ t, force, couleur }) => {
  const nombre = Math.round(46 * force);
  return (
    <g>
      {Array.from({ length: nombre }, (_, k) => {
        const v = 1500 + hachage(k, 17) * 700;
        const y = ((hachage(k, 18) * 1700 + t * v) % 1700) - 100;
        const x = hachage(k, 19) * LARGEUR;
        return <rect key={k} x={x} y={y} width={9} height={90} rx={4} fill={couleur} />;
      })}
    </g>
  );
};

const Lac: React.FC<{ t: number; n: number }> = ({ t, n }) => {
  const niveau = interpolate(n, [46, 53], [HAUTEUR, 1030], { extrapolateRight: "clamp" });
  const gele = entre(n, 53, 55);
  const clapot = 12 * (1 - gele);
  const couleur = teinte(n, [[46, "#8CCBF5"], [52, "#A9D8F2"], [55, "#E4F3F6"], [62, "#9FB6C8"]]);
  const crete = Array.from({ length: 10 }, (_, i) => `q60 ${i % 2 === 0 ? -clapot : clapot} 120 0`).join(" ");
  const decale = (t * 120) % 240;
  return (
    <g>
      <path d={`M${-240 - decale} ${niveau} ${crete} ${crete} L1400 ${HAUTEUR + 40} L-240 ${HAUTEUR + 40} Z`} fill={couleur} opacity={0.94 - gele * 0.1} />
      {gele > 0.6
        ? Array.from({ length: 6 }, (_, k) => {
            const x = 70 + k * 170;
            return <path key={k} d={`M${x} ${niveau + 8} L${x + 60} ${niveau + 90} L${x + 36} ${niveau + 180}`} fill="none" stroke="#FFFFFF" strokeWidth={7} opacity={0.8} />;
          })
        : null}
    </g>
  );
};

// Réseau de molécules d'eau : chacune tremble selon la température
const Reseau: React.FC<{ t: number; opacite: number }> = ({ t, opacite }) => {
  const n = pasDecor(t);
  const k = kelvin(n);
  const base = 30 * Math.sqrt(k / 13);
  const reveil = entre(t, calcul.t_tremble, calcul.t_fonte);
  const front = 1100 * reveil * reveil;
  const debout = t >= calcul.t_tremble;
  const centre = { x: 540, y: 830 };
  return (
    <g opacity={opacite}>
      <rect width={LARGEUR} height={HAUTEUR} fill="#0B1E33" />
      {Array.from({ length: 70 }, (_, i) => {
        const ligne = Math.floor(i / 7);
        const colonne = i % 7;
        const x = 90 + colonne * 150 + (ligne % 2) * 75;
        const y = 560 + ligne * 150;
        const distance = Math.hypot(x - centre.x, y - centre.y);
        const active = debout && (distance < front || distance < 60);
        const amplitude = active ? 26 : debout ? 0 : base;
        const dx = amplitude * Math.sin(t * (21 + hachage(i, 20) * 12) + hachage(i, 21) * 6);
        const dy = amplitude * Math.sin(t * (17 + hachage(i, 22) * 14) + hachage(i, 23) * 6);
        const rotation = hachage(i, 24) * 360 + amplitude * Math.sin(t * 13 + i) * 1.4;
        return (
          <g key={i} transform={`translate(${x + dx} ${y + dy}) rotate(${rotation})`}>
            <circle cx={-32} cy={26} r={19} fill="#EAF6FF" />
            <circle cx={32} cy={26} r={19} fill="#EAF6FF" />
            <circle r={36} fill={active ? "#FF8A3D" : "#7FD3FF"} />
          </g>
        );
      })}
    </g>
  );
};

export const SceneIce: React.FC<SceneProps> = ({ t }) => {
  const n = pasDecor(t);
  const palette = paletteA(t);
  const fonte = t >= calcul.t_fonte;
  const chute = entre(t, calcul.t_fonte, calcul.t_fin);
  const cubeY = fonte && t < calcul.t_fin ? interpolate(chute * chute, [0, 1], [-200, CUBE_Y]) : CUBE_Y + 4 * Math.sin(t * 2.4) * (1 - entre(n, 2, 6));
  const zoom = Math.exp(entre(n, 61.5, 65) * Math.log(18));
  const atomes = entre(n, 64, 65);
  const eclair = 1 - entre(t, calcul.t_fonte, calcul.t_fonte + 0.3);
  const visible = (debut: number) => (t >= debut && t < debut + VISIBLE_S ? entre(t, debut, debut + 0.2) * (1 - entre(t, debut + VISIBLE_S - 0.3, debut + VISIBLE_S)) : 0);
  const monte = (debut: number) => entre(t, debut, debut + VISIBLE_S);

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg width={LARGEUR} height={HAUTEUR} viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`} style={{ position: "absolute" }}>
        {atomes < 1 ? (
          <g transform={`translate(${CX} ${CUBE_Y}) scale(${zoom}) translate(${-CX} ${-CUBE_Y})`}>
            <Etoiles opacite={entre(n, 24, 30) * 0.5 + entre(n, 49, 53) * 0.5} />
            {n < 24 ? <Soleil n={n} /> : null}
            {n >= 31 && n < 45 ? <Aurore t={t} opacite={entre(n, 31, 33) * (1 - entre(n, 43, 45))} /> : null}
            <Planete opacite={visible(MARS)} monte={monte(MARS)} fond="#C2562C" marque={<path d="M-70 -132 Q0 -170 70 -132 Q0 -100 -70 -132 Z" fill="#F4EFE6" />} />
            <Planete opacite={visible(PLUTON)} monte={monte(PLUTON)} fond="#B69A7E" marque={<path d="M0 90 Q-120 0 -70 -44 Q-24 -74 0 -26 Q24 -74 70 -44 Q120 0 0 90 Z" fill="#F0E2CC" />} />
            <Mer t={t} n={n} />
            {n < 32 ? <Parasol n={n} /> : null}
            <Sol n={n} />
            <Manchot n={n} t={t} />
            <Table n={n} />
            <Thermometre n={n} />
            <Verre t={t} n={n} cubeY={cubeY} />
            {n >= 13 && n < 31 ? <Neige t={t} force={entre(n, 13, 15) * (1 - entre(n, 29, 31))} /> : null}
            {n >= 46 ? <Lac t={t} n={n} /> : null}
            {n >= 46 && n < 53 ? <Pluie t={t} force={entre(n, 46, 48) * (1 - entre(n, 52, 53))} couleur={n < 49 ? "#8CCBF5" : "#D6F0FF"} /> : null}
          </g>
        ) : null}
        {atomes > 0 ? <Reseau t={t} opacite={atomes} /> : null}
        {fonte && eclair > 0 ? <rect width={LARGEUR} height={HAUTEUR} fill="#FFFFFF" opacity={eclair} /> : null}
      </svg>
    </AbsoluteFill>
  );
};
