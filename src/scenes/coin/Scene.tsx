import type { FC } from "react";
import { AbsoluteFill, interpolate, interpolateColors } from "remotion";
import calcul from "../../../sujets/coin.calcul.json";
import type { SceneProps } from "../../cadre/types";
import { entre, lisse, paletteA, pasDecor } from "./temps";

const SOL_Y = 1150;
const OR = "#E3B23C";
const OR_SOMBRE = "#B98A1F";
const OR_CLAIR = "#F6D676";
const COIN_X = 800;
const COIN_R = 125;
const MEDAILLE_X = 470;
const MEDAILLE_Y = 810;
const REPOS_Y = SOL_Y - COIN_R - 20;
const APOGEE_Y = 760;
const ETAGERE_Y = 620;
const POP_S = 1.7; // durée en pas pendant laquelle l'icône du palier occupe la scène
const PLACE_Y = ETAGERE_Y - 44;
const ECHELLE_PLACE = 0.72;
const placeX = (i: number) => 296 + i * 87;

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const hachage = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Les icônes tiennent dans une case de 100 sur 100 centrée sur l'origine
const Cadenas = () => (
  <g>
    <path d="M -24 -8 V -26 A 24 24 0 0 1 24 -26 V -8" fill="none" stroke="#7A8089" strokeWidth={11} />
    <rect x={-40} y={-10} width={80} height={56} rx={8} fill="#D9A026" />
    {[-22, 0, 22].map((x) => (
      <rect key={x} x={x - 8} y={6} width={16} height={24} rx={3} fill="#FFF4D8" />
    ))}
  </g>
);

const Foudre = () => <polygon points="10,-50 -30,8 -4,8 -14,50 32,-12 6,-12" fill="#FFD23F" stroke="#2A2014" strokeWidth={4} />;

const Carte = ({ angle, couleur }: { angle: number; couleur: string }) => (
  <g transform={`rotate(${angle} 0 46)`}>
    <rect x={-25} y={-40} width={50} height={78} rx={6} fill="#FFFFFF" stroke="#2A2014" strokeWidth={3} />
    <polygon points="0,-18 13,0 0,18 -13,0" fill={couleur} />
  </g>
);

const Cartes = () => (
  <g>
    <Carte angle={-24} couleur="#C8361F" />
    <Carte angle={-8} couleur="#C8361F" />
    <Carte angle={8} couleur="#C8361F" />
    <Carte angle={24} couleur="#C8361F" />
  </g>
);

const Boule = () => (
  <g>
    <circle cx={0} cy={0} r={46} fill="#C8361F" />
    <circle cx={0} cy={0} r={23} fill="#FFFFFF" />
    <circle cx={-16} cy={-20} r={7} fill="#F08A7A" />
  </g>
);

// Une personne désignée au milieu de toutes les autres
const UnParmi = () => (
  <g>
    {Array.from({ length: 25 }, (_, i) => (
      <circle key={i} cx={-40 + (i % 5) * 20} cy={-40 + Math.floor(i / 5) * 20} r={i === 12 ? 11 : 7} fill={i === 12 ? "#C8361F" : "#8A93A3"} />
    ))}
  </g>
);

const UnArbre = () => (
  <g>
    <rect x={-8} y={10} width={16} height={38} fill="#6B4A28" />
    <circle cx={0} cy={-14} r={36} fill="#2E8B4C" />
    <circle cx={-22} cy={4} r={20} fill="#2E8B4C" />
    <circle cx={22} cy={4} r={20} fill="#2E8B4C" />
  </g>
);

const MotDePasse = () => (
  <g>
    <rect x={-48} y={-26} width={96} height={52} rx={8} fill="#20232A" />
    {[-34, -17, 0, 17, 34].map((x) => (
      <circle key={x} cx={x} cy={0} r={7} fill="#6FD0E8" />
    ))}
  </g>
);

