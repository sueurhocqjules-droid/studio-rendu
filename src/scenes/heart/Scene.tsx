import type { FC, ReactNode } from "react";
import { AbsoluteFill, interpolate, interpolateColors } from "remotion";
import calcul from "../../../sujets/heart.calcul.json";
import type { SceneProps } from "../../cadre/types";
import { entre, hzAffiche, hzContinu, indexPalier, lisse, paletteA, partSalle, pasA, psiA } from "./temps";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const ROUGE_COEUR = "#D7263D";
const CREME = "#FFF3E8";
const CLAVIER_BAS = 1172;
const ECG_HAUT = 1506;
const ECG_BAS = 1796;
const ECG_GAUCHE = 70;
const ECG_DROITE = 1010;

const COEUR = "M 0 88 C -34 58 -100 14 -100 -32 C -100 -70 -72 -94 -44 -94 C -22 -94 -8 -80 0 -62 C 8 -80 22 -94 44 -94 C 72 -94 100 -70 100 -32 C 100 14 34 58 0 88 Z";

const CLES = calcul.paliers.map((p) => p.cle);
const LA = CLES.length;

// ---------- Rythme : battements calculés, puis flou au-delà de 3 par seconde ----------

const pulsation = (t: number) => {
  const f = hzAffiche(t);
  const amplitude = 1 - entre(f, 2, calcul.pulse_max_hz);
  if (amplitude <= 0) {
    return 0;
  }
  const battements = calcul.battements;
  let i = -1;
  for (let k = 0; k < battements.length && battements[k] <= t + 1e-6; k++) {
    i = k;
  }
  if (i < 0) {
    return 0;
  }
  const periode = i + 1 < battements.length ? battements[i + 1] - battements[i] : 1 / f;
  const u = (t - battements[i]) / Math.min(periode, 1.2 / f);
  const lub = Math.exp(-u * 9);
  const dub = 0.55 * Math.exp(-Math.pow((u - 0.3) / 0.07, 2));
  return amplitude * Math.min(lub + dub, 1);
};

// ---------- Le cœur ----------

const Coeur: FC<{ t: number; x: number; y: number; s: number; trait?: string }> = ({ t, x, y, s, trait = CREME }) => {
  const f = hzContinu(t);
  const battement = pulsation(t);
  const flou = entre(f, 2.5, 4.5);
  const ampleur = (3 + 4 * entre(f, 20, calcul.la_hz)) * flou * Math.max(s, 0.6);
  const dx = ampleur * Math.sin(t * 2 * Math.PI * 11.3);
  const dy = ampleur * 0.6 * Math.sin(t * 2 * Math.PI * 7.7 + 1);
  const echelle = s * (1 + 0.12 * battement);
  return (
    <g transform={`translate(${x + dx} ${y + dy})`}>
      {flou > 0 && (
        <g transform={`scale(${s * 1.1})`} filter="url(#flou-coeur)" opacity={0.55 * flou}>
          <path d={COEUR} fill={ROUGE_COEUR} />
        </g>
      )}
      <g transform={`scale(${echelle})`}>
        <path d={COEUR} fill={ROUGE_COEUR} stroke={trait} strokeWidth={9 / Math.max(s, 0.4)} strokeLinejoin="round" />
        <ellipse cx={-50} cy={-52} rx={20} ry={12} fill={CREME} opacity={0.55} transform="rotate(-38 -50 -52)" />
      </g>
    </g>
  );
};

// Anneaux sonores : ils s'éloignent lentement, sans jamais clignoter
const Anneaux: FC<{ t: number; x: number; y: number; couleur: string }> = ({ t, x, y, couleur }) => (
  <g>
    {[0, 1, 2, 3].map((k) => {
      const r = 230 + ((k * 95 + t * 60) % 380);
      const opacite = 0.35 * (1 - (r - 230) / 380);
      return <circle key={k} cx={x} cy={y} r={r} fill="none" stroke={couleur} strokeWidth={14} opacity={opacite} />;
    })}
  </g>
);

// ---------- Décors des paliers ----------

