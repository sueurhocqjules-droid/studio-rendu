import type { FC } from "react";
import { AbsoluteFill, interpolate, random } from "remotion";
import calcul from "../../../sujets/rumor.calcul.json";
import type { SceneProps } from "../../cadre/types";
import { entre, lisse, paletteA, pasDecor, saventA } from "./temps";

type Point = { x: number; y: number };
type Forme = "tete" | "fenetre" | "point";

type Lieu = {
  capacite: number;
  origine: Point;
  places: Point[];
  forme: Forme;
  taille: number;
  Decor: FC;
};

const ECLAIRE = "#FFD25A";
const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const grille = (x0: number, y0: number, colonnes: number, lignes: number, dx: number, dy: number) =>
  Array.from({ length: colonnes * lignes }, (_, i) => ({ x: x0 + (i % colonnes) * dx, y: y0 + Math.floor(i / colonnes) * dy }));

const dansPolygone = (p: Point, poly: number[][]) => {
  let dedans = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > p.y !== yj > p.y && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi) {
      dedans = !dedans;
    }
  }
  return dedans;
};

const pointsDans = (poly: number[][], pas: number) => {
  const sortie: Point[] = [];
  for (let y = 520; y < 1200; y += pas) {
    for (let x = 100; x < 1000; x += pas) {
      if (dansPolygone({ x, y }, poly)) {
        sortie.push({ x, y });
      }
    }
  }
  return sortie;
};

const chemin = (poly: number[][]) => `M ${poly.map(([x, y]) => `${x} ${y}`).join(" L ")} Z`;

// Silhouettes volontairement grossières : on reconnaît la forme, pas une carte
const USA = [
  [150, 700], [330, 688], [520, 698], [690, 704], [750, 660], [800, 690], [870, 648], [935, 636], [905, 720], [862, 772],
  [850, 842], [800, 902], [762, 934], [792, 1050], [752, 1066], [702, 962], [622, 958], [562, 1002], [522, 1086], [478, 1062],
  [440, 982], [360, 960], [300, 940], [230, 900], [180, 860], [150, 780],
];
const INDE = [
  [470, 560], [540, 598], [560, 676], [640, 700], [720, 690], [780, 640], [846, 660], [822, 722], [742, 762], [700, 822],
  [640, 900], [602, 1000], [562, 1100], [532, 1160], [500, 1080], [462, 962], [420, 862], [360, 822], [318, 762], [380, 722],
  [420, 662], [440, 600],
];
const IMMEUBLES = [
  [120, 110, 330], [240, 90, 470], [340, 120, 380], [470, 100, 560], [580, 130, 420], [720, 90, 500], [820, 120, 300],
];
const SOL = 1160;
const TERRE = { x: 540, y: 850, r: 320 };

const Classe = () => (
  <g>
    <rect x={150} y={540} width={780} height={96} rx={8} fill="#2F5D46" stroke="#7A5A3A" strokeWidth={10} />
    <path d="M 210 590 q 40 -30 80 0 t 80 0" fill="none" stroke="#F6F1E4" strokeWidth={5} opacity={0.6} />
    {grille(230, 724, 5, 6, 155, 76).map((p, i) => (
      <rect key={i} x={p.x - 50} y={p.y + 16} width={100} height={14} rx={4} fill="#A87A4C" />
    ))}
  </g>
);

const Ecole = () => (
  <g>
    <polygon points="140,650 540,540 940,650" fill="#8E3B2A" />
    <rect x={170} y={640} width={740} height={SOL - 640} fill="#B5523A" />
    <rect x={490} y={1060} width={100} height={SOL - 1060} fill="#5A2A1C" />
    <circle cx={540} cy={600} r={26} fill="#F3E9D2" />
  </g>
);

const Paquebot = () => (
  <g>
    <rect x={0} y={1110} width={1080} height={120} fill="#1F5F7A" />
    <rect x={250} y={640} width={60} height={90} fill="#C9372C" />
    <rect x={250} y={640} width={60} height={22} fill="#1D2B24" />
    <rect x={280} y={730} width={520} height={80} fill="#F7F3EA" />
    <rect x={220} y={810} width={640} height={90} fill="#F7F3EA" />
    <rect x={180} y={900} width={720} height={100} fill="#F7F3EA" />
    <path d="M 110 1000 L 980 1000 L 910 1130 L 190 1130 Z" fill="#14324A" />
    <path d="M 110 1000 L 980 1000 L 972 1016 L 118 1016 Z" fill="#C9372C" />
  </g>
);

