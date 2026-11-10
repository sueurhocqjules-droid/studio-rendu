import React from "react";
import { AbsoluteFill, interpolate, interpolateColors } from "remotion";
import calcul from "../../../sujets/ball.calcul.json";
import type { SceneProps } from "../../cadre/types";
import { hauteurBallon, hauteurCamera, hauteurPic, HOOP_M, phaseA, rebondA } from "./temps";

const LARGEUR = 1080;
const HAUTEUR = 1920;
const SOL_Y = 1210;
const HAUT_Y = 540;
const BALLON_X = 720;
const RAYON = 40;
const PANIER_X_M = -1.15;
const SALLE_G_M = -11;
const SALLE_D_M = 13;
const SALLE_H_M = 8;
const TROU_X_M = -0.6;
const TROU_M = 1;

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const hachage = (i: number, k = 0) => {
  let n = Math.imul(i + 1, 374761393) + Math.imul(k + 1, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};

type Vue = { s: number; x: (m: number) => number; y: (m: number) => number };

const vueA = (t: number): Vue => {
  const s = (SOL_Y - HAUT_Y) / hauteurCamera(t);
  return { s, x: (m) => BALLON_X + m * s, y: (m) => SOL_Y - m * s };
};

// Courbure exagérée : à l'échelle exacte, la Terre resterait presque plate à 420 km
const rayonTerre = (v: Vue) => calcul.rayon_m * v.s * 0.15;
const TERRE_PLATE_PX = 60000;

// Le ciel est rangé par altitude réelle : monter, c'est le traverser. Chaque couche va de son sommet au sol
const COUCHES: [number, string][] = [
  [100000, "#0E1A36"],
  [70000, "#1F4C8F"],
  [35000, "#4E90CF"],
  [12000, "#9CCFEA"],
];

const Ciel: React.FC<{ v: Vue }> = ({ v }) => {
  const rayon = rayonTerre(v);
  return (
    <g>
      {COUCHES.map(([sommet, couleur]) => {
        if (rayon < TERRE_PLATE_PX) {
          return <circle key={sommet} cx={BALLON_X} cy={SOL_Y + rayon} r={rayon + sommet * v.s} fill={couleur} />;
        }
        const y = Math.max(-10, v.y(sommet));
        return <rect key={sommet} x={0} y={y} width={LARGEUR} height={HAUTEUR - y} fill={couleur} />;
      })}
    </g>
  );
};

// Les repères arrivent par la gauche quand la caméra recule, au lieu de remplir l'image à l'avance
const entree = (v: Vue, hauteur: number, cible: number, demi: number) => {
  const vue = (SOL_Y - HAUT_Y) / v.s;
  // Le repère n'entre que quand son sommet passe sous le compteur
  const part = interpolate(vue / hauteur, [0.85, 1.2], [0, 1], borne);
  const dehors = -BALLON_X / v.s - demi * 1.1;
  return dehors + (cible - dehors) * (1 - Math.pow(1 - part, 3));
};

const Etoiles: React.FC<{ v: Vue }> = ({ v }) => {
  const haut = v.y(100000);
  if (haut < 20) {
    return null;
  }
  return (
    <g>
      {Array.from({ length: 70 }, (_, k) => {
        const y = hachage(k, 2) * SOL_Y;
        return y < haut ? <circle key={k} cx={hachage(k, 1) * LARGEUR} cy={y} r={1.5 + hachage(k, 3) * 2.5} fill="#F3EAD7" /> : null;
      })}
    </g>
  );
};

const Terre: React.FC<{ v: Vue }> = ({ v }) => {
  const rayon = rayonTerre(v);
  const altitude = (SOL_Y - HAUT_Y) / v.s;
  const couleur = interpolateColors(altitude, [1000, 12000, 60000], ["#4F8F4E", "#3C8A6E", "#1E5FA8"]);
  if (rayon >= TERRE_PLATE_PX) {
    return <rect x={0} y={SOL_Y} width={LARGEUR} height={HAUTEUR - SOL_Y} fill={couleur} />;
  }
  const nuages = Array.from({ length: 9 }, (_, k) => ({
    k,
    x: hachage(k, 4) * LARGEUR,
    y: SOL_Y + 90 + hachage(k, 5) * 560,
  })).filter(({ x, y }) => Math.hypot(x - BALLON_X, y - SOL_Y - rayon) < rayon - 150);
  return (
    <g>
      <circle cx={BALLON_X} cy={SOL_Y + rayon} r={rayon} fill={couleur} />
      {altitude > 40000
        ? nuages.map(({ k, x, y }) => (
            <ellipse key={k} cx={x} cy={y} rx={70 + hachage(k, 6) * 130} ry={16 + hachage(k, 7) * 22} fill="#EAF3F7" opacity={0.75} />
          ))
        : null}
    </g>
  );
};

const Nuages: React.FC<{ v: Vue }> = ({ v }) => {
  if (v.s > 1.2 || v.s < 0.004) {
    return null;
  }
  return (
    <g>
      {Array.from({ length: 16 }, (_, k) => {
        const m = 1200 + hachage(k, 8) * 5200;
        const x = v.x((hachage(k, 9) - 0.75) * 7000);
        const largeur = (900 + hachage(k, 10) * 900) * v.s;
        return <rect key={k} x={x} y={v.y(m)} width={largeur} height={largeur * 0.16} rx={largeur * 0.08} fill="#FFFDF6" />;
      })}
    </g>
  );
};

// Un seul bâtiment à l'échelle de la règle : les autres ne sont là que pour donner la ville
const Ville: React.FC<{ v: Vue }> = ({ v }) => {
  if (v.s < 0.2) {
    return null;
  }
  const immeubles = Array.from({ length: 22 }, (_, k) => {
    const x = -130 + k * 12;
    const h = 9 + hachage(k, 11) * 15;
    return { k, x, h, l: 10 };
  }).filter(({ x }) => Math.abs(x + 5) > 22);
  return (
    <g>
      {immeubles.map(({ k, x, h, l }) => (
        <rect key={k} x={v.x(x)} y={v.y(h)} width={l * v.s} height={h * v.s} fill={k % 3 === 0 ? "#6E7B8A" : "#7E8C99"} />
      ))}
    </g>
  );
};

const Immeuble: React.FC<{ v: Vue }> = ({ v }) => {
  const largeur = 14;
  const x = entree(v, 30, -17, largeur / 2) - largeur / 2;
  const fenetres: React.ReactNode[] = [];
  for (let e = 0; e < 10; e++) {
    for (let c = 0; c < 4; c++) {
      fenetres.push(
        <rect key={`${e}:${c}`} x={v.x(x + 1.2 + c * 3.1)} y={v.y(3 * e + 2.3)} width={1.8 * v.s} height={1.5 * v.s} fill="#FFE9A8" />,
      );
    }
  }
  return (
    <g>
      <rect x={v.x(x)} y={v.y(30)} width={largeur * v.s} height={30 * v.s} fill="#3A4656" />
      {v.s > 3 ? fenetres : null}
    </g>
  );
};

const Pyramide: React.FC<{ v: Vue }> = ({ v }) => {
  const h = 138.5;
  const demi = 115;
  const x = entree(v, h, -70, demi);
  return (
    <g>
      <path d={`M${v.x(x - demi)} ${SOL_Y} L${v.x(x)} ${v.y(h)} L${v.x(x + demi)} ${SOL_Y} Z`} fill="#D9B36A" />
      <path d={`M${v.x(x)} ${v.y(h)} L${v.x(x + demi)} ${SOL_Y} L${v.x(x + demi * 0.3)} ${SOL_Y} Z`} fill="#BC9650" />
    </g>
  );
};

// Tour à gradins : des étages de plus en plus fins, sans reprendre de marque
const Tour: React.FC<{ v: Vue }> = ({ v }) => {
  const x = entree(v, 828, -270, 35);
  const gradins: [number, number][] = [
    [0, 70],
    [230, 52],
    [400, 36],
    [540, 22],
    [640, 10],
    [720, 3],
  ];
  return (
    <g>
      {gradins.map(([bas, largeur], k) => {
        const haut = k + 1 < gradins.length ? gradins[k + 1][0] : 828;
        return (
          <rect
            key={bas}
            x={v.x(x - largeur / 2)}
            y={v.y(haut)}
            width={largeur * v.s}
            height={(haut - bas) * v.s + 1}
            fill={k % 2 === 0 ? "#44566B" : "#54687F"}
          />
        );
      })}
    </g>
  );
};

const Avion: React.FC<{ t: number; v: Vue }> = ({ t, v }) => {
  if (v.s > 0.3 || v.s < 0.002) {
    return null;
  }
  // À droite du ballon : ni l'avion ni le ballon sonde ne passent derrière le compteur
  const x = v.x(3000) - (t - 42) * 26;
  const y = v.y(11000);
  return (
    <g transform={`translate(${x} ${y}) scale(-1 1)`}>
      <path d="M-120 0 Q-120 -16 -96 -16 L88 -16 Q120 -12 132 0 Q120 12 88 12 L-96 12 Q-120 12 -120 0 Z" fill="#FFFDF6" stroke="#14110D" strokeWidth={4} />
      <path d="M-104 -14 L-128 -52 L-92 -52 L-64 -14 Z" fill="#C8261C" stroke="#14110D" strokeWidth={4} />
      <path d="M-20 2 L-64 48 L-24 48 L40 2 Z" fill="#D7DEE5" stroke="#14110D" strokeWidth={4} />
    </g>
  );
};

const BallonMeteo: React.FC<{ v: Vue }> = ({ v }) => {
  if (v.s > 0.1 || v.s < 0.0008) {
    return null;
  }
  const x = v.x(8000);
  const y = v.y(30000);
  return (
    <g>
      <line x1={x} y1={y + 60} x2={x} y2={y + 170} stroke="#FFFDF6" strokeWidth={4} />
      <rect x={x - 18} y={y + 170} width={36} height={26} fill="#FFFDF6" stroke="#14110D" strokeWidth={3} />
      <circle cx={x} cy={y} r={64} fill="#FFFDF6" stroke="#14110D" strokeWidth={4} />
      <ellipse cx={x - 20} cy={y - 22} rx={16} ry={22} fill="#C7DDEA" />
    </g>
  );
};

const Karman: React.FC<{ v: Vue }> = ({ v }) => {
  const y = v.y(100000);
  if (y < 0 || y > SOL_Y) {
    return null;
  }
  return <line x1={0} y1={y} x2={LARGEUR} y2={y} stroke="#FFE36B" strokeWidth={6} strokeDasharray="34 22" />;
};

const Station: React.FC<{ t: number; v: Vue }> = ({ t, v }) => {
  if (v.s > 0.01) {
    return null;
  }
  const x = v.x(-110000) - 20;
  const y = v.y(calcul.paliers[calcul.paliers.length - 1].cible_m) + Math.sin(t * 1.4) * 4;
  const panneau = (dx: number) => (
    <g key={dx}>
      <rect x={dx} y={-46} width={72} height={36} fill="#1E3E73" stroke="#E9EEF3" strokeWidth={3} />
      <rect x={dx} y={10} width={72} height={36} fill="#1E3E73" stroke="#E9EEF3" strokeWidth={3} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-130} y={-5} width={260} height={10} fill="#C8CFD6" />
      {panneau(-128)}
      {panneau(56)}
      <rect x={-46} y={-20} width={92} height={40} rx={10} fill="#E9EEF3" stroke="#6B7680" strokeWidth={3} />
      <circle cx={0} cy={0} r={10} fill="#6B7680" />
    </g>
  );
};

