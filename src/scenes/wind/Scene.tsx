import React from "react";
import { AbsoluteFill, interpolate, interpolateColors } from "remotion";
import calcul from "../../../sujets/wind.calcul.json";
import type { SceneProps } from "../../cadre/types";
import { BRULANT, entre, lisse, paletteA, pasDecor } from "./temps";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Y_SOL = 1130;
const Y_CORDE = 640;
const X_POTEAU_G = 150;
const X_POTEAU_D = 930;
const X_PINCE = 540;
const LARGEUR = 1080;

const BOIS = "#5A4632";
const BOIS_CLAIR = "#B88A52";
const ROUGE = "#D63A2E";
const CREME = "#F6F0DF";

const hachage = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const pasDe = (cle: string) => calcul.paliers.find((p) => p.cle === cle)?.pas ?? 0;

// Un objet ancré tremble, s'arrache au pas donné, traverse l'écran vers la droite
const Envol: React.FC<{
  n: number;
  t: number;
  a: number;
  x: number;
  y: number;
  tour: number;
  arc?: number;
  children: React.ReactNode;
}> = ({ n, t, a, x, y, tour, arc = 260, children }) => {
  const p = entre(n, a, a + 2.4);
  if (p >= 1) {
    return null;
  }
  const secousse = Math.sin(t * 22 + x) * 3 * entre(n, a - 3, a) * (1 - p);
  const dx = 1900 * p * p;
  const dy = -arc * Math.sin(p * Math.PI);
  return (
    <g transform={`translate(${x + dx} ${y + dy}) rotate(${secousse + tour * p})`}>{children}</g>
  );
};

// Un objet venu d'ailleurs traverse l'écran de gauche à droite autour de son palier
const Passage: React.FC<{
  n: number;
  a: number;
  avant: number;
  apres: number;
  y: number;
  tour?: number;
  children: React.ReactNode;
}> = ({ n, a, avant, apres, y, tour = 0, children }) => {
  const p = entre(n, a - avant, a + apres);
  if (p <= 0 || p >= 1) {
    return null;
  }
  return <g transform={`translate(${-420 + p * 1920} ${y}) rotate(${tour * p})`}>{children}</g>;
};

const Arbre: React.FC = () => (
  <g>
    <path d="M-60 0 L-30 50 L0 18 L34 56 L64 0 Z" fill="#6B4A2C" />
    <rect x={-26} y={-250} width={52} height={256} fill="#6B4A2C" />
    <circle cx={-80} cy={-290} r={110} fill="#3F8A3F" />
    <circle cx={80} cy={-300} r={120} fill="#4C9C48" />
    <circle cx={0} cy={-400} r={130} fill="#57AB50" />
  </g>
);

const Toit: React.FC = () => <polygon points="-185,0 0,-130 185,0" fill="#B5472F" />;

const Murs: React.FC = () => (
  <g>
    <rect x={-160} y={-220} width={320} height={220} fill="#F2E3C6" />
    <rect x={-120} y={-180} width={76} height={70} fill="#7CC4E4" />
    <rect x={44} y={-180} width={76} height={70} fill="#7CC4E4" />
    <rect x={-36} y={-100} width={72} height={100} fill="#6B4226" />
  </g>
);

const Planche: React.FC = () => (
  <g fill="#E9DFC8">
    <polygon points="-20,-108 0,-132 20,-108 20,0 -20,0" />
  </g>
);

const Serviette: React.FC = () => (
  <g>
    <rect x={-80} y={0} width={160} height={210} fill="#E8B23A" />
    <rect x={-80} y={150} width={160} height={24} fill="#F6F0DF" />
  </g>
);

const Tshirt: React.FC = () => (
  <path d="M-46 0 L46 0 L120 44 L92 96 L66 80 L66 220 L-66 220 L-66 80 L-92 96 L-120 44 Z" fill="#3A8FB7" />
);

const Parapluie: React.FC<{ retourne: number }> = ({ retourne }) => {
  const c = interpolate(retourne, [0, 1], [-120, 90]);
  return (
    <g>
      <path d={`M-130 0 Q0 ${c * 1.6} 130 0 Q65 ${c * 0.3} 0 0 Q-65 ${c * 0.3} -130 0 Z`} fill="#D63A2E" />
      <rect x={-5} y={-4} width={10} height={160} fill="#2A2A2A" />
      <path d="M5 156 a18 18 0 0 1 -36 0" fill="none" stroke="#2A2A2A" strokeWidth={10} />
    </g>
  );
};

