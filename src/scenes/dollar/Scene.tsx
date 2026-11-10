import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import calcul from "../../../sujets/dollar.calcul.json";
import { ANTON } from "../../cadre/polices";
import type { SceneProps } from "../../cadre/types";
import { Globe } from "./Globe";
import { aIcone, Bonbon, Icone } from "./Icones";
import { prixDe } from "./montant";
import { paletteA, pasDollar } from "./temps";

const CX = 540;
const CY = 860;
const COTE_PX = 640;
const BANDE_Y = 505;
const LARGEUR = 1080;
const HAUTEUR = 1920;
const RAYON_MIN = 350;
const AIRE = calcul.billet_largeur_m * calcul.billet_hauteur_m;
const TAPIS_CENTRE = { lon: -97, lat: 38 };
const PASTILLE_S = 2.6;

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const pxParMetre = (pas: number) => COTE_PX / Math.sqrt(AIRE * Math.pow(2, pas));

// Le tapis double en copiant ses rangées, puis ses colonnes
const tailleTapis = (pas: number) => {
  const n = Math.floor(pas);
  const reste = pas - n;
  const rangees = Math.pow(2, Math.ceil(n / 2)) * (n % 2 === 0 ? 1 + reste : 1);
  const colonnes = Math.pow(2, Math.floor(n / 2)) * (n % 2 === 1 ? 1 + reste : 1);
  return { largeur: colonnes * calcul.billet_largeur_m, hauteur: rangees * calcul.billet_hauteur_m };
};

const hachage = (i: number, j: number, k = 0) => {
  let n = Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(k, 2246822519);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};

type Rendu = (x: number, y: number, c: number, i: number, j: number) => React.ReactNode;

// Une couche de sol : des cases à l'échelle réelle, dessinées seulement sur l'écran
const Couche: React.FC<{ pxm: number; cellule: number; opacite: number; rendu: Rendu }> = ({ pxm, cellule, opacite, rendu }) => {
  if (opacite <= 0) {
    return null;
  }
  const c = cellule * pxm;
  const cases: React.ReactNode[] = [];
  for (let i = Math.floor(-CX / c) - 1; i <= Math.ceil((LARGEUR - CX) / c); i++) {
    for (let j = Math.floor((BANDE_Y - CY) / c) - 1; j <= Math.ceil((HAUTEUR - CY) / c); j++) {
      cases.push(<g key={`${i}:${j}`}>{rendu(CX + i * c, CY + j * c, c, i, j)}</g>);
    }
  }
  return <g opacity={opacite}>{cases}</g>;
};

const fondu = (c: number) => interpolate(c, [60, 110], [0, 1], borne);

const carrelage: Rendu = (x, y, c, i, j) => (
  <rect x={x + 1} y={y + 1} width={c - 2} height={c - 2} fill={hachage(i, j) > 0.5 ? "#E9DEC7" : "#DCCFB4"} stroke="#B9AB8E" strokeWidth={2} />
);

const TOITS = ["#A8442E", "#8E8F92", "#6B4A3A", "#B7643C", "#5D6B78"];

const banlieue: Rendu = (x, y, c, i, j) => {
  const route = c * 0.16;
  const toit = TOITS[Math.floor(hachage(i, j, 1) * TOITS.length)];
  return (
    <>
      <rect x={x} y={y} width={c} height={c} fill="#5C6066" />
      <rect x={x + route / 2} y={y + route / 2} width={c - route} height={c - route} fill="#5D9A4A" />
      <rect x={x + c * 0.26} y={y + c * 0.26} width={c * 0.48} height={c * 0.38} fill={toit} stroke="#2B2B2B" strokeWidth={2} />
      <circle cx={x + c * 0.22} cy={y + c * 0.76} r={c * 0.08} fill="#2F6B38" />
    </>
  );
};

