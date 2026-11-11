import type { FC, ReactElement } from "react";
import { AbsoluteFill, interpolateColors } from "remotion";
import calcul from "../../../sujets/snowball.calcul.json";
import type { SceneProps } from "../../cadre/types";
import { diametreA, entre, lisse, nudite, paletteCadre, pasDecor } from "./temps";

// Pente de 17 degrés qui descend vers la droite ; la boule reste au même endroit, la caméra recule
const PENTE = (17 * Math.PI) / 180;
const SIN = Math.sin(PENTE);
const COS = Math.cos(PENTE);
const TAN = Math.tan(PENTE);
const CENTRE_X = 320;
const CENTRE_Y = 860;
const BOULE_PX = 190;
// La boule grossit un peu à l'écran (racine faible), le monde rétrécit beaucoup
const GROSSIT = 0.14;
// Distance parcourue sur la pente, en diamètres de boule
const COURSE = 14;

const NEIGE = "#F4F8FA";
const TERRE = "#7A5C43";

const alea = (i: number) => {
  const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453;
  return x - Math.floor(x);
};

type Vue = { z: number; s: number; R: number; px: number; py: number };

const vueA = (t: number): Vue & { angle: number; D: number } => {
  const p = pasDecor(t);
  const D = diametreA(p);
  const recul =
    t < calcul.t_retour
      ? 1 - 0.55 * lisse(entre(t, calcul.t_limite + 0.2, calcul.t_qui))
      : 0.45 + 0.55 * lisse(entre(t, calcul.t_retour, calcul.t_fin));
  // Après le dernier palier, la boule finit sa course dans la vallée ; au retour, elle remonte
  const elan = t < calcul.t_retour ? lisse(entre(t, calcul.t_limite, calcul.t_coupe + 1)) : 1 - lisse(entre(t, calcul.t_retour, calcul.t_fin));
  const B = BOULE_PX * Math.pow(D / calcul.d0_m, GROSSIT) * recul;
  const z = B / D;
  const R = B / 2;
  const s = D * (COURSE + 2 * elan);
  const angle = 2 * COURSE * Math.log(D / calcul.d0_m) + 4 * elan;
  return { z, s, R, D, angle, px: CENTRE_X - R * SIN, py: CENTRE_Y + R * COS };
};

const ecran = (v: Vue, metres: number) => {
  const d = (metres - v.s) * v.z;
  return { x: v.px + d * COS, y: v.py + d * SIN };
};

const solY = (v: Vue, x: number) => v.py + (x - v.px) * TAN;

// ---------- Les références, dessinées dans une boîte dont la plus grande dimension vaut 200 ----------

const Bowling = () => (
  <g>
    <circle cx={0} cy={-100} r={100} fill="#2B3A67" />
    <circle cx={-34} cy={-136} r={22} fill="#4A5C94" opacity={0.6} />
    {[
      [-14, -158],
      [16, -160],
      [2, -128],
    ].map(([x, y]) => (
      <circle key={x} cx={x} cy={y} r={11} fill="#10162B" />
    ))}
  </g>
);

// Pictogramme de panneau, pas une personne
const Humain = () => (
  <g stroke="#2E3440" strokeLinecap="round" fill="none">
    <circle cx={0} cy={-182} r={17} fill="#2E3440" stroke="none" />
    <path d="M 0 -158 L 0 -94" strokeWidth={30} />
    <path d="M 0 -94 L -20 -4 M 0 -94 L 20 -4" strokeWidth={24} />
    <path d="M 0 -150 L -28 -96 M 0 -150 L 28 -96" strokeWidth={18} />
  </g>
);

