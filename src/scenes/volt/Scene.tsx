import type { FC } from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import calcul from "../../../sujets/volt.calcul.json";
import type { SceneProps } from "../../cadre/types";
import { entre, lisse, paletteA, pasDecor } from "./temps";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// La pile, toujours à gauche ; l'objet du palier au centre droit, posé sur le même sol
const SOL_Y = 1050;
const PILE_X = 110;
const PILE_L = 140;
const PILE_HAUT = 760;
const PILE_BAS = 1040;
const PLUS = { x: PILE_X + PILE_L / 2, y: PILE_HAUT - 30 };
const MOINS = { x: PILE_X + PILE_L + 14, y: PILE_BAS - 30 };
const OX = 660;
const OY = 800;

const JAUNE = "#FFD21F";
const CUIVRE = "#C8733A";
const ROUGE = "#D8352A";
const CREME = "#FFF1D6";
const NOIR = "#14110D";
const ARGENT = "#D9D2C3";

type Point = { x: number; y: number };
type Objet = { Dessin: FC<{ t: number }>; plus: Point | null; moins: Point | null };

// Un éclair net : une ligne brisée, jamais un clignotement
const Zigzag = ({ points, largeur, couleur, progres = 1 }: { points: number[][]; largeur: number; couleur: string; progres?: number }) => {
  const d = points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  return (
    <g>
      <path d={d} fill="none" stroke={NOIR} strokeWidth={largeur + 10} strokeLinejoin="miter" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - progres} />
      <path d={d} fill="none" stroke={couleur} strokeWidth={largeur} strokeLinejoin="miter" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - progres} />
    </g>
  );
};

const Ampoule = () => (
  <g>
    <circle cx={0} cy={110} r={150} fill={JAUNE} opacity={0.14} />
    <circle cx={0} cy={110} r={100} fill={JAUNE} opacity={0.18} />
    <path d="M -62 110 A 70 70 0 1 1 62 110 C 52 140 34 150 32 180 L -32 180 C -34 150 -52 140 -62 110 Z" fill="#FFE884" />
    <path d="M -18 176 L -18 120 L -6 98 L 6 120 L 18 98 L 18 176" fill="none" stroke={CUIVRE} strokeWidth={6} strokeLinejoin="round" />
    {[186, 204, 222].map((y) => (
      <rect key={y} x={-36} y={y} width={72} height={14} rx={7} fill={ARGENT} />
    ))}
    <rect x={-70} y={236} width={140} height={14} rx={4} fill="#3A2E25" />
  </g>
);

const Voiture = () => (
  <g>
    <polygon points="230,120 420,60 420,230" fill={JAUNE} opacity={0.35} />
    <path d="M -240 210 L -240 120 L -150 104 L -90 30 L 90 30 L 160 104 L 236 120 L 236 210 Z" fill={ROUGE} />
    <path d="M -76 46 L -10 46 L -10 104 L -126 104 Z" fill="#F4DDB0" />
    <path d="M 10 46 L 78 46 L 128 104 L 10 104 Z" fill="#F4DDB0" />
    <rect x={-240} y={150} width={476} height={14} fill="#9E241C" />
    {[-140, 140].map((x) => (
      <g key={x}>
        <circle cx={x} cy={210} r={44} fill={NOIR} />
        <circle cx={x} cy={210} r={18} fill={ARGENT} />
      </g>
    ))}
    <rect x={218} y={118} width={22} height={24} rx={6} fill="#FFF6C8" />
    <rect x={-244} y={124} width={14} height={22} rx={4} fill="#FF8A3A" />
  </g>
);

const Grillepain = ({ t }: { t: number }) => {
  const age = t - (calcul.paliers.find((p) => p.cle === "prise")?.arrivee_s ?? 0);
  const saut = interpolate(age, [0.3, 0.55, 0.8], [0, -120, -90], { ...borne, easing: Easing.out(Easing.quad) });
  return (
    <g>
      <rect x={-250} y={-60} width={130} height={190} rx={18} fill={CREME} />
      {[-205, -165].map((x) => (
        <rect key={x} x={x} y={-10} width={12} height={44} rx={4} fill={NOIR} />
      ))}
      <path d="M -194 72 a 12 12 0 0 1 24 0 l 0 14 l -24 0 Z" fill={NOIR} />
      <path d="M -150 110 C -120 260 -60 250 -40 210" fill="none" stroke={NOIR} strokeWidth={10} />
      {[20, 110].map((x) => (
        <g key={x} transform={`translate(0 ${saut})`}>
          <rect x={x} y={20} width={70} height={110} rx={18} fill="#E7B36A" stroke="#9A5F16" strokeWidth={8} />
        </g>
      ))}
      <rect x={-40} y={70} width={270} height={180} rx={44} fill={ROUGE} />
      <rect x={-10} y={70} width={210} height={16} fill="#9E241C" />
      <rect x={160} y={140} width={46} height={18} rx={8} fill={NOIR} />
      <rect x={-20} y={244} width={230} height={10} rx={5} fill={NOIR} />
    </g>
  );
};