const ville: Rendu = (x, y, c, i, j) => {
  const route = c * 0.1;
  const a = (c - route * 2) / 2;
  const immeuble = (k: number) => {
    const clair = 90 + Math.floor(hachage(i, j, k) * 90);
    return `rgb(${clair}, ${clair + 6}, ${clair + 16})`;
  };
  return (
    <>
      <rect x={x} y={y} width={c} height={c} fill="#2B323C" />
      <rect x={x + route / 2} y={y + route / 2} width={a} height={a} fill={immeuble(2)} />
      <rect x={x + route * 1.5 + a} y={y + route / 2} width={a} height={a} fill={immeuble(3)} />
      <rect x={x + route / 2} y={y + route * 1.5 + a} width={a} height={a} fill={immeuble(4)} />
      <rect x={x + route * 1.5 + a} y={y + route * 1.5 + a} width={a} height={a} fill={hachage(i, j, 5) > 0.8 ? "#4F8A45" : immeuble(5)} />
    </>
  );
};

const region: Rendu = (x, y, c, i, j) => {
  const type = hachage(i, j, 6);
  const couleur = type < 0.22 ? "#6E7681" : type < 0.55 ? "#3E7A3E" : type < 0.9 ? "#B9B04E" : "#3D7FB8";
  return <rect x={x} y={y} width={c + 1} height={c + 1} fill={couleur} />;
};

const terres: Rendu = (x, y, c, i, j) => {
  const type = hachage(i, j, 7);
  const couleur = type < 0.4 ? "#C9A85A" : type < 0.75 ? "#B9963F" : "#A7A04E";
  return <rect x={x} y={y} width={c + 1} height={c + 1} fill={couleur} />;
};

const Billet: React.FC = () => (
  <g>
    <rect x={1} y={1} width={154} height={64} fill="#CFE3BE" stroke="#1F5C3A" strokeWidth={2} />
    <rect x={7} y={7} width={142} height={52} fill="none" stroke="#2F7D51" strokeWidth={2} />
    <ellipse cx={78} cy={33} rx={21} ry={22} fill="#2F7D51" />
    <text x={78} y={46} textAnchor="middle" fontFamily={ANTON} fontSize={36} fill="#EAF3DE">
      $
    </text>
    <text x={25} y={29} textAnchor="middle" fontFamily={ANTON} fontSize={18} fill="#1F5C3A">
      1
    </text>
    <text x={131} y={51} textAnchor="middle" fontFamily={ANTON} fontSize={18} fill="#1F5C3A">
      1
    </text>
    <path d="M18 44 H44 M18 50 H44 M112 15 H138 M112 21 H138" stroke="#2F7D51" strokeWidth={2} />
  </g>
);

const MotifBrique: React.FC<{ id: string; x: number; y: number; largeur: number }> = ({ id, x, y, largeur }) => (
  <pattern id={id} patternUnits="userSpaceOnUse" x={x} y={y} width={largeur} height={largeur * 0.425}>
    <rect width={largeur} height={largeur * 0.425} fill="#3E9A62" stroke="#2A7449" strokeWidth={1.5} />
    <ellipse cx={largeur / 2} cy={largeur * 0.2125} rx={largeur * 0.14} ry={largeur * 0.14} fill="#2F7D51" />
  </pattern>
);

const Tapis: React.FC<{ pas: number; pxm: number; opacite: number }> = ({ pas, pxm, opacite }) => {
  if (opacite <= 0) {
    return null;
  }
  const taille = tailleTapis(pas);
  const largeur = taille.largeur * pxm;
  const hauteur = taille.hauteur * pxm;
  const x = CX - largeur / 2;
  const y = CY - hauteur / 2;
  const tuile = calcul.billet_largeur_m * pxm;
  const detail = interpolate(tuile, [20, 44], [0, 1], borne);
  // Sous 44 px, deux motifs qui se relaient donnent une impression de recul sans fin
  const palier = Math.ceil(Math.log2(22 / tuile));
  const fin = tuile * Math.pow(2, palier);
  const finOpacite = interpolate(fin, [22, 44], [0, 1], borne);
  const echelle = tuile / (calcul.billet_largeur_m * 1000);
  return (
    <g opacity={opacite}>
      <defs>
        <pattern
          id="billet"
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
          width={tuile}
          height={calcul.billet_hauteur_m * pxm}
        >
          <g transform={`scale(${echelle})`}>
            <Billet />
          </g>
        </pattern>
        <MotifBrique id="fin" x={x} y={y} largeur={fin} />
        <MotifBrique id="gros" x={x} y={y} largeur={fin * 2} />
      </defs>
      <rect x={x + 10} y={y + 14} width={largeur} height={hauteur} fill="#000000" opacity={0.28} />
      <rect x={x} y={y} width={largeur} height={hauteur} fill="url(#gros)" />
      <rect x={x} y={y} width={largeur} height={hauteur} fill="url(#fin)" opacity={finOpacite} />
      <rect x={x} y={y} width={largeur} height={hauteur} fill="url(#billet)" opacity={detail} />
      <rect x={x} y={y} width={largeur} height={hauteur} fill="none" stroke="#14352A" strokeWidth={4} />
    </g>
  );
};