const Elephant = () => (
  <g fill="#8D9096">
    {[-62, -36, 22, 46].map((x) => (
      <rect key={x} x={x} y={-62} width={22} height={62} rx={6} />
    ))}
    <ellipse cx={-10} cy={-84} rx={72} ry={46} />
    <circle cx={62} cy={-96} r={34} />
    <path d="M 88 -90 C 104 -66 100 -34 92 -10 L 80 -12 C 86 -36 86 -60 72 -78 Z" />
    <ellipse cx={48} cy={-94} rx={22} ry={30} fill="#74777D" />
    <path d="M 70 -78 L 96 -70" stroke="#F3EEE2" strokeWidth={6} strokeLinecap="round" />
    <path d="M -80 -96 L -92 -60" stroke="#8D9096" strokeWidth={5} />
  </g>
);

const Baleine = () => (
  <g>
    <path d="M -86 -24 C -50 -60 50 -56 94 -30 C 100 -26 100 -14 90 -10 C 50 0 -40 2 -84 -14 Z" fill="#4F6D8C" />
    <path d="M -84 -14 C -40 0 50 0 90 -10 C 60 -18 -30 -20 -84 -14 Z" fill="#A9BCCB" />
    <path d="M -86 -22 L -108 -46 L -100 -20 L -110 4 Z" fill="#4F6D8C" />
    <circle cx={70} cy={-28} r={3.5} fill="#1B2733" />
  </g>
);

const Fusee = () => (
  <g>
    <path d="M -1 -200 L 1 -200 L 1 -182 L -1 -182 Z" fill="#3A3F49" />
    <path d="M -6 -182 L 6 -182 L 8 -168 L -8 -168 Z" fill="#E9EBEF" />
    <rect x={-8} y={-168} width={16} height={58} fill="#F4F5F7" />
    <rect x={-8} y={-128} width={16} height={6} fill="#20232A" />
    <rect x={-10} y={-110} width={20} height={104} fill="#F4F5F7" />
    {[-104, -80, -40].map((y) => (
      <rect key={y} x={-10} y={y} width={20} height={7} fill="#20232A" />
    ))}
    <rect x={-10} y={-30} width={10} height={24} fill="#20232A" />
    <path d="M -10 -24 L -20 -2 L -10 -6 Z M 10 -24 L 20 -2 L 10 -6 Z" fill="#20232A" />
  </g>
);

const Eiffel = () => (
  <g fill="#6B4E3D">
    <path d="M -38 0 L -9 -112 L -5 -168 L -1 -200 L 1 -200 L 5 -168 L 9 -112 L 38 0 L 24 0 Q 0 -44 -24 0 Z" />
    <rect x={-26} y={-74} width={52} height={7} />
    <rect x={-13} y={-120} width={26} height={6} />
  </g>
);

const Titanic = () => (
  <g>
    {[-42, -16, 10, 36].map((x) => (
      <g key={x}>
        <rect x={x} y={-62} width={13} height={34} fill="#D9A441" />
        <rect x={x} y={-62} width={13} height={8} fill="#1B1B1E" />
      </g>
    ))}
    <rect x={-72} y={-30} width={146} height={12} fill="#F4F1E6" />
    <path d="M -100 -20 L 100 -20 L 92 0 L -94 0 Z" fill="#1B1B1E" />
    <path d="M -97 -6 L 97 -6 L 92 0 L -94 0 Z" fill="#A3271D" />
  </g>
);

const Navire = () => (
  <g>
    <rect x={-92} y={-40} width={20} height={24} fill="#F4F1E6" />
    <rect x={-86} y={-52} width={8} height={12} fill="#20232A" />
    <path d="M -100 -16 L 100 -16 L 95 0 L -98 0 Z" fill="#7A2323" />
    <rect x={-100} y={-19} width={200} height={4} fill="#3E4A3F" />
    {[-50, -20, 10, 40, 70].map((x) => (
      <rect key={x} x={x} y={-22} width={10} height={4} fill="#B7B9AE" />
    ))}
  </g>
);

const Pyramide = () => (
  <g>
    <path d="M -100 0 L 0 -121 L 100 0 Z" fill="#D8B26E" />
    <path d="M 0 -121 L 100 0 L 28 0 Z" fill="#B48A4A" />
  </g>
);