const Salle: React.FC<{ t: number; v: Vue; apresToit: boolean }> = ({ t, v, apresToit }) => {
  if (v.s < 0.4) {
    return null;
  }
  const g = v.x(SALLE_G_M);
  const d = v.x(SALLE_D_M);
  const toit = v.y(SALLE_H_M);
  const epaisseur = Math.max(0.35 * v.s, 3);
  const trouG = v.x(TROU_X_M - TROU_M);
  const trouD = v.x(TROU_X_M + TROU_M);
  // La fin de la vidéo garde le trou : le ballon rentre par où il est sorti
  return (
    <g>
      <rect x={g} y={toit} width={d - g} height={SOL_Y - toit} fill="#E8833A" />
      <rect x={g} y={v.y(1.1)} width={d - g} height={1.1 * v.s} fill="#C9642A" />
      {apresToit ? (
        <g>
          <rect x={g} y={toit - epaisseur} width={trouG - g} height={epaisseur} fill="#3A2A20" />
          <rect x={trouD} y={toit - epaisseur} width={d - trouD} height={epaisseur} fill="#3A2A20" />
        </g>
      ) : (
        <rect x={g} y={toit - epaisseur} width={d - g} height={epaisseur} fill="#3A2A20" />
      )}
      <Eclats t={t} v={v} />
    </g>
  );
};