const Voiture: React.FC = () => (
  <g>
    <path d="M-150 40 C-146 8 -112 2 -78 -2 L-36 -52 C-28 -62 -16 -66 -2 -66 L58 -66 C74 -66 84 -60 92 -48 L116 -2 C134 2 142 18 140 40 Z" fill="#2F7D5B" />
    <path d="M-64 -4 L-30 -44 L18 -44 L18 -4 Z" fill="#BFE6F5" />
    <path d="M32 -4 L32 -44 L60 -44 C70 -44 76 -40 80 -32 L94 -4 Z" fill="#BFE6F5" />
    <circle cx={-86} cy={48} r={32} fill="#22262C" />
    <circle cx={76} cy={48} r={32} fill="#22262C" />
  </g>
);

const Vache: React.FC = () => (
  <g>
    <rect x={-120} y={-60} width={220} height={110} rx={36} fill={CREME} />
    <circle cx={-50} cy={-20} r={30} fill="#22262C" />
    <circle cx={50} cy={20} r={24} fill="#22262C" />
    <rect x={90} y={-96} width={80} height={72} rx={22} fill={CREME} />
    <rect x={132} y={-62} width={48} height={40} rx={16} fill="#E9A9A0" />
    <rect x={100} y={-120} width={14} height={30} fill="#D7C9A8" />
    <rect x={146} y={-120} width={14} height={30} fill="#D7C9A8" />
    {[-96, -50, 40, 80].map((x) => (
      <rect key={x} x={x} y={44} width={22} height={64} fill={CREME} />
    ))}
  </g>
);

const Neptune: React.FC = () => (
  <g>
    <circle r={270} fill="#3B74E6" />
    <path d="M-262 -66 Q0 -112 262 -66 L256 -30 Q0 -72 -256 -30 Z" fill="#6A9AF2" />
    <path d="M-268 60 Q0 18 268 60 L258 104 Q0 62 -258 104 Z" fill="#2A5CC4" />
    <ellipse cx={-70} cy={150} rx={64} ry={24} fill="#1F49A0" />
  </g>
);

const Avion: React.FC = () => (
  <g>
    <path d="M-220 -14 L150 -18 L240 0 L150 18 L-220 14 Z" fill="#1B1E26" />
    <polygon points="-90,12 30,12 -130,92 -176,92" fill="#2A2E38" />
    <polygon points="-180,-14 -116,-14 -190,-110 -226,-110" fill="#2A2E38" />
    <path d="M-262 -8 L-220 -8 L-220 8 L-262 8 Z" fill="#FFD23F" />
  </g>
);

const Station: React.FC = () => (
  <g>
    <rect x={-180} y={-8} width={360} height={16} fill="#D7DDE5" />
    <rect x={-44} y={-30} width={88} height={60} rx={12} fill="#EEF1F5" />
    <rect x={-290} y={-72} width={110} height={144} fill="#2E5AA8" />
    <rect x={180} y={-72} width={110} height={144} fill="#2E5AA8" />
    {[-254, -218, 216, 252].map((x) => (
      <rect key={x} x={x} y={-72} width={4} height={144} fill="#D7DDE5" />
    ))}
  </g>
);

const SEGMENTS = 14;
const L_SEGMENT = 19;

const Chaussette: React.FC<{ angle: number; lent: number; vif: number; t: number; brule: number }> = ({
  angle,
  lent,
  vif,
  t,
  brule,
}) => {
  const spine: { x: number; y: number; a: number }[] = [{ x: 0, y: 0, a: angle }];
  for (let i = 1; i <= SEGMENTS; i++) {
    const part = i / SEGMENTS;
    const a =
      angle + lent * 11 * Math.sin(t * 3 + i * 0.55) * part + vif * 5 * Math.sin(t * 46 + i * 0.9) * part;
    const r = (a * Math.PI) / 180;
    const prec = spine[i - 1];
    spine.push({ x: prec.x + Math.sin(r) * L_SEGMENT, y: prec.y + Math.cos(r) * L_SEGMENT, a });
  }
  const bord = (i: number, cote: number) => {
    const p = spine[i];
    const r = (p.a * Math.PI) / 180;
    const pied = cote > 0 ? Math.max(0, i - 9) * 15 : 0;
    const bout = i === SEGMENTS ? 0.65 : 1;
    const demi = (46 + pied) * bout;
    return { x: p.x + Math.cos(r) * demi * cote, y: p.y - Math.sin(r) * demi * cote };
  };
  const contour = [
    ...spine.map((_, i) => bord(i, 1)),
    ...spine.map((_, i) => bord(SEGMENTS - i, -1)),
  ]
    .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const bande = (i: number, couleur: string) => {
    const a = bord(i, 1);
    const b = bord(i + 1, 1);
    const c = bord(i + 1, -1);
    const d = bord(i, -1);
    return (
      <polygon key={i} points={`${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y} ${d.x},${d.y}`} fill={couleur} />
    );
  };
  return (
    <g>
      {brule > 0 ? (
        <polygon points={contour} fill="none" stroke="#FFE14A" strokeWidth={18} strokeLinejoin="round" opacity={brule} />
      ) : null}
      <polygon points={contour} fill={ROUGE} />
      {bande(0, CREME)}
      {bande(3, CREME)}
      {bande(6, CREME)}
    </g>
  );
};

