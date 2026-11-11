import { AbsoluteFill, interpolate, interpolateColors } from "remotion";
import calcul from "../../../sujets/time.calcul.json";
import type { SceneProps } from "../../cadre/types";
import { ampliJour, ampliSaison, anneeA, cielA, debit, entre, heureA, lisse, nuitA, P, pasDecor, reel, SOMBRE, sombreA } from "./temps";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const SOLEIL = "#FFD45C";
const ROUGE_GEANT = "#E0521E";
const ENCRE = "#1F1712";
const CREME = "#FFF1D6";

// La colline est un grand cercle : en reculant, il devient la Terre vue de l'espace
const colline = (n: number) => {
  const m = lisse(entre(n, P.dinos + 1.5, P.terre - 2));
  return { cx: interpolate(m, [0, 1], [540, 520]), cy: interpolate(m, [0, 1], [1920, 880]), r: interpolate(m, [0, 1], [900, 280]), m };
};

const surface = (c: { cx: number; cy: number; r: number }, x: number) => c.cy - Math.sqrt(Math.max(c.r * c.r - (x - c.cx) * (x - c.cx), 0));

const SAISONS: [number, string][] = [
  [0, "#E6ECEC"],
  [0.17, "#E6ECEC"],
  [0.3, "#8DBB4E"],
  [0.55, "#5E9A3A"],
  [0.72, "#9AA142"],
  [0.82, "#C27A2E"],
  [0.92, "#8A6A45"],
  [1, "#E6ECEC"],
];

const couleurColline = (t: number, n: number) => {
  const saison = interpolateColors(anneeA(t), SAISONS.map(([p]) => p), SAISONS.map(([, c]) => c));
  const zone = interpolateColors(
    n,
    [0, P.vie, P.pyramide - 1, P.sapiens + 2, P.dinos - 2.5, P.dinos + 1.5, P.terre - 2],
    ["#7E9446", "#7E9446", "#A08A55", "#A08A55", "#4F8A3A", "#4F8A3A", "#2D6A85"],
  );
  const jour = interpolateColors(ampliSaison(t), [0, 1], [zone, saison]);
  return interpolateColors(nuitA(heureA(t)) * ampliJour(t) * 0.6, [0, 1], [jour, "#1C2620"]);
};

// Le soleil suit l'heure ; quand les jours défilent trop vite, il ne reste que sa trace
const Soleil = ({ t, n }: { t: number; n: number }) => {
  const a = ampliJour(t);
  const theta = (Math.PI * (heureA(t) - 6)) / 12;
  const x = 540 - 640 * Math.cos(theta);
  const y = 1020 - 470 * Math.sin(theta);
  const trace = (1 - a) * 0.4 * (1 - entre(n, P.dinos, P.dinos + 2));
  return (
    <g>
      {trace > 0 && <path d="M -100 1020 A 640 470 0 0 1 1180 1020" fill="none" stroke={SOLEIL} strokeWidth={90} opacity={trace} />}
      {a > 0 && Math.sin(theta) > -0.2 && <circle cx={x} cy={y} r={58} fill={SOLEIL} opacity={a} />}
    </g>
  );
};

// Vu de l'espace, le Soleil enfle jusqu'à tout avaler
const SoleilGeant = ({ n }: { n: number }) => {
  const vu = entre(n, P.dinos + 2, P.terre - 2);
  if (vu <= 0) {
    return null;
  }
  const r = interpolate(n, [P.terre - 2, P.terre, P.terre + 1, calcul.n_max], [70, 130, 430, 2300], borne);
  const couleur = interpolateColors(entre(n, P.terre - 0.5, P.terre + 1.5), [0, 1], [SOLEIL, ROUGE_GEANT]);
  return <circle cx={210} cy={600} r={r} fill={couleur} opacity={vu} />;
};

const ETOILES = [
  [120, 820],
  [930, 860],
  [880, 1060],
  [160, 1080],
  [980, 700],
  [60, 640],
  [700, 520],
  [420, 470],
  [1000, 1180],
  [90, 1240],
];

