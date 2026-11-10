import React from "react";
import { AbsoluteFill, interpolate, interpolateColors } from "remotion";
import calcul from "../../../sujets/walk.calcul.json";
import type { Palette, SceneProps } from "../../cadre/types";
import { paletteA, partRetour, pasDecor, secondeDe, vitesse } from "./temps";

const LARGEUR = 1080;
const HAUTEUR = 1920;
const SOL_Y = 1090;
const PERIODE = 560;

const N_GUEPARD = secondeDe("guepard");
const N_TRAIN = secondeDe("train");
const N_SON = secondeDe("son");
const N_LIB = secondeDe("liberation");
const N_SONDE = secondeDe("sonde");
const N_OCEAN = secondeDe("ocean");
const N_MONDE = secondeDe("monde");
const N_LUNE = secondeDe("lune");
const N_MAX = calcul.n_max;

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

const hachage = (i: number, k = 0) => {
  let n = Math.imul(i + 1, 374761393) + Math.imul(k + 1, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};

// Défilement du sol : une fonction du pas, pour repartir à l'envers au retour
const defilement = (n: number) => 190 * n + 16 * n * n;

type Decor = { t: number; n: number; palette: Palette };

const Maison: React.FC<{ x: number; clef: number }> = ({ x, clef }) => (
  <g transform={`translate(${x} 0)`}>
    <rect x={-330} y={SOL_Y - 420} width={640} height={420} fill="#D9694A" />
    <path d={`M-370 ${SOL_Y - 420} L-10 ${SOL_Y - 550} L350 ${SOL_Y - 420} Z`} fill="#6B2B2B" />
    <rect x={-250} y={SOL_Y - 340} width={150} height={150} fill="#FFF3D1" stroke="#6B2B2B" strokeWidth={10} />
    <line x1={-175} y1={SOL_Y - 340} x2={-175} y2={SOL_Y - 190} stroke="#6B2B2B" strokeWidth={8} />
    <line x1={-250} y1={SOL_Y - 265} x2={-100} y2={SOL_Y - 265} stroke="#6B2B2B" strokeWidth={8} />
    <rect x={120} y={SOL_Y - 290} width={150} height={290} fill="#23615A" stroke="#6B2B2B" strokeWidth={10} />
    <circle cx={146} cy={SOL_Y - 140} r={10} fill="#F2C14E" />
    <rect x={92} y={SOL_Y - 10} width={206} height={18} fill="#A8824F" />
    <g transform={`translate(214 ${SOL_Y - 16}) rotate(-12)`}>
      <circle r={13 + clef * 5} fill="none" stroke="#F2C14E" strokeWidth={7} />
      <rect x={12} y={-4} width={40} height={8} fill="#F2C14E" />
      <rect x={40} y={2} width={7} height={11} fill="#F2C14E" />
    </g>
    {clef > 0
      ? [0, 1, 2, 3].map((k) => {
          const a = (k / 4) * Math.PI * 2 + 0.6;
          return <line key={k} x1={214 + Math.cos(a) * 30} y1={SOL_Y - 16 + Math.sin(a) * 30} x2={214 + Math.cos(a) * (30 + clef * 36)} y2={SOL_Y - 16 + Math.sin(a) * (30 + clef * 36)} stroke="#F2C14E" strokeWidth={7} strokeLinecap="round" />;
        })
      : null}
  </g>
);

const Rue: React.FC<Decor> = ({ n, palette }) => {
  const visible = 1 - entre(n, N_SON - 1, N_SON + 2);
  if (visible <= 0) {
    return null;
  }
  const scroll = defilement(n);
  const fond = scroll * 0.45;
  const premier = Math.floor(fond / 340);
  const devant = Math.floor(scroll / PERIODE);
  return (
    <g opacity={visible}>
      {Array.from({ length: 6 }, (_, k) => {
        const i = premier + k;
        const x = i * 340 - fond + 700;
        const h = 200 + hachage(i, 1) * 240;
        const couleur = interpolateColors(hachage(i, 2), [0, 1], ["#E8B27C", "#D79A6B"]);
        return (
          <g key={i}>
            <rect x={x} y={SOL_Y - h} width={260} height={h} fill={couleur} />
            {[0, 1, 2].map((j) => (
              <rect key={j} x={x + 36 + j * 72} y={SOL_Y - h + 44} width={40} height={54} fill={palette.fond} />
            ))}
          </g>
        );
      })}
      {Array.from({ length: 5 }, (_, k) => {
        const i = devant + k;
        const x = i * PERIODE - scroll + 900;
        return hachage(i, 3) > 0.5 ? (
          <g key={i}>
            <rect x={x - 12} y={SOL_Y - 150} width={24} height={150} fill="#6E4A32" />
            <circle cx={x} cy={SOL_Y - 220} r={100} fill="#4F8A4C" />
            <circle cx={x + 50} cy={SOL_Y - 180} r={62} fill="#5E9C57" />
          </g>
        ) : (
          <g key={i}>
            <rect x={x - 7} y={SOL_Y - 340} width={14} height={340} fill="#3E3640" />
            <path d={`M${x} ${SOL_Y - 340} q0 -36 70 -36`} fill="none" stroke="#3E3640" strokeWidth={14} />
            <circle cx={x + 76} cy={SOL_Y - 362} r={24} fill="#FFF3D1" />
          </g>
        );
      })}
    </g>
  );
};

// Le sol s'arrondit, puis la Terre reste derrière et rapetisse
const Terre: React.FC<Decor> = ({ t, n }) => {
  const courbe = entre(n, N_SON + 1, N_LIB - 1);
  const depart = entre(n, N_LIB - 1.5, N_LIB + 3);
  const rayonSol = 40000 * Math.pow(760 / 40000, courbe);
  const rayonLoin = interpolate(n, [N_LIB + 3, N_MONDE + 1, N_LUNE + 1.5, N_MAX], [235, 170, 90, 44], borne);
  const r = interpolate(depart, [0, 1], [rayonSol, rayonLoin]);
  const cx = interpolate(depart, [0, 1], [540, 250]);
  const cy = interpolate(depart, [0, 1], [SOL_Y + rayonSol, 960]);
  const terre = interpolateColors(courbe, [0, 0.8], ["#4A4650", "#2A7FA8"]);
  const rotation = defilement(Math.min(n, N_LIB)) * 0.004 + n * 3;
  const ocean = entre(n, N_OCEAN - 0.6, N_OCEAN) * (1 - entre(n, N_OCEAN + 2.2, N_OCEAN + 3));
  const tour = entre(n, N_MONDE - 0.6, N_MONDE) * (1 - entre(n, N_MONDE + 2.2, N_MONDE + 2.8));
  const angleTour = (t % 1) * Math.PI * 2 - Math.PI / 2;
  const traceOcean = t % 1;
  return (
    <g>
      <defs>
        <clipPath id="terre">
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={r + 10 + courbe * 14} fill="#A9DDF0" opacity={courbe * 0.6} />
      <circle cx={cx} cy={cy} r={r} fill={terre} />
      <g clipPath="url(#terre)" opacity={entre(courbe, 0.35, 0.8)}>
        {Array.from({ length: 6 }, (_, k) => {
          const a = ((rotation + k * 60) * Math.PI) / 180;
          return (
            <ellipse
              key={k}
              cx={cx + Math.cos(a) * r * 0.7}
              cy={cy + Math.sin(a) * r * 0.7}
              rx={r * (0.2 + hachage(k, 4) * 0.2)}
              ry={r * (0.13 + hachage(k, 5) * 0.14)}
              fill="#5E9C57"
            />
          );
        })}
      </g>
      {courbe < 0.5 ? <rect x={0} y={SOL_Y} width={LARGEUR} height={22} fill="#B9A58C" opacity={1 - courbe * 2} /> : null}
      {ocean > 0 ? (
        <path
          d={`M${cx - r * 0.55} ${cy - r * 0.25} Q${cx} ${cy - r * 0.8} ${cx + r * 0.55} ${cy - r * 0.35}`}
          fill="none"
          stroke="#FFD24A"
          strokeWidth={13}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${traceOcean} 1`}
          opacity={ocean}
        />
      ) : null}
      {tour > 0 ? (
        <g opacity={tour}>
          <circle cx={cx} cy={cy} r={r + 26} fill="none" stroke="#FFD24A" strokeWidth={7} opacity={0.6} />
          <circle cx={cx + Math.cos(angleTour) * (r + 26)} cy={cy + Math.sin(angleTour) * (r + 26)} r={19} fill="#FFD24A" />
        </g>
      ) : null}
    </g>
  );
};

const Etoiles: React.FC<Decor> = ({ n }) => {
  const visible = entre(n, N_LIB - 3, N_LIB + 1);
  if (visible <= 0) {
    return null;
  }
  const etire = interpolate(n, [N_LIB, N_LUNE - 2, N_MAX], [0, 60, 900], borne);
  const glisse = n * 240 + Math.pow(entre(n, N_LIB, N_MAX), 3) * 90000;
  return (
    <g fill="#F4EFE6" opacity={visible}>
      {Array.from({ length: 34 }, (_, k) => {
        // Trois bandes : rien ne passe derrière le compteur ni la légende
        const h = hachage(k, 6);
        const y = h < 0.1 ? 60 + h * 1500 : h < 0.7 ? 520 + (h - 0.1) * 1100 : 1480 + (h - 0.7) * 1300;
        const x = ((hachage(k, 7) * 1400 - glisse * (0.4 + hachage(k, 8) * 0.6)) % 1400 + 1400) % 1400 - 160;
        return <rect key={k} x={x} y={y} width={8 + etire} height={6} rx={3} />;
      })}
    </g>
  );
};

const Guepard: React.FC<Decor> = ({ t, n }) => {
  const dessus = entre(n, N_GUEPARD - 3.4, N_GUEPARD - 1);
  const depasse = entre(n, N_GUEPARD - 0.8, N_GUEPARD + 0.8);
  if (dessus <= 0 || depasse >= 1) {
    return null;
  }
  const x = interpolate(dessus, [0, 1], [-300, 810]) - depasse * 1250;
  const foulee = Math.sin(t * 26) * 26;
  return (
    <g transform={`translate(${x} ${SOL_Y - 76})`}>
      <path d={`M-120 -30 Q-210 -60 -240 ${-14 + foulee * 0.4}`} fill="none" stroke="#D9A23B" strokeWidth={13} strokeLinecap="round" />
      <ellipse rx={130} ry={42} cy={-30} fill="#E0AE4A" />
      <circle cx={134} cy={-52} r={36} fill="#E0AE4A" />
      <path d="M116 -84 l-6 -26 l24 14 Z" fill="#E0AE4A" />
      <circle cx={146} cy={-58} r={6} fill="#2C1E2F" />
      <path d="M150 -46 q12 6 18 0" fill="none" stroke="#2C1E2F" strokeWidth={5} />
      {[-82, -36, 12, 58, 96].map((dx, k) => (
        <circle key={dx} cx={dx} cy={-34 + (k % 2) * 14} r={9} fill="#2C1E2F" />
      ))}
      {[[-90, 1], [-60, -1], [70, -1], [100, 1]].map(([dx, s]) => (
        <line key={dx} x1={dx} y1={0} x2={dx + foulee * s} y2={72} stroke="#D9A23B" strokeWidth={17} strokeLinecap="round" />
      ))}
    </g>
  );
};

const Train: React.FC<Decor> = ({ n }) => {
  const dessus = entre(n, N_TRAIN - 3, N_TRAIN - 0.8);
  const depasse = entre(n, N_TRAIN - 0.2, N_TRAIN + 2);
  if (dessus <= 0 || depasse >= 1) {
    return null;
  }
  const nez = interpolate(dessus, [0, 1], [-200, 930]) - depasse * 1350;
  const y = SOL_Y - 190;
  return (
    <g>
      <path d={`M${nez - 1500} ${y} L${nez - 170} ${y} Q${nez - 30} ${y + 16} ${nez} ${y + 170} L${nez - 1500} ${y + 170} Z`} fill="#F6F3EC" />
      <rect x={nez - 1500} y={y + 112} width={1490} height={22} fill="#B5301A" />
      {Array.from({ length: 13 }, (_, k) => (
        <rect key={k} x={nez - 1450 + k * 100} y={y + 36} width={70} height={52} fill="#2C3E50" />
      ))}
      <path d={`M${nez - 150} ${y + 28} L${nez - 72} ${y + 40} L${nez - 36} ${y + 88} L${nez - 150} ${y + 88} Z`} fill="#2C3E50" />
    </g>
  );
};

const Sonde: React.FC<Decor> = ({ n }) => {
  const part = entre(n, N_SONDE - 1.6, N_SONDE + 1.2);
  if (part <= 0 || part >= 1) {
    return null;
  }
  const x = interpolate(part, [0, 1], [1260, -260]);
  return (
    <g transform={`translate(${x} 700) rotate(-8)`}>
      <rect x={-46} y={-30} width={92} height={60} fill="#C8CDD3" />
      <path d="M46 -66 q40 66 0 132 Z" fill="#F6F3EC" />
      <rect x={-196} y={-14} width={150} height={28} fill="#2F4F7F" />
      <rect x={-46} y={-96} width={12} height={66} fill="#8C9299" />
      <rect x={-46} y={30} width={12} height={66} fill="#8C9299" />
    </g>
  );
};

const Lune: React.FC<Decor> = ({ n }) => {
  if (n <= N_LUNE - 1.6 || n >= N_LUNE + 1.4) {
    return null;
  }
  // Au palier, elle vient de passer : juste derrière le marcheur, au-dessus de la Terre
  const x = interpolate(n, [N_LUNE - 1.6, N_LUNE, N_LUNE + 1.4], [1320, 430, -320], borne);
  return (
    <g transform={`translate(${x} 700) scale(0.8)`}>
      <circle r={200} fill="#CFC9BD" />
      <circle cx={-70} cy={-60} r={40} fill="#ADA697" />
      <circle cx={64} cy={30} r={56} fill="#ADA697" />
      <circle cx={-40} cy={92} r={26} fill="#ADA697" />
      <circle cx={92} cy={-92} r={20} fill="#ADA697" />
    </g>
  );
};

const Marcheur: React.FC<Decor> = ({ t, n }) => {
  const espace = entre(n, N_LIB - 1.5, N_LIB + 3);
  const x = interpolate(espace, [0, 1], [440, 660]);
  const y = interpolate(espace, [0, 1], [SOL_Y, 900]);
  const echelle = interpolate(espace, [0, 1], [1, 0.8]);
  const beta = vitesse(n) / calcul.lumiere_ms;
  const contraction = Math.max(Math.sqrt(Math.max(1 - beta * beta, 0)), 0.3);
  const retourne = t >= calcul.t_clefs + 1.4 && partRetour(t) < 0.97;
  const penche = entre(n, 4, N_GUEPARD) * 15;
  const flou = entre(n, N_GUEPARD - 3, N_GUEPARD - 1);
  const phase = t < calcul.t_clefs ? Math.min(defilement(n) / 62, 600 + t * 40) : t * 42;
  const arret = t >= calcul.t_fin ? 1 : 0;
  const a = Math.sin(phase) * 0.62 * (1 - arret);
  const jambe = (angle: number) => <line x1={0} y1={-92} x2={Math.sin(angle) * 92} y2={-92 + Math.cos(angle) * 92} stroke="#2C3A52" strokeWidth={24} strokeLinecap="round" />;
  const bras = (angle: number) => <line x1={0} y1={-170} x2={Math.sin(angle) * 78} y2={-170 + Math.cos(angle) * 78} stroke="#E4A72E" strokeWidth={19} strokeLinecap="round" />;
  const echarpe = Math.sin(t * 16) * 12;
  return (
    <g transform={`translate(${x} ${y}) scale(${(retourne ? -1 : 1) * echelle * contraction} ${echelle})`}>
      <g transform={`rotate(${penche * (1 - arret)})`}>
        {flou > 0 ? (
          <g>
            <circle cy={-92} cx={0} r={84} fill="none" stroke="#2C3A52" strokeWidth={24} strokeDasharray="60 44" transform={`rotate(${t * 2200} 0 -92)`} opacity={flou} />
          </g>
        ) : null}
        {flou < 1 ? (
          <g opacity={1 - flou}>
            {jambe(a)}
            {jambe(-a)}
          </g>
        ) : null}
        {bras(-a * 0.9)}
        <rect x={-34} y={-200} width={68} height={118} rx={26} fill="#F2B53A" />
        {bras(a * 0.9)}
        <path d={`M-16 -196 L-108 ${-190 + echarpe} L-96 ${-168 + echarpe} L-14 -176 Z`} fill="#B5301A" />
        <circle cy={-240} r={42} fill="#F3CDA4" />
        <path d="M-42 -242 A42 42 0 0 1 42 -242 Z" fill="#B5301A" />
        <circle cx={18} cy={-236} r={5} fill="#2C1E2F" />
      </g>
    </g>
  );
};

const Mur: React.FC<Decor> = ({ n }) => {
  const age = n - N_SON;
  if (age < -0.3 || age > 3.2) {
    return null;
  }
  const part = entre(age, -0.3, 3.2);
  const x = 460;
  const y = SOL_Y - 130;
  return (
    <g fill="none" stroke="#FFFFFF" strokeLinecap="round">
      {[0, 0.2, 0.4].map((retard) => {
        const r = Math.max(part - retard, 0) * 1500;
        return r > 0 ? <circle key={retard} cx={x} cy={y} r={r} strokeWidth={12} opacity={1 - part} /> : null;
      })}
      <path d={`M${x + 90} ${y - 10} L${x - 440} ${y - 330} M${x + 90} ${y + 10} L${x - 440} ${y + 130}`} strokeWidth={14} opacity={0.9} />
      <ellipse cx={x + 10} cy={y} rx={70} ry={190} fill="#FFFFFF" stroke="none" opacity={0.85 * (1 - part)} />
    </g>
  );
};

const Feu: React.FC<Decor> = ({ t, n }) => {
  const force = entre(n, N_SON + 3, N_SON + 6) * (1 - entre(n, N_LIB, N_LIB + 2));
  if (force <= 0) {
    return null;
  }
  const y = interpolate(entre(n, N_LIB - 1.5, N_LIB + 3), [0, 1], [SOL_Y - 130, 790]);
  const x = interpolate(entre(n, N_LIB - 1.5, N_LIB + 3), [0, 1], [440, 660]);
  const l = 460 * force * (1 + Math.sin(t * 22) * 0.1);
  return (
    <g>
      <path d={`M${x + 60} ${y - 110} Q${x - l * 0.4} ${y - 150} ${x - l} ${y} Q${x - l * 0.4} ${y + 150} ${x + 60} ${y + 130} Z`} fill="#F2761B" />
      <path d={`M${x + 34} ${y - 66} Q${x - l * 0.25} ${y - 86} ${x - l * 0.6} ${y} Q${x - l * 0.25} ${y + 86} ${x + 34} ${y + 90} Z`} fill="#FFD84A" />
    </g>
  );
};

// La bulle : c'est là qu'il pense à ses clefs
const Bulle: React.FC<{ t: number }> = ({ t }) => {
  const entree = interpolate(t, [calcul.t_clefs + 0.1, calcul.t_clefs + 0.4], [0, 1], borne);
  const sortie = interpolate(t, [calcul.t_retour - 0.3, calcul.t_retour], [1, 0], borne);
  const s = entree * sortie;
  if (s <= 0) {
    return null;
  }
  return (
    <g transform={`translate(790 620) scale(${s})`}>
      <circle cx={-110} cy={120} r={16} fill="#F4EFE6" />
      <circle cx={-70} cy={90} r={24} fill="#F4EFE6" />
      <ellipse rx={170} ry={110} fill="#F4EFE6" />
      <g transform="rotate(-20)">
        <circle cx={-66} r={40} fill="none" stroke="#D69A1E" strokeWidth={22} />
        <rect x={-30} y={-11} width={136} height={22} fill="#D69A1E" />
        <rect x={72} y={8} width={16} height={28} fill="#D69A1E" />
        <rect x={40} y={8} width={16} height={22} fill="#D69A1E" />
      </g>
    </g>
  );
};

export const SceneWalk: React.FC<SceneProps> = ({ t }) => {
  const n = pasDecor(t);
  const d: Decor = { t, n, palette: paletteA(t) };
  const scroll = defilement(n);
  const clef = interpolate(t, [calcul.t_fin - 0.2, calcul.t_fin + 0.2, calcul.t_fin + 0.6], [0, 1, 0], borne);
  return (
    <AbsoluteFill>
      <svg width={LARGEUR} height={HAUTEUR} viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`} style={{ position: "absolute" }}>
        <Etoiles {...d} />
        <Rue {...d} />
        <Train {...d} />
        <Sonde {...d} />
        <Terre {...d} />
        <Lune {...d} />
        <Maison x={scroll > 1300 ? -2000 : 40 - scroll} clef={clef} />
        <Guepard {...d} />
        <Feu {...d} />
        <Mur {...d} />
        <Marcheur {...d} />
        <Bulle t={t} />
      </svg>
    </AbsoluteFill>
  );
};