const Piste: FC<{ t: number }> = ({ t }) => {
  const haut = 960;
  const fuite = { x: 540, y: 640 };
  const bords = [-420, -40, 290, 540, 790, 1120, 1500];
  const surHaut = (x: number) => fuite.x + (x - fuite.x) * ((haut - fuite.y) / (CLAVIER_BAS - fuite.y));
  return (
    <g>
      <polygon points={`${surHaut(-420)},${haut} ${surHaut(1500)},${haut} 1500,${CLAVIER_BAS} -420,${CLAVIER_BAS}`} fill="#C4553A" />
      <rect x={0} y={haut - 14} width={1080} height={14} fill="#5E8C4A" />
      {bords.map((x) => (
        <line key={x} x1={surHaut(x)} y1={haut} x2={x} y2={CLAVIER_BAS} stroke={CREME} strokeWidth={6} />
      ))}
      {[0, 1, 2, 3].map((k) => {
        const avance = (t * 1.6 + k / 4) % 1;
        const y = haut + (CLAVIER_BAS - haut) * avance * avance;
        const part = (y - fuite.y) / (CLAVIER_BAS - fuite.y);
        return <rect key={k} x={fuite.x - 1000 * part} y={y} width={2000 * part} height={4 + 8 * avance} fill={CREME} opacity={0.5} />;
      })}
      {[0, 1, 2].map((k) => {
        const x = 1080 - (((t * 900 + k * 420) % 1400) - 160);
        return <rect key={k} x={x} y={560 + k * 150} width={170} height={16} rx={8} fill="#A30F27" opacity={0.25} />;
      })}
    </g>
  );
};

const Souris = () => (
  <g>
    <path d="M 250 880 C 140 900 90 820 120 720 C 140 660 110 600 70 580" fill="none" stroke="#E8A9B4" strokeWidth={14} strokeLinecap="round" />
    <ellipse cx={480} cy={810} rx={270} ry={160} fill="#A99DA2" />
    <ellipse cx={720} cy={730} rx={70} ry={78} fill="#A99DA2" />
    <ellipse cx={720} cy={730} rx={42} ry={50} fill="#F2A7B3" />
    <path d="M 640 760 C 700 700 820 700 900 790 C 860 840 720 870 640 850 Z" fill="#A99DA2" />
    <circle cx={800} cy={770} r={13} fill="#24080F" />
    <circle cx={902} cy={790} r={15} fill="#E07A8C" />
    <ellipse cx={380} cy={962} rx={50} ry={16} fill="#8D8086" />
    <ellipse cx={610} cy={962} rx={50} ry={16} fill="#8D8086" />
  </g>
);

const Musaraigne = () => (
  <g>
    <path d="M 250 860 C 180 880 140 860 110 830" fill="none" stroke="#5A3F31" strokeWidth={12} strokeLinecap="round" />
    <ellipse cx={460} cy={830} rx={230} ry={125} fill="#7A5A47" />
    <path d="M 600 760 C 700 740 850 790 980 850 C 860 880 700 900 600 880 Z" fill="#7A5A47" />
    <circle cx={640} cy={745} r={30} fill="#5A3F31" />
    <circle cx={740} cy={800} r={9} fill="#120508" />
    <circle cx={980} cy={850} r={11} fill="#3A2318" />
    <ellipse cx={370} cy={950} rx={44} ry={14} fill="#5A3F31" />
    <ellipse cx={580} cy={950} rx={44} ry={14} fill="#5A3F31" />
  </g>
);

const Colibri = () => (
  <g transform="translate(520 760) scale(1.3) translate(-520 -760)">
    <g filter="url(#flou-aile)" opacity={0.5}>
      <path d="M 560 760 L 360 540 L 520 520 Z" fill={CREME} />
      <path d="M 590 760 L 760 520 L 860 600 Z" fill={CREME} />
    </g>
    <path d="M 120 690 C 150 640 230 640 250 700 C 230 760 150 760 120 690 Z" fill="#F07C9B" />
    <circle cx={190} cy={700} r={22} fill="#FFD9B8" />
    <line x1={240} y1={736} x2={470} y2={770} stroke="#FFD9B8" strokeWidth={10} strokeLinecap="round" />
    <circle cx={510} cy={770} r={62} fill="#2F8F5B" />
    <ellipse cx={600} cy={850} rx={120} ry={80} fill="#2F8F5B" transform="rotate(30 600 850)" />
    <path d="M 690 900 L 820 1000 L 760 920 L 830 950 Z" fill="#1F6B43" />
    <circle cx={495} cy={755} r={9} fill="#120508" />
  </g>
);

