import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, random } from "remotion";
import calcul from "../../../sujets/paper.calcul.json";
import texte from "../../../sujets/paper.json";
import { ANTON } from "../../cadre/polices";
import type { SceneProps } from "../../cadre/types";
import { pliA } from "./index";

// Le monde est à l'échelle réelle : seule la pile est élargie pour rester visible
const BASE_X = 540;
const BASE_Y = 1120;
const HAUTEUR_PILE_PX = 580;
const PX_PAR_METRE_DEPART = 2400;
const LARGEUR_MIN_PX = 20;
const TABLE_M = 0.75;
const RAYON_TERRE_M = 6371000;
const UA_M = 149597870700;
const ANGLE_SOLEIL = (25 * Math.PI) / 180;

const ENCRE = "#1B1712";
const BOIS = "#B9783C";
const BOIS_SOMBRE = "#8C5526";

const metres = (cle: string) => calcul.paliers.find((p) => p.cle === cle)!.cible_m;
const hauteurA = (pli: number) => calcul.epaisseur_m * Math.pow(2, pli);
// La caméra s'approche tant que la feuille rétrécit, puis recule pour garder toute la pile
const echelleA = (pli: number) => Math.min(PX_PAR_METRE_DEPART * Math.pow(2, pli / 2), HAUTEUR_PILE_PX / hauteurA(pli));

type Point3 = [number, number, number];

// Vue en plongée : x vers la droite, y vers le fond, z vers le haut, en pixels
const projeter = ([x, y, z]: Point3): [number, number] => [BASE_X + x + 0.38 * y, BASE_Y - z - 0.42 * y];

const aire = (points: [number, number][]) =>
  points.reduce((somme, [x, y], i) => {
    const [x2, y2] = points[(i + 1) % points.length];
    return somme + x * y2 - x2 * y;
  }, 0);

// Faces d'un pavé, dans un ordre où une face visible a une aire négative à l'écran (y vers le bas)
const FACES = [
  { sommets: [4, 5, 6, 7], teinte: "dessus" },
  { sommets: [0, 3, 2, 1], teinte: "dessous" },
  { sommets: [0, 1, 5, 4], teinte: "avant" },
  { sommets: [2, 3, 7, 6], teinte: "arriere" },
  { sommets: [1, 2, 6, 5], teinte: "droite" },
  { sommets: [3, 0, 4, 7], teinte: "gauche" },
] as const;

type Teintes = Record<(typeof FACES)[number]["teinte"], string>;

const PAPIER: Teintes = {
  dessus: "#FFFDF6",
  dessous: "#CFC4AA",
  avant: "#EFE6D2",
  arriere: "#CFC4AA",
  droite: "#DDD2BA",
  gauche: "#DDD2BA",
};

const TABLE: Teintes = {
  dessus: BOIS,
  dessous: BOIS_SOMBRE,
  avant: BOIS_SOMBRE,
  arriere: BOIS_SOMBRE,
  droite: "#9C6330",
  gauche: "#9C6330",
};

const Pave: React.FC<{ coins: Point3[]; teintes: Teintes; trait?: number }> = ({ coins, teintes, trait = 4 }) => {
  const ecran = coins.map(projeter);
  return (
    <>
      {FACES.map(({ sommets, teinte }) => {
        const points = sommets.map((i) => ecran[i]);
        if (aire(points) >= 0) {
          return null;
        }
        return (
          <polygon
            key={teinte}
            points={points.map((p) => p.join(",")).join(" ")}
            fill={teintes[teinte]}
            stroke={ENCRE}
            strokeWidth={trait}
            strokeLinejoin="round"
          />
        );
      })}
    </>
  );
};

const boite = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number): Point3[] => [
  [x0, y0, z0],
  [x1, y0, z0],
  [x1, y1, z0],
  [x0, y1, z0],
  [x0, y0, z1],
  [x1, y0, z1],
  [x1, y1, z1],
  [x0, y1, z1],
];

