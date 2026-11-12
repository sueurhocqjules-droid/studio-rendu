import type { FC } from "react";
import { AbsoluteFill, interpolate, interpolateColors } from "remotion";
import calcul from "../../../sujets/thick.calcul.json";
import type { SceneProps } from "../../cadre/types";
import { couleurMatiere, entre, lisse, paletteA, pasDecor, presence, recul } from "./temps";

// La cuisine : une carafe penchée verse dans un verre posé sur le plan de travail
const TABLE_Y = 1166;
const VERRE_HAUT = 880;
const VERRE_H = TABLE_Y - VERRE_HAUT;
const VERRE_X = 550;
const DEMI_HAUT = 148;
const DEMI_BAS = 118;
const LEVRE_X = 520;
const LEVRE_Y = 805;
const INCLINAISON = 58;
const ECHELLE_CARAFE = 0.88;

// La Terre de l'épilogue : le verre devient un point sur la croûte
const SOMMET_X = 540;
const SOMMET_Y = 930;
const RAYON_TERRE = 1180;
const ECHELLE_VERRE = 0.12;

// Le brai fige tout : au-delà, la carafe bascule sans que rien ne tombe
const PAS_FIGE = 23.5;

const niveau = (n: number) => 0.2 + 0.55 * (1 - Math.pow(0.8, Math.min(n, 24)));
const surfaceY = (n: number) => TABLE_Y - niveau(n) * VERRE_H;
const demiLargeurA = (y: number) => DEMI_BAS + ((DEMI_HAUT - DEMI_BAS) * (TABLE_Y - y)) / VERRE_H;

// Avancée cumulée du filet : vite pour l'eau, presque rien pour le miel
const avancee = (n: number) => (1100 * (1 - Math.pow(0.8, n))) / -Math.log(0.8);

const fonce = (couleur: string, part: number) => interpolateColors(part, [0, 1], [couleur, "#000000"]);

const TABLES = {
  eau: "#7FA9B5",
  huile: "#8C7F3A",
  miel: "#9B5A14",
  lave: "#1A0B08",
  brai: "#2E2620",
  verre: "#5E8A75",
  glace: "#F4FAFD",
  sel: "#C99A8D",
  granit: "#5F5C59",
  manteau: "#6E1F06",
};
const POINTS_TABLE = [0, ...calcul.paliers.map((p) => p.pas)];
const COULEURS_TABLE = Object.values(TABLES);
const tableA = (n: number) => interpolateColors(n, POINTS_TABLE, COULEURS_TABLE);

// Points fixes, tirés une fois : grain du granite et cristaux de sel
const alea = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const GRAINS = Array.from({ length: 70 }, (_, i) => ({ x: alea(i), y: alea(i + 100), r: 3 + alea(i + 200) * 7, c: alea(i + 300) }));

const Carrelage = () => (
  <g stroke="#FFFFFF" strokeWidth={5} opacity={0.55}>
    {Array.from({ length: 9 }, (_, i) => (
      <line key={`h${i}`} x1={0} y1={520 + i * 80} x2={1080} y2={520 + i * 80} />
    ))}
    {Array.from({ length: 14 }, (_, i) => (
      <line key={`v${i}`} x1={i * 80} y1={520} x2={i * 80} y2={TABLE_Y} />
    ))}
  </g>
);