const Bourdon = () => (
  <g>
    <g filter="url(#flou-aile)" opacity={0.6}>
      <ellipse cx={460} cy={630} rx={130} ry={60} fill={CREME} transform="rotate(-30 460 630)" />
      <ellipse cx={650} cy={620} rx={130} ry={60} fill={CREME} transform="rotate(25 650 620)" />
    </g>
    <path d="M 770 810 L 880 832 L 770 856 Z" fill="#F2B705" />
    <clipPath id="corps-bourdon">
      <ellipse cx={560} cy={830} rx={230} ry={160} />
    </clipPath>
    <ellipse cx={560} cy={830} rx={230} ry={160} fill="#F2B705" />
    <g clipPath="url(#corps-bourdon)" fill="#24080F">
      <rect x={430} y={660} width={60} height={340} />
      <rect x={560} y={660} width={60} height={340} />
      <rect x={690} y={660} width={60} height={340} />
    </g>
    <ellipse cx={560} cy={830} rx={230} ry={160} fill="none" stroke={CREME} strokeWidth={8} />
    <circle cx={310} cy={840} r={105} fill="#24080F" stroke={CREME} strokeWidth={8} />
    <circle cx={260} cy={815} r={16} fill={CREME} />
    <path d="M 260 745 C 230 690 200 660 160 650 M 300 738 C 290 680 280 650 250 620" fill="none" stroke="#F2B705" strokeWidth={10} strokeLinecap="round" />
  </g>
);

// Salle de concert : un arc de pupitres et d'instruments tournés vers le cœur
const Orchestre: FC<{ t: number }> = ({ t }) => (
  <g>
    <polygon points="440,480 640,480 1000,1180 80,1180" fill={CREME} opacity={0.08} />
    {Array.from({ length: 6 }, (_, k) => {
      const angle = Math.PI * (k < 3 ? 0.04 + 0.13 * k : 0.7 + 0.13 * (k - 3));
      const x = 540 - 410 * Math.cos(angle);
      const y = 800 - 290 * Math.sin(angle);
      const gros = k === 0 || k === 5;
      return (
        <g key={k} transform={`translate(${x} ${y}) rotate(${(x - 540) * 0.03}) scale(${gros ? 2.2 : 1.7})`}>
          <ellipse cx={0} cy={22} rx={22} ry={26} fill="#C98A3E" />
          <ellipse cx={0} cy={-12} rx={17} ry={20} fill="#C98A3E" />
          <rect x={-4} y={-70} width={8} height={60} fill="#3A2216" />
          <rect x={-9} y={-82} width={18} height={14} rx={4} fill="#3A2216" />
        </g>
      );
    })}
    <g transform={`translate(540 ${515 + 6 * Math.sin(t * 2 * Math.PI * 0.5)})`}>
      <path d="M -26 -60 L -26 0 C -26 24 26 24 26 0 L 26 -60" fill="none" stroke="#F2C14E" strokeWidth={12} strokeLinecap="round" />
      <rect x={-6} y={14} width={12} height={46} rx={6} fill="#F2C14E" />
    </g>
  </g>
);

const decor = (index: number, t: number, couleurAnneaux: string): ReactNode => {
  if (index === LA) {
    return (
      <>
        <Orchestre t={t} />
        <Anneaux t={t} x={540} y={720} couleur="#F2C14E" />
      </>
    );
  }
  switch (CLES[index]) {
    case "course":
      return <Piste t={t} />;
    case "souris":
      return <Souris />;
    case "audible":
      return <Anneaux t={t} x={540} y={780} couleur={couleurAnneaux} />;
    case "musaraigne":
      return <Musaraigne />;
    case "colibri":
      return <Colibri />;
    case "bourdon":
      return <Bourdon />;
    case "do":
      return <rect x={50} y={830} width={980} height={360} rx={26} fill="#1A0B0E" />;
    default:
      return null;
  }
};