const largeurApres = (plis: number) => calcul.largeur_m / Math.pow(2, Math.ceil(plis / 2));
const profondeurApres = (plis: number) => calcul.profondeur_m / Math.pow(2, Math.floor(plis / 2));

// La feuille se plie vraiment jusqu'au record, puis devient une aiguille
const Pile: React.FC<{ pli: number }> = ({ pli }) => {
  const s = echelleA(pli);
  const dernierPliReel = calcul.paliers[0].pli;
  if (pli >= dernierPliReel) {
    const w = Math.max(largeurApres(pli) * s, LARGEUR_MIN_PX);
    const d = Math.max(profondeurApres(pli) * s, LARGEUR_MIN_PX);
    const coins = boite(-w / 2, w / 2, -d / 2, d / 2, 0, HAUTEUR_PILE_PX);
    return <Pave coins={coins} teintes={PAPIER} />;
  }

  const n = Math.floor(pli);
  const e = pli - n;
  const w = largeurApres(n) * s;
  const d = profondeurApres(n) * s;
  const h = Math.max(hauteurA(n) * s, 7);
  const angle = Math.PI * e;
  const replierEnLargeur = n % 2 === 0;

  if (e < 1e-6) {
    return <Pave coins={boite(-w / 2, w / 2, -d / 2, d / 2, 0, h)} teintes={PAPIER} />;
  }

  const tourner = (radial: number, z: number): [number, number] => {
    const dz = z - h;
    return [radial * Math.cos(angle) - dz * Math.sin(angle), h + radial * Math.sin(angle) + dz * Math.cos(angle)];
  };

  if (replierEnLargeur) {
    const decalage = (w / 4) * e;
    const base = boite(-w / 2 + decalage, decalage, -d / 2, d / 2, 0, h);
    const [a, b, c, f] = [tourner(0, 0), tourner(w / 2, 0), tourner(w / 2, h), tourner(0, h)];
    const rabat: Point3[] = [
      [a[0] + decalage, -d / 2, a[1]],
      [b[0] + decalage, -d / 2, b[1]],
      [b[0] + decalage, d / 2, b[1]],
      [a[0] + decalage, d / 2, a[1]],
      [f[0] + decalage, -d / 2, f[1]],
      [c[0] + decalage, -d / 2, c[1]],
      [c[0] + decalage, d / 2, c[1]],
      [f[0] + decalage, d / 2, f[1]],
    ];
    return (
      <>
        <Pave coins={base} teintes={PAPIER} />
        <Pave coins={rabat} teintes={PAPIER} />
      </>
    );
  }

  const decalage = (d / 4) * e;
  const base = boite(-w / 2, w / 2, -d / 2 + decalage, decalage, 0, h);
  const [a, b, c, f] = [tourner(0, 0), tourner(d / 2, 0), tourner(d / 2, h), tourner(0, h)];
  const rabat: Point3[] = [
    [-w / 2, a[0] + decalage, a[1]],
    [w / 2, a[0] + decalage, a[1]],
    [w / 2, b[0] + decalage, b[1]],
    [-w / 2, b[0] + decalage, b[1]],
    [-w / 2, f[0] + decalage, f[1]],
    [w / 2, f[0] + decalage, f[1]],
    [w / 2, c[0] + decalage, c[1]],
    [-w / 2, c[0] + decalage, c[1]],
  ];
  return (
    <>
      <Pave coins={base} teintes={PAPIER} />
      <Pave coins={rabat} teintes={PAPIER} />
    </>
  );
};

// Les lattes sont serrées autour de la feuille : elles montrent que la caméra s'approche
const LATTES_M = [-0.62, -0.41, -0.24, -0.13, -0.066, -0.03, -0.012, 0.012, 0.03, 0.066, 0.13, 0.24, 0.41];