const Parquet: React.FC<{ v: Vue }> = ({ v }) => {
  if (v.s < 0.4) {
    return null;
  }
  const g = v.x(SALLE_G_M);
  const d = v.x(SALLE_D_M);
  // Le parquet a une épaisseur réelle : il rétrécit avec la salle et laisse place au sol
  const epaisseur = Math.min(HAUTEUR - SOL_Y, 8 * v.s);
  const lames = Array.from({ length: 12 }, (_, k) => k).filter((k) => 26 + k * 58 < epaisseur);
  return (
    <g>
      <rect x={g} y={SOL_Y} width={d - g} height={epaisseur} fill="#C98B4E" />
      {lames.map((k) => (
        <rect key={k} x={g} y={SOL_Y + 26 + k * 58} width={d - g} height={4} fill="#A96F38" />
      ))}
      <rect x={g} y={SOL_Y} width={d - g} height={10} fill="#FFF6E6" />
    </g>
  );
};

const Eclats: React.FC<{ t: number; v: Vue }> = ({ t, v }) => {
  const toit = calcul.paliers[0];
  const age = t - toit.arrivee_s + 0.05;
  if (age < 0 || age > 1.3) {
    return null;
  }
  return (
    <g>
      {Array.from({ length: 16 }, (_, k) => {
        const angle = -Math.PI / 2 + (hachage(k, 12) - 0.5) * 1.9;
        const vitesse = 500 + hachage(k, 13) * 700;
        const x = v.x(0) + Math.cos(angle) * vitesse * age;
        const y = v.y(SALLE_H_M) + Math.sin(angle) * vitesse * age + 900 * age * age;
        const cote = 14 + hachage(k, 14) * 22;
        return (
          <rect key={k} x={x} y={y} width={cote} height={cote * 0.6} fill="#3A2A20" transform={`rotate(${age * 400 * (hachage(k, 15) - 0.5)} ${x} ${y})`} />
        );
      })}
    </g>
  );
};