const Arbre = ({ n, c }: { n: number; c: ReturnType<typeof colline> }) => {
  const pousse = lisse(entre(n, P.vie - 5.5, P.vie - 2));
  const chute = lisse(entre(n, P.vie - 0.5, P.vie + 0.7));
  const reste = 1 - entre(n, P.vie + 0.7, P.vie + 1.7);
  if (pousse <= 0 || reste <= 0) {
    return null;
  }
  const x = 760;
  const y = surface(c, x) + 6;
  return (
    <g transform={`translate(${x} ${y}) rotate(${chute * 84}) scale(${0.15 + 0.85 * pousse})`} opacity={reste}>
      <rect x={-14} y={-210} width={28} height={210} fill="#5B3A22" />
      <circle cx={0} cy={-250} r={92} fill="#3F6B2A" />
      <circle cx={-62} cy={-196} r={58} fill="#3F6B2A" />
      <circle cx={60} cy={-200} r={62} fill="#4A7A30" />
    </g>
  );
};

// La maison, puis la ville autour, puis les ruines que la glace efface
const IMMEUBLES = [
  { x: 210, l: 90, h: 210, d: 1.2 },
  { x: 300, l: 70, h: 330, d: 0.6 },
  { x: 470, l: 100, h: 420, d: 0.2 },
  { x: 580, l: 80, h: 300, d: 0.9 },
  { x: 670, l: 110, h: 380, d: 0.4 },
  { x: 800, l: 80, h: 250, d: 1.4 },
];

const Ville = ({ n, c }: { n: number; c: ReturnType<typeof colline> }) => {
  const maison = entre(n, P.vie - 3, P.vie - 2);
  const ruine = lisse(entre(n, P.pyramide - 1, P.pyramide + 0.5));
  const efface = 1 - entre(n, P.pyramide + 2, P.pyramide + 3.5);
  if (maison <= 0 || efface <= 0) {
    return null;
  }
  const mur = interpolateColors(ruine, [0, 1], ["#4A3B33", "#8C7B66"]);
  const fenetre = 1 - entre(ruine, 0, 0.3);
  const xMaison = 390;
  const yMaison = surface(c, xMaison) + 8;
  const engloutie = entre(n, P.vie + 1, P.vie + 2);
  return (
    <g opacity={efface}>
      {IMMEUBLES.map((b, i) => {
        const monte = lisse(entre(n, P.vie + 0.5 + b.d, P.vie + 2.5 + b.d));
        if (monte <= 0) {
          return null;
        }
        const base = surface(c, b.x + b.l / 2) + 10;
        const h = b.h * monte * (1 - 0.62 * ruine);
        const creux = ruine * 40 * (i % 2 ? 1 : 0.5);
        const haut = base - h;
        return (
          <g key={b.x}>
            <polygon
              points={`${b.x},${base} ${b.x},${haut + creux} ${b.x + b.l * 0.35},${haut} ${b.x + b.l * 0.6},${haut + creux * 1.4} ${b.x + b.l},${haut + creux * 0.3} ${b.x + b.l},${base}`}
              fill={mur}
            />
            {fenetre > 0 &&
              Array.from({ length: Math.floor(h / 46) }, (_, k) => (
                <rect key={k} x={b.x + b.l * 0.25} y={base - 40 - k * 46} width={b.l * 0.5} height={18} fill="#F6C453" opacity={fenetre} />
              ))}
          </g>
        );
      })}
      {engloutie < 1 && (
        <g transform={`translate(${xMaison} ${yMaison}) scale(${maison})`} opacity={1 - engloutie}>
          <rect x={-70} y={-100} width={140} height={100} fill="#F2E3C4" />
          <polygon points="-88,-96 0,-170 88,-96" fill="#A63A1E" />
          <rect x={-18} y={-58} width={36} height={58} fill="#5B3A22" />
          <rect x={30} y={-80} width={26} height={26} fill="#F6C453" />
        </g>
      )}
    </g>
  );
};

const Glacier = ({ n, c }: { n: number; c: ReturnType<typeof colline> }) => {
  const avance = lisse(entre(n, P.sapiens - 4, P.sapiens - 1.5)) * (1 - lisse(entre(n, P.sapiens + 1.5, P.sapiens + 3.5)));
  if (avance <= 0) {
    return null;
  }
  const front = interpolate(avance, [0, 1], [-200, 1600]);
  return (
    <g>
      <clipPath id="glace">
        <polygon points={`-50,0 ${front},0 ${front - 260},1920 -50,1920`} />
      </clipPath>
      <g clipPath="url(#glace)">
        <circle cx={c.cx} cy={c.cy} r={c.r + 70} fill="#EEF5F6" />
        <circle cx={c.cx} cy={c.cy} r={c.r + 20} fill="#D4E6EA" />
        <path d={`M 0 ${surface(c, 0) + 40} L 1080 ${surface(c, 1080) + 40}`} stroke="#B9D4DA" strokeWidth={14} />
      </g>
    </g>
  );
};