const Table: React.FC<{ s: number }> = ({ s }) => {
  const m = (v: number) => v * s;
  const pied = (x: number, y: number) => (
    <Pave
      key={`${x}-${y}`}
      coins={boite(m(x), m(x + 0.07), m(y), m(y + 0.07), -m(TABLE_M), -m(0.04))}
      teintes={TABLE}
      trait={3}
    />
  );
  return (
    <>
      {pied(-0.8, 0.38)}
      {pied(0.73, 0.38)}
      {pied(-0.8, -0.8)}
      {pied(0.73, -0.8)}
      <Pave coins={boite(m(-0.8), m(0.8), m(-0.8), m(0.45), -m(0.04), 0)} teintes={TABLE} trait={3} />
      {LATTES_M.map((y) => {
        const [x1, y1] = projeter([m(-0.8), m(y), 0]);
        const [x2, y2] = projeter([m(0.8), m(y), 0]);
        return <line key={y} x1={x1} y1={y1} x2={x2} y2={y2} stroke={BOIS_SOMBRE} strokeWidth={4} />;
      })}
    </>
  );
};

const IMMEUBLES = Array.from({ length: 14 }, (_, i) => ({
  x: -520 + i * 74 + random(`x${i}`) * 30,
  largeur: 34 + random(`l${i}`) * 34,
  hauteur: 30 + random(`h${i}`) * 90,
  teinte: i % 3 === 0 ? "#5E6F82" : i % 3 === 1 ? "#73859A" : "#4C5C6E",
}));

const Sol: React.FC<{ s: number; pli: number }> = ({ s, pli }) => {
  const solY = BASE_Y + TABLE_M * s;
  const rayonVrai = RAYON_TERRE_M * s;
  const couleur = interpolateColors(pli, [26, 31], ["#4C8C4A", "#2B6CB0"]);
  if (rayonVrai > 20000) {
    return <rect x={-10} y={solY} width={1100} height={Math.max(1930 - solY, 0)} fill={couleur} />;
  }
  const rayon = Math.max(rayonVrai, 30);
  return (
    <>
      <circle cx={BASE_X} cy={BASE_Y + rayon} r={rayon} fill={couleur} />
      {rayon > 200 ? (
        <>
          <ellipse cx={BASE_X - rayon * 0.3} cy={BASE_Y + rayon * 0.55} rx={rayon * 0.34} ry={rayon * 0.2} fill="#4C8C4A" />
          <ellipse cx={BASE_X + rayon * 0.42} cy={BASE_Y + rayon * 0.9} rx={rayon * 0.26} ry={rayon * 0.18} fill="#4C8C4A" />
        </>
      ) : null}
    </>
  );
};

const Maison: React.FC<{ s: number }> = ({ s }) => {
  const x = BASE_X + 16 * s;
  const y = BASE_Y + TABLE_M * s;
  const l = 11 * s;
  const h = 6 * s;
  if (h < 5) {
    return null;
  }
  return (
    <>
      <rect x={x} y={y - h} width={l} height={h} fill="#E9D8B4" stroke={ENCRE} strokeWidth={3} />
      <polygon points={`${x - l * 0.1},${y - h} ${x + l / 2},${y - h * 1.6} ${x + l * 1.1},${y - h}`} fill="#A63D2B" stroke={ENCRE} strokeWidth={3} />
    </>
  );
};

const Ville: React.FC<{ s: number }> = ({ s }) => {
  const y = BASE_Y + TABLE_M * s;
  return (
    <>
      {IMMEUBLES.map((b) => {
        const h = b.hauteur * s;
        if (h < 4 || Math.abs(b.x) < 60) {
          return null;
        }
        return <rect key={b.x} x={BASE_X + b.x * s} y={y - h} width={Math.max(b.largeur * s, 2)} height={h} fill={b.teinte} />;
      })}
    </>
  );
};

