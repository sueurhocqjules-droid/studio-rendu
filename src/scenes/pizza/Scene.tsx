import type { ReactNode } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import calcul from "../../../sujets/pizza.calcul.json";
import type { SceneProps } from "../../cadre/types";
import { entre, horloge, lisse, paletteA, rassemble, zoomA } from "./temps";

const BASE = 330;
const ANCRE_0 = { x: 540, y: 860 };
const ANCRE = { x: 880, y: 1180 };
const ECART = 0.12;
const N = calcul.n_max;

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Pseudo-hasard stable pour les motifs
const hasard = (graine: number) => {
  const x = Math.sin(graine * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

type Vue = { ax: number; ay: number; k: number };

const vueA = (z: number): Vue => {
  const u = lisse(Math.min(Math.max(z, 0), 1));
  const m = 2.4 - 1.4 * u;
  return { ax: ANCRE_0.x + (ANCRE.x - ANCRE_0.x) * u, ay: ANCRE_0.y + (ANCRE.y - ANCRE_0.y) * u, k: BASE * Math.pow(2, z) * m };
};

// La pizza entière, dessinée en coordonnées écran autour de son centre (cx, cy), rayon r
const Pizza = ({ cx, cy, r }: { cx: number; cy: number; r: number }) => {
  const garnitures = [
    [-0.04, -0.03, 0.05],
    [0.22, -0.18, 0.07],
    [-0.25, 0.12, 0.07],
    [0.12, 0.26, 0.065],
    [-0.15, -0.28, 0.06],
    [0.3, 0.1, 0.06],
    [-0.3, -0.08, 0.05],
  ];
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#D99A4E" />
      <circle cx={cx} cy={cy} r={r * 0.88} fill="#C7361F" />
      <circle cx={cx} cy={cy} r={r * 0.84} fill="#F2C14E" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={i} cx={cx + r * 0.5 * Math.cos(i * 1.1 + 0.4)} cy={cy + r * 0.5 * Math.sin(i * 1.1 + 0.4)} r={r * 0.13} fill="#F7D57A" />
      ))}
      {garnitures.map(([x, y, g], i) => (
        <g key={i}>
          <circle cx={cx + x * 2 * r} cy={cy + y * 2 * r} r={g * 2 * r} fill="#A3241A" />
          <circle cx={cx + x * 2 * r - g * 0.6 * r} cy={cy + y * 2 * r - g * 0.5 * r} r={g * 0.5 * r} fill="#C2412F" />
        </g>
      ))}
      <path d={`M ${cx + 0.33 * r} ${cy - 0.52 * r} q ${0.12 * r} ${-0.1 * r} ${0.22 * r} 0 q ${-0.1 * r} ${0.12 * r} ${-0.22 * r} 0 Z`} fill="#3E8A3A" />
    </g>
  );
};

// Un morceau à l'échelle microscopique : la matière de la pizza change d'aspect avec le niveau
const Matiere = ({ x, y, c, niveau, graine }: { x: number; y: number; c: number; niveau: number; graine: number }) => {
  const motif: ReactNode[] = [];
  let fond = "#E8B54A";
  if (niveau < 13) {
    for (let i = 0; i < 7; i++) {
      motif.push(<circle key={i} cx={x + c * (0.15 + 0.7 * hasard(graine + i))} cy={y + c * (0.15 + 0.7 * hasard(graine + i + 50))} r={c * (0.04 + 0.05 * hasard(graine + i + 9))} fill={i === 0 ? "#B8321F" : "#C98E2B"} />);
    }
  } else if (niveau < 21) {
    fond = "#F3D27A";
    for (let i = 0; i < 6; i++) {
      motif.push(<ellipse key={i} cx={x + c * (0.2 + 0.6 * hasard(graine + i))} cy={y + c * (0.2 + 0.6 * hasard(graine + i + 50))} rx={c * 0.11} ry={c * 0.08} fill="#FFF3C4" stroke="#D9A441" strokeWidth={c * 0.015} />);
    }
    motif.push(<circle key="g" cx={x + c * 0.7} cy={y + c * 0.3} r={c * 0.09} fill="#EE9F2E" />);
  } else if (niveau < 31) {
    fond = "#F2D99B";
    for (let i = 0; i < 5; i++) {
      const y0 = y + c * (0.15 + 0.17 * i);
      motif.push(
        <path key={i} d={`M ${x + c * 0.1} ${y0} q ${c * 0.2} ${c * 0.1 * (hasard(graine + i) - 0.5)} ${c * 0.4} 0 t ${c * 0.4} 0`} fill="none" stroke="#B8642A" strokeWidth={c * 0.035} strokeLinecap="round" />,
      );
    }
  } else {
    fond = "none";
    const atomes = [0, 1, 2, 3, 4, 5].map((i) => [x + c * (0.2 + 0.6 * hasard(graine + i)), y + c * (0.2 + 0.6 * hasard(graine + i + 30))]);
    atomes.forEach(([ax, ay], i) => {
      if (i > 0) {
        motif.push(<line key={`l${i}`} x1={atomes[i - 1][0]} y1={atomes[i - 1][1]} x2={ax} y2={ay} stroke="#C9CED8" strokeWidth={c * 0.035} />);
      }
    });
    atomes.forEach(([ax, ay], i) => {
      motif.push(<circle key={`a${i}`} cx={ax} cy={ay} r={c * (i % 3 === 0 ? 0.09 : 0.065)} fill={i % 3 === 0 ? "#D9443A" : i % 3 === 1 ? "#3A3F4B" : "#F4F1E6"} />);
    });
  }
  return (
    <g>
      {fond !== "none" && <rect x={x} y={y} width={c} height={c} rx={c * 0.12} fill={fond} />}
      {motif}
    </g>
  );
};