// Plus grande dimension réelle de chaque référence, en mètres, pour la dessiner à l'échelle de la boule
const ICONES: Record<string, { Icone: FC; metres: number }> = {
  boule: { Icone: Bowling, metres: 0.218 },
  humain: { Icone: Humain, metres: 1.7 },
  elephant: { Icone: Elephant, metres: 6 },
  baleine: { Icone: Baleine, metres: 25 },
  fusee: { Icone: Fusee, metres: 111 },
  eiffel: { Icone: Eiffel, metres: 330 },
  titanic: { Icone: Titanic, metres: 269 },
  navire: { Icone: Navire, metres: 458 },
  pyramide: { Icone: Pyramide, metres: 230 },
};
const REF_MAX_PX = 600;

// ---------- Décor ----------

const Chaine = ({ base, hauteur, periode, decalage, roche, nu }: { base: number; hauteur: number; periode: number; decalage: number; roche: string; nu: number }) => {
  const forme = [1, 0.5, 0.82, 0.38];
  const pas = periode / 4;
  const depart = -periode - (((decalage % periode) + periode) % periode);
  const sommets: { x: number; y: number }[] = [];
  for (let x = depart, i = 0; x <= 1080 + periode; x += pas, i++) {
    sommets.push({ x, y: base - hauteur * forme[i % 4] });
    sommets.push({ x: x + pas / 2, y: base - hauteur * 0.12 });
  }
  const points = sommets.map((p) => `${p.x},${p.y}`).join(" ");
  return (
    <g>
      <polygon points={`${sommets[0].x},1920 ${points} ${sommets[sommets.length - 1].x},1920`} fill={roche} />
      {nu < 1 &&
        sommets
          .filter((_, i) => i % 2 === 0)
          .map((p, i) => {
            const h = base - p.y;
            const d = h * 0.3;
            return (
              <path
                key={i}
                d={`M ${p.x - d * 0.9} ${p.y + d} L ${p.x} ${p.y} L ${p.x + d * 0.9} ${p.y + d} L ${p.x + d * 0.4} ${p.y + d * 0.75} L ${p.x} ${p.y + d * 1.05} L ${p.x - d * 0.45} ${p.y + d * 0.8} Z`}
                fill="#FBFDFF"
                opacity={1 - nu}
              />
            );
          })}
    </g>
  );
};

type Couche = { espacement: number; taille: number; dessin: (h: number, i: number, nu: number) => ReactElement };

const COUCHES: Couche[] = [
  {
    espacement: 0.45,
    taille: 0.07,
    dessin: (h) => <path d={`M ${-h * 0.8} 2 Q 0 ${-h * 1.2} ${h * 0.8} 2 Z`} fill="#5B6670" />,
  },
  {
    espacement: 14,
    taille: 9,
    dessin: (h, i, nu) => (
      <g>
        <rect x={-h * 0.04} y={-h * 0.18} width={h * 0.08} height={h * 0.2} fill="#5A3E2B" />
        {[0, 1, 2].map((k) => {
          const bas = -h * (0.14 + k * 0.26);
          const l = h * (0.3 - k * 0.07);
          return (
            <g key={k}>
              <path d={`M ${-l} ${bas} L 0 ${bas - h * 0.42} L ${l} ${bas} Z`} fill={i % 3 === 0 ? "#2C5E45" : "#21503A"} />
              <path d={`M ${-l * 0.45} ${bas - h * 0.22} L 0 ${bas - h * 0.42} L ${l * 0.45} ${bas - h * 0.22} Z`} fill="#FBFDFF" opacity={1 - nu} />
            </g>
          );
        })}
      </g>
    ),
  },
  {
    espacement: 260,
    taille: 120,
    dessin: (h, _, nu) => (
      <g>
        <path d={`M ${-h * 0.75} 4 L ${-h * 0.1} ${-h} L ${h * 0.7} 4 Z`} fill="#7D8790" />
        <path d={`M ${-h * 0.1} ${-h} L ${h * 0.7} 4 L ${h * 0.15} 4 Z`} fill="#646E77" />
        <path d={`M ${-h * 0.32} ${-h * 0.66} L ${-h * 0.1} ${-h} L ${h * 0.14} ${-h * 0.66} L ${-h * 0.05} ${-h * 0.74} Z`} fill="#FBFDFF" opacity={1 - nu} />
      </g>
    ),
  },
];