const Anguille = ({ t }: { t: number }) => {
  const points = Array.from({ length: 13 }, (_, i) => {
    const x = -200 + i * 30;
    const y = 90 + Math.sin(i * 0.7 - t * 4) * 34 * (0.4 + i / 13);
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");
  const tete = 90 + Math.sin(-t * 4) * 34 * 0.4;
  return (
    <g>
      <rect x={-260} y={-120} width={520} height={370} rx={14} fill="#24392C" />
      <rect x={-260} y={-120} width={520} height={30} fill="#36513F" />
      <rect x={-260} y={226} width={520} height={24} fill="#5A4528" />
      <path d={points} fill="none" stroke="#5B5A26" strokeWidth={46} strokeLinecap="round" strokeLinejoin="round" />
      <path d={points} fill="none" stroke="#C99A3A" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" transform="translate(0 14)" opacity={0.7} />
      <circle cx={-208} cy={tete - 6} r={7} fill={CREME} />
      <circle cx={-210} cy={tete - 6} r={3} fill={NOIR} />
      <Zigzag points={[[-120, 10], [-104, -20], [-88, 0], [-72, -36]]} largeur={7} couleur={JAUNE} />
      <Zigzag points={[[40, 160], [56, 190], [76, 170], [92, 206]]} largeur={7} couleur={JAUNE} />
      <Zigzag points={[[150, 20], [168, -6], [186, 14], [204, -22]]} largeur={7} couleur={JAUNE} />
    </g>
  );
};

const Cloture = () => (
  <g>
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M -300 ${20 + i * 70} Q -110 ${40 + i * 70} 0 ${20 + i * 70} Q 110 ${40 + i * 70} 300 ${20 + i * 70}`} fill="none" stroke={ARGENT} strokeWidth={6} />
    ))}
    {[-220, 0, 220].map((x) => (
      <rect key={x} x={x - 14} y={-40} width={28} height={290} rx={4} fill="#8A5A2B" />
    ))}
    <g transform="translate(110 70)">
      <polygon points="0,-62 62,48 -62,48" fill={JAUNE} stroke={NOIR} strokeWidth={8} strokeLinejoin="round" />
      <polygon points="6,-28 -14,10 2,10 -8,38 18,0 2,0 12,-28" fill={NOIR} />
    </g>
    <rect x={-300} y={240} width={600} height={10} fill="#4A3A22" />
  </g>
);

const Poignee = ({ t }: { t: number }) => {
  const tremble = Math.floor(t * 2) % 2 === 0 ? 0 : 6;
  return (
    <g>
      <rect x={-200} y={-250} width={360} height={500} fill="#8A4A22" />
      <rect x={-160} y={-210} width={280} height={180} fill="#743C1A" />
      <rect x={-160} y={10} width={280} height={200} fill="#743C1A" />
      <rect x={-210} y={-260} width={380} height={14} fill="#4A2A14" />
      <rect x={90} y={0} width={40} height={90} rx={12} fill="#B4822C" />
      <circle cx={110} cy={45} r={36} fill="#E0A93B" />
      <circle cx={98} cy={33} r={10} fill="#F6D58A" />
      <Zigzag points={[[-10, 45 + tremble], [20, 22], [36, 60], [56, 30 - tremble], [74, 45]]} largeur={10} couleur={CREME} />
    </g>
  );
};

const Pylone = () => (
  <g stroke="#BFB6A8" strokeWidth={9} fill="none" strokeLinecap="round">
    <path d="M -130 250 L -34 -250 L 34 -250 L 130 250" />
    {[-150, -40, 70, 170].map((y, i, liste) => {
      const k = (y + 250) / 500;
      const kb = ((liste[i + 1] ?? 250) + 250) / 500;
      const xa = 34 + 96 * k;
      const xb = 34 + 96 * kb;
      return <path key={y} d={`M ${-xa} ${y} L ${xb} ${liste[i + 1] ?? 250} M ${xa} ${y} L ${-xb} ${liste[i + 1] ?? 250} M ${-xa} ${y} L ${xa} ${y}`} strokeWidth={6} />;
    })}
    <path d="M -230 -200 L 230 -200 M -180 -110 L 180 -110" />
    {[-230, 230, -180, 180].map((x, i) => (
      <path key={x} d={`M ${x} ${i < 2 ? -200 : -110} L ${x} ${i < 2 ? -150 : -60}`} stroke={CUIVRE} strokeWidth={14} />
    ))}
    <path d="M 230 -150 Q 330 -110 440 -140 M 180 -60 Q 300 -20 440 -50 M -230 -150 Q -330 -110 -440 -140" strokeWidth={5} stroke="#3A2E25" />
  </g>
);

const Machine = ({ t }: { t: number }) => (
  <g>
    <rect x={-120} y={-200} width={240} height={450} fill="#E8E0D0" />
    {[-150, -80, -10, 60, 130, 200].map((y) => (
      <rect key={y} x={-120} y={y} width={240} height={10} fill="#BFB6A8" />
    ))}
    <path d="M -120 -200 A 120 70 0 0 1 120 -200 Z" fill="#E8E0D0" />
    <rect x={-24} y={196} width={48} height={54} fill="#3A2E25" />
    <circle cx={0} cy={-270} r={56} fill={ARGENT} />
    <circle cx={-18} cy={-288} r={16} fill="#FFFFFF" opacity={0.7} />
    <Zigzag points={[[50, -290], [96, -318], [86, -280], [140, -300]]} largeur={8} couleur={JAUNE} progres={0.6 + 0.4 * ((t * 1.5) % 1)} />
    <Zigzag points={[[-50, -250], [-100, -230], [-86, -270], [-150, -246]]} largeur={8} couleur={JAUNE} />
  </g>
);

const NUAGE = "M -560 -470 L 560 -470 L 560 -250 C 520 -200 450 -220 420 -250 C 380 -190 280 -190 240 -240 C 200 -180 90 -180 50 -240 C 10 -180 -100 -180 -140 -240 C -180 -180 -290 -190 -330 -250 C -380 -200 -480 -210 -560 -250 Z";

// Le nuage d'orage, au-dessus du compteur, sans texte dessous
const Nuage = ({ t }: { t: number }) => {
  const descente = interpolate(t - calcul.t_limite, [0, 0.5], [-200, 0], { ...borne, easing: Easing.out(Easing.cubic) });
  return (
    <g transform={`translate(${540 - OX} ${descente - OY + 410})`}>
      <path d={NUAGE} fill="#2B2622" />
      <path d={NUAGE} fill="#3D352F" transform="translate(0 -40) scale(0.9 0.9)" />
      {/* La masse du nuage descend à droite, loin du compteur */}
      {[
        [200, -110, 130],
        [330, -40, 170],
        [470, -130, 150],
        [470, 40, 110],
        [250, 50, 90],
      ].map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#2B2622" />
      ))}
      <circle cx={300} cy={-70} r={110} fill="#3D352F" />
    </g>
  );
};

const Maison = ({ t }: { t: number }) => {
  const age = t - calcul.t_maison;
  return (
    <g>
      <polygon points="-200,100 0,-50 200,100" fill={ROUGE} />
      <rect x={-170} y={100} width={340} height={150} fill={CREME} />
      <rect x={-130} y={130} width={90} height={60} fill={age > 0.3 ? JAUNE : "#3A2E25"} />
      <rect x={40} y={130} width={90} height={60} fill={age > 0.5 ? JAUNE : "#3A2E25"} />
      <rect x={-30} y={190} width={60} height={60} fill="#5A3A22" />
    </g>
  );
};

const OBJETS: Record<string, Objet> = {
  ampoule: { Dessin: Ampoule, plus: { x: -36, y: 196 }, moins: { x: 0, y: 236 } },
  voiture: { Dessin: Voiture, plus: { x: -236, y: 130 }, moins: { x: -236, y: 196 } },
  prise: { Dessin: Grillepain, plus: { x: -250, y: 0 }, moins: { x: -250, y: 90 } },
  anguille: { Dessin: Anguille, plus: { x: -230, y: -40 }, moins: { x: -230, y: 200 } },
  cloture: { Dessin: Cloture, plus: { x: -300, y: 20 }, moins: { x: -260, y: 244 } },
  statique: { Dessin: Poignee, plus: { x: -10, y: 45 }, moins: { x: -200, y: 230 } },
  ligne: { Dessin: Pylone, plus: { x: -230, y: -150 }, moins: { x: -130, y: 250 } },
  machine: { Dessin: Machine, plus: { x: -120, y: -60 }, moins: { x: -120, y: 230 } },
  eclair: { Dessin: Nuage, plus: null, moins: null },
  maison: { Dessin: Maison, plus: { x: -170, y: 100 }, moins: { x: -170, y: 230 } },
};

// Quel objet est branché à cet instant, et depuis quand
const objetA = (t: number): { cle: string; depuis: number } => {
  if (t >= calcul.t_retour) {
    return { cle: "ampoule", depuis: calcul.t_retour };
  }
  if (t >= calcul.t_maison) {
    return { cle: "maison", depuis: calcul.t_maison };
  }
  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  return atteint ? { cle: atteint.cle, depuis: atteint.arrivee_s } : { cle: "ampoule", depuis: -10 };
};

const Pile = ({ pas, t }: { pas: number; t: number }) => {
  const halo = 0.06 + 0.003 * pas;
  return (
    <g>
      <circle cx={PLUS.x} cy={(PILE_HAUT + PILE_BAS) / 2} r={120 + 2.2 * pas} fill={JAUNE} opacity={halo} />
      <rect x={PLUS.x - 26} y={PILE_HAUT - 30} width={52} height={36} rx={8} fill={ARGENT} />
      <rect x={PILE_X} y={PILE_HAUT} width={PILE_L} height={PILE_BAS - PILE_HAUT} rx={20} fill={NOIR} />
      <rect x={PILE_X} y={PILE_HAUT} width={PILE_L} height={120} rx={20} fill={CUIVRE} />
      <rect x={PILE_X} y={PILE_HAUT + 100} width={PILE_L} height={20} fill={CUIVRE} />
      <rect x={PILE_X + 18} y={PILE_HAUT + 10} width={14} height={PILE_BAS - PILE_HAUT - 20} rx={7} fill="#FFFFFF" opacity={0.18} />
      <rect x={PLUS.x - 26} y={PILE_HAUT + 52} width={52} height={14} rx={3} fill={CREME} />
      <rect x={PLUS.x - 7} y={PILE_HAUT + 33} width={14} height={52} rx={3} fill={CREME} />
      <rect x={PLUS.x - 22} y={PILE_BAS - 70} width={44} height={12} rx={3} fill={CREME} />
      <rect x={PILE_X + PILE_L - 4} y={MOINS.y - 10} width={22} height={20} rx={4} fill={ARGENT} />
      {/* Au-delà de la clôture, de petits arcs crépitent autour de la borne + (une forme par demi-seconde) */}
      {pas > 27 &&
        [0, 1, 2].map((i) => {
          const angle = ((Math.floor(t * 2) * 47 + i * 120) % 360) * (Math.PI / 180);
          const r1 = 30;
          const r2 = 60 + Math.min(pas - 27, 30) * 3;
          const x1 = PLUS.x + Math.cos(angle) * r1;
          const y1 = PLUS.y + Math.sin(angle) * r1 * 0.6 - 10;
          const x2 = PLUS.x + Math.cos(angle) * r2;
          const y2 = PLUS.y + Math.sin(angle) * r2 * 0.6 - 10;
          const mx = (x1 + x2) / 2 + Math.sin(angle) * 14;
          const my = (y1 + y2) / 2 - Math.cos(angle) * 14;
          return <Zigzag key={i} points={[[x1, y1], [mx, my], [x2, y2]]} largeur={5} couleur={JAUNE} />;
        })}
    </g>
  );
};

const Fils = ({ objet, t, pas, apparition }: { objet: Objet; t: number; pas: number; apparition: number }) => {
  if (!objet.plus || !objet.moins) {
    return null;
  }
  const a = { x: OX + objet.plus.x, y: OY + objet.plus.y };
  const b = { x: OX + objet.moins.x, y: OY + objet.moins.y };
  const dPlus = `M ${PLUS.x} ${PLUS.y} C ${PLUS.x} ${PLUS.y - 160} ${a.x - 200} ${a.y - 40} ${a.x} ${a.y}`;
  const dMoins = `M ${MOINS.x} ${MOINS.y} C ${MOINS.x + 120} ${MOINS.y + 60} ${b.x - 160} ${b.y + 30} ${b.x} ${b.y}`;
  // Le courant défile de plus en plus vite, sans dépasser ce que 30 images par seconde montrent net
  const vitesse = 60 + 9 * pas;
  const decalage = -(t * vitesse) % 80;
  return (
    <g fill="none" strokeLinecap="round" opacity={apparition}>
      <path d={dPlus} stroke={ROUGE} strokeWidth={14} />
      <path d={dMoins} stroke={CUIVRE} strokeWidth={14} />
      <path d={dPlus} stroke={JAUNE} strokeWidth={5} strokeDasharray="20 60" strokeDashoffset={decalage} />
      <path d={dMoins} stroke={JAUNE} strokeWidth={5} strokeDasharray="20 60" strokeDashoffset={-decalage} />
      <circle cx={a.x} cy={a.y} r={10} fill={ARGENT} />
      <circle cx={b.x} cy={b.y} r={10} fill={ARGENT} />
    </g>
  );
};

// L'éclair qui part de la pile vers le ciel : tracé du bas vers le haut, puis il reste net
const EclairMontant = ({ t }: { t: number }) => {
  const progres = lisse(entre(t, calcul.t_haut, calcul.t_haut + 0.35));
  const fondu = 1 - entre(t, calcul.t_maison - 0.3, calcul.t_maison);
  if (progres <= 0 || fondu <= 0) {
    return null;
  }
  // Le tracé contourne le compteur par la droite pour ne jamais couper les chiffres
  const tronc = [
    [PLUS.x, PLUS.y],
    [PLUS.x + 90, PLUS.y - 90],
    [PLUS.x + 50, PLUS.y - 140],
    [PLUS.x + 260, PLUS.y - 230],
    [PLUS.x + 230, PLUS.y - 300],
    [PLUS.x + 470, 330],
    [PLUS.x + 420, 250],
    [PLUS.x + 560, 120],
    [PLUS.x + 520, 60],
    [PLUS.x + 600, -10],
  ];
  const branche = [
    [PLUS.x + 260, PLUS.y - 230],
    [PLUS.x + 420, PLUS.y - 250],
    [PLUS.x + 480, PLUS.y - 330],
    [PLUS.x + 640, PLUS.y - 380],
  ];
  return (
    <g opacity={fondu}>
      <Zigzag points={tronc} largeur={26} couleur="#FFFFFF" progres={progres} />
      <Zigzag points={branche} largeur={12} couleur="#FFFFFF" progres={entre(t, calcul.t_haut + 0.15, calcul.t_haut + 0.4)} />
    </g>
  );
};

// Une case par année d'électricité d'un foyer, qui se remplissent l'une après l'autre
const Annees = ({ t }: { t: number }) => {
  const age = t - calcul.t_maison;
  const colonnes = 15;
  const pasCase = 34;
  const x0 = 1010 - colonnes * pasCase;
  const y0 = 505;
  const remplies = Math.floor(calcul.annees * entre(age, 0.4, 1.9));
  return (
    <g>
      {Array.from({ length: calcul.annees }, (_, i) => (
        <rect
          key={i}
          x={x0 + (i % colonnes) * pasCase}
          y={y0 + Math.floor(i / colonnes) * pasCase}
          width={pasCase - 8}
          height={pasCase - 8}
          rx={5}
          fill={i < remplies ? JAUNE : "#3A2E25"}
        />
      ))}
    </g>
  );
};

export const SceneVolt = ({ t }: SceneProps) => {
  const palette = paletteA(t);
  const pas = pasDecor(t);
  const tBoucle = t >= calcul.t_fin ? t - calcul.t_fin : t;
  const { cle, depuis } = objetA(t);
  const objet = OBJETS[cle];
  const age = t - depuis;
  const echelle = interpolate(age, [0, 0.35], [0.4, 1], { ...borne, easing: Easing.out(Easing.back(1.8)) });
  const apparition = cle === "ampoule" && t >= calcul.t_retour ? entre(t, calcul.t_retour, calcul.t_retour + 0.6) : entre(age, 0.05, 0.3);
  // Un seul flash doux, au départ de l'éclair
  const flash = t >= calcul.t_haut ? interpolate(t, [calcul.t_haut, calcul.t_haut + 0.5], [0.45, 0], borne) : 0;
  const Dessin = objet.Dessin;
  const surSol = cle !== "eclair";

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <rect x={0} y={SOL_Y} width={1080} height={1920 - SOL_Y} fill="#000000" opacity={0.28} />
        <rect x={0} y={SOL_Y} width={1080} height={8} fill={palette.accent} opacity={0.5} />
        <g transform={`translate(${OX} ${OY}) ${surSol ? `translate(0 250) scale(${echelle}) translate(0 -250)` : ""}`}>
          <Dessin t={tBoucle} />
        </g>
        {t >= calcul.t_maison && t < calcul.t_retour && <Annees t={t} />}
        <Fils objet={objet} t={tBoucle} pas={pas} apparition={apparition} />
        <Pile pas={pas} t={tBoucle} />
        <EclairMontant t={t} />
        {flash > 0 && <rect x={0} y={0} width={1080} height={1920} fill="#FFFFFF" opacity={flash} />}
      </svg>
    </AbsoluteFill>
  );
};