const Panier: React.FC<{ v: Vue; devant: boolean; balancement: number }> = ({ v, devant, balancement }) => {
  if (v.s < 8) {
    return null;
  }
  const x = v.x(PANIER_X_M);
  const y = v.y(HOOP_M);
  const r = 0.33 * v.s;
  if (!devant) {
    return (
      <g>
        <rect x={x - r - 0.16 * v.s} y={y - 0.85 * v.s} width={0.06 * v.s} height={1.07 * v.s} fill="#FFFDF6" stroke="#3A2A20" strokeWidth={3} />
        <rect x={x - r - 0.6 * v.s} y={y - 0.2 * v.s} width={0.46 * v.s} height={0.07 * v.s} fill="#3A2A20" />
        <rect x={x - r - 0.66 * v.s} y={y - 0.2 * v.s} width={0.08 * v.s} height={3.3 * v.s} fill="#3A2A20" />
        <ellipse cx={x} cy={y} rx={r} ry={r * 0.26} fill="none" stroke="#A8240F" strokeWidth={8} />
      </g>
    );
  }
  const bas = 0.42 * v.s * (1 + balancement * 0.35);
  const fils = [-1, -0.5, 0, 0.5, 1];
  return (
    <g>
      {fils.map((f) => (
        <line key={f} x1={x + f * r} y1={y} x2={x + f * r * 0.6} y2={y + bas} stroke="#FFFDF6" strokeWidth={4} />
      ))}
      <path d={`M${x - r * 0.8} ${y + bas * 0.5} H${x + r * 0.8} M${x - r * 0.6} ${y + bas} H${x + r * 0.6}`} stroke="#FFFDF6" strokeWidth={4} />
      <path d={`M${x - r} ${y} A${r} ${r * 0.26} 0 0 0 ${x + r} ${y}`} fill="none" stroke="#D6391F" strokeWidth={10} />
    </g>
  );
};