const Decor = ({ v, nu }: { v: Vue; nu: number }) => (
  <g>
    {COUCHES.map((couche, c) => {
      const portee = 1700 / v.z;
      if (portee / couche.espacement > 260) {
        return null;
      }
      const elements = [];
      for (let i = Math.floor((v.s - portee) / couche.espacement); i <= Math.ceil((v.s + portee) / couche.espacement); i++) {
        const variation = 0.7 + 0.6 * alea(i + c * 1000);
        const h = couche.taille * variation * v.z;
        if (h < 5 || h > 650) {
          continue;
        }
        const { x, y } = ecran(v, (i + 0.4 * alea(i * 7 + c)) * couche.espacement);
        if (x < -h * 1.2 || x > 1080 + h * 1.2) {
          continue;
        }
        elements.push(
          <g key={`${c}-${i}`} transform={`translate(${x} ${y})`} opacity={1 - entre(h, 420, 650)}>
            {couche.dessin(h, i, nu)}
          </g>,
        );
      }
      return <g key={c}>{elements}</g>;
    })}
  </g>
);

// Chaque référence glisse à côté de la boule pendant sa légende, à l'échelle réelle tant qu'elle tient dans le cadre
const References = ({ v, t }: { v: Vue; t: number }) => (
  <g>
    {calcul.paliers.map((p) => {
      const age = t - p.arrivee_s;
      if (age < -0.6 || age > 3.2 || t >= calcul.t_coupe) {
        return null;
      }
      const { Icone, metres } = ICONES[p.cle];
      const gauche = CENTRE_X + v.R * 0.65;
      const place = 1050 - gauche;
      const xBase = gauche + Math.min(metres * v.z, REF_MAX_PX, place) / 2;
      // Jamais plus haut que le bas du compteur
      const taille = Math.min(metres * v.z, REF_MAX_PX, place, solY(v, xBase) - 560);
      const arrivee = lisse(entre(age, -0.6, 0));
      const depart = lisse(entre(age, 2.5, 3.2));
      const x = gauche + taille / 2 + (1 - arrivee) * 700 - depart * 260;
      return (
        <g key={p.cle} opacity={1 - depart} transform={`translate(${x} ${solY(v, x) + 6}) scale(${taille / 200})`}>
          <Icone />
        </g>
      );
    })}
  </g>
);

// Après le retournement : la neige mangée, en terrains de football, sur la montagne nue
const Terrains = ({ v, t }: { v: Vue; t: number }) => {
  const visible = entre(t, calcul.t_qui, calcul.t_qui + 0.3) * (1 - entre(t, calcul.t_retour, calcul.t_retour + 0.8));
  if (visible <= 0) {
    return null;
  }
  const largeur = 105 * v.z * COS;
  const hauteur = 68 * v.z * 0.5;
  const age = t - calcul.t_qui;
  const cases = [];
  const colonnes = Math.ceil(1280 / largeur);
  for (let k = 0; k < 9; k++) {
    for (let j = 0; j < colonnes; j++) {
      const x = -100 + j * largeur;
      if (Math.abs(x - CENTRE_X) * 0.004 + k * 0.05 > age * 1.6) {
        continue;
      }
      const y = solY(v, x) + 16 + k * hauteur;
      const w = largeur - 6;
      cases.push(
        <path
          key={`${k}-${j}`}
          d={`M ${x} ${y} L ${x + w} ${y + w * TAN} L ${x + w} ${y + w * TAN + hauteur - 6} L ${x} ${y + hauteur - 6} Z`}
          fill="#5E8C3E"
          stroke="#CFE3B8"
          strokeWidth={2}
        />,
      );
    }
  }
  return <g opacity={visible}>{cases}</g>;
};