const Sauropode = () => (
  <g fill="#2E3A1F">
    <ellipse cx={0} cy={-90} rx={110} ry={58} />
    <path d="M 70 -120 C 130 -170 150 -260 170 -300 L 200 -296 C 186 -240 170 -160 110 -90 Z" />
    <ellipse cx={196} cy={-302} rx={26} ry={14} />
    <path d="M -100 -100 C -180 -90 -240 -60 -290 -30 L -280 -18 C -220 -40 -160 -60 -96 -64 Z" />
    {[-70, -30, 40, 80].map((x) => (
      <rect key={x} x={x - 14} y={-60} width={28} height={60} />
    ))}
  </g>
);

const Theropode = () => (
  <g fill="#2E3A1F">
    <ellipse cx={0} cy={-120} rx={70} ry={40} transform="rotate(-12 0 -120)" />
    <path d="M 50 -140 L 92 -200 L 150 -196 L 150 -168 L 104 -160 L 70 -116 Z" />
    <path d="M -60 -120 L -190 -100 L -60 -96 Z" />
    <path d="M -10 -90 L -24 0 L 2 0 L 10 -90 Z M 26 -94 L 30 0 L 54 0 L 46 -96 Z" />
  </g>
);

const Dinos = ({ n, c }: { n: number; c: ReturnType<typeof colline> }) => {
  const vu = entre(n, P.dinos - 2.5, P.dinos - 1.5) * (1 - entre(n, P.dinos + 0.8, P.dinos + 1.8));
  if (vu <= 0) {
    return null;
  }
  const pas = (n - P.dinos) * 60;
  const troupe = [
    { x: 330 + pas, Forme: Sauropode, s: 1 },
    { x: 760 - pas * 0.8, Forme: Theropode, s: 1.1 },
    { x: 560 + pas * 0.5, Forme: Sauropode, s: 0.55 },
  ];
  return (
    <g opacity={vu}>
      {troupe.map(({ x, Forme, s }, i) => (
        <g key={i} transform={`translate(${x} ${surface(c, x) + 12}) scale(${i === 1 ? -s : s} ${s})`}>
          <Forme />
        </g>
      ))}
    </g>
  );
};

const CONTINENTS = [
  { x: -120, y: -70, rx: 90, ry: 60, dx: -1, dy: 0.3 },
  { x: 70, y: -130, rx: 70, ry: 45, dx: 0.6, dy: -0.4 },
  { x: 100, y: 60, rx: 60, ry: 95, dx: 0.8, dy: 0.5 },
  { x: -70, y: 120, rx: 80, ry: 40, dx: -0.4, dy: 0.7 },
];

const Globe = ({ n, c }: { n: number; c: ReturnType<typeof colline> }) => {
  const vu = entre(n, P.dinos + 2.5, P.terre - 2);
  if (vu <= 0) {
    return null;
  }
  const derive = (n - (P.terre - 3)) * 28;
  return (
    <g opacity={vu}>
      <clipPath id="globe">
        <circle cx={c.cx} cy={c.cy} r={c.r} />
      </clipPath>
      <g clipPath="url(#globe)">
        {CONTINENTS.map((k, i) => (
          <ellipse key={i} cx={c.cx + k.x + k.dx * derive} cy={c.cy + k.y + k.dy * derive} rx={k.rx} ry={k.ry} fill="#C9A35C" />
        ))}
        <ellipse cx={c.cx} cy={c.cy - c.r + 18} rx={c.r * 0.5} ry={26} fill="#EEF5F6" />
      </g>
    </g>
  );
};

