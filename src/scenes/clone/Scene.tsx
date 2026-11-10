import type { FC } from "react";
import { AbsoluteFill, interpolate, interpolateColors } from "remotion";
import calcul from "../../../sujets/clone.calcul.json";
import { ANTON } from "../../cadre/polices";
import type { SceneProps } from "../../cadre/types";
import { entre, lisse, paletteA, pasDecor } from "./temps";

const COPIE = "#E8572A";
const COPIE_SOMBRE = "#B83E1A";
const SOL_Y = 1150;

const pasDe = (cle: string) => calcul.paliers.find((p) => p.cle === cle)?.pas ?? 0;

const P_ASCENSEUR = pasDe("ascenseur");
const P_AVION = pasDe("a380");
const P_STADE = pasDe("stade");
const P_VILLE = pasDe("tokyo");
const P_MONDE = pasDe("monde");
const P_ARBRES = pasDe("arbres");
const P_TERRES = pasDe("terres");
const P_AIR = pasDe("air");
const P_O2 = pasDe("oxygene");

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Pictogramme : tête ronde et corps arrondi, jamais une vraie personne
const Picto = ({ x, y, h, couleur = COPIE }: { x: number; y: number; h: number; couleur?: string }) => (
  <g>
    <circle cx={x} cy={y - h * 0.82} r={h * 0.18} fill={couleur} />
    <rect x={x - h * 0.2} y={y - h * 0.62} width={h * 0.4} height={h * 0.62} rx={h * 0.14} fill={couleur} />
  </g>
);

const Photocopieuse = ({ flash, panne, vide }: { flash: number; panne: boolean; vide: boolean }) => (
  <g>
    <rect x={700} y={940} width={290} height={210} rx={10} fill="#8F949B" />
    <rect x={700} y={1090} width={290} height={14} fill="#6E737A" />
    <rect x={685} y={900} width={320} height={46} rx={8} fill="#3A3E45" />
    <rect x={700} y={892} width={290} height={12} fill={interpolateColors(flash, [0, 1], ["#59616B", "#FFF7C2"])} />
    <rect x={990} y={1000} width={64} height={12} fill="#C9CDD2" />
    {!vide && <rect x={995} y={990} width={50} height={10} fill="#FFFFFF" />}
    <circle cx={750} cy={990} r={15} fill="#3FBF6B" opacity={vide ? 0.25 : 1} />
    <circle cx={800} cy={990} r={15} fill="#E0322A" opacity={panne ? 1 : 0.3} />
  </g>
);

// Chaque icône tient dans une case de 120 sur 120 centrée sur l'origine
const Ascenseur = () => (
  <g>
    <rect x={-44} y={-56} width={88} height={112} fill="#59616B" />
    <rect x={-36} y={-46} width={72} height={102} fill="#F3EAD2" />
    {[-22, 0, 22].map((x) => (
      <Picto key={x} x={x} y={52} h={70} />
    ))}
    <rect x={-1.5} y={-46} width={3} height={102} fill="#59616B" />
  </g>
);

const Avion = () => (
  <g>
    <polygon points="-54,-6 -40,-40 -26,-40 -24,-6" fill="#D13A2A" />
    <rect x={-54} y={-10} width={108} height={30} rx={15} fill="#1F3F66" />
    <polygon points="-10,14 18,14 -20,50 -32,50" fill="#16304F" />
    {[-34, -22, -10, 2, 14, 26, 38].map((x) => (
      <rect key={x} x={x} y={-3} width={7} height={8} fill="#FFD23F" />
    ))}
  </g>
);

const Stade = () => (
  <g>
    <ellipse cx={0} cy={0} rx={58} ry={44} fill={COPIE} />
    <ellipse cx={0} cy={0} rx={40} ry={27} fill={COPIE_SOMBRE} />
    <ellipse cx={0} cy={0} rx={30} ry={18} fill="#3F9A4E" />
    <rect x={-1} y={-18} width={2} height={36} fill="#FFFFFF" />
  </g>
);

const Ville = () => (
  <g>
    <rect x={-54} y={-14} width={26} height={68} fill="#2F3440" />
    <rect x={-24} y={-48} width={30} height={102} fill="#3B4252" />
    <rect x={10} y={-26} width={22} height={80} fill="#2F3440" />
    <rect x={35} y={-4} width={20} height={58} fill="#3B4252" />
    {[-36, -22, -8, 6, 20, 34, 48].map((x) => (
      <rect key={x} x={x - 3} y={40} width={6} height={14} rx={3} fill={COPIE} />
    ))}
    {[-40, -16, -4, 16, 40].map((x, i) => (
      <rect key={x} x={x} y={-6 + i * 7} width={7} height={9} fill="#FFD23F" />
    ))}
  </g>
);

