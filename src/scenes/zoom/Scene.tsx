import type { ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import calcul from "../../../sujets/zoom.calcul.json";
import type { SceneProps } from "../../cadre/types";
import { entre, paletteA, pasDecor } from "./temps";

// Le point visé reste au centre ; chaque monde est dessiné dans une boîte de 1000 unités qui vaut `taille` mètres
const CX = 540;
const CY = 860;

type Fenetre = { taille: number; entree: [number, number]; sortie: [number, number] };

const Couche = ({ f, ppm, children }: { f: Fenetre; ppm: number; children: ReactNode }) => {
  const px = f.taille * ppm;
  const opacite = entre(px, f.entree[0], f.entree[1]) * (1 - entre(px, f.sortie[0], f.sortie[1]));
  if (opacite <= 0.001) {
    return null;
  }
  return (
    <g opacity={opacite} transform={`translate(${CX} ${CY}) scale(${px / 1000})`}>
      {children}
    </g>
  );
};

const MAIN: Fenetre = { taille: 0.2, entree: [0, 1], sortie: [14000, 30000] };
const EMPREINTE: Fenetre = { taille: 0.01, entree: [90, 300], sortie: [15000, 40000] };
const CELLULE: Fenetre = { taille: 2e-4, entree: [150, 500], sortie: [20000, 60000] };
const BACTERIE: Fenetre = { taille: 5e-6, entree: [120, 400], sortie: [25000, 80000] };
const VIRUS: Fenetre = { taille: 4e-7, entree: [150, 400], sortie: [8000, 25000] };
const ADN: Fenetre = { taille: 1.2e-8, entree: [150, 400], sortie: [10000, 30000] };
const ATOME: Fenetre = { taille: 6e-10, entree: [150, 400], sortie: [10000, 80000] };
const NOYAU: Fenetre = { taille: 2e-14, entree: [120, 300], sortie: [1e12, 2e12] };
const PROTON: Fenetre = { taille: 4e-15, entree: [500, 1500], sortie: [1e12, 2e12] };

const PEAU = "#E2A57E";
const PLI = "#B9785A";

const Main = () => (
  <g>
    <g fill={PEAU} stroke={PLI} strokeWidth={4}>
      <rect x={-60} y={240} width={410} height={480} rx={130} />
      <rect x={-45} y={-80} width={90} height={420} rx={45} />
      <rect x={55} y={-130} width={92} height={460} rx={46} />
      <rect x={157} y={-92} width={88} height={420} rx={44} />
      <rect x={255} y={10} width={80} height={340} rx={40} />
      <rect x={-250} y={260} width={100} height={330} rx={50} transform="rotate(-35 -200 425)" />
    </g>
    <path d="M -10 520 Q 140 470 330 520 M 20 600 Q 150 560 300 610 M -40 360 Q -20 520 40 680" fill="none" stroke={PLI} strokeWidth={6} />
    {[100, 200, 300].map((x, i) => (
      <path key={x} d={`M ${x - 40 + i * 2} ${i === 2 ? 130 : 90} q 40 14 80 0 M ${x - 40} ${i === 2 ? 230 : 210} q 40 14 80 0`} fill="none" stroke={PLI} strokeWidth={5} />
    ))}
    <path d="M -38 130 q 38 14 76 0 M -38 230 q 38 14 76 0" fill="none" stroke={PLI} strokeWidth={5} />
  </g>
);

// Crêtes de l'empreinte : 0,46 mm d'écart, soit 46 unités dans une boîte de 1 cm
const Empreinte = () => (
  <g fill="none" stroke="#A85A42" strokeWidth={18} strokeLinecap="round">
    {Array.from({ length: 18 }, (_, i) => (
      <ellipse key={i} cx={0} cy={i * 3} rx={46 * (i + 0.5) * 0.9} ry={46 * (i + 0.5) * 1.15} opacity={0.75} />
    ))}
    {Array.from({ length: 30 }, (_, i) => (
      <circle key={`p${i}`} cx={((i * 271) % 1400) - 700} cy={((i * 433) % 1600) - 800} r={5} fill="#7E3E2C" stroke="none" opacity={0.5} />
    ))}
  </g>
);

// Cornéocytes : des plaques de 40 µm, soit 200 unités dans une boîte de 200 µm
const Cellules = () => {
  const tuiles: ReactNode[] = [];
  for (let r = -7; r <= 7; r++) {
    for (let q = -7; q <= 7; q++) {
      const x = q * 182 + (r % 2 ? 91 : 0);
      const y = r * 158;
      const pts = Array.from({ length: 6 }, (_, k) => {
        const a = (Math.PI / 3) * k + Math.PI / 6 + (((q * 7 + r * 3) % 5) - 2) * 0.03;
        return `${x + Math.cos(a) * 100},${y + Math.sin(a) * 96}`;
      }).join(" ");
      tuiles.push(<polygon key={`${r}-${q}`} points={pts} fill={(q + r) % 2 ? "#F6D9CC" : "#EFC8B6"} stroke="#C98F7A" strokeWidth={7} />);
    }
  }
  return <g>{tuiles}</g>;
};

// Staphylocoques de 1 µm (200 unités dans 5 µm) ; le virus se pose en haut de celui du centre
const COQUES: [number, number][] = [
  [-205, -30],
  [205, -50],
  [-120, -225],
  [115, -235],
  [-310, 170],
  [300, 160],
  [0, 140],
];
const Bacteries = () => (
  <g>
    {COQUES.map(([x, y], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r={100} fill="#F7F1DA" stroke="#6E6630" strokeWidth={6} />
        <circle cx={x - 30} cy={y - 35} r={28} fill="#FFFFFF" opacity={0.5} />
      </g>
    ))}
  </g>
);

// Bactériophage : tête de 120 x 86 nm (300 x 215 unités dans 400 nm), queue de 140 nm, posé sur la bactérie
const Virus = () => (
  <g>
    <circle cx={0} cy={1750} r={1250} fill="#F7F1DA" stroke="#6E6630" strokeWidth={10} />
    <g stroke="#1F4D36" strokeWidth={10} strokeLinecap="round" fill="none">
      <path d="M -20 470 L -150 420 L -260 505" />
      <path d="M 20 470 L 150 420 L 260 505" />
      <path d="M -10 480 L -90 500 L -140 505" />
      <path d="M 10 480 L 90 500 L 140 505" />
    </g>
    <rect x={-22} y={150} width={44} height={320} fill="#3E8E68" stroke="#1F4D36" strokeWidth={8} />
    {Array.from({ length: 9 }, (_, i) => (
      <line key={i} x1={-22} x2={22} y1={180 + i * 34} y2={180 + i * 34} stroke="#1F4D36" strokeWidth={5} />
    ))}
    <polygon points="-60,465 60,465 40,500 -40,500" fill="#1F4D36" />
    <polygon points="0,-150 107,-90 107,90 0,150 -107,90 -107,-90" fill="#E3F0E6" stroke="#1F4D36" strokeWidth={10} />
    <g fill="none" stroke="#C9871A" strokeWidth={5}>
      <path d="M -90 0 C -45 -50 45 50 90 0" />
      <path d="M -85 -50 C -30 -100 40 -10 85 -60" />
      <path d="M -85 50 C -30 0 40 100 85 40" />
      <path d="M -60 -100 C 0 -130 30 -80 60 -110" />
      <path d="M -60 100 C 0 70 30 130 60 100" />
    </g>
  </g>
);

// Double hélice couchée : 2 nm de large (167 unités dans 12 nm), un tour tous les 3,4 nm ; le brin passe par le centre
const PAS_HELICE = 283;
const brin = (y: number, phase: number) => 83 * Math.sin((2 * Math.PI * y) / PAS_HELICE + phase);
const Adn = () => {
  const ys = Array.from({ length: 601 }, (_, i) => -4200 + i * 14);
  const chemin = (phase: number) => ys.map((y, i) => `${i ? "L" : "M"} ${y} ${brin(y, phase)}`).join(" ");
  const proches = ys.filter((y) => Math.abs(y) < 700);
  return (
    <g>
      {ys
        .filter((y) => Math.round(y / 14) % 3 === 0)
        .map((y) => (
          <line key={`b${y}`} y1={brin(y, 0)} y2={brin(y, 2.4)} x1={y} x2={y} stroke={Math.round(y / 42) % 2 ? "#5FB0A0" : "#E76F51"} strokeWidth={14} />
        ))}
      <path d={chemin(0)} fill="none" stroke="#F2B134" strokeWidth={20} />
      <path d={chemin(2.4)} fill="none" stroke="#E9D9A6" strokeWidth={20} />
      {proches.map((y) => (
        <circle key={`a${y}`} cy={brin(y, 0)} cx={y} r={7} fill="#FFF3D6" />
      ))}
    </g>
  );
};

// Atome de carbone : 70 pm de rayon (117 unités dans 0,6 nm), un nuage d'électrons sans bord net
const Atome = ({ t }: { t: number }) => (
  <g>
    {[1.9, 1.5, 1.15, 0.8, 0.45].map((k, i) => (
      <circle key={k} cx={0} cy={0} r={117 * k} fill="#F2B134" opacity={0.05 + i * 0.03} />
    ))}
    {Array.from({ length: 6 }, (_, i) => {
      const r = i < 2 ? 40 : 105;
      const a = t * (i < 2 ? 2.4 : 1.3) + (i * Math.PI * 2) / (i < 2 ? 2 : 4);
      return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r * 0.8} r={5} fill="#FFF3D6" />;
    })}
  </g>
);