const Tour: React.FC<{ s: number }> = ({ s }) => {
  const haut = metres("eiffel") * s;
  if (haut < 6) {
    return null;
  }
  const x = BASE_X + 190 * s;
  const y = BASE_Y + TABLE_M * s;
  const P = (dx: number, dz: number) => `${x + dx * haut},${y - dz * haut}`;
  const silhouette = [
    P(-0.24, 0), P(-0.17, 0), P(-0.1, 0.18), P(0.1, 0.18), P(0.17, 0), P(0.24, 0),
    P(0.11, 0.3), P(0.06, 0.55), P(0.015, 0.92), P(0.008, 1), P(-0.008, 1), P(-0.015, 0.92), P(-0.06, 0.55), P(-0.11, 0.3),
  ].join(" ");
  return (
    <>
      <polygon points={silhouette} fill="#4A3B33" />
      <rect x={x - 0.13 * haut} y={y - 0.32 * haut} width={0.26 * haut} height={Math.max(0.018 * haut, 2)} fill="#4A3B33" />
      <rect x={x - 0.08 * haut} y={y - 0.57 * haut} width={0.16 * haut} height={Math.max(0.014 * haut, 2)} fill="#4A3B33" />
    </>
  );
};

const Montagne: React.FC<{ s: number; x: number; hauteur: number; demiBase: number; teinte: string }> = ({ s, x, hauteur, demiBase, teinte }) => {
  const h = hauteur * s;
  if (h < 6 || s > 1) {
    return null;
  }
  const cx = BASE_X + x * s;
  const y = BASE_Y + TABLE_M * s;
  const b = demiBase * s;
  const neige = 0.26;
  return (
    <>
      <polygon points={`${cx - b},${y} ${cx},${y - h} ${cx + b},${y}`} fill={teinte} />
      <polygon
        points={`${cx - b * neige},${y - h * (1 - neige)} ${cx},${y - h} ${cx + b * neige},${y - h * (1 - neige)} ${cx + b * 0.08},${y - h * (1 - neige * 0.7)} ${cx - b * 0.08},${y - h * (1 - neige * 0.7)}`}
        fill="#FFFDF6"
      />
    </>
  );
};

const NUAGES = [
  { x: -3200, z: 1900, l: 2600 },
  { x: 2600, z: 2600, l: 3400 },
  { x: -1100, z: 3400, l: 2100 },
  { x: 6400, z: 1400, l: 3000 },
];

const Nuages: React.FC<{ s: number }> = ({ s }) => (
  <>
    {NUAGES.map((n) => {
      const l = n.l * s;
      if (l < 16 || l > 2400) {
        return null;
      }
      const cx = BASE_X + n.x * s;
      const cy = BASE_Y - n.z * s;
      return (
        <g key={n.x} fill="#FFFDF6">
          <ellipse cx={cx} cy={cy} rx={l / 2} ry={l / 7} />
          <ellipse cx={cx - l * 0.14} cy={cy - l * 0.07} rx={l / 4.6} ry={l / 6.5} />
          <ellipse cx={cx + l * 0.16} cy={cy - l * 0.05} rx={l / 5.4} ry={l / 8} />
        </g>
      );
    })}
  </>
);

const Station: React.FC<{ s: number }> = ({ s }) => {
  const cx = BASE_X + 170000 * s;
  const cy = BASE_Y - metres("iss") * s;
  if (cy < -200 || cy > BASE_Y - 40) {
    return null;
  }
  return (
    <g fill="#E8E2D0">
      <rect x={cx - 92} y={cy - 7} width={184} height={14} />
      <rect x={cx - 26} y={cy - 16} width={52} height={32} />
      {[-92, -58, 38, 72].map((dx) => (
        <rect key={dx} x={cx + dx} y={cy - 54} width={22} height={108} fill="#FFC53D" />
      ))}
    </g>
  );
};