const Globe = ({ r, couleurTerre = "#3F9A4E" }: { r: number; couleurTerre?: string }) => (
  <g>
    <circle cx={0} cy={0} r={r} fill="#2F7FC1" />
    <path
      d={`M ${-0.72 * r} ${-0.38 * r} Q ${-0.4 * r} ${-0.92 * r} ${-0.02 * r} ${-0.56 * r} Q ${0.1 * r} ${-0.24 * r} ${-0.2 * r} ${-0.14 * r} Q ${-0.1 * r} ${0.3 * r} ${-0.36 * r} ${0.54 * r} Q ${-0.58 * r} ${0.2 * r} ${-0.72 * r} ${-0.38 * r} Z`}
      fill={couleurTerre}
    />
    <path
      d={`M ${0.26 * r} ${-0.32 * r} Q ${0.72 * r} ${-0.5 * r} ${0.8 * r} ${-0.04 * r} Q ${0.74 * r} ${0.5 * r} ${0.4 * r} ${0.68 * r} Q ${0.18 * r} ${0.3 * r} ${0.26 * r} ${-0.32 * r} Z`}
      fill={couleurTerre}
    />
  </g>
);

const Arbre = () => (
  <g>
    <rect x={-20} y={22} width={12} height={32} fill="#6B4A28" />
    <circle cx={-14} cy={0} r={32} fill="#2E8B4C" />
    <circle cx={-26} cy={16} r={20} fill="#2E8B4C" />
    <Picto x={32} y={54} h={84} />
  </g>
);

const ZONE = { x: 50, y: 520, w: 980, h: 620 };

// À chaque seconde, le lot d'icônes double, comme s'il sortait de la machine
const Grille = ({ n, debut, Icone }: { n: number; debut: number; Icone: FC }) => {
  const entier = Math.floor(n - debut);
  const m = Math.pow(2, Math.min(entier, 8));
  const rangs = Math.max(1, Math.round(Math.sqrt((m * ZONE.h) / ZONE.w)));
  const colonnes = Math.ceil(m / rangs);
  const cellule = Math.min(ZONE.w / colonnes, ZONE.h / rangs);
  const echelle = cellule / 124;
  const largeur = colonnes * cellule;
  const hauteur = rangs * cellule;
  const fraction = n - Math.floor(n);
  const pop = interpolate(fraction, [0, 0.25], [0.86, 1], borne);
  const cases = [];
  for (let i = 0; i < m; i += 1) {
    const x = ZONE.x + (ZONE.w - largeur) / 2 + cellule * ((i % colonnes) + 0.5);
    const y = ZONE.y + (ZONE.h - hauteur) / 2 + cellule * (Math.floor(i / colonnes) + 0.5);
    cases.push(
      <g key={i} transform={`translate(${x} ${y}) scale(${echelle * (i >= m / 2 ? pop : 1)})`}>
        <Icone />
      </g>,
    );
  }
  return <g>{cases}</g>;
};

// La barre lumineuse de la machine balaie l'écran à chaque doublement
const Balayage = ({ n, fond }: { n: number; fond: string }) => {
  const fraction = n - Math.floor(n);
  if (fraction >= 0.4) {
    return null;
  }
  const y = interpolate(fraction, [0, 0.4], [500, 1150]);
  return <rect x={0} y={y - 9} width={1080} height={18} fill={interpolateColors(0.6, [0, 1], [fond, "#FFF7C2"])} opacity={0.85} />;
};