const Olivier = () => (
  <g>
    <path d="M 1100 560 C 980 600 880 640 760 760" fill="none" stroke="#5C4A22" strokeWidth={14} strokeLinecap="round" />
    {[0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((u, i) => {
      const x = 1100 - 340 * u;
      const y = 560 + 200 * u * u;
      return (
        <g key={u}>
          <ellipse cx={x} cy={y - 34} rx={14} ry={46} fill="#6E7A2A" transform={`rotate(${-50 + i * 6} ${x} ${y})`} />
          <ellipse cx={x + 6} cy={y + 34} rx={14} ry={46} fill="#7F8C34" transform={`rotate(${40 - i * 5} ${x} ${y})`} />
          {i % 2 === 1 && <circle cx={x - 10} cy={y + 48} r={18} fill="#3B4216" />}
        </g>
      );
    })}
  </g>
);

const Alveoles = () => {
  const r = 70;
  const cellules = [];
  for (let ligne = 0; ligne < 8; ligne++) {
    for (let col = 0; col < 9; col++) {
      const x = col * r * 1.5;
      const y = 470 + ligne * r * Math.sqrt(3) + (col % 2) * r * 0.866;
      const pts = Array.from({ length: 6 }, (_, k) => `${x + r * 0.92 * Math.cos((k * Math.PI) / 3)},${y + r * 0.92 * Math.sin((k * Math.PI) / 3)}`).join(" ");
      cellules.push(<polygon key={`${ligne}-${col}`} points={pts} fill="#E39A22" stroke="#C47A0A" strokeWidth={8} />);
    }
  }
  return <g>{cellules}</g>;
};

const Volcan = ({ n }: { n: number }) => (
  <g>
    <path d={`M -40 ${TABLE_Y} L 380 640 L 470 610 L 610 610 L 700 640 L 1120 ${TABLE_Y} Z`} fill="#3D1B12" />
    <path d="M 470 610 L 610 610 L 590 640 L 490 640 Z" fill="#FF7A2A" />
    <path d={`M 520 640 C 500 760 430 860 300 ${TABLE_Y}`} fill="none" stroke="#FF5A14" strokeWidth={18} strokeLinecap="round" />
    <path d={`M 570 640 C 610 790 720 930 880 ${TABLE_Y}`} fill="none" stroke="#FF8A2A" strokeWidth={14} strokeLinecap="round" />
    {[0, 1, 2].map((i) => {
      const age = (n * 0.9 + i / 3) % 1;
      return <circle key={i} cx={540 + (i - 1) * 50} cy={600 - age * 90} r={12 * (1 - age)} fill="#FFB347" />;
    })}
  </g>
);

// L'expérience de la goutte de brai : entonnoir, cloche, bécher, une goutte en attente
const Entonnoir = () => (
  <g>
    <rect x={892} y={600} width={14} height={TABLE_Y - 600} fill="#2A231D" />
    <rect x={820} y={TABLE_Y - 18} width={190} height={18} fill="#2A231D" />
    <path d="M 760 690 L 1040 690 L 912 850 L 912 900 L 888 900 L 888 850 Z" fill="#14100D" stroke="#CFC6B8" strokeWidth={6} />
    <path d="M 888 900 C 880 950 920 950 912 900 Z" fill="#14100D" />
    <ellipse cx={900} cy={952} rx={20} ry={30} fill="#14100D" />
    <rect x={830} y={1030} width={140} height={TABLE_Y - 1048} fill="none" stroke="#CFC6B8" strokeWidth={6} />
    <path d="M 740 1150 L 740 700 C 740 560 1060 560 1060 700 L 1060 1150" fill="none" stroke="#CFC6B8" strokeWidth={5} opacity={0.6} />
  </g>
);

// Abaissé pour que l'arche reste sous l'étiquette du compteur
const Vitrail = () => (
  <g transform="translate(0 110)">
    <path d={`M 230 ${TABLE_Y} L 230 720 A 310 310 0 0 1 850 720 L 850 ${TABLE_Y} Z`} fill="#D8EBDD" stroke="#20352C" strokeWidth={16} />
    {[385, 540, 695].map((x) => (
      <line key={x} x1={x} y1={440} x2={x} y2={TABLE_Y} stroke="#20352C" strokeWidth={10} />
    ))}
    {[620, 760, 900, 1040].map((y) => (
      <line key={y} x1={230} y1={y} x2={850} y2={y} stroke="#20352C" strokeWidth={10} />
    ))}
    {[
      [235, 625, "#9BCBB3"],
      [545, 765, "#E7C77A"],
      [390, 905, "#A9C9E3"],
      [700, 1045, "#9BCBB3"],
    ].map(([x, y, c]) => (
      <rect key={`${x}-${y}`} x={Number(x)} y={Number(y)} width={145} height={130} fill={String(c)} opacity={0.75} />
    ))}
  </g>
);

const Banquise = () => (
  <g>
    <circle cx={850} cy={720} r={70} fill="#FFF3C4" />
    <path d={`M 0 980 L 160 960 L 260 990 L 520 970 L 760 985 L 1080 965 L 1080 ${TABLE_Y} L 0 ${TABLE_Y} Z`} fill="#FFFFFF" />
    <path d="M 0 1000 L 1080 1000" stroke="#B8D5E8" strokeWidth={6} />
    {[
      "M 120 1040 L 210 1080 L 260 1060",
      "M 760 1030 L 840 1090 L 950 1070",
      "M 380 1100 L 470 1130",
    ].map((d) => (
      <path key={d} d={d} fill="none" stroke="#7FB2D6" strokeWidth={6} strokeLinecap="round" />
    ))}
    <path d="M 0 900 L 90 870 L 200 905 L 200 980 L 0 980 Z" fill="#CFE4F2" />
  </g>
);

const MontagneSel = () => (
  <g>
    <path d={`M -40 ${TABLE_Y} C 120 760 360 560 560 600 C 780 640 960 820 1120 ${TABLE_Y} Z`} fill="#D9A79A" />
    {[0, 1, 2, 3].map((i) => (
      <path
        key={i}
        d={`M ${40 + i * 30} ${TABLE_Y - i * 20} C 200 ${880 - i * 70} 420 ${740 - i * 50} 560 ${760 - i * 45} C 740 ${790 - i * 40} 900 ${940 - i * 40} ${1050 - i * 30} ${TABLE_Y - i * 20}`}
        fill="none"
        stroke={i % 2 ? "#F3D9D0" : "#B97E70"}
        strokeWidth={22}
      />
    ))}
    {[
      [150, 1110, 46],
      [860, 1100, 56],
      [940, 1128, 32],
    ].map(([x, y, c]) => (
      <g key={x}>
        <rect x={x} y={y} width={c} height={c} fill="#FBEDE8" stroke="#B97E70" strokeWidth={4} transform={`rotate(12 ${x} ${y})`} />
      </g>
    ))}
  </g>
);

const Dome = () => (
  <g>
    <path d={`M -40 ${TABLE_Y} L -40 760 C 160 560 520 520 760 620 C 900 680 1000 800 1120 900 L 1120 ${TABLE_Y} Z`} fill="#7D7976" />
    <path d="M 640 600 C 600 760 640 900 600 1166" fill="none" stroke="#55514E" strokeWidth={8} />
    <path d="M 240 640 C 280 780 230 940 270 1166" fill="none" stroke="#55514E" strokeWidth={6} />
    {GRAINS.slice(0, 40).map((g, i) => (
      <circle key={i} cx={g.x * 1080} cy={640 + g.y * 500} r={g.r} fill={g.c > 0.5 ? "#C9C3BD" : "#3A3634"} opacity={0.8} />
    ))}
  </g>
);

// Cellules de convection : le manteau tourne lentement
const Convection = ({ t, opacite }: { t: number; opacite: number }) => (
  <g opacity={opacite} fill="none" stroke="#7E2306" strokeWidth={24} strokeLinecap="round" strokeDasharray="70 60">
    {[
      [260, 860, 1],
      [820, 860, -1],
    ].map(([x, y, sens]) => (
      <ellipse key={x} cx={x} cy={y} rx={210} ry={150} strokeDashoffset={sens * t * 90} />
    ))}
  </g>
);

const Decors: Record<string, FC<{ n: number; t: number }>> = {
  eau: () => <Carrelage />,
  huile: () => <Olivier />,
  miel: () => <Alveoles />,
  lave: ({ n }) => <Volcan n={n} />,
  brai: () => <Entonnoir />,
  verre: () => <Vitrail />,
  glace: () => <Banquise />,
  sel: () => <MontagneSel />,
  granit: () => <Dome />,
  manteau: ({ t }) => <Convection t={t} opacite={1} />,
};

// La carafe, dessinée debout, bec à l'origine ; la matière dedans reste à l'angle du versement
const Carafe = ({ angle, couleur, fige }: { angle: number; couleur: string; fige: number }) => (
  <g transform={`translate(${LEVRE_X} ${LEVRE_Y}) rotate(${angle}) scale(${ECHELLE_CARAFE})`}>
    <defs>
      <clipPath id="thick-carafe">
        <path d="M -24 12 L -200 12 L -200 210 Q -200 240 -170 240 L -48 240 Q -18 240 -18 210 L -18 40 Z" />
      </clipPath>
    </defs>
    <path d="M -238 50 C -290 60 -290 180 -238 190" fill="none" stroke="#33302C" strokeWidth={22} />
    <path d="M -24 12 L -200 12 L -200 210 Q -200 240 -170 240 L -48 240 Q -18 240 -18 210 L -18 40 Z" fill="#FFFFFF" opacity={0.35} />
    <g clipPath="url(#thick-carafe)">
      <g transform={`rotate(${-INCLINAISON})`}>
        <rect x={-500} y={10} width={1000} height={600} fill={couleur} />
        {fige > 0 && <rect x={-500} y={10} width={1000} height={12} fill={fonce(couleur, 0.25)} opacity={fige} />}
      </g>
    </g>
    <path d="M -2 0 L -24 12 L -200 12 L -200 210 Q -200 240 -170 240 L -48 240 Q -18 240 -18 210 L -18 40 Z" fill="none" stroke="#33302C" strokeWidth={10} strokeLinejoin="round" />
    <rect x={-212} y={2} width={198} height={14} rx={7} fill="#33302C" />
  </g>
);

const Verre = ({ n, couleur, t }: { n: number; couleur: string; t: number }) => {
  const s = surfaceY(n);
  const contour = `M ${VERRE_X - DEMI_HAUT} ${VERRE_HAUT} L ${VERRE_X - DEMI_BAS} ${TABLE_Y} L ${VERRE_X + DEMI_BAS} ${TABLE_Y} L ${VERRE_X + DEMI_HAUT} ${VERRE_HAUT}`;
  const ds = demiLargeurA(s);
  const granite = presence("granit", n);
  const lave = presence("lave", n);
  return (
    <g>
      <path d={`${contour} Z`} fill="#FFFFFF" opacity={0.3} />
      <path d={`M ${VERRE_X - ds} ${s} L ${VERRE_X - DEMI_BAS} ${TABLE_Y} L ${VERRE_X + DEMI_BAS} ${TABLE_Y} L ${VERRE_X + ds} ${s} Z`} fill={couleur} />
      <ellipse cx={VERRE_X} cy={s} rx={ds} ry={14} fill={interpolateColors(0.25, [0, 1], [couleur, "#FFFFFF"])} />
      {granite > 0 &&
        GRAINS.slice(40).map((g, i) => (
          <circle key={i} cx={VERRE_X - DEMI_BAS + 8 + g.x * (DEMI_BAS * 2 - 16)} cy={s + 12 + g.y * (TABLE_Y - s - 20)} r={g.r * 0.8} fill={g.c > 0.5 ? "#D9D3CC" : "#2F2B29"} opacity={granite} />
        ))}
      {lave > 0 && (
        <path
          d={`M ${VERRE_X - 90} ${s + 40} L ${VERRE_X - 20} ${s + 70} L ${VERRE_X + 40} ${s + 50} L ${VERRE_X + 95} ${s + 90}`}
          fill="none"
          stroke="#FFD166"
          strokeWidth={8}
          opacity={lave * (0.6 + 0.4 * Math.sin(t * 6))}
        />
      )}
      <path d={contour} fill="none" stroke="#2B2F33" strokeWidth={9} strokeLinejoin="round" />
      <path d={`M ${VERRE_X - DEMI_HAUT + 26} ${VERRE_HAUT + 30} L ${VERRE_X - DEMI_BAS + 22} ${TABLE_Y - 30}`} stroke="#FFFFFF" strokeWidth={10} opacity={0.5} strokeLinecap="round" />
    </g>
  );
};

// Le filet : de plus en plus large et lent, il casse au brai et ne laisse qu'une goutte au bec
const Filet = ({ n, couleur }: { n: number; couleur: string }) => {
  const s = surfaceY(n);
  if (n >= PAS_FIGE) {
    return null;
  }
  const largeur = Math.min(10 + 3 * n, 56);
  const casse = entre(n, 20.5, PAS_FIGE);
  const bas = s - (s - LEVRE_Y - 10) * casse;
  const haut = LEVRE_Y + 4;
  const decalage = avancee(n) % 70;
  const enroulement = presence("miel", n) + presence("lave", n) * (1 - casse);
  return (
    <g>
      <rect x={LEVRE_X - largeur / 2} y={haut} width={largeur} height={Math.max(bas - haut, 0)} rx={largeur / 2} fill={couleur} />
      {casse < 0.95 &&
        Array.from({ length: 8 }, (_, i) => {
          const y = haut + i * 70 + decalage;
          return y < bas - 10 ? <rect key={i} x={LEVRE_X - largeur / 2 + 3} y={y} width={largeur - 6} height={10} rx={5} fill={fonce(couleur, 0.18)} /> : null;
        })}
      {enroulement > 0 &&
        [0, 1, 2].map((i) => (
          <ellipse key={i} cx={LEVRE_X + Math.sin(n * 3 + i) * 10} cy={s - 6 - i * largeur * 0.55} rx={largeur * 1.3 - i * 8} ry={largeur * 0.38} fill={couleur} stroke={fonce(couleur, 0.2)} strokeWidth={4} opacity={enroulement} />
        ))}
    </g>
  );
};

// La goutte de brai, accrochée au bec : elle s'allonge à peine, puis fige
const Goutte = ({ n, couleur, angle }: { n: number; couleur: string; angle: number }) => {
  const apparition = entre(n, 21.5, PAS_FIGE);
  if (apparition <= 0) {
    return null;
  }
  const longueur = 26 + 46 * entre(n, PAS_FIGE, 31);
  const r = 16 + 4 * entre(n, PAS_FIGE, 31);
  return (
    <g transform={`rotate(${angle - INCLINAISON} ${LEVRE_X} ${LEVRE_Y})`} opacity={apparition}>
      <path d={`M ${LEVRE_X - 10} ${LEVRE_Y} C ${LEVRE_X - 12} ${LEVRE_Y + longueur * 0.6} ${LEVRE_X - r} ${LEVRE_Y + longueur} ${LEVRE_X} ${LEVRE_Y + longueur + r} C ${LEVRE_X + r} ${LEVRE_Y + longueur} ${LEVRE_X + 12} ${LEVRE_Y + longueur * 0.6} ${LEVRE_X + 10} ${LEVRE_Y} Z`} fill={couleur} />
    </g>
  );
};

const Cuisine = ({ n, t, fondu }: { n: number; t: number; fondu: number }) => {
  const couleur = couleurMatiere(n);
  const angle = INCLINAISON + 77 * lisse(entre(n, 25, 44));
  const fige = entre(n, PAS_FIGE, 26);
  const table = tableA(n);
  return (
    <g>
      <g opacity={fondu}>
        {Object.entries(Decors).map(([cle, Decor]) => {
          const p = presence(cle, n);
          return p > 0 ? (
            <g key={cle} opacity={p}>
              <Decor n={n} t={t} />
            </g>
          ) : null;
        })}
        <rect x={0} y={TABLE_Y} width={1080} height={1920 - TABLE_Y} fill={table} />
        <rect x={0} y={TABLE_Y} width={1080} height={22} fill={interpolateColors(0.25, [0, 1], [table, "#FFFFFF"])} />
      </g>
      <Verre n={n} couleur={couleur} t={t} />
      <Filet n={n} couleur={couleur} />
      <Carafe angle={angle} couleur={couleur} fige={fige} />
      <Goutte n={n} couleur={couleur} angle={angle} />
    </g>
  );
};

const Terre = ({ t }: { t: number }) => {
  const cx = SOMMET_X;
  const cy = SOMMET_Y + RAYON_TERRE;
  const flux = entre(t, calcul.t_flux, calcul.t_flux + 0.8) * (1 - entre(t, calcul.t_retour, calcul.t_retour + 0.6));
  const glisse = 2.2 * lisse(entre(t, calcul.t_flux, calcul.t_retour));
  const plaques = [-30, -12, 7, 26];
  return (
    <g>
      <circle cx={cx} cy={cy} r={RAYON_TERRE} fill="#4A2A1C" />
      <circle cx={cx} cy={cy} r={RAYON_TERRE - 24} fill="#D9531A" />
      <g fill="none" stroke="#A8380C" strokeWidth={30} strokeLinecap="round" strokeDasharray="90 70">
        {[-24, 0, 24].map((a, i) => {
          const rad = ((a - 90) * Math.PI) / 180;
          const x = cx + Math.cos(rad) * (RAYON_TERRE - 260);
          const y = cy + Math.sin(rad) * (RAYON_TERRE - 260);
          return <ellipse key={a} cx={x} cy={y} rx={190} ry={150} transform={`rotate(${a} ${x} ${y})`} strokeDashoffset={(i % 2 ? 1 : -1) * t * (40 + 160 * flux)} />;
        })}
      </g>
      <circle cx={cx} cy={cy} r={RAYON_TERRE * 0.55} fill="#F2A23A" />
      <circle cx={cx} cy={cy} r={RAYON_TERRE * 0.2} fill="#FFE08A" />
      {/* Jointures des plaques, qui s'écartent quand « ça coule encore » */}
      {plaques.map((a, i) => (
        <g key={a} transform={`rotate(${a + (i % 2 ? glisse : -glisse)} ${cx} ${cy})`}>
          <rect x={cx - 7} y={SOMMET_Y - 6} width={14} height={34} fill="#140E0B" />
        </g>
      ))}
      {flux > 0 &&
        [-21, 16].map((a, i) => (
          <g key={a} transform={`rotate(${a} ${cx} ${cy})`} opacity={flux}>
            <path
              d={`M ${cx - 70} ${SOMMET_Y - 46} L ${cx + 50} ${SOMMET_Y - 46} L ${cx + 50} ${SOMMET_Y - 66} L ${cx + 90} ${SOMMET_Y - 40} L ${cx + 50} ${SOMMET_Y - 14} L ${cx + 50} ${SOMMET_Y - 34} L ${cx - 70} ${SOMMET_Y - 34} Z`}
              fill="#FFD166"
              transform={i === 0 ? `rotate(180 ${cx} ${SOMMET_Y - 40})` : undefined}
            />
          </g>
        ))}
    </g>
  );
};

export const SceneThick = ({ t }: SceneProps) => {
  const n = pasDecor(t);
  const palette = paletteA(t);
  const r = recul(t);

  if (r <= 0) {
    return (
      <AbsoluteFill style={{ backgroundColor: palette.fond }}>
        <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
          <Cuisine n={n} t={t} fondu={1} />
        </svg>
      </AbsoluteFill>
    );
  }

  // Caméra : on recule du verre jusqu'à la Terre entière, zoom géométrique
  const zoom = Math.pow(1 / ECHELLE_VERRE, 1 - r);
  const ancreX = interpolate(r, [0, 1], [VERRE_X, SOMMET_X]);
  const ancreY = interpolate(r, [0, 1], [TABLE_Y, SOMMET_Y]);
  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <g transform={`translate(${ancreX} ${ancreY}) scale(${zoom}) translate(${-SOMMET_X} ${-SOMMET_Y})`}>
          <g opacity={entre(r, 0.04, 0.22)}>
            <Terre t={t} />
          </g>
          <g transform={`translate(${SOMMET_X} ${SOMMET_Y}) scale(${ECHELLE_VERRE}) translate(${-VERRE_X} ${-TABLE_Y})`}>
            <Cuisine n={n} t={t} fondu={1 - entre(r, 0, 0.12)} />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