const Astre: React.FC<{
  s: number;
  altitude: number;
  decalage: number;
  rayonMin: number;
  rayonVrai: number;
  couleur: string;
  halo?: string;
  children?: React.ReactNode;
}> = ({ s, altitude, decalage, rayonMin, rayonVrai, couleur, halo, children }) => {
  const cx = BASE_X + decalage * s;
  const cy = BASE_Y - altitude * s;
  const r = Math.max(rayonVrai * s, rayonMin);
  const distance = Math.hypot(cx - BASE_X, cy - BASE_Y);
  const opacite = interpolate(distance, [40, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (cy < -r * 3 || opacite === 0) {
    return null;
  }
  return (
    <g opacity={opacite}>
      {halo ? (
        <>
          <circle cx={cx} cy={cy} r={r * 1.9} fill={halo} opacity={0.22} />
          <circle cx={cx} cy={cy} r={r * 1.42} fill={halo} opacity={0.4} />
        </>
      ) : null}
      <circle cx={cx} cy={cy} r={r} fill={couleur} />
      {children}
    </g>
  );
};

const ORBITES_UA = [1, 5.2, 9.58, 19.2, 30.07];

const SystemeSolaire: React.FC<{ s: number; pli: number }> = ({ s, pli }) => {
  const distance = metres("sun");
  const soleilX = BASE_X + Math.sin(ANGLE_SOLEIL) * distance * s;
  const soleilY = BASE_Y - Math.cos(ANGLE_SOLEIL) * distance * s;
  const neptune = metres("neptune");
  return (
    <>
      {ORBITES_UA.map((ua) => {
        const r = ua * UA_M * s;
        const opacite = interpolate(r, [40, 120, 1500, 2600], [0, 0.5, 0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return opacite > 0 ? (
          <circle key={ua} cx={soleilX} cy={soleilY} r={r} fill="none" stroke="#FFE9C2" strokeWidth={3} opacity={opacite} />
        ) : null;
      })}
      <Astre s={s} altitude={Math.cos(ANGLE_SOLEIL) * distance} decalage={Math.sin(ANGLE_SOLEIL) * distance} rayonMin={interpolate(pli, [50, 58], [84, 18], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} rayonVrai={696000000} couleur="#FFC53D" halo="#FF8A1F" />
      <Astre s={s} altitude={Math.cos(ANGLE_SOLEIL) * neptune} decalage={Math.sin(ANGLE_SOLEIL) * neptune} rayonMin={36} rayonVrai={24600000} couleur="#5BB7D6" halo="#2E7FA6" />
    </>
  );
};

const Etoiles: React.FC<{ pli: number }> = ({ pli }) => {
  const opacite = interpolate(pli, [31, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (opacite === 0) {
    return null;
  }
  return (
    <g opacity={opacite} fill="#F3EAD7">
      {Array.from({ length: 70 }, (_, i) => {
        const angle = random(`a${i}`) * Math.PI * 2;
        const phase = (random(`p${i}`) + pli * 0.11) % 1;
        // Chaque étoile file vers la base de la pile, comme tout le reste quand on recule
        const rayon = 1500 * Math.pow(2, -phase * 3.2);
        const r = 2 + random(`r${i}`) * 3;
        return <circle key={i} cx={BASE_X + Math.cos(angle) * rayon} cy={BASE_Y + Math.sin(angle) * rayon} r={r} opacity={Math.min(phase * 8, 1)} />;
      })}
    </g>
  );
};

// La lumière monte le long de la pile : un mois pour la gravir
const Lumiere: React.FC<{ t: number }> = ({ t }) => {
  const palier = calcul.paliers.find((p) => p.cle === "lumiere")!;
  const avance = interpolate(t, [palier.arrivee_s - 1, palier.arrivee_s + 2.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (avance === 0 || avance === 1) {
    return null;
  }
  const y = BASE_Y - HAUTEUR_PILE_PX * avance;
  return (
    <g>
      <rect x={BASE_X - 4} y={y} width={8} height={BASE_Y - y} fill="#FFE36B" />
      <circle cx={BASE_X} cy={y} r={26} fill="#FFE36B" opacity={0.35} />
      <circle cx={BASE_X} cy={y} r={13} fill="#FFFDF6" />
    </g>
  );
};

const Monde: React.FC<{ pli: number; t: number }> = ({ pli, t }) => {
  const s = echelleA(pli);
  const proxima = metres("proxima");
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <Etoiles pli={pli} />
      <SystemeSolaire s={s} pli={pli} />
      <Astre s={s} altitude={Math.cos(0.33) * proxima} decalage={Math.sin(0.33) * proxima} rayonMin={72} rayonVrai={0} couleur="#FF6A4D" halo="#FF3B1F" />
      <Astre s={s} altitude={metres("moon")} decalage={2.1e8} rayonMin={68} rayonVrai={1737400} couleur="#D9D4C5">
        <circle cx={BASE_X + 2.1e8 * s - 20} cy={BASE_Y - metres("moon") * s - 16} r={15} fill="#B4AE9D" />
        <circle cx={BASE_X + 2.1e8 * s + 24} cy={BASE_Y - metres("moon") * s + 18} r={10} fill="#B4AE9D" />
      </Astre>
      <Station s={s} />
      <Nuages s={s} />
      <g transform={`translate(0 ${interpolate(pli, [0, 8], [-170, 0], { extrapolateRight: "clamp" })})`}>
        <Montagne s={s} x={-9000} hauteur={6200} demiBase={5000} teinte="#6D7C8C" />
        <Montagne s={s} x={15000} hauteur={5400} demiBase={4000} teinte="#6D7C8C" />
        <Montagne s={s} x={7000} hauteur={metres("everest")} demiBase={6000} teinte="#54636F" />
        <Sol s={s} pli={pli} />
        <Ville s={s} />
        <Tour s={s} />
        <Maison s={s} />
        <Table s={s} />
        <Pile pli={pli} />
        <Lumiere t={t} />
      </g>
    </svg>
  );
};

const BANDE_X = 850;

const Atome: React.FC<{ t: number; etiquettes: { atome: string; papier: string } }> = ({ t, etiquettes }) => {
  const cx = 350;
  const cy = 820;
  const rayon = 230;
  const bande = Math.max(2 * rayon / calcul.ratio_atome, 4);
  const age = t - calcul.t_atome;
  const entree = interpolate(age, [0, 0.45], [2.6, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "#D6391F" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <rect x={BANDE_X - bande / 2} y={0} width={bande} height={1920} fill="#FFF6E6" />
        <g style={{ transformOrigin: `${cx}px ${cy}px`, scale: String(entree) }}>
          <circle cx={cx} cy={cy} r={rayon} fill="#FFF6E6" opacity={0.18} />
          {[0, 60, 120].map((angle) => (
            <ellipse
              key={angle}
              cx={cx}
              cy={cy}
              rx={rayon}
              ry={rayon * 0.36}
              fill="none"
              stroke="#FFF6E6"
              strokeWidth={7}
              transform={`rotate(${angle + age * 18} ${cx} ${cy})`}
            />
          ))}
          <circle cx={cx} cy={cy} r={26} fill="#1B1712" />
          <circle cx={cx + Math.cos(age * 5) * rayon} cy={cy + Math.sin(age * 5) * rayon * 0.36} r={15} fill="#1B1712" />
        </g>
      </svg>
      <div style={{ position: "absolute", left: cx - rayon, width: rayon * 2, top: cy + rayon + 24, textAlign: "center", fontFamily: ANTON, fontSize: 72, color: "#FFF6E6" }}>
        {etiquettes.atome}
      </div>
      <div style={{ position: "absolute", left: BANDE_X - 90, width: 180, top: cy + rayon + 24, textAlign: "center", fontFamily: ANTON, fontSize: 72, color: "#FFF6E6", backgroundColor: "#D6391F" }}>
        {etiquettes.papier}
      </div>
    </AbsoluteFill>
  );
};

export const ScenePaper: React.FC<SceneProps> = ({ t, langue }) => {
  const L = texte[langue];
  const finie = t >= calcul.t_fin;
  const fonduAtome = interpolate(t, [calcul.t_atome, calcul.t_atome + 0.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fonduFeuille = interpolate(t, [calcul.t_fin, calcul.t_fin + 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      {finie ? <Monde pli={0} t={0} /> : t < calcul.t_atome + 0.2 ? <Monde pli={pliA(t)} t={t} /> : null}
      {fonduAtome > 0 && fonduFeuille < 1 ? (
        <AbsoluteFill style={{ opacity: finie ? 1 - fonduFeuille : fonduAtome }}>
          <Atome t={t} etiquettes={{ atome: L.atome, papier: L.papier }} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