// Où se tient le cœur dans chaque décor : seul au centre, ou petit, dans la poitrine de l'animal
const PLACES: Record<string, [number, number, number]> = {
  depart: [540, 800, 2.3],
  course: [540, 740, 2.0],
  souris: [640, 820, 0.55],
  audible: [540, 780, 1.9],
  musaraigne: [560, 830, 0.5],
  colibri: [618, 872, 0.5],
  bourdon: [560, 800, 0.6],
  do: [540, 640, 1.5],
  la: [540, 720, 1.5],
};
const place = (index: number) => PLACES[index < 0 ? "depart" : index === LA ? "la" : CLES[index]];

// Quel décor quitte la scène, lequel arrive, et où en est le fondu
const transition = (t: number) => {
  if (t >= calcul.t_fin) {
    return { de: -1, a: -1, p: 1 };
  }
  if (t >= calcul.t_retour) {
    const pas = pasA(t);
    const a = indexPalier(t);
    const de = a + 1;
    const pasDe = de === LA ? calcul.n_la : calcul.paliers[de].pas;
    return { de, a, p: 1 - entre(pas, pasDe - 0.8, pasDe) };
  }
  if (t >= calcul.t_limite) {
    return { de: LA - 1, a: LA, p: entre(t, calcul.t_limite, calcul.t_limite + 0.45) };
  }
  const a = indexPalier(t);
  return { de: a - 1, a, p: a < 0 ? 1 : entre(t, calcul.paliers[a].arrivee_s, calcul.paliers[a].arrivee_s + 0.45) };
};

// ---------- Clavier : la touche jouée par le cœur s'allume ----------

const CENTRES = [0.5, 1, 1.5, 2.5, 3, 3.5, 4, 4.5, 5.5, 6, 6.5, 7];
const NOIRES = [1, 4, 6, 9, 11];
const position = (touche: number) => {
  const m = (((touche - 1) % 12) + 12) % 12;
  return Math.floor((touche - 1) / 12) * 7 + CENTRES[m];
};
const toucheDe = (hz: number) => 12 * Math.log2(hz / calcul.la_hz) + calcul.touche_la;

const Clavier: FC<{ t: number; grand: number; allume: string }> = ({ t, grand, allume }) => {
  const largeur = interpolate(grand, [0, 1], [62, 84]);
  const hauteur = interpolate(grand, [0, 1], [168, 300]);
  const haut = CLAVIER_BAS - hauteur;
  const continue_ = toucheDe(hzContinu(t));
  const jouee = Math.round(toucheDe(hzAffiche(t)));
  const demi = 470 / largeur;
  const bas = Math.floor(continue_);
  const pos = continue_ < 1 ? position(1) : position(bas) + (position(bas + 1) - position(bas)) * (continue_ - bas);
  const centre = Math.min(Math.max(pos, demi), 52 - demi);
  const xDe = (u: number) => 540 + (u - centre) * largeur;
  const touches = Array.from({ length: 88 }, (_, k) => k + 1);
  return (
    <g>
      <clipPath id="fenetre-clavier">
        <rect x={70} y={haut - 10} width={940} height={hauteur + 20} />
      </clipPath>
      <g clipPath="url(#fenetre-clavier)">
        {touches
          .filter((k) => !NOIRES.includes((k - 1) % 12))
          .map((k) => {
            const x = xDe(position(k) - 0.5);
            return x > -100 && x < 1180 ? (
              <rect key={k} x={x + 2} y={haut} width={largeur - 4} height={hauteur} rx={8} fill={k === jouee ? allume : "#FFF8EE"} />
            ) : null;
          })}
        {touches
          .filter((k) => NOIRES.includes((k - 1) % 12))
          .map((k) => {
            const x = xDe(position(k)) - largeur * 0.3;
            return x > -100 && x < 1180 ? (
              <rect key={k} x={x} y={haut} width={largeur * 0.6} height={hauteur * 0.62} rx={6} fill={k === jouee ? allume : "#1A0B0E"} />
            ) : null;
          })}
      </g>
    </g>
  );
};

// ---------- Électrocardiogramme, qui devient une sinusoïde ----------

const forme = (phi: number) => {
  const u = phi + 0.3 - Math.floor(phi + 0.3);
  const bosse = (centre: number, largeur: number, hauteur: number) => hauteur * Math.exp(-Math.pow((u - centre) / largeur, 2));
  return bosse(0.12, 0.035, 0.12) + bosse(0.27, 0.012, -0.12) + bosse(0.3, 0.014, 1) + bosse(0.33, 0.014, -0.28) + bosse(0.55, 0.06, 0.25);
};