// Les derniers rebonds restent dessinés derrière le ballon : on voit la courbe monter
const Trace: React.FC<{ t: number; v: Vue; couleur: string }> = ({ t, v, couleur }) => {
  if (t >= calcul.t_chute) {
    return null;
  }
  const n = rebondA(t);
  const pas = 96;
  const decale = (t < calcul.t_iss ? phaseA(t) : 1) * pas;
  const opacite = interpolate(t, [calcul.t_iss, calcul.t_chute], [1, 0], borne);
  return (
    <g opacity={opacite}>
      {Array.from({ length: 7 }, (_, k) => k + 1).map((j) => {
        if (n - j < 1) {
          return null;
        }
        const x = BALLON_X - j * pas - decale + pas / 2;
        const sommet = SOL_Y - 2 * hauteurPic(n - j) * v.s;
        return (
          <path
            key={j}
            d={`M${x - pas / 2} ${SOL_Y} Q${x} ${sommet} ${x + pas / 2} ${SOL_Y}`}
            fill="none"
            stroke={couleur}
            strokeWidth={9 - j * 0.8}
            opacity={0.85 - j * 0.1}
          />
        );
      })}
    </g>
  );
};

const Ballon: React.FC<{ t: number; x: number; y: number; ecrase: number; feu: number }> = ({ t, x, y, ecrase, feu }) => {
  const couleur = interpolateColors(feu, [0, 1], ["#E8732A", "#FF3B1F"]);
  return (
    <g transform={`translate(${x} ${y}) scale(${1 + ecrase * 0.22} ${1 - ecrase * 0.3}) rotate(${t * 220})`}>
      <circle r={RAYON} fill={couleur} stroke="#2B1608" strokeWidth={5} />
      <path d={`M${-RAYON} 0 H${RAYON} M0 ${-RAYON} V${RAYON}`} stroke="#2B1608" strokeWidth={4} />
      <path d={`M${-RAYON * 0.68} ${-RAYON * 0.72} Q${-RAYON * 0.2} 0 ${-RAYON * 0.68} ${RAYON * 0.72}`} fill="none" stroke="#2B1608" strokeWidth={4} />
      <path d={`M${RAYON * 0.68} ${-RAYON * 0.72} Q${RAYON * 0.2} 0 ${RAYON * 0.68} ${RAYON * 0.72}`} fill="none" stroke="#2B1608" strokeWidth={4} />
    </g>
  );
};

const Flammes: React.FC<{ t: number; x: number; y: number; force: number }> = ({ t, x, y, force }) => {
  if (force <= 0) {
    return null;
  }
  const vacille = 1 + Math.sin(t * 40) * 0.08;
  const haut = 300 * force * vacille;
  return (
    <g>
      <path d={`M${x - RAYON} ${y} Q${x - RAYON * 0.6} ${y - haut * 0.5} ${x} ${y - haut} Q${x + RAYON * 0.6} ${y - haut * 0.5} ${x + RAYON} ${y} Z`} fill="#FF7A1F" />
      <path d={`M${x - RAYON * 0.6} ${y} Q${x - RAYON * 0.3} ${y - haut * 0.3} ${x} ${y - haut * 0.6} Q${x + RAYON * 0.3} ${y - haut * 0.3} ${x + RAYON * 0.6} ${y} Z`} fill="#FFE36B" />
    </g>
  );
};