const Atome = ({ cx, cy, r, t, teinte }: { cx: number; cy: number; r: number; t: number; teinte: string }) => (
  <g>
    {[0, 60, 120].map((a, i) => (
      <g key={a} transform={`rotate(${a} ${cx} ${cy})`}>
        <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.36} fill="none" stroke="#F4F1E6" strokeWidth={Math.max(2, r * 0.025)} opacity={0.55} />
        <circle cx={cx + r * Math.cos(t * 2.4 + i * 2.1)} cy={cy + r * 0.36 * Math.sin(t * 2.4 + i * 2.1)} r={r * 0.07} fill="#7FC8F8" />
      </g>
    ))}
    <circle cx={cx - r * 0.07} cy={cy - r * 0.05} r={r * 0.12} fill={teinte} />
    <circle cx={cx + r * 0.08} cy={cy + r * 0.02} r={r * 0.12} fill="#9AA3B2" />
    <circle cx={cx - r * 0.02} cy={cy + r * 0.1} r={r * 0.12} fill={teinte} />
  </g>
);

const Reference = ({ cle, cx, cy, r }: { cle: string; cx: number; cy: number; r: number }) => {
  const halo = <circle cx={cx} cy={cy} r={r * 1.05} fill="#FFFDF6" opacity={0.25} />;
  switch (cle) {
    case "raisin":
      return (
        <g>
          {halo}
          <circle cx={cx} cy={cy} r={r * 0.8} fill="#6B2E6E" />
          <circle cx={cx - r * 0.3} cy={cy - r * 0.3} r={r * 0.18} fill="#A86BAA" />
          <rect x={cx - r * 0.05} y={cy - r * 1.05} width={r * 0.1} height={r * 0.3} fill="#5B7A2E" />
        </g>
      );
    case "riz":
      return (
        <g>
          {halo}
          <ellipse cx={cx} cy={cy} rx={r * 0.85} ry={r * 0.32} fill="#FFFDF6" stroke="#D8CDB0" strokeWidth={r * 0.04} transform={`rotate(-25 ${cx} ${cy})`} />
        </g>
      );
    case "sel":
      return (
        <g>
          {halo}
          <polygon points={`${cx - r * 0.6},${cy - r * 0.3} ${cx},${cy - r * 0.65} ${cx + r * 0.6},${cy - r * 0.3} ${cx},${cy + 0.05 * r}`} fill="#FFFFFF" />
          <polygon points={`${cx - r * 0.6},${cy - r * 0.3} ${cx},${cy + 0.05 * r} ${cx},${cy + r * 0.7} ${cx - r * 0.6},${cy + r * 0.35}`} fill="#DDE6EE" />
          <polygon points={`${cx + r * 0.6},${cy - r * 0.3} ${cx},${cy + 0.05 * r} ${cx},${cy + r * 0.7} ${cx + r * 0.6},${cy + r * 0.35}`} fill="#B9C7D4" />
        </g>
      );
    case "cellule":
      return (
        <g>
          <circle cx={cx} cy={cy} r={r * 0.9} fill="#F3B6C2" stroke="#C7576E" strokeWidth={r * 0.05} />
          <circle cx={cx + r * 0.15} cy={cy - r * 0.1} r={r * 0.32} fill="#8E4A8F" />
          <ellipse cx={cx - r * 0.4} cy={cy + r * 0.35} rx={r * 0.15} ry={r * 0.07} fill="#E07A5F" />
        </g>
      );
    case "bacterie":
    case "pelagibacter": {
      const petit = cle === "pelagibacter";
      return (
        <g transform={`rotate(-20 ${cx} ${cy})`}>
          {!petit &&
            [-1, 1].map((s) => <path key={s} d={`M ${cx + r * 0.75} ${cy + s * r * 0.1} q ${r * 0.2} ${s * r * 0.4} ${r * 0.4} ${s * r * 0.2} t ${r * 0.3} ${s * r * 0.3}`} fill="none" stroke="#2F6B3A" strokeWidth={r * 0.05} />)}
          <rect x={cx - r * 0.8} y={cy - r * (petit ? 0.22 : 0.32)} width={r * (petit ? 1.2 : 1.6)} height={r * (petit ? 0.44 : 0.64)} rx={r * 0.3} fill={petit ? "#E9873B" : "#6DBE6A"} stroke={petit ? "#A4521C" : "#2F6B3A"} strokeWidth={r * 0.05} />
        </g>
      );
    }
    case "virus":
      return (
        <g>
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * Math.PI) / 6;
            return <line key={i} x1={cx + r * 0.55 * Math.cos(a)} y1={cy + r * 0.55 * Math.sin(a)} x2={cx + r * 0.85 * Math.cos(a)} y2={cy + r * 0.85 * Math.sin(a)} stroke="#B8321F" strokeWidth={r * 0.08} strokeLinecap="round" />;
          })}
          <circle cx={cx} cy={cy} r={r * 0.58} fill="#E85D4A" />
          <circle cx={cx - r * 0.15} cy={cy - r * 0.12} r={r * 0.12} fill="#F4A08F" />
        </g>
      );
    case "hemoglobine":
      return (
        <g>
          {[
            [-0.32, -0.3],
            [0.32, -0.3],
            [-0.32, 0.3],
            [0.32, 0.3],
          ].map(([x, y], i) => (
            <g key={i}>
              <circle cx={cx + x * r} cy={cy + y * r} r={r * 0.4} fill={i % 2 ? "#B33A3A" : "#D65A4A"} />
              <rect x={cx + x * r - r * 0.08} y={cy + y * r - r * 0.08} width={r * 0.16} height={r * 0.16} fill="#F2C14E" transform={`rotate(45 ${cx + x * r} ${cy + y * r})`} />
            </g>
          ))}
        </g>
      );
    default:
      return null;
  }
};