const Trait: React.FC<{ i: number; t: number; vitesse: number; longueur: number; sens: number; couleur: string; opacite: number }> = ({
  i,
  t,
  vitesse,
  longueur,
  sens,
  couleur,
  opacite,
}) => {
  const tour = LARGEUR + longueur + 200;
  const d = (hachage(i, 1) * tour + t * vitesse * (0.8 + hachage(i, 2) * 0.5)) % tour;
  const x = sens > 0 ? d - longueur - 100 : LARGEUR + 100 - d;
  const y = 520 + hachage(i, 3) * 640;
  return <rect x={x} y={y} width={longueur} height={5 + hachage(i, 4) * 5} fill={couleur} opacity={opacite} />;
};

export const SceneWind: React.FC<SceneProps> = ({ t }) => {
  const n = pasDecor(t);
  const palette = paletteA(t);
  const { t_limite, t_coupe, t_pince, t_retour, t_fin } = calcul;

  // Air : le ciel s'arrache par la droite, le noir apparaît derrière
  const arrachage = t < t_retour && t >= t_limite - 0.6 ? entre(t, t_limite - 0.4, t_limite + 0.9) : -1;
  const bordCiel = lisse(Math.max(arrachage, 0)) * 1500;
  const pointsCiel = [
    ...Array.from({ length: 27 }, (_, i) => {
      const y = (i * 1920) / 26;
      return `${bordCiel + Math.sin(i * 1.3 + t * 2) * 36 - 40},${y}`;
    }),
    `${LARGEUR + 1600},1920`,
    `${LARGEUR + 1600},0`,
  ].join(" ");
  const etoiles = entre(t, t_limite - 0.2, t_limite + 1) * (1 - entre(t, t_retour, t_retour + 0.4));

  // Traits de vent
  const presence = t >= t_coupe && t < t_retour ? 0 : entre(n, 0, 6) * 0.35 + 0.25;
  const sens = t >= t_retour ? -1 : 1;
  const nbLents = Math.round(interpolate(n, [0, 12, 30], [5, 10, 14], borne));
  const nbVifs = Math.round(interpolate(n, [14, 30, 50], [0, 12, 26], borne));
  const longLent = interpolate(n, [0, 16, 30], [70, 240, 460], borne);
  const longVif = interpolate(n, [14, 30, 50], [260, 640, 980], borne);
  const couleurTrait = palette.encre;

  // Chaussette
  const angleVent = interpolate(n, [0, 7, 13], [8, 42, 86], borne);
  const chute = lisse(entre(t, t_coupe, t_coupe + 0.5));
  const balancement = t > t_coupe + 0.5 ? 9 * Math.exp(-(t - t_coupe - 0.5) * 1.8) * Math.sin((t - t_coupe) * 6) : 0;
  const angle =
    t < t_coupe
      ? angleVent
      : t < t_retour
        ? 86 * (1 - chute) + balancement
        : interpolate(t, [t_retour, t_fin], [0, 8], borne);
  const lent = t < t_coupe ? 1 - entre(n, 16, 24) : t < t_retour ? 0 : entre(t, t_retour, t_fin);
  const vif = t < t_coupe ? entre(n, 18, 30) : 0;
  const brule = t < t_coupe ? entre(n, 44, 48) : 0;

  // Gros plan sur la pince
  const zoom =
    1 + 0.75 * lisse(entre(t, t_pince - 0.3, t_pince + 0.4)) * (1 - lisse(entre(t, t_retour - 0.1, t_retour + 0.7)));

  const sol = interpolateColors(n, [0, 20, 27, 40, 50, 60], ["#6FB04F", "#8A8A48", "#7A6242", "#5A5048", "#3E2A28", "#2A2430"]);
  const herbe = 1 - entre(n, 20, 25);
  const ondeSon = entre(n, pasDe("son") - 0.2, pasDe("son") + 1.2);
  const choc = entre(n, pasDe("son") - 0.1, pasDe("son") + 0.2) * (1 - entre(n, 42, 44));
  const yStation = 800;
  const xStation = interpolate(n, [54.5, 57, 59.1, 60], [-420, 540, 540, 1600], borne);

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        {etoiles > 0
          ? Array.from({ length: 46 }, (_, i) => (
              <circle
                key={i}
                cx={hachage(i, 5) * LARGEUR}
                cy={hachage(i, 6) * Y_SOL}
                r={2 + hachage(i, 7) * 3}
                fill="#F4F1E6"
                opacity={etoiles}
              />
            ))
          : null}
        {arrachage >= 0 ? <polygon points={pointsCiel} fill={BRULANT.fond} /> : null}

        <Passage n={n} a={pasDe("neptune")} avant={2.6} apres={3.4} y={800}>
          <Neptune />
        </Passage>
        <Passage n={n} a={pasDe("avion")} avant={2.4} apres={2.6} y={830}>
          <Avion />
        </Passage>
        {xStation > -400 && xStation < 1500 ? (
          <g transform={`translate(${xStation} ${yStation})`}>
            <Station />
          </g>
        ) : null}

        <g transform={`translate(${X_PINCE} ${Y_CORDE}) scale(${zoom}) translate(${-X_PINCE} ${-Y_CORDE})`}>
          <rect x={-100} y={Y_SOL} width={1280} height={1000} fill={sol} />
          {herbe > 0
            ? Array.from({ length: 22 }, (_, i) => (
                <rect key={i} x={20 + i * 48} y={Y_SOL - 16} width={10} height={24} fill="#4E9A3C" opacity={herbe} />
              ))
            : null}

          <Envol n={n} t={t} a={pasDe("ouragan")} x={280} y={Y_SOL} tour={70}>
            <Murs />
          </Envol>
          <Envol n={n} t={t} a={pasDe("ouragan") - 2.5} x={280} y={Y_SOL - 220} tour={-120} arc={420}>
            <Toit />
          </Envol>
          <Envol n={n} t={t} a={pasDe("arbre")} x={800} y={Y_SOL} tour={85}>
            <Arbre />
          </Envol>
          {Array.from({ length: 18 }, (_, i) => (
            <Envol key={i} n={n} t={t} a={12 + (i / 18) * 8} x={40 + i * 60} y={Y_SOL + 6} tour={200 + i * 30} arc={140 + i * 12}>
              <Planche />
            </Envol>
          ))}

          <Passage n={n} a={pasDe("parapluie")} avant={1.4} apres={2} y={960} tour={35}>
            <Parapluie retourne={entre(n, pasDe("parapluie") - 0.7, pasDe("parapluie") + 0.1)} />
          </Passage>
          <Passage n={n} a={21} avant={1.2} apres={1.6} y={1000} tour={22}>
            <Voiture />
          </Passage>
          <Passage n={n} a={pasDe("record")} avant={1.6} apres={1.8} y={900} tour={380}>
            <Vache />
          </Passage>

          {ondeSon > 0 && ondeSon < 1
            ? [0, 1, 2].map((i) => (
                <circle
                  key={i}
                  cx={X_PINCE}
                  cy={Y_CORDE}
                  r={ondeSon * (1100 - i * 260)}
                  fill="none"
                  stroke="#F4F1E6"
                  strokeWidth={16}
                  opacity={1 - ondeSon}
                />
              ))
            : null}

          {[0, 1].map((i) => (
            <rect key={i} x={(i ? X_POTEAU_D : X_POTEAU_G) - 18} y={Y_CORDE - 30} width={36} height={Y_SOL - Y_CORDE + 34} fill={BOIS} />
          ))}
          <rect x={X_POTEAU_G} y={Y_CORDE - 3} width={X_POTEAU_D - X_POTEAU_G} height={6} fill="#2A2A2A" />

          <Envol n={n} t={t} a={5.5} x={320} y={Y_CORDE} tour={160} arc={120}>
            <Serviette />
          </Envol>
          <Envol n={n} t={t} a={9} x={780} y={Y_CORDE} tour={-140} arc={180}>
            <Tshirt />
          </Envol>

          {choc > 0 ? (
            <g opacity={choc} transform={`translate(${X_PINCE + 300} ${Y_CORDE + 24})`} fill="none" stroke="#F4F1E6" strokeWidth={10}>
              <path d="M-40 -230 L60 0 L-40 230" />
              <path d="M-130 -230 L-30 0 L-130 230" />
            </g>
          ) : null}

          <g transform={`translate(${X_PINCE} ${Y_CORDE + 18})`}>
            <Chaussette angle={angle} lent={lent} vif={vif} t={t} brule={brule} />
          </g>
          <rect x={X_PINCE - 12} y={Y_CORDE - 34} width={24} height={68} rx={6} fill={BOIS_CLAIR} />
          <rect x={X_PINCE - 15} y={Y_CORDE - 8} width={30} height={12} fill="#8C949C" />
        </g>

        {presence > 0
          ? Array.from({ length: nbLents }, (_, i) => (
              <Trait key={i} i={i} t={t} vitesse={1100} longueur={longLent} sens={sens} couleur={couleurTrait} opacite={presence} />
            ))
          : null}
        {presence > 0
          ? Array.from({ length: nbVifs }, (_, i) => (
              <Trait key={i} i={i + 200} t={t} vitesse={3400} longueur={longVif} sens={sens} couleur={couleurTrait} opacite={presence} />
            ))
          : null}
      </svg>
    </AbsoluteFill>
  );
};