const Stade = () => (
  <g>
    <ellipse cx={540} cy={880} rx={470} ry={300} fill="#5B6068" />
    <ellipse cx={540} cy={880} rx={240} ry={135} fill="#2E7D3A" />
    <rect x={380} y={810} width={320} height={140} fill="none" stroke="#F6F1E4" strokeWidth={4} />
    <line x1={540} y1={810} x2={540} y2={950} stroke="#F6F1E4" strokeWidth={4} />
  </g>
);

const Ville = () => (
  <g>
    {IMMEUBLES.map(([x, w, h], i) => (
      <rect key={i} x={x} y={SOL - h} width={w} height={h} fill={i % 2 ? "#2B3247" : "#343C55"} />
    ))}
    <rect x={0} y={SOL} width={1080} height={80} fill="#10141F" />
  </g>
);

const Pays = ({ poly, couleur }: { poly: number[][]; couleur: string }) => <path d={chemin(poly)} fill={couleur} />;
const Usa = () => <Pays poly={USA} couleur="#4A5A3A" />;
const Inde = () => <Pays poly={INDE} couleur="#7A4A2E" />;

const Globe = () => (
  <g>
    <circle cx={TERRE.x} cy={TERRE.y} r={TERRE.r + 10} fill="#1E3A52" />
    <circle cx={TERRE.x} cy={TERRE.y} r={TERRE.r} fill="#245E86" />
  </g>
);

const LIEUX: Lieu[] = [
  { capacite: 27, origine: { x: 540, y: 1104 }, places: grille(230, 724, 5, 6, 155, 76), forme: "tete", taille: 26, Decor: Classe },
  { capacite: 514, origine: { x: 540, y: 1100 }, places: grille(214, 680, 8, 6, 93, 66), forme: "fenetre", taille: 26, Decor: Ecole },
  {
    capacite: 9950,
    origine: { x: 200, y: 950 },
    places: [...grille(310, 770, 12, 1, 44, 0), ...grille(250, 855, 14, 1, 44, 0), ...grille(210, 950, 16, 1, 44, 0), ...grille(210, 1060, 16, 1, 44, 0)],
    forme: "point",
    taille: 13,
    Decor: Paquebot,
  },
  {
    capacite: 90000,
    origine: { x: 540, y: 1150 },
    places: Array.from({ length: 6 }, (_, k) =>
      Array.from({ length: 30 + k * 4 }, (_, i) => {
        const a = (i / (30 + k * 4)) * Math.PI * 2;
        return { x: 540 + Math.cos(a) * (280 + k * 36), y: 880 + Math.sin(a) * (165 + k * 22) };
      }),
    ).flat(),
    forme: "point",
    taille: 11,
    Decor: Stade,
  },
  {
    capacite: 8585000,
    origine: { x: 140, y: 1140 },
    places: IMMEUBLES.flatMap(([x, w, h]) => grille(x + 20, SOL - h + 24, Math.floor((w - 20) / 34), Math.floor((h - 30) / 40), 34, 40)),
    forme: "fenetre",
    taille: 18,
    Decor: Ville,
  },
  { capacite: 341784857, origine: { x: 880, y: 680 }, places: pointsDans(USA, 30), forme: "point", taille: 10, Decor: Usa },
  { capacite: 1463865525, origine: { x: 480, y: 600 }, places: pointsDans(INDE, 28), forme: "point", taille: 9, Decor: Inde },
  {
    capacite: 8231613070,
    origine: { x: 700, y: 700 },
    places: pointsDans(
      Array.from({ length: 48 }, (_, i) => [TERRE.x + Math.cos((i / 48) * Math.PI * 2) * (TERRE.r - 16), TERRE.y + Math.sin((i / 48) * Math.PI * 2) * (TERRE.r - 16)]),
      26,
    ),
    forme: "point",
    taille: 9,
    Decor: Globe,
  },
];

// Ordre d'allumage : du point de départ vers l'extérieur, avec un peu de désordre, comme un bouche-à-oreille
const ORDRES = LIEUX.map((lieu, l) =>
  lieu.places
    .map((p, i) => ({ i, d: Math.hypot(p.x - lieu.origine.x, p.y - lieu.origine.y) + random(`rumor-${l}-${i}`) * 90 }))
    .sort((a, b) => a.d - b.d)
    .map((o) => o.i),
);