const Onde: React.FC<{ t: number; x: number; y: number }> = ({ t, x, y }) => {
  const son = calcul.paliers.find((p) => p.cle === "son");
  // Le bang part du sol, à l'instant où le ballon le quitte
  const age = son ? t - son.arrivee_s + calcul.rebond_s / 2 : -1;
  if (age < 0 || age > 1.3) {
    return null;
  }
  return (
    <g fill="none" stroke="#FFFDF6">
      {[0, 0.22, 0.44].map((retard) => {
        const a = age - retard;
        return a > 0 ? <circle key={retard} cx={x} cy={y} r={40 + a * 1000} strokeWidth={12} opacity={Math.max(0, 1 - a / 0.85)} /> : null;
      })}
    </g>
  );
};

const Poussiere: React.FC<{ t: number; x: number }> = ({ t, x }) => {
  if (t >= calcul.t_iss) {
    return null;
  }
  const age = phaseA(t) * calcul.rebond_s;
  if (age > 0.2) {
    return null;
  }
  const r = 50 + age * 900;
  return <ellipse cx={x} cy={SOL_Y} rx={r} ry={r * 0.13} fill="none" stroke="#FFF6E6" strokeWidth={6} opacity={1 - age * 5} />;
};

export const SceneBall: React.FC<SceneProps> = ({ t }) => {
  const v = vueA(t);
  const h = hauteurBallon(t);
  const apresToit = t >= calcul.paliers[0].arrivee_s - 0.05 && t < calcul.t_fin;
  // Le ballon quitte le panier au premier rebond et y retourne pendant la chute
  const depart = interpolate(t, [0, 1], [PANIER_X_M, 0], borne);
  const retour = interpolate(t, [calcul.t_panier - 1.6, calcul.t_panier - 0.1], [0, PANIER_X_M], borne);
  const xMetres = t < calcul.t_iss ? depart : retour;
  const x = v.x(xMetres);
  const y = v.y(h) - RAYON;
  const contact = t < calcul.t_iss ? Math.max(0, 1 - h / 0.3) : 0;
  const ageChute = t - calcul.t_chute;
  const feu = t >= calcul.t_chute && t < calcul.t_panier ? interpolate(ageChute, [0.4, 1.6], [0, 1], borne) * interpolate(ageChute, [3.6, 4.3], [1, 0], borne) : 0;
  const balancement = t >= calcul.t_panier ? interpolate(t - calcul.t_panier, [0, 0.3], [1, 0], borne) : 0;
  const trace = t < 45 ? "#A8240F" : "#FFB020";
  const hover = t >= calcul.t_iss && t < calcul.t_chute ? Math.sin((t - calcul.t_iss) * 3) * 6 : 0;
  return (
    <AbsoluteFill>
      <svg width={LARGEUR} height={HAUTEUR} viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`} style={{ position: "absolute" }}>
        <rect x={0} y={0} width={LARGEUR} height={HAUTEUR} fill="#070B18" />
        <Etoiles v={v} />
        <Ciel v={v} />
        <Karman v={v} />
        <Nuages v={v} />
        <BallonMeteo v={v} />
        <Avion t={t} v={v} />
        <Station t={t} v={v} />
        <Tour v={v} />
        <Pyramide v={v} />
        <Ville v={v} />
        <Immeuble v={v} />
        <Terre v={v} />
        <Salle t={t} v={v} apresToit={apresToit} />
        <Parquet v={v} />
        <Panier v={v} devant={false} balancement={balancement} />
        <Trace t={t} v={v} couleur={trace} />
        <Poussiere t={t} x={x} />
        <ellipse cx={x} cy={SOL_Y + 8} rx={RAYON * (1.2 - Math.min(h * v.s, 500) / 900)} ry={9} fill="#000000" opacity={0.28} />
        <Onde t={t} x={x} y={SOL_Y} />
        <Flammes t={t} x={x} y={y + hover} force={feu} />
        <Ballon t={t} x={x} y={y + hover} ecrase={contact} feu={feu} />
        <Panier v={v} devant balancement={balancement} />
      </svg>
    </AbsoluteFill>
  );
};