const Table: React.FC<{ pxm: number }> = ({ pxm }) => {
  const largeur = 2.8 * pxm;
  const hauteur = 1.7 * pxm;
  const rebord = 0.09 * pxm;
  return (
    <g>
      <rect x={CX - largeur / 2 - rebord} y={CY - hauteur / 2 - rebord} width={largeur + rebord * 2} height={hauteur + rebord * 2} fill="#6B3F22" />
      <rect x={CX - largeur / 2} y={CY - hauteur / 2} width={largeur} height={hauteur} fill="#0E5A41" />
    </g>
  );
};

const Rayons: React.FC<{ t: number; opacite: number }> = ({ t, opacite }) => {
  if (opacite <= 0) {
    return null;
  }
  const rayons = Array.from({ length: 14 }, (_, k) => k);
  return (
    <g opacity={opacite} transform={`rotate(${t * 14} ${CX} ${CY})`}>
      {rayons.map((k) => {
        const a = (k / 14) * Math.PI * 2;
        const b = a + Math.PI / 14;
        const r = 1500;
        return (
          <path
            key={k}
            d={`M${CX} ${CY} L${CX + r * Math.cos(a)} ${CY + r * Math.sin(a)} L${CX + r * Math.cos(b)} ${CY + r * Math.sin(b)} Z`}
            fill="#F7CE55"
          />
        );
      })}
    </g>
  );
};

// Billets en orbite : la planète est pleine, le reste déborde
const Essaim: React.FC<{ t: number; pas: number; rayon: number; or: number }> = ({ t, pas, rayon, or }) => {
  const quantite = Math.floor(interpolate(pas, [56, 62], [0, 90], borne));
  const billets = Array.from({ length: quantite }, (_, k) => k);
  return (
    <g>
      {billets.map((k) => {
        const distance = rayon * (1.1 + hachage(k, 3) * 0.42);
        const angle = hachage(k, 4) * Math.PI * 2 + t * (0.5 + hachage(k, 5) * 0.5);
        const x = CX + distance * Math.cos(angle);
        const y = CY + distance * 0.86 * Math.sin(angle);
        return (
          <rect
            key={k}
            x={x - 15}
            y={y - 7}
            width={30}
            height={14}
            fill={or > 0.5 ? "#FFF6E6" : "#7BE08A"}
            stroke="#14352A"
            strokeWidth={2}
            transform={`rotate(${angle * 60} ${x} ${y})`}
          />
        );
      })}
    </g>
  );
};

const Pastille: React.FC<SceneProps> = ({ t, langue }) => {
  const palier = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  if (!palier || !aIcone(palier.cle) || t >= palier.arrivee_s + PASTILLE_S) {
    return null;
  }
  const age = t - palier.arrivee_s;
  const entree = interpolate(age, [0, 0.22], [0.4, 1], { ...borne, easing: Easing.out(Easing.back(2.4)) });
  const sortie = interpolate(age, [PASTILLE_S - 0.25, PASTILLE_S], [1, 0], borne);
  return (
    <div
      style={{
        position: "absolute",
        left: CX - 310,
        top: CY - 215,
        width: 620,
        height: 430,
        backgroundColor: "#FFF6E6",
        border: "8px solid #14352A",
        borderRadius: 28,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: sortie,
        scale: String(entree),
        rotate: "-4deg",
        boxShadow: "14px 16px 0 rgba(0, 0, 0, 0.3)",
      }}
    >
      <Icone cle={palier.cle} />
      <div style={{ fontFamily: ANTON, fontSize: 82, lineHeight: 1.1, color: "#14352A", whiteSpace: "nowrap" }}>
        {prixDe(palier.cible_usd, langue)}
      </div>
    </div>
  );
};