const Flocons = ({ t }: { t: number }) => {
  const visible = entre(t, calcul.t_retour, calcul.t_retour + 0.3) * (1 - entre(t, calcul.t_fin - 0.6, calcul.t_fin));
  if (visible <= 0) {
    return null;
  }
  const age = t - calcul.t_retour;
  return (
    <g opacity={visible} fill="#FFFFFF">
      {Array.from({ length: 46 }, (_, i) => {
        const x = (i * 197 + 40 * Math.sin(age * 1.3 + i)) % 1080;
        const y = (i * 331 + age * (200 + (i % 5) * 40)) % 1920;
        return <circle key={i} cx={x} cy={y} r={6 + (i % 4) * 2} />;
      })}
    </g>
  );
};

const Boule = ({ v, angle }: { v: Vue; angle: number }) => {
  const R = v.R;
  const degres = (angle * 180) / Math.PI;
  return (
    <g transform={`translate(${CENTRE_X} ${CENTRE_Y})`}>
      <ellipse cx={R * 0.1} cy={R * 0.98} rx={R * 0.9} ry={R * 0.12} fill="#000000" opacity={0.12} transform={`rotate(17)`} />
      <defs>
        <clipPath id="snowball-boule">
          <circle cx={0} cy={0} r={R} />
        </clipPath>
      </defs>
      <g clipPath="url(#snowball-boule)">
        <circle cx={0} cy={0} r={R} fill="#C8DAE4" />
        <circle cx={-R * 0.12} cy={-R * 0.12} r={R * 0.95} fill="#F9FCFE" />
        <g transform={`rotate(${degres})`}>
          {Array.from({ length: 11 }, (_, i) => {
            const a = (i * 137.5 * Math.PI) / 180;
            const r = R * (0.25 + 0.6 * ((i * 0.618) % 1));
            return <ellipse key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r} rx={R * 0.17} ry={R * 0.1} fill="#DCE8EF" transform={`rotate(${i * 33} ${Math.cos(a) * r} ${Math.sin(a) * r})`} />;
          })}
        </g>
      </g>
      <circle cx={0} cy={0} r={R} fill="none" stroke="#9FB8C6" strokeWidth={Math.max(3, R * 0.025)} />
      <circle cx={-R * 0.38} cy={-R * 0.4} r={R * 0.12} fill="#FFFFFF" />
    </g>
  );
};

export const SceneSnowball = ({ t }: SceneProps) => {
  const p = pasDecor(t);
  const palette = paletteCadre(t);
  const nu = nudite(t);
  const v = vueA(t);
  const sol = interpolateColors(nu, [0, 1], [NEIGE, TERRE]);
  const levre = interpolateColors(nu, [0, 1], ["#D5E4EC", "#5E4532"]);
  const soleil = interpolateColors(p, [0, 30, 52], ["#FFF7DC", "#FFE7A0", "#FFB36B"]);
  const yG = solY(v, -100);
  const yD = solY(v, 1180);

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <circle cx={830} cy={640 + 260 * (p / calcul.n_max)} r={70} fill={soleil} />
        <Chaine base={1060} hauteur={420} periode={980} decalage={p * 6} roche="#A3B4C0" nu={nu} />
        <Chaine base={1120} hauteur={300} periode={720} decalage={p * 14 + 200} roche="#748A98" nu={nu} />

        <polygon points={`-100,${yG} 1180,${yD} 1180,1920 -100,1920`} fill={levre} />
        <polygon points={`-100,${yG + 18} 1180,${yD + 18} 1180,1920 -100,1920`} fill={sol} />
        <Terrains v={v} t={t} />
        <Decor v={v} nu={nu} />
        <References v={v} t={t} />
        <Boule v={v} angle={v.angle} />
        <Flocons t={t} />
      </svg>
    </AbsoluteFill>
  );
};
