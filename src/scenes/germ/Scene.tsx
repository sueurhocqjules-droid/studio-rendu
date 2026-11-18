import type { ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, interpolateColors } from "remotion";
import calcul from "../../../sujets/germ.calcul.json";
import type { SceneProps } from "../../cadre/types";
import { entre, lisse, paletteA, pasCompteur } from "./temps";

// Une balance de pharmacien : les bactéries à gauche, la référence du palier à droite
const PX = 540;
const PY = 640;
const BRAS = 330;
const FIL = 230;
const VERT = "#4FB06D";
const VERT_FONCE = "#2D6E43";
const MORT = "#8F8A6E";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type Palier = (typeof calcul.paliers)[number];
const PALIERS: Palier[] = calcul.paliers;

// Doublements entre la bactérie de départ et une masse
const doublements = (kg: number) => Math.log2(kg / calcul.m0_kg);

// Chaque référence arrive sur le plateau 2,4 s après le palier précédent et repart 2,4 s après le sien
const entree = (i: number) => (i === 0 ? -10 : PALIERS[i - 1].arrivee_s + 2.4);
const sortie = (i: number) => (i === PALIERS.length - 1 ? calcul.t_qui - 0.5 : PALIERS[i].arrivee_s + 2.4);

// Positions des bâtonnets en tas : rangées de 8, 8, 7, 7… centrées, la première bactérie au milieu du bas
const RANGEES = [8, 8, 7, 7, 6, 6, 5, 5, 4, 4, 3, 2, 1];
const POSITIONS: { x: number; y: number; a: number }[] = [];
RANGEES.forEach((n, r) => {
  const rang = Array.from({ length: n }, (_, k) => k - (n - 1) / 2).sort((a, b) => Math.abs(a) - Math.abs(b) || a - b);
  rang.forEach((k, j) => POSITIONS.push({ x: k * 36, y: -9 - r * 15, a: (((r * 7 + j * 13) % 9) - 4) * 4 }));
});