const FinPrix: React.FC<{ t: number }> = ({ t }) => {
  const age = t - calcul.t_prix;
  const entree = interpolate(age, [0, 0.22], [0.3, 1], { ...borne, easing: Easing.out(Easing.back(2.4)) });
  const barre = interpolate(age, [0.5, 0.75], [0, 1], borne);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 160,
          top: 640,
          scale: String(entree),
          rotate: `${Math.sin(t * 9) * 2.5}deg`,
        }}
      >
        <Bonbon />
      </div>
      <div
        style={{
          position: "absolute",
          left: 420,
          top: 540,
          padding: "2px 34px 6px",
          fontFamily: ANTON,
          fontSize: 110,
          lineHeight: 1.1,
          color: "#14352A",
          backgroundColor: "#FFF6E6",
          border: "8px solid #14352A",
          rotate: "-6deg",
          scale: String(entree),
        }}
      >
        $1
        <div
          style={{
            position: "absolute",
            left: "-6%",
            top: "48%",
            width: `${112 * barre}%`,
            height: 14,
            backgroundColor: "#C8261C",
            rotate: "-14deg",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const ScenePaysage: React.FC<SceneProps> = ({ t, langue }) => {
  const palette = paletteA(t);
  // La fin revient à la première image, pour la boucle
  const pas = t >= calcul.t_egal ? 0 : pasDollar(t);
  const pxm = pxParMetre(pas);
  const rayon = Math.max(RAYON_MIN, calcul.terre_rayon_m * pxm);
  const couverture = Math.min(1, (Math.pow(2, pas) * AIRE) / (4 * Math.PI * Math.pow(calcul.terre_rayon_m, 2)));
  // Le globe tourne pendant que le tapis s'étend : la dernière tache de terre se ferme face à nous
  const tour = interpolate(pas, [52, 55.45], [0, 1], { ...borne, easing: Easing.inOut(Easing.quad) });
  const apres = Math.max(0, t - 55.5) * 14;
  const vue = {
    lon: TAPIS_CENTRE.lon + 180 * tour + apres,
    lat: TAPIS_CENTRE.lat * (1 - 2 * tour),
    rayon,
    cx: CX,
    cy: CY,
  };
  const or = interpolate(t, [62.5, 62.85], [0, 1], borne);
  const globe = pas >= 44;
  return (
    <AbsoluteFill>
      <svg width={LARGEUR} height={HAUTEUR} viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`} style={{ position: "absolute" }}>
        <Rayons t={t} opacite={or} />
        {globe ? (
          <Globe
            vue={vue}
            centre={TAPIS_CENTRE}
            angle={Math.acos(1 - 2 * couverture)}
            opaciteTapis={interpolate(pas, [47, 49], [0, 1], borne)}
            or={or}
          />
        ) : null}
        <Essaim t={t} pas={pas} rayon={rayon} or={or} />
        <Couche pxm={pxm} cellule={100000} opacite={interpolate(pas, [45, 47], [1, 0], borne)} rendu={terres} />
        <Couche pxm={pxm} cellule={6000} opacite={fondu(6000 * pxm)} rendu={region} />
        <Couche pxm={pxm} cellule={400} opacite={fondu(400 * pxm)} rendu={ville} />
        <Couche pxm={pxm} cellule={30} opacite={fondu(30 * pxm)} rendu={banlieue} />
        <Couche pxm={pxm} cellule={2} opacite={interpolate(2 * pxm, [50, 110], [0, 1], borne)} rendu={carrelage} />
        {pxm > 20 ? <Table pxm={pxm} /> : null}
        <Tapis pas={pas} pxm={pxm} opacite={interpolate(pas, [47, 49], [1, 0], borne)} />
        <rect x={0} y={0} width={LARGEUR} height={BANDE_Y} fill={palette.fond} />
        {pas < 49 ? <rect x={0} y={BANDE_Y - 3} width={LARGEUR} height={6} fill="#14110D" opacity={interpolate(pas, [47, 49], [1, 0], borne)} /> : null}
      </svg>
      <Pastille t={t} langue={langue} />
    </AbsoluteFill>
  );
};

export const SceneDollar: React.FC<SceneProps> = ({ t, langue }) => {
  if (t >= calcul.t_prix && t < calcul.t_egal) {
    return <FinPrix t={t} />;
  }
  return <ScenePaysage t={t} langue={langue} />;
};