// Bureau : le début de la boucle, et la chute au retour de la pause déjeuner
const Bureau = ({ t, n }: { t: number; n: number }) => {
  const fini = t >= calcul.t_patte;
  const entier = Math.floor(n);
  const copies = fini ? 0 : Math.min(Math.pow(2, entier), 8);
  const fraction = n - entier;
  const flash = fini ? 0 : interpolate(fraction, [0, 0.2, 0.5], [0, 1, 0], borne);
  // Pleine fenêtre de copies quand il revient, vidée au fil du retour
  const pression = fini ? n / calcul.n_max : 0;
  const hauteurFoule = 240 * pression;
  const xOriginal = fini ? interpolate(t, [calcul.t_patte, calcul.t_fin - 0.4], [1180, 590], borne) : 590;
  const sandwich = fini && t < calcul.t_fin;
  const lumiere = lisse(entre(t, calcul.t_retour, calcul.t_fin));
  const vitre = fini ? interpolateColors(lumiere, [0, 1], ["#1B2A40", "#9FD3E8"]) : "#9FD3E8";
  const vide = fini && t < calcul.t_fin;
  const clignote = vide && Math.floor(t * 4) % 2 === 0;

  return (
    <g>
      <rect x={110} y={620} width={230} height={260} fill="#E8E3D2" />
      <rect x={122} y={632} width={206} height={236} fill={vitre} />
      {fini && hauteurFoule > 0 && (
        <g clipPath="url(#fenetre)">
          {Array.from({ length: 36 }, (_, i) => (
            <Picto
              key={i}
              x={132 + (i % 9) * 24}
              y={868 - Math.floor(i / 9) * 56 + (240 - hauteurFoule)}
              h={62}
            />
          ))}
        </g>
      )}
      <rect x={224} y={632} width={6} height={236} fill="#E8E3D2" />
      <rect x={122} y={748} width={206} height={6} fill="#E8E3D2" />

      <Photocopieuse flash={flash} panne={clignote} vide={vide} />

      {Array.from({ length: Math.max(copies - 1, 0) }, (_, i) => {
        const devant = i % 2 === 0;
        return <Picto key={i} x={120 + Math.floor(i / 2) * 118 + (devant ? 0 : 58)} y={devant ? SOL_Y : SOL_Y - 80} h={devant ? 200 : 170} couleur={devant ? COPIE : COPIE_SOMBRE} />;
      })}
      <Picto x={xOriginal} y={SOL_Y} h={230} couleur={COPIE} />
      {sandwich && (
        <g transform={`translate(${xOriginal - 62} ${SOL_Y - 118})`}>
          <rect x={-30} y={-12} width={60} height={10} rx={5} fill="#E9C46A" />
          <rect x={-32} y={-3} width={64} height={7} fill="#5FAE4A" />
          <rect x={-30} y={4} width={60} height={10} rx={5} fill="#E9C46A" />
        </g>
      )}
    </g>
  );
};