const Place = ({ p, forme, taille, allume, eteint }: { p: Point; forme: Forme; taille: number; allume: boolean; eteint: string }) => {
  const couleur = allume ? ECLAIRE : eteint;
  if (forme === "tete") {
    return (
      <g>
        <path d={`M ${p.x - taille * 1.1} ${p.y + taille * 1.3} Q ${p.x} ${p.y - taille * 0.2} ${p.x + taille * 1.1} ${p.y + taille * 1.3} Z`} fill={allume ? "#D2463C" : "#8A8F99"} />
        <circle cx={p.x} cy={p.y - taille * 0.2} r={taille * 0.7} fill={couleur} />
      </g>
    );
  }
  if (forme === "fenetre") {
    return <rect x={p.x - taille / 2} y={p.y - taille * 0.6} width={taille} height={taille * 1.2} rx={3} fill={couleur} />;
  }
  return <circle cx={p.x} cy={p.y} r={taille} fill={couleur} />;
};

const VueLieu = ({ index, part, ondes, eteint }: { index: number; part: number; ondes: number; eteint: string }) => {
  const lieu = LIEUX[index];
  const ordre = ORDRES[index];
  const n = lieu.places.length;
  const allumes = Math.max(index === 0 ? 1 : 0, Math.round(part * n));
  const rang = new Array<number>(n);
  ordre.forEach((i, r) => {
    rang[i] = r;
  });
  const avant = Math.round(ondes * n);
  return (
    <g>
      <lieu.Decor />
      {lieu.places.map((p, i) => (
        <Place key={i} p={p} forme={lieu.forme} taille={lieu.taille} allume={rang[i] < allumes} eteint={eteint} />
      ))}
      {/* Les derniers à l'apprendre chuchotent encore : un anneau autour d'eux */}
      {lieu.places.map((p, i) =>
        rang[i] < allumes && rang[i] >= avant ? (
          <circle key={`o${i}`} cx={p.x} cy={p.y} r={lieu.taille * 2} fill="none" stroke="#D2463C" strokeWidth={4} opacity={0.8} />
        ) : null,
      )}
    </g>
  );
};

const indexDe = (t: number) => {
  if (t >= calcul.t_retour) {
    return 0;
  }
  const atteints = calcul.paliers.filter((p) => t >= p.arrivee_s).length;
  return Math.min(atteints, LIEUX.length - 1);
};

const partDe = (index: number, pas: number) => Math.min(1, saventA(pas) / LIEUX[index].capacite);

const Bebe = ({ x, y, r, allume }: { x: number; y: number; r: number; allume: boolean }) => (
  <g>
    <ellipse cx={x} cy={y + r * 0.9} rx={r * 1.3} ry={r * 0.7} fill="#F6F1E4" />
    <circle cx={x} cy={y} r={r} fill={allume ? ECLAIRE : "#C9B79A"} />
    <path d={`M ${x - r * 0.45} ${y - r * 0.05} q ${r * 0.15} ${r * 0.15} ${r * 0.3} 0 M ${x + r * 0.15} ${y - r * 0.05} q ${r * 0.15} ${r * 0.15} ${r * 0.3} 0`} fill="none" stroke="#2A1C0A" strokeWidth={r * 0.08} />
  </g>
);

