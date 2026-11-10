import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import calcul from "../../../sujets/gravity.calcul.json";
import texte from "../../../sujets/gravity.json";
import { ANTON, MONO } from "../../cadre/polices";
import type { SceneProps } from "../../cadre/types";
import { COUCHES, CUISINE, entre, facteur, hauteurCiel, paletteA, pasCompteur, pasDecor, profondeur } from "./temps";

const LARGEUR = 1080;
const HAUTEUR = 1920;
const CX = 540;
const PLATEAU = 1040; // dessus de la table
const SOL = 1700; // sol de la cuisine, dans le monde
const SOL_ECRAN = 1150;
const RAYON_POMME = 105;
const HAUT_BALANCE = 125;
const CENTRE_TERRE = 800;
const R_TERRE = 300;

const seuil = (cle: string) => {
  const palier = calcul.paliers.find((p) => p.cle === cle);
  if (!palier) {
    throw new Error(`Palier inconnu : ${cle}`);
  }
  return palier;
};

const N_CASSE = seuil("personne").pas;
const BALEINE = seuil("baleine").arrivee_s;
const EIFFEL = seuil("eiffel").arrivee_s;
const VISIBLE_S = 2.6;

const hachage = (i: number, k = 0) => {
  let n = Math.imul(i + 1, 374761393) + Math.imul(k + 1, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};

// La pomme, ancrée par le bas : elle s'écrase sans décoller
const Pomme: React.FC<{ x: number; bas: number; rayon: number; ecrase: number }> = ({ x, bas, rayon, ecrase }) => (
  <g transform={`translate(${x} ${bas}) scale(${(1 + ecrase * 0.8) * (rayon / RAYON_POMME)} ${(1 - ecrase) * (rayon / RAYON_POMME)})`}>
    <path d="M6 -206 Q2 -236 22 -250" fill="none" stroke="#5A3A22" strokeWidth={13} strokeLinecap="round" />
    <path d="M14 -222 Q60 -262 96 -226 Q54 -196 14 -222 Z" fill="#4E8C3A" />
    <path d="M0 -190 C-44 -226 -112 -204 -112 -122 C-112 -48 -56 0 -22 0 C-10 0 -6 -6 0 -6 C6 -6 10 0 22 0 C56 0 112 -48 112 -122 C112 -204 44 -226 0 -190 Z" fill="#C8321F" />
    <path d="M-70 -150 Q-74 -176 -44 -182" fill="none" stroke="#EE7A5E" strokeWidth={16} strokeLinecap="round" />
  </g>
);

// La balance est posée sur `bas`. `hauteur` à 1 : intacte, proche de 0 : écrasée
const Balance: React.FC<{ bas: number; hauteur: number; enfonce: number; ecran: string; rouge: boolean; tare: string; appui: number }> = ({ bas, hauteur, enfonce, ecran, rouge, tare, appui }) => (
  <g transform={`translate(0 ${bas}) scale(1 ${hauteur})`}>
    <rect x={500} y={-125 + enfonce} width={80} height={40} fill="#A8A092" />
    <rect x={300} y={-125 + enfonce} width={480} height={24} rx={8} fill="#CFC8BA" />
    <rect x={230} y={-100} width={620} height={100} rx={14} fill="#E8E0D0" />
    <rect x={250} y={-90} width={390} height={80} rx={6} fill="#1B2420" />
    <text x={445} y={-26} textAnchor="middle" fontFamily={MONO} fontSize={66} fill={rouge ? "#FF5A3C" : "#9BE8A8"}>
      {ecran}
    </text>
    <rect x={660} y={-90 + appui * 6} width={170} height={80} rx={10} fill={appui > 0 ? "#FF8A3D" : "#B5301A"} />
    <text x={745} y={-22 + appui * 6} textAnchor="middle" fontFamily={ANTON} fontSize={64} fill="#FFF4DD">
      {tare}
    </text>
  </g>
);

const Fenetre = () => (
  <g>
    <rect x={100} y={550} width={290} height={320} fill="#FFF8EA" />
    <rect x={118} y={568} width={254} height={284} fill="#8CCBE8" />
    <rect x={238} y={568} width={14} height={284} fill="#FFF8EA" />
    <rect x={118} y={702} width={254} height={14} fill="#FFF8EA" />
  </g>
);

const Lampe: React.FC<{ n: number }> = ({ n }) => {
  const chute = entre(n, 15, 15.45);
  if (chute >= 1) {
    return null;
  }
  const x = 880;
  const y = interpolate(chute * chute, [0, 1], [560 + n * 16, PLATEAU - 90]);
  return (
    <g>
      {chute === 0 ? <line x1={x} y1={-700} x2={x} y2={y} stroke="#2B1C0E" strokeWidth={7} /> : null}
      <path d={`M${x - 26} ${y} L${x + 26} ${y} L${x + 96} ${y + 90} L${x - 96} ${y + 90} Z`} fill="#B5301A" />
      <circle cx={x} cy={y + 92} r={24} fill="#FFE27A" />
    </g>
  );
};

const Table: React.FC<{ n: number; flexion: number; casse: number }> = ({ flexion, casse }) => {
  const pied = (x: number, sens: number) => (
    <rect x={x} y={PLATEAU + 30} width={46} height={SOL - PLATEAU - 30} fill="#7A4E2C" transform={`rotate(${sens * casse * 86} ${x + 23} ${SOL})`} />
  );
  if (casse === 0) {
    return (
      <g>
        {pied(120, 0)}
        {pied(914, 0)}
        <path d={`M60 ${PLATEAU} Q${CX} ${PLATEAU + flexion * 2} 1020 ${PLATEAU} L1020 ${PLATEAU + 44} Q${CX} ${PLATEAU + 44 + flexion * 2} 60 ${PLATEAU + 44} Z`} fill="#A8743F" />
        {flexion > 26 ? <path d={`M${CX - 8} ${PLATEAU + 44 + flexion} L${CX + 14} ${PLATEAU + 24 + flexion} L${CX - 10} ${PLATEAU + 14 + flexion} L${CX + 8} ${PLATEAU + flexion}`} fill="none" stroke="#3A2214" strokeWidth={7} /> : null}
      </g>
    );
  }
  return (
    <g>
      {pied(120, -1)}
      {pied(914, 1)}
      <g transform={`translate(0 ${casse * (SOL - PLATEAU - 60)}) rotate(${casse * 26} 60 ${PLATEAU})`}>
        <path d={`M60 ${PLATEAU} L${CX - 10} ${PLATEAU} L${CX + 12} ${PLATEAU + 22} L${CX - 10} ${PLATEAU + 44} L60 ${PLATEAU + 44} Z`} fill="#A8743F" />
      </g>
      <g transform={`translate(0 ${casse * (SOL - PLATEAU - 60)}) rotate(${-casse * 26} 1020 ${PLATEAU})`}>
        <path d={`M1020 ${PLATEAU} L${CX + 4} ${PLATEAU} L${CX + 26} ${PLATEAU + 22} L${CX + 4} ${PLATEAU + 44} L1020 ${PLATEAU + 44} Z`} fill="#A8743F" />
      </g>
    </g>
  );
};

const Etoiles: React.FC<{ attraction: number }> = ({ attraction }) => (
  <g>
    {Array.from({ length: 70 }, (_, k) => {
      const a = hachage(k, 1) * Math.PI * 2;
      const r = (340 + hachage(k, 2) * 900) * (1 - attraction * (0.45 + hachage(k, 3) * 0.3));
      return <circle key={k} cx={CX + Math.cos(a) * r} cy={CENTRE_TERRE + Math.sin(a) * r} r={3 + hachage(k, 4) * 3} fill="#F4EFE6" />;
    })}
  </g>
);

const Dehors: React.FC<{ n: number; surface: number }> = ({ n, surface }) => {
  const ligne = SOL_ECRAN - 960 * hauteurCiel(n);
  return (
    <g>
      <rect width={LARGEUR} height={HAUTEUR} fill="#0B0C16" />
      <Etoiles attraction={0} />
      <circle cx={815} cy={640} r={78} fill="#FFD24A" />
      {ligne < surface ? (
        <g>
          <rect y={ligne} width={LARGEUR} height={surface - ligne} fill="#8CCBE8" opacity={0.92} />
          {ligne > 0 ? <rect y={ligne - 5} width={LARGEUR} height={10} fill="#F4FBFF" /> : null}
        </g>
      ) : null}
    </g>
  );
};

const Couches: React.FC<{ surface: number }> = ({ surface }) => (
  <g>
    <rect y={surface} width={LARGEUR} height={COUCHES.roche + 8} fill="#5B3A26" />
    <rect y={surface + COUCHES.roche} width={LARGEUR} height={COUCHES.manteau - COUCHES.roche + 8} fill="#55545C" />
    <rect y={surface + COUCHES.manteau} width={LARGEUR} height={COUCHES.noyau - COUCHES.manteau + 8} fill="#A63A12" />
    <rect y={surface + COUCHES.noyau} width={LARGEUR} height={12000} fill="#FFC24A" />
    {Array.from({ length: 230 }, (_, k) => {
      const profond = hachage(k, 5) * COUCHES.noyau;
      const y = surface + profond;
      if (y < -90 || y > HAUTEUR + 90) {
        return null;
      }
      const couleur = profond < COUCHES.roche ? "#7A5536" : profond < COUCHES.manteau ? "#6F6E78" : "#D9651F";
      return <ellipse key={k} cx={hachage(k, 6) * LARGEUR} cy={y} rx={22 + hachage(k, 7) * 58} ry={12 + hachage(k, 8) * 26} fill={couleur} />;
    })}
    <rect y={surface} width={LARGEUR} height={34} fill="#8F5B35" />
  </g>
);

const Baleine: React.FC<{ opacite: number }> = ({ opacite }) => (
  <g opacity={opacite} transform="translate(540 590)">
    <path d="M-340 0 L-400 -66 L-372 0 L-400 66 Z M-350 -10 Q-120 -92 240 -88 Q420 -60 420 0 Q420 60 240 88 Q-120 92 -350 10 Z" fill="#FFF1D6" />
    <circle cx={300} cy={-14} r={11} fill="#A63A12" />
  </g>
);

const Tour: React.FC<{ opacite: number }> = ({ opacite }) => (
  <g opacity={opacite} transform={`translate(${CX} ${CENTRE_TERRE})`} fill="#FFF1D6">
    <path d="M-120 240 Q-44 70 -14 -240 L14 -240 Q44 70 120 240 L76 240 Q40 150 0 150 Q-40 150 -76 240 Z" />
    <rect x={-70} y={40} width={140} height={22} />
    <rect x={-44} y={-70} width={88} height={18} />
  </g>
);

const Terre: React.FC<{ t: number; n: number }> = ({ t, n }) => {
  const recul = entre(n, 45.5, 48.5);
  const r = R_TERRE * (1 + 40 * Math.pow(1 - recul, 3));
  const noir = entre(n, 58, 60.6);
  const anneau = noir * (1 - entre(t, calcul.t_limite + 1.2, calcul.t_allumee));
  const portee = 300 * (1 - entre(n, 49, 60.4));
  const repere = 14 + (RAYON_POMME - 14) * (1 - recul);
  return (
    <g>
      <rect width={LARGEUR} height={HAUTEUR} fill="#0B0C16" opacity={entre(recul, 0.3, 0.5)} />
      <Etoiles attraction={Math.pow(entre(n, 53, 60.6), 2)} />
      <circle cx={CX} cy={CENTRE_TERRE} r={r} fill="#3B2A20" />
      <circle cx={CX} cy={CENTRE_TERRE} r={r * 0.97} fill="#A63A12" />
      <circle cx={CX} cy={CENTRE_TERRE} r={r * 0.55} fill="#E9842B" />
      <circle cx={CX} cy={CENTRE_TERRE} r={r * 0.2} fill="#FFC24A" />
      <circle cx={CX} cy={CENTRE_TERRE} r={repere} fill="#C8321F" />
      {recul >= 1 ? <circle cx={CX} cy={CENTRE_TERRE} r={42} fill="none" stroke="#FFF1D6" strokeWidth={7} /> : null}
      {recul >= 1 && portee > 8
        ? Array.from({ length: 14 }, (_, k) => {
            const a = (k / 14) * Math.PI * 2;
            const b = a + 0.1 + 0.42 * (1 - portee / 300);
            const pointe = (a + b) / 2;
            const x = (angle: number, rayon: number) => CX + Math.cos(angle) * rayon;
            const y = (angle: number, rayon: number) => CENTRE_TERRE + Math.sin(angle) * rayon;
            return (
              <path
                key={k}
                d={`M${x(a, R_TERRE)} ${y(a, R_TERRE)} Q${x(pointe, R_TERRE + portee * 2)} ${y(pointe, R_TERRE + portee * 2)} ${x(b, R_TERRE)} ${y(b, R_TERRE)}`}
                fill="none"
                stroke="#FFD27A"
                strokeWidth={8}
                strokeDasharray="34 26"
                strokeDashoffset={-t * 260}
              />
            );
          })
        : null}
      {noir > 0 ? <circle cx={CX} cy={CENTRE_TERRE} r={R_TERRE + 2} fill="#000000" opacity={noir} /> : null}
      {anneau > 0 ? <circle cx={CX} cy={CENTRE_TERRE} r={R_TERRE + 8} fill="none" stroke="#FF8A3D" strokeWidth={10} opacity={anneau} /> : null}
    </g>
  );
};

export const SceneGravity: React.FC<SceneProps> = ({ t, langue }) => {
  const L = texte[langue];
  const n = pasDecor(t);
  const seconde = Math.floor(pasCompteur(t) + 1e-9);
  const palette = paletteA(t);

  const flexion = 36 * Math.pow(Math.min(n / N_CASSE, 1), 3);
  const casse = entre(n, N_CASSE, N_CASSE + 0.45);
  const decale = (SOL - SOL_ECRAN) * entre(n, N_CASSE, N_CASSE + 0.6);
  const d = profondeur(n);
  const surface = SOL - decale - d;
  const tasse = entre(n, 22.5, 24);
  const dehors = n >= 22.4 && n < 47;
  const terre = n >= 45.5;

  // La balance suit le plateau qui plie, puis tombe avec lui
  const posee = PLATEAU + flexion;
  const basBalance = interpolate(casse * casse, [0, 1], [posee, SOL]);
  const hauteurBalance = 1 - 0.82 * entre(n, N_CASSE + 0.3, N_CASSE + 0.6);
  const enfonce = Math.min(n * 1.3, 22);
  const dessusBalance = basBalance - (HAUT_BALANCE - enfonce) * hauteurBalance;

  // La pomme tombe du haut de l'image après la tare
  const tare = t >= calcul.t_tare;
  const chute = entre(t, calcul.t_tare, calcul.t_fin);
  const basPomme = tare
    ? interpolate(chute * chute, [0, 1], [-120, dessusBalance])
    : dessusBalance - decale - 225 * entre(n, 33, 36);

  const ecrase = 0.24 * entre(n, 6, N_CASSE + 12);
  const allumee = t >= calcul.t_allumee && !tare;
  const grammes = Math.round(calcul.pomme_g * facteur(seconde));
  const trop = seconde >= 12;
  const clignote = Math.floor(t * 4) % 2 === 0;
  const ecran = tare && t < calcul.t_fin ? "0 g" : trop ? (clignote || allumee ? L.erreur : "") : `${grammes} g`;
  const appui = allumee && t >= calcul.t_tare - 0.3 ? 1 : 0;
  const eclair = 1 - entre(t, calcul.t_tare, calcul.t_tare + 0.3);

  const visible = (debut: number) => (t >= debut && t < debut + VISIBLE_S ? entre(t, debut, debut + 0.2) * (1 - entre(t, debut + VISIBLE_S - 0.3, debut + VISIBLE_S)) : 0);

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg width={LARGEUR} height={HAUTEUR} viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`} style={{ position: "absolute" }}>
        {dehors ? <Dehors n={n} surface={surface} /> : null}
        {n < 47 ? (
          <g>
            <g transform={`translate(0 ${-decale - d})`}>
              <g transform={`translate(0 ${SOL}) scale(1 ${1 - 0.97 * tasse}) translate(0 ${-SOL})`}>
                <rect y={-700} width={LARGEUR} height={SOL + 700} fill={CUISINE.fond} />
                <rect y={SOL - 60} width={LARGEUR} height={60} fill="#D9C39A" />
                <Fenetre />
                <Lampe n={n} />
                <Table n={n} flexion={flexion} casse={casse} />
              </g>
            </g>
            <Couches surface={surface} />
            {n >= 33 ? <rect x={CX - 100} y={surface} width={200} height={Math.max(0, basPomme - surface - 40)} fill="#1E140E" /> : null}
            {!allumee ? (
              <g transform={`translate(0 ${-decale - d})`}>
                <Balance bas={basBalance} hauteur={hauteurBalance} enfonce={enfonce} ecran={ecran} rouge={trop} tare={L.tare} appui={0} />
              </g>
            ) : null}
            <Pomme x={CX} bas={basPomme} rayon={RAYON_POMME} ecrase={ecrase} />
            <Baleine opacite={visible(BALEINE)} />
          </g>
        ) : null}
        {terre && !tare ? <Terre t={t} n={n} /> : null}
        {terre && !tare ? <Tour opacite={visible(EIFFEL)} /> : null}
        {allumee ? <Balance bas={PLATEAU} hauteur={1} enfonce={0} ecran={L.erreur} rouge tare={L.tare} appui={appui} /> : null}
        {tare && eclair > 0 ? <rect width={LARGEUR} height={HAUTEUR} fill="#FFFFFF" opacity={eclair} /> : null}
      </svg>
    </AbsoluteFill>
  );
};