// L'horloge en aplat : les aiguilles trop rapides deviennent un disque flou
const Aiguille = ({ tours, rythme, longueur, epaisseur, couleur, r }: { tours: number; rythme: number; longueur: number; epaisseur: number; couleur: string; r: number }) => {
  const net = 1 - entre(rythme, 0.25, 0.6);
  return (
    <g>
      {net < 1 && <circle cx={0} cy={0} r={r * longueur} fill={couleur} opacity={(1 - net) * 0.22} />}
      {net > 0 && (
        <rect x={-epaisseur / 2} y={-r * longueur} width={epaisseur} height={r * longueur + 10} rx={epaisseur / 2} fill={couleur} opacity={net} transform={`rotate(${tours * 360})`} />
      )}
    </g>
  );
};

const Horloge = ({ t, n }: { t: number; n: number }) => {
  const grand = lisse(entre(t, calcul.t_limite, calcul.t_limite + 0.7)) * (1 - lisse(entre(t, calcul.t_retour, calcul.t_retour + 0.7)));
  const x = interpolate(grand, [0, 1], [850, 540]);
  const y = interpolate(grand, [0, 1], [590, 780]);
  const r = interpolate(grand, [0, 1], [92, 260]);
  const T = reel(n) + calcul.heure_depart * calcul.heure_s;
  const vitesse = debit(t);
  const balaye = lisse(entre(t, calcul.t_coupe, calcul.t_coupe + 1.6)) * (calcul.univers_pct / 100);
  const part = 1 - entre(t, calcul.t_retour, calcul.t_retour + 0.5);
  const angle = balaye * 2 * Math.PI;
  const secteur = `M 0 0 L 0 ${-r * 0.9} A ${r * 0.9} ${r * 0.9} 0 ${balaye > 0.5 ? 1 : 0} 1 ${r * 0.9 * Math.sin(angle)} ${-r * 0.9 * Math.cos(angle)} Z`;
  const normal = 1 - grand;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx={0} cy={0} r={r + 12} fill={ENCRE} />
      <circle cx={0} cy={0} r={r} fill={CREME} />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={-r * 0.025} y={-r * 0.92} width={r * 0.05} height={r * 0.14} fill={ENCRE} transform={`rotate(${i * 30})`} />
      ))}
      {normal > 0 && (
        <g opacity={normal}>
          <Aiguille tours={T / 43200} rythme={vitesse / 43200} longueur={0.5} epaisseur={r * 0.11} couleur={ENCRE} r={r} />
          <Aiguille tours={T / 3600} rythme={vitesse / 3600} longueur={0.78} epaisseur={r * 0.07} couleur={ENCRE} r={r} />
          <Aiguille tours={T / 60} rythme={vitesse / 60} longueur={0.86} epaisseur={r * 0.03} couleur="#C2381A" r={r} />
        </g>
      )}
      {grand > 0 && part > 0 && (
        <g opacity={grand * part}>
          {balaye > 0 && <path d={secteur} fill="#C2381A" />}
          <rect x={-r * 0.02} y={-r * 0.88} width={r * 0.04} height={r * 0.88} fill={ENCRE} transform={`rotate(${balaye * 360})`} />
        </g>
      )}
      <circle cx={0} cy={0} r={r * 0.07} fill={ENCRE} />
    </g>
  );
};

export const SceneTime = ({ t }: SceneProps) => {
  const n = pasDecor(t);
  const c = colline(n);
  const herbe = couleurColline(t, n);
  const etoiles = entre(n, P.dinos + 2.5, P.terre - 2.5);
  const sombre = sombreA(t);
  return (
    <AbsoluteFill style={{ backgroundColor: cielA(t) }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        {etoiles > 0 && ETOILES.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={5} fill={CREME} opacity={etoiles * 0.8} />)}
        <Soleil t={t} n={n} />
        <SoleilGeant n={n} />
        {c.m < 1 && <rect x={0} y={1180} width={1080} height={740} fill={herbe} opacity={1 - c.m} />}
        {c.m < 1 && <rect x={0} y={1180} width={1080} height={740} fill="#000000" opacity={0.12 * (1 - c.m)} />}
        <circle cx={c.cx} cy={c.cy} r={c.r} fill={herbe} />
        <Globe n={n} c={c} />
        <Ville n={n} c={c} />
        <Arbre n={n} c={c} />
        <Glacier n={n} c={c} />
        <Dinos n={n} c={c} />
        {sombre > 0 && <rect x={0} y={0} width={1080} height={1920} fill={SOMBRE} opacity={sombre} />}
        <Horloge t={t} n={n} />
      </svg>
    </AbsoluteFill>
  );
};