// Épilogue : la planète entière sait, une bulle vide cherche quelqu'un, puis les bébés arrivent un par un
const Epilogue = ({ t }: { t: number }) => {
  const recul = lisse(entre(t, calcul.t_coupe, calcul.t_coupe + 0.6));
  const s = 1 - 0.3 * recul;
  const bebes = t >= calcul.t_qui ? Math.floor(calcul.naissances_s * (t - calcul.t_qui)) : 0;
  const zoom = lisse(entre(t, calcul.t_patte, calcul.t_patte + 0.7));
  if (zoom >= 1) {
    const onde = (t - calcul.t_patte) % 1;
    return (
      <g>
        <circle cx={540} cy={860} r={330} fill="#1E3A52" />
        <g opacity={1}>
          <Place p={{ x: 330, y: 820 }} forme="tete" taille={110} allume eteint="#8A8F99" />
          {[0, 1, 2].map((k) => (
            <path
              key={k}
              d={`M ${470 + k * 40} ${760 - k * 10} q 30 50 0 100`}
              fill="none"
              stroke="#D2463C"
              strokeWidth={14}
              strokeLinecap="round"
              opacity={entre(onde, k * 0.2, k * 0.2 + 0.2) * (1 - entre(onde, 0.8, 1))}
            />
          ))}
          <Bebe x={760} y={850} r={110} allume={onde > 0.7} />
        </g>
      </g>
    );
  }
  return (
    <g>
      <g transform={`translate(${TERRE.x} ${TERRE.y - 60 * recul}) scale(${s * (1 + zoom * 2)}) translate(${-TERRE.x} ${-TERRE.y})`} opacity={1 - zoom}>
        <VueLieu index={LIEUX.length - 1} part={1} ondes={1} eteint="#245E86" />
      </g>
      {recul > 0 && zoom === 0 && (
        <g opacity={recul}>
          <path d="M 760 560 h 200 a 30 30 0 0 1 30 30 v 90 a 30 30 0 0 1 -30 30 h -140 l -40 40 v -40 h -20 a 30 30 0 0 1 -30 -30 v -90 a 30 30 0 0 1 30 -30 Z" fill="none" stroke="#FFF4E0" strokeWidth={8} strokeDasharray="22 14" />
        </g>
      )}
      {Array.from({ length: bebes }, (_, i) => {
        const a = -Math.PI / 2 + (i + 0.5) * 0.36;
        const x = TERRE.x + Math.cos(a) * 300;
        const y = TERRE.y - 60 + Math.sin(a) * 300;
        const age = t - (calcul.t_qui + (i + 1) / calcul.naissances_s);
        return (
          <g key={i} opacity={1 - zoom} transform={`translate(${x} ${y}) scale(${interpolate(age, [0, 0.2], [0.3, 1], borne)}) translate(${-x} ${-y})`}>
            <Bebe x={x} y={y} r={30} allume={age > 0.5} />
          </g>
        );
      })}
    </g>
  );
};

export const SceneRumor = ({ t }: SceneProps) => {
  const palette = paletteA(t);
  const pas = pasDecor(t);

  if (t >= calcul.t_coupe && t < calcul.t_retour) {
    return (
      <AbsoluteFill style={{ backgroundColor: palette.fond }}>
        <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
          <Epilogue t={t} />
        </svg>
      </AbsoluteFill>
    );
  }

  const index = indexDe(t);
  const precedent = calcul.paliers[index - 1];
  const age = precedent ? t - precedent.arrivee_s : 99;
  // Le lieu rempli reste à l'écran le temps de sa légende, puis il rapetisse dans le suivant
  const bascule = lisse(entre(age, 1.6, 2.2));
  const eteint = palette.encre === "#1D2B24" || palette.encre === "#2A140C" ? "#B9AE98" : "#5A6070";
  const flash = t >= calcul.t_retour ? interpolate(t, [calcul.t_retour, calcul.t_retour + 0.35], [1, 0], borne) : 0;
  const lieu = LIEUX[index];

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        {precedent && bascule < 1 && (
          <g
            transform={`translate(${lieu.origine.x} ${lieu.origine.y}) scale(${interpolate(bascule, [0, 1], [1, 0.05])}) translate(${-LIEUX[index - 1].origine.x} ${-LIEUX[index - 1].origine.y})`}
            opacity={1 - bascule * 0.6}
          >
            <VueLieu index={index - 1} part={1} ondes={1} eteint={eteint} />
          </g>
        )}
        {(!precedent || bascule > 0) && (
          <g
            transform={`translate(${lieu.origine.x} ${lieu.origine.y}) scale(${interpolate(bascule, [0, 1], [2.2, 1])}) translate(${-lieu.origine.x} ${-lieu.origine.y})`}
            opacity={precedent ? bascule : 1}
          >
            <VueLieu index={index} part={partDe(index, pas)} ondes={partDe(index, Math.max(0, pas - 0.6))} eteint={eteint} />
          </g>
        )}
        {flash > 0 && <rect x={0} y={0} width={1080} height={1920} fill="#FFFFFF" opacity={flash} />}
      </svg>
    </AbsoluteFill>
  );
};