// Noyau de carbone 12 : 6 protons et 6 neutrons de 0,84 fm (42 unités dans 20 fm), un proton au centre
const NUCLEONS: [number, number, boolean][] = [
  [-70, -30, false],
  [60, -55, true],
  [-20, 75, true],
  [75, 45, false],
  [-75, 50, true],
  [15, -85, false],
  [-45, -80, true],
  [90, -5, true],
  [40, 85, false],
  [-95, -10, false],
  [55, 0, false],
  [0, 0, true],
];
const Noyau = () => (
  <g>
    <circle cx={0} cy={0} r={150} fill="#FF7A45" opacity={0.12} />
    {NUCLEONS.map(([x, y, proton], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r={42} fill={proton ? "#E4572E" : "#7D776C"} stroke="#1A0E0A" strokeWidth={3} />
        <circle cx={x - 12} cy={y - 14} r={11} fill="#FFFFFF" opacity={0.35} />
      </g>
    ))}
  </g>
);

// Trois quarks dans le proton (210 unités de rayon dans 4 fm), reliés par des ressorts de gluons
const QUARKS: [number, number, string][] = [
  [0, -80, "#F2C14E"],
  [-72, 45, "#5FB0A0"],
  [72, 45, "#2F5D8A"],
];
const ressort = (a: [number, number, string], b: [number, number, string]) => {
  const n = 9;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dx, dy);
  const nx = -dy / l;
  const ny = dx / l;
  return Array.from({ length: n + 1 }, (_, i) => {
    const s = i / n;
    const o = i === 0 || i === n ? 0 : (i % 2 ? 9 : -9);
    return `${i ? "L" : "M"} ${a[0] + dx * s + nx * o} ${a[1] + dy * s + ny * o}`;
  }).join(" ");
};
const Proton = ({ t }: { t: number }) => (
  <g>
    <circle cx={0} cy={0} r={170} fill="#F08A5D" opacity={0.35} />
    {[0, 1, 2].map((i) => (
      <path key={i} d={ressort(QUARKS[i], QUARKS[(i + 1) % 3])} fill="none" stroke="#FFF3E6" strokeWidth={4} opacity={0.7} />
    ))}
    {QUARKS.map(([x, y, c], i) => (
      <circle key={i} cx={x + Math.sin(t * 3 + i) * 4} cy={y + Math.cos(t * 2.5 + i) * 4} r={24} fill={c} stroke="#1A0E0A" strokeWidth={3} />
    ))}
  </g>
);