export const ScenePizza = ({ t }: SceneProps) => {
  const z = zoomA(t);
  const h = horloge(t);
  const palette = paletteA(t);
  const v = vueA(z);
  const ferme = 1 - rassemble(t);
  const X = (x: number) => v.ax + x * v.k;
  const Y = (y: number) => v.ay + y * v.k;

  // Nombre de coupes commencées
  const profond = h < 0 ? 0 : Math.min(N, Math.floor(h) + 1);
  const ouverture = (j: number) => (t >= calcul.t_retour ? ferme : lisse(entre(h, j - 1 + 0.1, j - 1 + 0.45)));

  const formes: ReactNode[] = [];
  const references = calcul.paliers.filter((p) => p.cle !== "atome" && t >= p.arrivee_s - 0.6 && (t < calcul.t_retour || z > p.pas - 2));

  const niveauMin = Math.max(1, Math.floor(z) - 3);
  const jHaut = Math.min(profond, Math.floor(z) + 2);
  for (let j = jHaut; j >= niveauMin; j--) {
    const s = Math.pow(2, -j);
    const px = j === 1 ? -0.5 : -2 * s;
    const qa = j === 1 ? 0 : 1;
    const gap = ECART * ouverture(j) * s;
    for (let a = 0; a < 2; a++) {
      for (let b = 0; b < 2; b++) {
        const estChoisi = a === qa && b === qa;
        if (estChoisi && j !== jHaut) {
          continue;
        }
        const ox = (a - qa) * gap;
        const oy = (b - qa) * gap;
        const x = px + a * s + ox;
        const y = px + b * s + oy;
        const taille = s * v.k;
        if (X(x) > 1300 || Y(y) > 2100 || X(x + s) < -200 || Y(y + s) < -200 || taille < 2) {
          continue;
        }
        // La référence prend la place du frère en haut à gauche
        if (references.some((p) => (p.pas === j && t < p.pas + 0.25) || (p.pas + 1 === j && t >= p.pas + 0.25)) && a === 0 && b === 0 && !estChoisi) {
          continue;
        }
        const id = `p${j}${a}${b}`;
        if (j >= N) {
          formes.push(<Atome key={id} cx={X(x + s / 2)} cy={Y(y + s / 2)} r={taille * 0.46} t={t + a * 1.3 + b * 2.1} teinte={estChoisi ? "#D9443A" : a + b === 1 ? "#3A3F4B" : "#F4F1E6"} />);
        } else if (j <= 6) {
          formes.push(
            <g key={id}>
              <clipPath id={id}>
                <rect x={X(x)} y={Y(y)} width={taille + 0.5} height={taille + 0.5} />
              </clipPath>
              <g clipPath={`url(#${id})`}>
                <Pizza cx={X(ox)} cy={Y(oy)} r={0.5 * v.k} />
              </g>
            </g>,
          );
        } else {
          formes.push(<Matiere key={id} x={X(x) + taille * 0.03} y={Y(y) + taille * 0.03} c={taille * 0.94} niveau={j} graine={j * 7 + a * 3 + b} />);
        }
      }
    }
  }

  // Chaque référence suit le morceau : de la place du frère au niveau p à celle du niveau p + 1
  references.forEach((p) => {
    if (t > p.pas + 2.6 || t >= calcul.t_retour) {
      return;
    }
    const u = lisse(entre(t, p.pas, p.pas + 0.5));
    const s = Math.pow(2, -p.pas) * (1 - 0.5 * u);
    formes.push(<Reference key={`r${p.cle}`} cle={p.cle} cx={X(-1.5 * s)} cy={Y(-1.5 * s)} r={s * v.k * 0.48} />);
  });

  // Coupe en cours : deux traits de couteau sur le morceau
  const enCoupe = h >= 0 && h - Math.floor(h) < 0.35 && Math.floor(h) < N && t < calcul.t_retour;
  const kc = Math.floor(h);
  const sc = kc === 0 ? 1 : Math.pow(2, -kc);
  const pxc = kc === 0 ? -0.5 : -sc;
  const avance = entre(h - kc, 0, 0.22);
  const coupe = enCoupe && (
    <g stroke="#2B1A10" strokeWidth={8} strokeLinecap="round" opacity={1 - entre(h - kc, 0.22, 0.35)}>
      <line x1={X(pxc + sc / 2)} y1={Y(pxc)} x2={X(pxc + sc / 2)} y2={Y(pxc + sc * avance)} />
      <line x1={X(pxc)} y1={Y(pxc + sc / 2)} x2={X(pxc + sc * avance)} y2={Y(pxc + sc / 2)} />
    </g>
  );

  // Le couteau qui bute sur l'atome
  const cibleX = X(-Math.pow(2, -N) / 2);
  const cibleY = Y(-Math.pow(2, -N));
  const descente = interpolate(t, [calcul.t_coupe - 1.3, calcul.t_coupe], [-700, 0], borne);
  const rebond = t >= calcul.t_coupe ? -120 * Math.sin(Math.min(1, (t - calcul.t_coupe) / 0.5) * Math.PI) * Math.exp(-(t - calcul.t_coupe)) : 0;
  const casse = t >= calcul.t_qui;
  const couteau = t >= calcul.t_coupe - 1.3 && t < calcul.t_retour && (
    <g transform={`translate(${cibleX} ${cibleY - 20 + descente + rebond})`}>
      {casse ? (
        <g>
          <polygon points="-40,-300 40,-300 40,-150 -40,-130" fill="#C9CED8" transform="rotate(-14 0 -220) translate(-120 40)" />
          <polygon points="-40,-130 40,-150 40,0 0,0 -40,-40" fill="#C9CED8" transform="rotate(32 0 -60) translate(150 40)" />
          <rect x={-34} y={-520} width={68} height={220} rx={20} fill="#3A2416" transform="rotate(-14 0 -220) translate(-120 40)" />
        </g>
      ) : (
        <g>
          <polygon points="-40,-300 40,-300 40,0 0,0 -40,-40" fill="#C9CED8" />
          <rect x={-34} y={-520} width={68} height={220} rx={20} fill="#3A2416" />
        </g>
      )}
      {t >= calcul.t_coupe && t < calcul.t_coupe + 0.5 &&
        Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          const l = 60 + 160 * (t - calcul.t_coupe);
          return <line key={i} x1={Math.cos(a) * 30} y1={Math.sin(a) * 30} x2={Math.cos(a) * l} y2={Math.sin(a) * l} stroke="#FFD166" strokeWidth={10} strokeLinecap="round" />;
        })}
    </g>
  );

  // Nappe à carreaux sous la pizza
  const nappe = z < 3 && (
    <g opacity={1 - entre(z, 1, 3)}>
      {Array.from({ length: 16 }, (_, i) =>
        Array.from({ length: 16 }, (__, j) =>
          (i + j) % 2 === 0 ? <rect key={`${i}-${j}`} x={X((i - 8) * 0.25)} y={Y((j - 8) * 0.25)} width={0.25 * v.k} height={0.25 * v.k} fill="#E9A99E" opacity={0.55} /> : null,
        ),
      )}
    </g>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        {nappe}
        {profond === 0 && <Pizza cx={X(0)} cy={Y(0)} r={0.5 * v.k} />}
        <clipPath id="sousCompteur">
          <rect x={0} y={z < 1 ? 0 : 500} width={1080} height={1920} />
        </clipPath>
        <g clipPath="url(#sousCompteur)">{formes}</g>
        {coupe}
        {couteau}
      </svg>
    </AbsoluteFill>
  );
};