const Fourmi = () => (
  <g>
    {[-14, 2, 18].map((x, i) => (
      <path key={x} d={`M ${x} 2 L ${x - 10 + i * 8} 32 M ${x} 2 L ${x + 2 + i * 6} -28`} stroke="#20232A" strokeWidth={4} fill="none" />
    ))}
    <ellipse cx={-30} cy={0} rx={15} ry={13} fill="#3A2415" />
    <ellipse cx={0} cy={0} rx={13} ry={11} fill="#3A2415" />
    <ellipse cx={32} cy={0} rx={21} ry={16} fill="#3A2415" />
    <path d="M -40 -10 L -52 -26 M -36 -12 L -42 -32" stroke="#20232A" strokeWidth={4} fill="none" />
  </g>
);

const Explosion = () => {
  const points = Array.from({ length: 24 }, (_, i) => {
    const rayon = i % 2 === 0 ? 50 : 24;
    const angle = (i / 24) * 2 * Math.PI;
    return `${rayon * Math.cos(angle)},${rayon * Math.sin(angle)}`;
  }).join(" ");
  return (
    <g>
      <polygon points={points} fill="#E2541B" />
      <circle cx={0} cy={0} r={14} fill="#FFD23F" />
    </g>
  );
};

// Toutes les icônes sont frappées sur le même fond clair, lisible quelle que soit la palette
const Medaille = ({ Icone }: { Icone: FC }) => (
  <g>
    <circle cx={0} cy={0} r={56} fill="#FFF4D8" stroke={OR_SOMBRE} strokeWidth={5} />
    <g transform="scale(0.85)">
      <Icone />
    </g>
  </g>
);

const ICONES: Record<string, FC> = {
  cadenas: Cadenas,
  foudre: Foudre,
  quinte: Cartes,
  loto: Boule,
  humain: UnParmi,
  arbre: UnArbre,
  mdp: MotDePasse,
  fourmi: Fourmi,
  bigbang: Explosion,
};

// Le profil gravé est le même des deux côtés : c'est toute l'histoire
const Piece = ({ x, y, r, ecrasement }: { x: number; y: number; r: number; ecrasement: number }) => (
  <g transform={`translate(${x} ${y}) scale(1 ${Math.max(ecrasement, 0.04)})`}>
    <circle cx={0} cy={8} r={r} fill={OR_SOMBRE} />
    <circle cx={0} cy={0} r={r} fill={OR} />
    <circle cx={0} cy={0} r={r * 0.86} fill="none" stroke={OR_SOMBRE} strokeWidth={r * 0.05} />
    <circle cx={0} cy={-r * 0.2} r={r * 0.26} fill={OR_SOMBRE} />
    <path d={`M ${-r * 0.48} ${r * 0.56} A ${r * 0.5} ${r * 0.5} 0 0 1 ${r * 0.48} ${r * 0.56} Z`} fill={OR_SOMBRE} />
    <circle cx={-r * 0.5} cy={-r * 0.5} r={r * 0.09} fill={OR_CLAIR} />
  </g>
);