// Le noyau à 1 cm : l'atome ferait 283 m, on pose un terrain de football (105 x 68 m) dedans
const Bille = ({ age, encre }: { age: number; encre: string }) => {
  const r = 430;
  const m = (2 * r) / calcul.atome_si_noyau_1cm_m;
  const w = 105 * m;
  const h = 68 * m;
  const pouls = 1 + 0.4 * Math.abs(Math.sin(age * 4));
  return (
    <g opacity={entre(age, 0, 0.4)}>
      <circle cx={CX} cy={CY} r={r} fill="#F2B134" opacity={0.12} />
      <circle cx={CX} cy={CY} r={r} fill="none" stroke="#F2B134" strokeWidth={6} strokeDasharray="18 14" />
      <g opacity={entre(age, 0.8, 1.3)}>
        <rect x={CX - w / 2} y={CY - h / 2} width={w} height={h} fill="#3F8F4A" stroke="#F4F1E8" strokeWidth={4} />
        <line x1={CX} x2={CX} y1={CY - h / 2} y2={CY + h / 2} stroke="#F4F1E8" strokeWidth={3} />
        <circle cx={CX} cy={CY} r={9.15 * m} fill="none" stroke="#F4F1E8" strokeWidth={3} />
        <rect x={CX - w / 2} y={CY - 20.15 * m} width={16.5 * m} height={40.3 * m} fill="none" stroke="#F4F1E8" strokeWidth={3} />
        <rect x={CX + w / 2 - 16.5 * m} y={CY - 20.15 * m} width={16.5 * m} height={40.3 * m} fill="none" stroke="#F4F1E8" strokeWidth={3} />
      </g>
      <circle cx={CX} cy={CY} r={7} fill="#E4572E" stroke={encre} strokeWidth={2} />
      <circle cx={CX} cy={CY} r={22 * pouls} fill="none" stroke="#E4572E" strokeWidth={4} />
    </g>
  );
};