// De la seconde des terres émergées au dernier souffle : le globe disparaît sous les copies
const Planete = ({ n, t, palette }: { n: number; t: number; palette: { encre: string; accent: string } }) => {
  const couvert = lisse(entre(n, P_TERRES, P_TERRES + 2));
  const ocean = lisse(entre(n, P_TERRES + 2, P_AIR));
  const halo = 1 - entre(n, P_TERRES, P_AIR);
  const gonfle = entre(n, P_TERRES, P_O2);
  const rGlobe = interpolate(gonfle, [0, 1], [250, 170]);
  const rFoule = interpolate(gonfle, [0, 1], [250, 320]);
  const reserve = 1 - lisse(entre(n, P_AIR, P_O2));
  // Une fois la mer couverte aussi, les continents restent lisibles en plus sombre
  const couleurTerre = interpolateColors(couvert + ocean, [0, 1, 2], ["#3F9A4E", COPIE, COPIE_SOMBRE]);
  const couleurMer = interpolateColors(ocean, [0, 1], ["#2F7FC1", COPIE]);
  const CX = 480;
  const CY = 830;
  const couronne = [];
  const rangs = 4;
  for (let r = 0; r < rangs; r += 1) {
    const rayon = rGlobe + ((rFoule - rGlobe) * (r + 0.5)) / rangs;
    const nombre = Math.floor((2 * Math.PI * rayon) / 26);
    if (rFoule - rGlobe > 8) {
      for (let i = 0; i < nombre; i += 1) {
        const angle = (i / nombre) * 2 * Math.PI + r * 0.35;
        couronne.push(
          <circle key={`${r}-${i}`} cx={CX + rayon * Math.cos(angle)} cy={CY + rayon * Math.sin(angle)} r={11} fill={r % 2 ? COPIE : COPIE_SOMBRE} />,
        );
      }
    }
  }
  const question = entre(t, calcul.t_qui, calcul.t_qui + 0.3);
  return (
    <g>
      {halo > 0 && <circle cx={CX} cy={CY} r={rFoule + 34} fill="#9FD3E8" opacity={0.4 * halo} />}
      <g transform={`translate(${CX} ${CY})`}>
        <circle cx={0} cy={0} r={rGlobe} fill={couleurMer} />
        <g>
          <path
            d={`M ${-0.72 * rGlobe} ${-0.38 * rGlobe} Q ${-0.4 * rGlobe} ${-0.92 * rGlobe} ${-0.02 * rGlobe} ${-0.56 * rGlobe} Q ${0.1 * rGlobe} ${-0.24 * rGlobe} ${-0.2 * rGlobe} ${-0.14 * rGlobe} Q ${-0.1 * rGlobe} ${0.3 * rGlobe} ${-0.36 * rGlobe} ${0.54 * rGlobe} Q ${-0.58 * rGlobe} ${0.2 * rGlobe} ${-0.72 * rGlobe} ${-0.38 * rGlobe} Z`}
            fill={couleurTerre}
          />
          <path
            d={`M ${0.26 * rGlobe} ${-0.32 * rGlobe} Q ${0.72 * rGlobe} ${-0.5 * rGlobe} ${0.8 * rGlobe} ${-0.04 * rGlobe} Q ${0.74 * rGlobe} ${0.5 * rGlobe} ${0.4 * rGlobe} ${0.68 * rGlobe} Q ${0.18 * rGlobe} ${0.3 * rGlobe} ${0.26 * rGlobe} ${-0.32 * rGlobe} Z`}
            fill={couleurTerre}
          />
        </g>
      </g>
      {couronne}

      <rect x={880} y={600} width={80} height={460} rx={14} fill="#2A2F3A" />
      <rect x={892} y={612 + 436 * (1 - reserve)} width={56} height={436 * reserve} rx={8} fill={reserve < 0.15 ? "#E0322A" : "#6FD0E8"} />
      <text x={920} y={1112} textAnchor="middle" fontFamily={ANTON} fontSize={46} fill={palette.encre}>
        O₂
      </text>

      {question > 0 && (
        <text
          x={CX}
          y={CY + 130}
          textAnchor="middle"
          fontFamily={ANTON}
          fontSize={380 * (0.8 + 0.2 * question)}
          fill={palette.accent}
          opacity={question}
        >
          ?
        </text>
      )}
    </g>
  );
};

const FORET_FIN = P_TERRES;

export const SceneClone = ({ t }: SceneProps) => {
  const n = pasDecor(t);
  const palette = paletteA(t);
  const sol = interpolateColors(n, [0, 25, 33, 50, 60], ["#C9B48A", "#A8842C", "#0D3D33", "#0A2236", "#17151E"]);
  const fini = t >= calcul.t_patte;
  const flashPatte = interpolate(t, [calcul.t_patte, calcul.t_patte + 0.35], [1, 0], borne);
  const enBureau = fini || n < P_ASCENSEUR;

  let Icone: FC | null = null;
  let debut = 0;
  if (!enBureau) {
    if (n < P_AVION) {
      Icone = Ascenseur;
      debut = P_ASCENSEUR;
    } else if (n < P_STADE) {
      Icone = Avion;
      debut = P_AVION;
    } else if (n < P_VILLE) {
      Icone = Stade;
      debut = P_STADE;
    } else if (n < P_MONDE) {
      Icone = Ville;
      debut = P_VILLE;
    } else if (n < P_ARBRES) {
      const GlobeIcone = () => <Globe r={54} />;
      Icone = GlobeIcone;
      debut = P_MONDE;
    } else if (n < FORET_FIN) {
      Icone = Arbre;
      debut = P_ARBRES;
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <defs>
          <clipPath id="fenetre">
            <rect x={122} y={632} width={206} height={236} />
          </clipPath>
        </defs>
        <rect x={0} y={SOL_Y} width={1080} height={1920 - SOL_Y} fill={sol} />
        {enBureau && <Bureau t={t} n={n} />}
        {Icone && <Grille n={n} debut={debut} Icone={Icone} />}
        {!enBureau && !Icone && <Planete n={n} t={t} palette={palette} />}
        {!enBureau && Icone && t < calcul.t_limite && <Balayage n={n} fond={palette.fond} />}
        {flashPatte > 0 && fini && <rect x={0} y={0} width={1080} height={1920} fill="#FFFFFF" opacity={flashPatte} />}
      </svg>
    </AbsoluteFill>
  );
};