const Baton = ({ x, y, a, s, couleur, opacite = 1 }: { x: number; y: number; a: number; s: number; couleur: string; opacite?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`} opacity={opacite}>
    <path d="M 17 0 q 8 -4 14 2 M 17 3 q 9 2 13 8" fill="none" stroke={VERT_FONCE} strokeWidth={1.6} />
    <rect x={-17} y={-7} width={34} height={14} rx={7} fill={couleur} stroke={VERT_FONCE} strokeWidth={2} />
    <rect x={-11} y={-3} width={14} height={3} rx={1.5} fill="#FFFFFF" opacity={0.35} />
  </g>
);

// Le tas posé sur le plateau gauche, origine au fond du plateau
const Tas = ({ c, couleur, rapetisse }: { c: number; couleur: string; rapetisse: number }) => {
  if (c < 6) {
    const n = Math.floor(c);
    const k = c - n;
    const avant = Math.pow(2, n);
    const total = k > 0.001 ? avant * 2 : avant;
    const s = interpolate(c, [0, 1, 6], [3, 2.4, 1], borne);
    return (
      <g>
        {Array.from({ length: total }, (_, j) => {
          const p = POSITIONS[j];
          if (j < avant) {
            return <Baton key={j} x={p.x * s} y={p.y * s} a={p.a} s={s} couleur={couleur} />;
          }
          const parent = POSITIONS[j - avant];
          const e = Easing.out(Easing.cubic)(k);
          return <Baton key={j} x={(parent.x + (p.x - parent.x) * e) * s} y={(parent.y + (p.y - parent.y) * e) * s} a={p.a} s={s} couleur={couleur} />;
        })}
      </g>
    );
  }
  // Au-delà de 64 : une butte qui monte doucement, tapissée de bâtonnets
  const h = (Math.min(300, 190 + 5 * (c - 6)) * (1 - rapetisse * 0.55));
  const l = 150 * (1 - rapetisse * 0.4);
  const butte = `M ${-l} 0 C ${-l} ${-h * 0.75} ${-l * 0.45} ${-h} 0 ${-h} C ${l * 0.45} ${-h} ${l} ${-h * 0.75} ${l} 0 Z`;
  const motif: ReactNode[] = [];
  for (let r = 0; r < 22; r++) {
    for (let k = 0; k < 10; k++) {
      const x = -162 + k * 36 + (r % 2) * 18;
      const y = -8 - r * 14;
      if (-y > h + 10) {
        continue;
      }
      motif.push(<Baton key={`${r}-${k}`} x={x} y={y} a={(((r * 5 + k * 11) % 9) - 4) * 6} s={1} couleur={couleur} />);
    }
  }
  return (
    <g>
      <clipPath id="germ-butte">
        <path d={butte} />
      </clipPath>
      <path d={butte} fill={VERT_FONCE} />
      <g clipPath="url(#germ-butte)">{motif}</g>
    </g>
  );
};

// Les références du plateau droit, origine au fond du plateau
const Reference = ({ cle }: { cle: string }) => {
  switch (cle) {
    case "globule":
      return (
        <g transform="translate(0 -70)">
          <ellipse cx={0} cy={0} rx={95} ry={66} fill="#C8323A" />
          <ellipse cx={0} cy={-4} rx={48} ry={30} fill="#E35A5E" />
          <ellipse cx={0} cy={58} rx={70} ry={8} fill="#000000" opacity={0.12} />
        </g>
      );
    case "cellule":
      return (
        <g transform="translate(0 -85)">
          <path d="M -110 10 C -120 -60 -40 -90 20 -80 C 90 -70 120 -20 105 30 C 90 80 10 90 -40 80 C -90 70 -105 50 -110 10 Z" fill="#F2B6A6" stroke="#C97C6C" strokeWidth={5} />
          <circle cx={10} cy={0} r={30} fill="#8A4F9E" />
          <circle cx={-50} cy={-30} r={8} fill="#C97C6C" />
          <circle cx={60} cy={40} r={6} fill="#C97C6C" />
        </g>
      );
    case "ovule":
      return (
        <g transform="translate(0 -110)">
          <circle cx={0} cy={0} r={108} fill="#FFF3C9" opacity={0.6} />
          <circle cx={0} cy={0} r={92} fill="#F7E3A0" stroke="#D9B85A" strokeWidth={8} />
          <circle cx={18} cy={-12} r={26} fill="#C99A3A" />
        </g>
      );
    case "sel":
      return (
        <g transform="translate(0 -6)">
          <polygon points="-60,0 20,0 20,-80 -60,-80" fill="#FFFFFF" stroke="#B9C2C9" strokeWidth={4} />
          <polygon points="-60,-80 -20,-120 60,-120 20,-80" fill="#EEF2F5" stroke="#B9C2C9" strokeWidth={4} />
          <polygon points="20,0 60,-40 60,-120 20,-80" fill="#D5DDE3" stroke="#B9C2C9" strokeWidth={4} />
        </g>
      );
    case "moustique":
      return (
        <g transform="translate(0 -70)" stroke="#2A2116" strokeLinecap="round">
          <path d="M -40 30 L -70 60 M -10 30 L -20 66 M 20 30 L 40 66 M 40 25 L 90 60" strokeWidth={5} fill="none" />
          <ellipse cx={-30} cy={-40} rx={22} ry={60} fill="#D6E6F2" opacity={0.8} strokeWidth={3} transform="rotate(-35 -30 -40)" />
          <ellipse cx={20} cy={-40} rx={22} ry={60} fill="#D6E6F2" opacity={0.8} strokeWidth={3} transform="rotate(30 20 -40)" />
          <ellipse cx={10} cy={10} rx={70} ry={16} fill="#5A4A3A" strokeWidth={0} />
          <circle cx={-68} cy={4} r={18} fill="#3A2E24" strokeWidth={0} />
          <path d="M -84 8 L -130 30" strokeWidth={4} fill="none" />
        </g>
      );
    case "trombone":
      return (
        <g transform="translate(0 -14) rotate(-8)">
          <path d="M -40 -10 L 90 -10 A 22 22 0 0 0 90 -54 L -70 -54 A 18 18 0 0 0 -70 -18 L 70 -18 A 14 14 0 0 0 70 -46 L -40 -46" fill="none" stroke="#8C979F" strokeWidth={8} strokeLinecap="round" />
        </g>
      );
    case "souris":
      return (
        <g>
          <path d="M 80 -20 C 140 -10 150 -70 120 -90" fill="none" stroke="#D49A9A" strokeWidth={6} strokeLinecap="round" />
          <ellipse cx={10} cy={-55} rx={85} ry={55} fill="#A7A39B" />
          <circle cx={-65} cy={-90} r={28} fill="#A7A39B" />
          <circle cx={-55} cy={-120} r={22} fill="#D9B3B0" stroke="#A7A39B" strokeWidth={6} />
          <circle cx={-95} cy={-90} r={5} fill="#1C1B17" />
          <circle cx={-118} cy={-80} r={6} fill="#D49A9A" />
        </g>
      );
    case "chat":
      return (
        <g fill="#E08A3C">
          <path d="M 70 -20 C 150 -20 150 -110 110 -130" fill="none" stroke="#E08A3C" strokeWidth={18} strokeLinecap="round" />
          <ellipse cx={0} cy={-80} rx={80} ry={80} />
          <circle cx={-10} cy={-180} r={58} />
          <polygon points="-62,-200 -50,-262 -18,-226" />
          <polygon points="42,-200 30,-262 -2,-226" />
          <circle cx={-32} cy={-185} r={7} fill="#1C1B17" />
          <circle cx={12} cy={-185} r={7} fill="#1C1B17" />
          <path d="M -40 -40 L -40 0 M 20 -40 L 20 0" stroke="#B9692A" strokeWidth={6} />
        </g>
      );
    case "toi":
      return (
        <g fill="#2A3A5A">
          <circle cx={0} cy={-250} r={48} />
          <rect x={-62} y={-190} width={124} height={130} rx={50} />
          <rect x={-50} y={-90} width={42} height={90} rx={20} />
          <rect x={8} y={-90} width={42} height={90} rx={20} />
        </g>
      );
    case "terre":
      return (
        <g transform="translate(0 -120)">
          <circle cx={0} cy={0} r={118} fill="#2F6FB0" />
          <path d="M -80 -60 C -40 -90 10 -70 0 -30 C -10 0 -60 10 -90 -10 Z M 20 20 C 60 0 100 30 80 70 C 60 100 20 80 20 20 Z" fill="#4E9A4A" />
          <ellipse cx={-30} cy={-95} rx={40} ry={10} fill="#F4F6FF" />
        </g>
      );
    default:
      return null;
  }
};

// Décors par monde, en fond : platine de microscope, paillasse, cuisine, salon
const Decor = ({ c, encre }: { c: number; encre: string }) => {
  const micro = 1 - entre(c, 17, 20);
  const banc = entre(c, 17, 20) * (1 - entre(c, 29, 32));
  const cuisine = entre(c, 29, 32) * (1 - entre(c, 48, 52));
  const salon = entre(c, 48, 52);
  return (
    <g>
      {micro > 0 && (
        <g opacity={micro}>
          <circle cx={540} cy={820} r={640} fill="#FFFFFF" opacity={0.35} />
          <circle cx={540} cy={820} r={640} fill="none" stroke={encre} strokeWidth={14} opacity={0.12} />
          {Array.from({ length: 9 }, (_, i) => (
            <circle key={i} cx={120 + ((i * 377) % 860)} cy={560 + ((i * 263) % 900)} r={30 + (i % 3) * 14} fill="none" stroke="#9BC9A8" strokeWidth={4} opacity={0.6} />
          ))}
        </g>
      )}
      {banc > 0 && (
        <g opacity={banc}>
          <rect x={0} y={1190} width={1080} height={730} fill="#B98A5A" />
          <rect x={0} y={1180} width={1080} height={20} fill="#8F6440" />
          <path d="M 860 1180 L 860 1000 L 840 1000 L 840 960 L 920 960 L 920 1000 L 900 1000 L 900 1180 Z" fill="#E3DBC9" />
          <path d="M 120 1180 L 170 1060 L 170 990 L 210 990 L 210 1060 L 260 1180 Z" fill="#E3DBC9" />
          <ellipse cx={540} cy={1260} rx={260} ry={34} fill="#D9D2C2" />
        </g>
      )}
      {cuisine > 0 && (
        <g opacity={cuisine}>
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`h${i}`} x1={0} x2={1080} y1={120 + i * 120} y2={120 + i * 120} stroke="#FFFFFF" strokeWidth={6} opacity={0.6} />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <line key={`v${i}`} x1={i * 120} x2={i * 120} y1={0} y2={1190} stroke="#FFFFFF" strokeWidth={6} opacity={0.6} />
          ))}
          <rect x={0} y={1190} width={1080} height={730} fill="#5A6B7A" />
          <rect x={0} y={1180} width={1080} height={24} fill="#3E4A55" />
        </g>
      )}
      {salon > 0 && (
        <g opacity={salon}>
          <rect x={0} y={1190} width={1080} height={730} fill="#7A5A3A" />
          <rect x={-40} y={980} width={260} height={210} rx={40} fill="#3F7A4A" />
          <rect x={860} y={980} width={260} height={210} rx={40} fill="#3F7A4A" />
          <rect x={900} y={560} width={12} height={420} fill="#4A3A2A" />
          <path d="M 850 560 L 962 560 L 930 480 L 882 480 Z" fill="#F7E9B0" />
        </g>
      )}
    </g>
  );
};

const Balance = ({ angle, gauche, droite }: { angle: number; gauche: ReactNode; droite: ReactNode }) => {
  const a = (angle * Math.PI) / 180;
  const gx = PX - BRAS * Math.cos(a);
  const gy = PY - BRAS * Math.sin(a);
  const dx = PX + BRAS * Math.cos(a);
  const dy = PY + BRAS * Math.sin(a);
  const plateau = (x: number, y: number, contenu: ReactNode) => (
    <g>
      <path d={`M ${x} ${y} L ${x - 150} ${y + FIL} M ${x} ${y} L ${x + 150} ${y + FIL}`} stroke="#5A5246" strokeWidth={4} />
      <g transform={`translate(${x} ${y + FIL})`}>{contenu}</g>
      <path d={`M ${x - 165} ${y + FIL} Q ${x} ${y + FIL + 70} ${x + 165} ${y + FIL} Z`} fill="#C9A24A" stroke="#8F6E26" strokeWidth={5} />
      <circle cx={x} cy={y} r={10} fill="#8F6E26" />
    </g>
  );
  return (
    <g>
      <rect x={PX - 14} y={PY} width={28} height={560} fill="#8F6E26" />
      <path d={`M ${PX - 140} 1200 L ${PX + 140} 1200 L ${PX + 90} 1150 L ${PX - 90} 1150 Z`} fill="#8F6E26" />
      <g transform={`rotate(${angle} ${PX} ${PY})`}>
        <rect x={PX - BRAS - 10} y={PY - 9} width={2 * BRAS + 20} height={18} rx={9} fill="#C9A24A" stroke="#8F6E26" strokeWidth={4} />
      </g>
      <polygon points={`${PX},${PY - 50} ${PX - 26},${PY + 6} ${PX + 26},${PY + 6}`} fill="#8F6E26" />
      <rect x={PX - 4} y={PY - 130} width={8} height={90} fill="#2A2116" transform={`rotate(${angle} ${PX} ${PY})`} />
      {plateau(gx, gy, gauche)}
      {plateau(dx, dy, droite)}
    </g>
  );
};

// Inclinaison en degrés : positive quand la droite est plus lourde
const inclinaison = (ecart: number) => 16 * Math.tanh(ecart / 2);

export const SceneGerm = ({ t }: SceneProps) => {
  const palette = paletteA(t);
  const c = pasCompteur(t);
  // Après le retour, la balance retrouve exactement son état de départ (boucle)
  const tb = t >= calcul.t_retour ? 0 : t;

  // La référence présente sur le plateau droit, son arrivée et son départ
  const droite: ReactNode[] = [];
  let ecart = -6;
  let presence = 0;
  if (tb < calcul.t_qui) {
    PALIERS.forEach((p, i) => {
      const de = entree(i);
      const a = sortie(i);
      if (tb < de || tb > a + 0.7) {
        return;
      }
      const chute = interpolate(tb, [de, de + 0.45], [-900, 0], { ...borne, easing: Easing.in(Easing.quad) });
      const envol = entre(tb, a, a + 0.7);
      const pres = entre(tb, de + 0.35, de + 0.6) * (1 - entre(tb, a, a + 0.2));
      if (pres > presence) {
        presence = pres;
        ecart = doublements(p.kg) - c;
      }
      droite.push(
        <g key={p.cle} transform={`translate(${envol * 700} ${chute - envol * 260}) rotate(${envol * 70})`}>
          <Reference cle={p.cle} />
        </g>,
      );
    });
  }
  // La Terre, au vrai rythme, puis elle s'en va quand la nourriture manque
  if (t >= calcul.t_qui && t < calcul.t_point) {
    const de = calcul.t_qui;
    const a = calcul.t_patte + 1.4;
    const chute = interpolate(t, [de, de + 0.5], [-900, 0], { ...borne, easing: Easing.in(Easing.quad) });
    const envol = entre(t, a, a + 0.8);
    droite.push(
      <g key="terre" transform={`translate(${envol * 700} ${chute - envol * 200})`}>
        <Reference cle="terre" />
      </g>,
    );
    presence = entre(t, de + 0.4, de + 0.6) * (1 - entre(t, a, a + 0.2));
    ecart = -3;
  }
  const angle = inclinaison(ecart) * presence + inclinaison(-6) * (1 - presence);

  const faim = t >= calcul.t_retour ? 0 : entre(t, calcul.t_patte, calcul.t_patte + 2);
  const couleur = interpolateColors(faim, [0, 1], [VERT, MORT]);
  const cTas = t >= calcul.t_coupe && t < calcul.t_retour ? calcul.n_max : c;

  // Une vraie colonie sur sa boîte de Petri, puis on replonge dans le point jusqu'à la première bactérie
  const petri = entre(t, calcul.t_point, calcul.t_point + 0.5) * (1 - entre(t, calcul.t_retour + 0.6, calcul.t_retour + 0.9));
  const plonge = lisse(entre(t, calcul.t_retour, calcul.t_retour + 0.8));
  const balance = 1 - entre(t, calcul.t_point, calcul.t_point + 0.4) + entre(t, calcul.t_retour + 0.6, calcul.t_retour + 0.9);
  const horloge = entre(t, calcul.t_coupe, calcul.t_coupe + 0.4) * (1 - entre(t, calcul.t_qui, calcul.t_qui + 0.4));

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        {(t < calcul.t_qui || t >= calcul.t_retour + 0.6) && <Decor c={cTas} encre={palette.encre} />}
        {t >= calcul.t_qui && t < calcul.t_patte + 1 &&
          Array.from({ length: 36 }, (_, i) => (
            <circle key={i} cx={(i * 263) % 1080} cy={520 + ((i * 397) % 1300)} r={2 + (i % 3)} fill="#F2F7EC" opacity={0.7 * (1 - entre(t, calcul.t_patte, calcul.t_patte + 1))} />
          ))}

        {horloge > 0 && (
          <g opacity={horloge} transform="translate(540 760)">
            <circle r={300} fill="#FFFFFF" opacity={0.5} />
            <circle r={300} fill="none" stroke={palette.encre} strokeWidth={10} opacity={0.4} />
            {Array.from({ length: 12 }, (_, i) => (
              <rect key={i} x={-5} y={-290} width={10} height={36} fill={palette.encre} opacity={0.4} transform={`rotate(${i * 30})`} />
            ))}
            <rect x={-6} y={-240} width={12} height={240} fill={palette.encre} opacity={0.5} transform={`rotate(${(t - calcul.t_coupe) * 1440})`} />
            <rect x={-8} y={-160} width={16} height={160} fill={palette.encre} opacity={0.5} transform={`rotate(${(t - calcul.t_coupe) * 120})`} />
          </g>
        )}

        {balance > 0 && (
          <g opacity={Math.min(1, balance)}>
            <Balance angle={angle} gauche={<Tas c={cTas} couleur={couleur} rapetisse={faim} />} droite={droite} />
          </g>
        )}

        {petri > 0 && (
          <g opacity={petri}>
            <circle cx={540} cy={880} r={340} fill="#E9EEF0" opacity={0.5} />
            <circle cx={540} cy={880} r={320} fill="#E8C46A" />
            <circle cx={540} cy={880} r={320} fill="none" stroke="#F4EAD0" strokeWidth={14} opacity={0.8} />
            <ellipse cx={440} cy={760} rx={120} ry={40} fill="#FFFFFF" opacity={0.18} transform="rotate(-35 440 760)" />
            <circle cx={600} cy={880} r={26 + plonge * 1800} fill={interpolateColors(plonge, [0, 1], ["#F7F1DC", "#DDEFE2"])} />
            <circle cx={600} cy={880} r={26 + plonge * 1800} fill="none" stroke="#C9B98A" strokeWidth={4} opacity={1 - plonge} />
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
