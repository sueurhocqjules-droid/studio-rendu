import type { FC } from "react";
import { AbsoluteFill, interpolateColors } from "remotion";
import calcul from "../../../sujets/domino.calcul.json";
import type { SceneProps } from "../../cadre/types";
import { entre, focusA, horloge, lisse, paletteA, SOLS } from "./temps";

const SOL_Y = 1190;
const CENTRE_X = 470;
const HAUTEUR_PX = 400;
const ECART = 0.55;
const CONTACT = Math.asin(ECART / 1.0);
const REPOS = (72 * Math.PI) / 180;
const R_TERRE = 6.371e6;

const H0 = calcul.h0_m;
const F = calcul.facteur;
const EP = calcul.epaisseur;

const hauteur = (k: number) => H0 * Math.pow(F, k);
// Bord gauche du domino k : chaque pas ajoute l'épaisseur et l'écart, proportionnels à la hauteur
const position = (k: number) => ((EP + ECART) * H0 * (Math.pow(F, k) - 1)) / (F - 1);

// Angle du domino k (radians) à l'horloge de chaîne h
const angle = (k: number, h: number) => {
  const u = h - (k - 1);
  if (u <= 0) {
    return 0;
  }
  if (k === calcul.n_max) {
    return (Math.PI / 2) * Math.min(1, Math.pow(Math.min(u / 1.8, 1), 2));
  }
  if (u < 1) {
    return CONTACT * u * u;
  }
  return CONTACT + (REPOS - CONTACT) * lisse(entre(u, 1, 2.5));
};

const silhouette = (cle: string, couleur: string): FC => {
  const S = () => {
    switch (cle) {
      case "domino":
        return (
          <g>
            <rect x={-25} y={-100} width={50} height={100} rx={6} fill="#FFF8EA" stroke="#17171C" strokeWidth={3} />
            <rect x={-20} y={-51} width={40} height={3} fill="#17171C" />
            {[
              [-11, -88],
              [11, -62],
              [0, -75],
              [-11, -38],
              [11, -12],
              [-11, -12],
              [11, -38],
            ].map(([x, y]) => (
              <circle key={`${x}${y}`} cx={x} cy={y} r={4.5} fill="#17171C" />
            ))}
          </g>
        );
      case "quille":
        return (
          <g>
            <path d="M -6 -100 C 6 -100 9 -90 8 -80 C 7 -72 4 -68 5 -62 C 8 -50 17 -40 17 -24 C 17 -10 12 -4 9 0 L -9 0 C -12 -4 -17 -10 -17 -24 C -17 -40 -8 -50 -5 -62 C -4 -68 -7 -72 -8 -80 C -9 -90 -6 -100 0 -100 Z" fill="#FFFDF6" />
            <rect x={-6} y={-74} width={12} height={4} fill="#C0392B" />
            <rect x={-6} y={-67} width={12} height={4} fill="#C0392B" />
          </g>
        );
      case "toi":
        return (
          <g fill={couleur}>
            <circle cx={0} cy={-88} r={11} />
            <rect x={-15} y={-74} width={30} height={40} rx={10} />
            <rect x={-14} y={-40} width={11} height={40} rx={5} />
            <rect x={3} y={-40} width={11} height={40} rx={5} />
            <rect x={-24} y={-72} width={9} height={34} rx={4} />
            <rect x={15} y={-72} width={9} height={34} rx={4} />
          </g>
        );
      case "girafe":
        return (
          <g fill={couleur}>
            <path d="M -30 -50 L 10 -50 L 14 -60 L 14 -92 L 26 -100 L 32 -94 L 22 -88 L 22 -52 L 24 -40 L 22 0 L 16 0 L 14 -36 L -20 -36 L -22 0 L -28 0 Z" />
            <rect x={14} y={-104} width={3} height={8} />
            <rect x={-30} y={-48} width={3} height={18} transform="rotate(20 -30 -48)" />
          </g>
        );
      case "christ":
        return (
          <g fill={couleur}>
            <rect x={-10} y={-21} width={20} height={21} />
            <path d="M -5 -21 L -7 -70 L -36 -73 L -36 -77 L -6 -78 L -4 -84 L 4 -84 L 6 -78 L 36 -77 L 36 -73 L 7 -70 L 5 -21 Z" />
            <circle cx={0} cy={-90} r={6} />
          </g>
        );
      case "burj":
        return (
          <g fill={couleur}>
            <path d="M -18 0 L -18 -20 L -13 -20 L -13 -45 L -8 -45 L -8 -65 L -4 -65 L -4 -82 L -1 -82 L 0 -100 L 1 -82 L 4 -82 L 4 -60 L 9 -60 L 9 -38 L 14 -38 L 14 -15 L 18 -15 L 18 0 Z" />
          </g>
        );
      case "fuji":
        return (
          <g>
            <path d="M -210 0 L -30 -100 L 30 -100 L 210 0 Z" fill={couleur} />
            <path d="M -30 -100 L 30 -100 L 62 -82 L 40 -78 L 22 -86 L 4 -76 L -14 -86 L -36 -76 L -62 -82 Z" fill="#FFFDF6" />
          </g>
        );
      default:
        return null;
    }
  };
  return S;
};