export const SceneCoin = ({ t }: SceneProps) => {
  const n = pasDecor(t);
  const palette = paletteA(t);
  const table = interpolateColors(n, [0, 29, 42, 55, 59], ["#2E7D5A", "#1F6647", "#7A5A26", "#2B3A55", "#1A1622"]);

  const entier = Math.floor(n);
  const pile = Math.min(entier, calcul.n_max);
  const enVol = t < calcul.t_limite;
  const fraction = enVol ? n - entier : 0;
  const hauteur = 4 * fraction * (1 - fraction);
  const y = REPOS_Y - (REPOS_Y - APOGEE_Y) * hauteur;
  const tour = 4 * Math.PI * fraction;

  // Épilogue : la pièce vient au centre, on la retourne, puis elle retourne sur la table
  const zoom = entre(t, calcul.t_coupe, calcul.t_coupe + 0.5) * (1 - lisse(entre(t, calcul.t_retour, calcul.t_fin)));
  const retourne = Math.PI * lisse(entre(t, calcul.t_qui, calcul.t_patte));
  const xPiece = interpolate(zoom, [0, 1], [COIN_X, 600]);
  const yPiece = interpolate(zoom, [0, 1], [y, 885]);
  const rPiece = interpolate(zoom, [0, 1], [COIN_R, 235]);
  const ecrasement = Math.abs(Math.cos(t >= calcul.t_coupe ? retourne : tour));

  const nbSpectateurs = Math.max(0, Math.min(Math.floor((n - 14) * 0.9), 34));
  const rayons = entre(n, 42, 57);
  const nbRayons = 14;

  const FLASH_Y = 1;
  const flashPatte = interpolate(t, [calcul.t_patte, calcul.t_patte + 0.3], [FLASH_Y, 0], borne);

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        {rayons > 0 &&
          Array.from({ length: nbRayons }, (_, i) => {
            const a1 = (i / nbRayons) * 2 * Math.PI + t * 0.12;
            const a2 = a1 + Math.PI / nbRayons;
            const R = 1300;
            return (
              <polygon
                key={i}
                points={`${COIN_X},${REPOS_Y} ${COIN_X + R * Math.cos(a1)},${REPOS_Y + R * Math.sin(a1)} ${COIN_X + R * Math.cos(a2)},${REPOS_Y + R * Math.sin(a2)}`}
                fill={palette.accent}
                opacity={0.1 * rayons}
              />
            );
          })}

        <rect x={0} y={SOL_Y} width={1080} height={1920 - SOL_Y} fill={table} />

        {/* L'étagère des exploits : une icône de plus à chaque palier */}
        <rect x={250} y={ETAGERE_Y} width={790} height={10} fill={palette.encre} opacity={0.45} />
        {calcul.paliers.map((p, i) => {
          const Icone = ICONES[p.cle];
          const age = n - p.pas;
          if (age < 0 || (age < POP_S && t < calcul.t_limite)) {
            return null;
          }
          return (
            <g key={p.cle} transform={`translate(${placeX(i)} ${PLACE_Y}) scale(${ECHELLE_PLACE})`}>
              <Medaille Icone={Icone} />
            </g>
          );
        })}

        {/* La salle se remplit, et tout le monde regarde la pièce */}
        <g opacity={0.3}>
          {Array.from({ length: nbSpectateurs }, (_, i) => {
            const xs = 280 + hachage(i, 1) * 770;
            const ys = 1010 + hachage(i, 2) * 120;
            const r = 22 + hachage(i, 3) * 8;
            return (
              <g key={i}>
                <circle cx={xs} cy={ys} r={r} fill={palette.encre} />
                <rect x={xs - r * 1.2} y={ys + r * 0.8} width={r * 2.4} height={SOL_Y - ys - r * 0.8} rx={r * 0.6} fill={palette.encre} />
              </g>
            );
          })}
        </g>

        {/* Une pièce de plus sur la pile à chaque seconde */}
        {Array.from({ length: pile }, (_, i) => (
          <rect key={i} x={70} y={SOL_Y - 10 * (i + 1)} width={150} height={8} rx={3} fill={i % 2 === 0 ? OR : OR_SOMBRE} />
        ))}

        {zoom === 0 && <ellipse cx={COIN_X} cy={SOL_Y - 6} rx={COIN_R * (0.5 + 0.5 * (1 - hauteur))} ry={12} fill="#000000" opacity={0.28} />}
        <Piece x={xPiece} y={yPiece} r={rPiece} ecrasement={ecrasement} />

        {/* Chaque palier occupe la scène un instant, puis rejoint l'étagère */}
        {calcul.paliers.map((p, i) => {
          const age = n - p.pas;
          if (age < 0 || age >= POP_S || t >= calcul.t_limite) {
            return null;
          }
          const Icone = ICONES[p.cle];
          const echelle = interpolate(age, [0, 0.2, POP_S - 0.3, POP_S], [1.4, 3, 3, ECHELLE_PLACE], borne);
          const vol = entre(age, POP_S - 0.3, POP_S);
          const x = interpolate(vol, [0, 1], [MEDAILLE_X, placeX(i)]);
          const yMedaille = interpolate(vol, [0, 1], [MEDAILLE_Y, PLACE_Y]);
          return (
            <g key={p.cle} transform={`translate(${x} ${yMedaille}) scale(${echelle})`}>
              <Medaille Icone={Icone} />
            </g>
          );
        })}

        {flashPatte > 0 && t >= calcul.t_patte && <rect x={0} y={0} width={1080} height={1920} fill="#FFFFFF" opacity={flashPatte} />}
      </svg>
    </AbsoluteFill>
  );
};