const Ecg: FC<{ t: number; encre: string; trace: string }> = ({ t, encre, trace }) => {
  const f = hzContinu(t);
  const psi = psiA(t);
  const cycles =
    f <= calcul.pulse_max_hz
      ? 3
      : f <= calcul.audible_hz
        ? 3 * Math.pow(f / calcul.pulse_max_hz, 0.6)
        : interpolate(Math.log(f), [Math.log(calcul.audible_hz), Math.log(2 * calcul.audible_hz)], [3 * Math.pow(calcul.audible_hz / calcul.pulse_max_hz, 0.6), 6], borne);
  const sinus = entre(f, 8, calcul.audible_hz);
  const milieu = (ECG_HAUT + ECG_BAS) / 2 + 30;
  const N = 1200;
  const points: string[] = [];
  for (let i = 0; i <= N; i++) {
    const s = i / N;
    const phi = psi - (1 - s) * cycles;
    const v = (1 - sinus) * forme(phi) + sinus * 0.75 * Math.sin(2 * Math.PI * phi);
    points.push(`${(ECG_GAUCHE + s * (ECG_DROITE - ECG_GAUCHE)).toFixed(1)},${(milieu - 120 * v).toFixed(1)}`);
  }
  const yFin = milieu - 120 * ((1 - sinus) * forme(psi) + sinus * 0.75 * Math.sin(2 * Math.PI * psi));
  return (
    <g>
      <rect x={40} y={ECG_HAUT} width={1000} height={ECG_BAS - ECG_HAUT} rx={28} fill={encre} opacity={0.07} />
      {Array.from({ length: 12 }, (_, k) => (
        <line key={`v${k}`} x1={ECG_GAUCHE + k * 85.5} y1={ECG_HAUT + 16} x2={ECG_GAUCHE + k * 85.5} y2={ECG_BAS - 16} stroke={encre} strokeWidth={2} opacity={0.1} />
      ))}
      {[1, 2, 3].map((k) => (
        <line key={`h${k}`} x1={ECG_GAUCHE} y1={ECG_HAUT + (k * (ECG_BAS - ECG_HAUT)) / 4} x2={ECG_DROITE} y2={ECG_HAUT + (k * (ECG_BAS - ECG_HAUT)) / 4} stroke={encre} strokeWidth={2} opacity={0.1} />
      ))}
      <polyline points={points.join(" ")} fill="none" stroke={trace} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={ECG_DROITE} cy={yFin} r={14} fill={trace} />
    </g>
  );
};

// ---------- Scène ----------

export const SceneHeart = ({ t }: SceneProps) => {
  const palette = paletteA(t);
  const { de, a, p } = transition(t);
  const q = lisse(p);
  const [x0, y0, s0] = place(de);
  const [x1, y1, s1] = place(a);
  const pas = pasA(t);
  const nAudible = calcul.paliers[CLES.indexOf("audible")].pas;
  const clavier = entre(pas, nAudible - 0.6, nAudible);
  const poids = (index: number) => (a === index ? q : 0) + (de === index ? 1 - q : 0);
  const grand = poids(CLES.indexOf("do")) + poids(LA);
  const allume = interpolateColors(partSalle(t), [0, 1], ["#FF4D63", "#F2C14E"]);

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <defs>
          <filter id="flou-coeur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={14} />
          </filter>
          <filter id="flou-aile" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={10} />
          </filter>
        </defs>

        {de !== a && de >= 0 && 1 - q > 0 && <g opacity={1 - q}>{decor(de, t, palette.accent)}</g>}
        {a >= 0 && <g opacity={de === a ? 1 : q}>{decor(a, t, palette.accent)}</g>}

        {clavier > 0 && (
          <g opacity={clavier} transform={`translate(0 ${(1 - clavier) * 220})`}>
            <Clavier t={t} grand={grand} allume={allume} />
          </g>
        )}

        <Coeur t={t} x={x0 + (x1 - x0) * q} y={y0 + (y1 - y0) * q} s={s0 + (s1 - s0) * q} />

        <Ecg t={t} encre={palette.encre} trace={palette.accent} />
      </svg>
    </AbsoluteFill>
  );
};