const Domino = ({ x, h, a, trait }: { x: number; h: number; a: number; trait: number }) => {
  const e = h * EP;
  // Pivot sur l'arête avant droite, au sol
  return (
    <g transform={`translate(${x + e} ${SOL_Y}) rotate(${(a * 180) / Math.PI})`}>
      <rect x={-e} y={-h} width={e} height={h} fill="#17171C" stroke="#FFF8EA" strokeWidth={trait} />
      <rect x={-e + e * 0.18} y={-h + e * 0.18} width={e * 0.16} height={h - e * 0.36} fill="#FFF8EA" opacity={0.85} />
    </g>
  );
};

const Doigt = ({ x, h, opacite }: { x: number; h: number; opacite: number }) => (
  <g opacity={opacite} transform={`translate(${x} ${SOL_Y - h * 0.8}) scale(${h / 100})`}>
    <rect x={-260} y={-40} width={240} height={80} rx={40} fill="#E8B48F" />
    <rect x={-70} y={-36} width={44} height={40} rx={14} fill="#F6D8C6" />
  </g>
);

export const SceneDomino = ({ t }: SceneProps) => {
  const c = focusA(t);
  const h = horloge(t);
  const palette = paletteA(t);
  const z = HAUTEUR_PX / hauteur(c);
  const xc = position(c);
  const ecran = (x: number) => CENTRE_X + (x - xc) * z;
  const sol = interpolateColors(
    c,
    SOLS.map(([p]) => p),
    SOLS.map(([, couleur]) => couleur),
  );
  const epilogue = t >= calcul.t_coupe && t < calcul.t_patte;
  const enEnergie = t >= calcul.t_qui && t < calcul.t_patte;
  const rTerre = R_TERRE * z;
  const etoiles = entre(c, 38.5, 41.5);

  const visibles: number[] = [];
  for (let k = Math.max(0, Math.floor(c) - 14); k <= Math.min(calcul.n_max, Math.ceil(c) + 2); k++) {
    if (hauteur(k) * z > 1.5) {
      visibles.push(k);
    }
  }

  // Le dernier domino frappe le sol : onde de choc
  const choc = enEnergie ? entre(t, calcul.t_qui + 1.6, calcul.t_qui + 4.5) : entre(t, calcul.n_max + 0.8, calcul.t_coupe + 0.6);
  const xImpact = ecran(position(calcul.n_max) + hauteur(calcul.n_max) * (1 + EP));
  const montreChoc = (enEnergie || (t >= calcul.n_max + 0.8 && t < calcul.t_coupe + 0.6)) && choc > 0 && choc < 1;

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        {etoiles > 0 &&
          Array.from({ length: 40 }, (_, i) => (
            <circle key={i} cx={(i * 263) % 1080} cy={520 + ((i * 397) % 560)} r={i % 3 === 0 ? 3 : 2} fill="#FFF6E5" opacity={etoiles * 0.8} />
          ))}

        {/* Ligne de Kármán */}
        {c > 38 && (
          <line x1={0} x2={1080} y1={SOL_Y - 1e5 * z} y2={SOL_Y - 1e5 * z} stroke="#FFD166" strokeWidth={4} strokeDasharray="18 14" opacity={entre(c, 38, 40)} />
        )}

        {/* Les références restent dans le décor, à l'échelle réelle */}
        {calcul.paliers.map((p) => {
          const taille = p.m * z;
          if (p.cle === "espace" || taille < 3 || taille > 4000 || t < p.arrivee_s - 0.6) {
            return null;
          }
          // Debout derrière les dominos déjà tombés, juste avant celui qui la dépasse
          const x = ecran(position(p.pas) - hauteur(p.pas) * (p.cle === "fuji" ? 1.1 : 0.4));
          if (p.cle === "ballon") {
            const y = SOL_Y - taille;
            const r = Math.max(10, 26 * entre(c, 36, 40));
            return (
              <g key={p.cle}>
                <line x1={x} x2={x} y1={y + r} y2={y + r * 3} stroke="#FFF6E5" strokeWidth={3} />
                <ellipse cx={x} cy={y} rx={r * 0.8} ry={r} fill="#FFF6E5" />
              </g>
            );
          }
          const Forme = silhouette(p.cle, interpolateColors(0.6, [0, 1], [palette.fond, "#17171C"]));
          return (
            <g key={p.cle} transform={`translate(${x} ${SOL_Y}) scale(${taille / 100})`}>
              <Forme />
            </g>
          );
        })}

        {/* Sol, puis courbure de la Terre quand on monte */}
        {rTerre > 2e5 ? (
          <rect x={0} y={SOL_Y} width={1080} height={1920 - SOL_Y} fill={sol} />
        ) : (
          <circle cx={CENTRE_X} cy={SOL_Y + rTerre} r={rTerre} fill={sol} />
        )}

        {visibles.map((k) => (
          <Domino key={k} x={ecran(position(k))} h={hauteur(k) * z} a={angle(k, h)} trait={Math.min(4, Math.max(1, hauteur(k) * z * 0.01))} />
        ))}

        {montreChoc && (
          <ellipse cx={xImpact} cy={SOL_Y} rx={60 + choc * 900} ry={20 + choc * 260} fill="none" stroke="#FFD166" strokeWidth={14 * (1 - choc)} opacity={1 - choc} />
        )}

        {epilogue && !enEnergie && (
          <Doigt x={ecran(position(0)) - 4} h={hauteur(0) * z} opacite={entre(t, calcul.t_coupe + 1.8, calcul.t_coupe + 2.4)} />
        )}
      </svg>
    </AbsoluteFill>
  );
};