export const SceneZoom = ({ t }: SceneProps) => {
  const palette = paletteA(t);
  const c = pasDecor(t);
  const ppm = 1080 / (calcul.champ_0_m / Math.pow(calcul.facteur, c));
  const bille = t >= calcul.t_coupe + 0.7 && t < calcul.t_qui + 0.4 ? 1 - entre(t, calcul.t_qui, calcul.t_qui + 0.4) : 0;

  // Le vide entre l'atome et le noyau : des anneaux qui défilent pour sentir qu'on avance quand même
  const vide = entre(c, 29, 31) * (1 - entre(c, 40.5, 42));
  const frac = c - Math.floor(c);
  // Le noyau, minuscule point avant d'avoir une taille dessinable
  const noyauPx = NOYAU.taille * ppm;
  const point = entre(c, 34, 37) * (1 - entre(noyauPx, 120, 300));
  const vu = 1 - bille;

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <g opacity={vu}>
          <Couche f={MAIN} ppm={ppm}>
            <Main />
          </Couche>
          <Couche f={EMPREINTE} ppm={ppm}>
            <Empreinte />
          </Couche>
          <Couche f={CELLULE} ppm={ppm}>
            <Cellules />
          </Couche>
          <Couche f={BACTERIE} ppm={ppm}>
            <Bacteries />
          </Couche>
          <Couche f={VIRUS} ppm={ppm}>
            <Virus />
          </Couche>
          <Couche f={ADN} ppm={ppm}>
            <Adn />
          </Couche>
          <Couche f={ATOME} ppm={ppm}>
            <Atome t={t} />
          </Couche>
          {vide > 0 &&
            Array.from({ length: 7 }, (_, j) => (
              <circle key={j} cx={CX} cy={CY} r={40 * Math.pow(2, j + 1 - frac)} fill="none" stroke={palette.encre} strokeWidth={3} opacity={vide * 0.16 * (1 - j / 7)} />
            ))}
          {point > 0 && (
            <g opacity={point}>
              <circle cx={CX} cy={CY} r={Math.max(4, noyauPx * 0.124)} fill="#FF7A45" />
              <circle cx={CX} cy={CY} r={Math.max(14, noyauPx * 0.2)} fill="none" stroke="#FF7A45" strokeWidth={3} opacity={0.6} />
            </g>
          )}
          <Couche f={NOYAU} ppm={ppm}>
            <Noyau />
          </Couche>
          <Couche f={PROTON} ppm={ppm}>
            <Proton t={t} />
          </Couche>
          {t >= calcul.t_qui && t < calcul.t_retour + 0.5 && (
            <circle cx={CX} cy={CY} r={10 + 40 * ((t * 1.2) % 1)} fill="none" stroke="#FF7A45" strokeWidth={4} opacity={1 - ((t * 1.2) % 1)} />
          )}
        </g>
        {bille > 0 && <Bille age={t - calcul.t_coupe - 0.7} encre={palette.encre} />}
      </svg>
    </AbsoluteFill>
  );
};
