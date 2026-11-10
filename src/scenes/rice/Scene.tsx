import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import calcul from "../../../sujets/rice.calcul.json";
import type { SceneProps } from "../../cadre/types";
import { ECHELLE_MAX, RAYON_ECRAN, echelle, partEntre, paletteA, pasCompteur, pasDecor } from "./temps";

const LARGEUR = 1080;
const HAUTEUR = 1920;
const CX = 540;
const CY = 720;

const RIZ = "#F6EEDC";
const RIZ_OMBRE = "#D9CBAC";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

const hachage = (i: number, k = 0) => {
  let n = Math.imul(i + 1, 374761393) + Math.imul(k + 1, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};

type Vue = { t: number; n: number; s: number };

// Un grain dessiné à l'échelle du monde : 6 mm de long
const Grain: React.FC<{ x: number; y: number; angle: number; longueur: number; opacite?: number }> = ({ x, y, angle, longueur, opacite = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle})`} opacity={opacite}>
    <ellipse rx={longueur / 2} ry={longueur / 6} fill="#FFF8E7" />
    <ellipse cx={longueur * 0.08} cy={longueur * 0.05} rx={longueur * 0.3} ry={longueur / 16} fill={RIZ_OMBRE} />
  </g>
);

const ANGLE_PREMIER = -20;

// Les premiers grains se posent un à un sur la case
const Grains: React.FC<Vue & { seconde: number; premier: boolean }> = ({ t, n, s, seconde, premier }) => {
  const visible = 1 - entre(n, 8, 9.2);
  if (visible <= 0) {
    return null;
  }
  const total = Math.min(Math.pow(2, seconde), 256);
  const age = (t + 0.5) % 1;
  return (
    <g opacity={visible}>
      {Array.from({ length: total }, (_, i) => {
        if (i === 0 && !premier) {
          return null;
        }
        const r = 0.0026 * Math.sqrt(i) * s * 1.5;
        const a = i * 2.39996;
        const neuf = i >= total / 2 && i > 0 ? Math.min(age / 0.22, 1) : 1;
        return (
          <Grain
            key={i}
            x={CX + Math.cos(a) * r}
            y={CY + Math.sin(a) * r}
            angle={i === 0 ? ANGLE_PREMIER : hachage(i, 1) * 180}
            longueur={0.006 * s * neuf}
          />
        );
      })}
    </g>
  );
};

const Tas: React.FC<Vue & { pas: number }> = ({ t, n, pas }) => {
  const visible = entre(n, 7.4, 8.8);
  if (visible <= 0) {
    return null;
  }
  const r = RAYON_ECRAN * Math.pow(2, Math.min((pas - n) / 3, 0.2));
  const age = (t + 0.5) % 1;
  return (
    <g opacity={visible}>
      <circle cx={CX + 16} cy={CY + 18} r={r + 4} fill="#000000" opacity={0.22} />
      <circle cx={CX} cy={CY} r={r} fill={RIZ_OMBRE} />
      <circle cx={CX} cy={CY} r={r * 0.9} fill={RIZ} />
      <circle cx={CX} cy={CY} r={r * 0.55} fill="#FBF5E8" />
      <circle cx={CX} cy={CY} r={r * 0.25} fill="#FFFCF2" />
      {Array.from({ length: 64 }, (_, k) => {
        // Les grains coulent du sommet vers le bord
        const phase = (hachage(k, 2) + n / 3) % 1;
        const a = hachage(k, 3) * Math.PI * 2;
        const d = Math.sqrt(phase) * r * 0.96;
        return (
          <ellipse
            key={k}
            cx={CX + Math.cos(a) * d}
            cy={CY + Math.sin(a) * d}
            rx={15}
            ry={5}
            fill={RIZ_OMBRE}
            opacity={Math.min(phase * 4, 1)}
            transform={`rotate(${(a * 180) / Math.PI + 90} ${CX + Math.cos(a) * d} ${CY + Math.sin(a) * d})`}
          />
        );
      })}
      {age < 0.5
        ? Array.from({ length: 14 }, (_, k) => {
            const a = (k / 14) * Math.PI * 2 + Math.floor(t) * 0.7;
            const d = r + age * 190;
            return <ellipse key={k} cx={CX + Math.cos(a) * d} cy={CY + Math.sin(a) * d} rx={13} ry={5} fill={RIZ} opacity={1 - age * 2} />;
          })
        : null}
    </g>
  );
};

// Un objet dessiné à la taille `dessin`, posé à sa vraie taille `metres` à côté du tas
const Objet: React.FC<Vue & { x: number; y: number; metres: number; dessin: number; children: React.ReactNode }> = ({ s, x, y, metres, dessin, children }) => {
  const k = (s * metres) / dessin;
  // Trop gros, l'objet n'est qu'une tache en bas de l'image : il n'apparaît qu'en approchant
  const opacite = 1 - entre(k, 3, 4.5);
  if (k < 0.04 || opacite <= 0) {
    return null;
  }
  return (
    <g opacity={opacite} transform={`translate(${CX + x * s} ${CY + y * s}) scale(${k})`}>
      {children}
    </g>
  );
};

const Damier: React.FC<{ s: number }> = ({ s }) => {
  const cote = 0.05 * s;
  if (cote < 3) {
    return null;
  }
  const gauche = CX - cote / 2;
  const haut = CY + cote / 2 - 8 * cote;
  return (
    <g>
      <rect x={CX - 0.6 * s} y={CY - 0.75 * s} width={1.7 * s} height={1.03 * s} fill="#A8743F" />
      <rect x={gauche - cote * 0.15} y={haut - cote * 0.15} width={cote * 8.3} height={cote * 8.3} fill="#3A2214" />
      {Array.from({ length: 64 }, (_, k) => {
        const c = k % 8;
        const l = Math.floor(k / 8);
        const sombre = (c + (7 - l)) % 2 === 0;
        return <rect key={k} x={gauche + c * cote} y={haut + l * cote} width={cote + 0.6} height={cote + 0.6} fill={sombre ? "#5A3522" : "#84532F"} />;
      })}
    </g>
  );
};

const Tasse = () => (
  <g>
    <rect x={120} y={-24} width={90} height={48} rx={20} fill="#E8E0D0" />
    <circle r={134} fill="#E8E0D0" />
    <circle r={112} fill="#B5301A" />
    <circle r={98} fill={RIZ} />
    {Array.from({ length: 22 }, (_, k) => (
      <ellipse key={k} cx={Math.cos(k * 2.4) * Math.sqrt(k) * 19} cy={Math.sin(k * 2.4) * Math.sqrt(k) * 19} rx={13} ry={5} fill={RIZ_OMBRE} transform={`rotate(${k * 40} ${Math.cos(k * 2.4) * Math.sqrt(k) * 19} ${Math.sin(k * 2.4) * Math.sqrt(k) * 19})`} />
    ))}
  </g>
);

const Sac = () => (
  <g>
    <path d="M-200 -120 Q0 -150 170 -120 L170 120 Q0 150 -200 120 Q-222 0 -200 -120 Z" fill="#C9A46B" />
    <path d="M170 -120 L216 -46 L216 46 L170 120 Z" fill="#A9834A" />
    <rect x={150} y={-90} width={22} height={180} fill="#6E4A32" />
    <rect x={-140} y={-132} width={36} height={264} fill="#B5301A" />
    <rect x={-88} y={-132} width={14} height={264} fill="#B5301A" />
  </g>
);

const Elephant: React.FC<{ t: number }> = ({ t }) => {
  const trompe = Math.sin(t * 3) * 26;
  return (
    <g>
      <path d="M-170 0 L-236 18" stroke="#6E6E78" strokeWidth={13} strokeLinecap="round" />
      <ellipse rx={176} ry={112} fill="#8E8E96" />
      <ellipse cx={140} cy={-104} rx={62} ry={78} fill="#73737D" />
      <ellipse cx={140} cy={104} rx={62} ry={78} fill="#73737D" />
      <circle cx={176} r={74} fill="#9A9AA2" />
      <path d={`M240 0 Q290 ${trompe} 262 ${trompe * 2}`} fill="none" stroke="#9A9AA2" strokeWidth={30} strokeLinecap="round" />
      <path d="M222 -32 L262 -44 M222 32 L262 44" stroke="#F4EFE6" strokeWidth={11} strokeLinecap="round" />
    </g>
  );
};

const Baleine: React.FC<{ t: number }> = ({ t }) => {
  const queue = Math.sin(t * 2.4) * 22;
  return (
    <g>
      <path d={`M-340 0 L-400 ${-70 + queue} L-372 ${queue} L-400 ${70 + queue} Z`} fill="#34526B" />
      <path d="M-350 -10 Q-120 -92 240 -88 Q420 -60 420 0 Q420 60 240 88 Q-120 92 -350 10 Z" fill="#3E5C76" />
      <path d="M80 -86 L10 -170 L-40 -84 Z" fill="#34526B" />
      <path d="M80 86 L10 170 L-40 84 Z" fill="#34526B" />
      <path d="M300 -18 L300 18" stroke="#1B2F40" strokeWidth={10} strokeLinecap="round" />
      {Array.from({ length: 9 }, (_, k) => (
        <circle key={k} cx={-200 + hachage(k, 4) * 400} cy={-50 + hachage(k, 5) * 100} r={9} fill="#5F7E98" />
      ))}
    </g>
  );
};

const COULEURS = ["#B5301A", "#2F6F8F", "#E0A42C", "#D9D5CC", "#4E8C3A"];

const Navire = () => (
  <g>
    <path d="M-552 -82 L420 -82 Q520 -60 552 0 Q520 60 420 82 L-552 82 Z" fill="#23282E" />
    <path d="M-530 -66 L410 -66 Q490 -48 520 0 Q490 48 410 66 L-530 66 Z" fill="#7A2E22" />
    {Array.from({ length: 19 }, (_, c) =>
      [0, 1, 2, 3].map((l) => (
        <rect key={`${c}-${l}`} x={-400 + c * 42} y={-58 + l * 29} width={38} height={25} fill={COULEURS[Math.floor(hachage(c * 4 + l, 6) * COULEURS.length)]} />
      )),
    )}
    <rect x={-500} y={-60} width={78} height={120} fill="#F0ECE4" />
    <rect x={-486} y={-44} width={18} height={88} fill="#2C3E50" />
  </g>
);

const Pyramide = () => (
  <g>
    <path d="M126 -126 L176 -60 L176 170 L-60 170 L-126 126 Z" fill="#000000" opacity={0.22} />
    <path d="M-126 -126 L126 -126 L0 0 Z" fill="#EBC06E" />
    <path d="M126 -126 L126 126 L0 0 Z" fill="#CC9A45" />
    <path d="M126 126 L-126 126 L0 0 Z" fill="#B3843A" />
    <path d="M-126 126 L-126 -126 L0 0 Z" fill="#DDAF5C" />
  </g>
);

// Trame du sol : elle rapetisse avec la caméra et donne la sensation de reculer
const Trame: React.FC<Vue & { cellule: number; de: number; a: number; dessin: (x: number, y: number, px: number, i: number, j: number) => React.ReactNode }> = ({ n, s, cellule, de, a, dessin }) => {
  const opacite = entre(n, de, de + 1.2) * (1 - entre(n, a - 1.2, a));
  const px = cellule * s;
  if (opacite <= 0 || px < 36) {
    return null;
  }
  const premier = (centre: number) => Math.floor(-centre / px) - 1;
  const iDe = premier(CX);
  const jDe = premier(CY);
  const colonnes = Math.ceil(LARGEUR / px) + 3;
  const lignes = Math.ceil(HAUTEUR / px) + 3;
  return (
    <g opacity={opacite}>
      {Array.from({ length: colonnes * lignes }, (_, k) => {
        const i = iDe + (k % colonnes);
        const j = jDe + Math.floor(k / colonnes);
        return <g key={k}>{dessin(CX + i * px, CY + j * px, px, i, j)}</g>;
      })}
    </g>
  );
};

const carreau = (x: number, y: number, px: number) => <rect x={x} y={y} width={px} height={px} fill="none" stroke="#5E3A22" strokeWidth={5} />;

const herbe = (x: number, y: number, px: number, i: number, j: number) => {
  const h = hachage(i * 131 + j, 7);
  const dx = x + h * px;
  const dy = y + hachage(i * 17 + j, 8) * px;
  return <path d={`M${dx - 16} ${dy} L${dx} ${dy - 22} L${dx + 16} ${dy}`} fill="none" stroke="#9C7A25" strokeWidth={7} strokeLinecap="round" />;
};

const vague = (x: number, y: number, px: number, i: number, j: number) => {
  const dx = x + hachage(i * 37 + j, 9) * px;
  const dy = y + hachage(i * 53 + j, 10) * px;
  return <path d={`M${dx - 34} ${dy} q17 -16 34 0 t34 0`} fill="none" stroke="#6FB4CC" strokeWidth={7} strokeLinecap="round" />;
};

const dune = (x: number, y: number, px: number, i: number, j: number) => {
  const dx = x + hachage(i * 41 + j, 11) * px;
  const dy = y + hachage(i * 29 + j, 12) * px;
  return <path d={`M${dx - 70} ${dy} q70 -36 140 0`} fill="none" stroke="#C99A4E" strokeWidth={8} strokeLinecap="round" />;
};

const parcelle = (couleurs: string[]) => (x: number, y: number, px: number, i: number, j: number) => (
  <rect x={x + 3} y={y + 3} width={px - 6} height={px - 6} fill={couleurs[Math.floor(hachage(i * 71 + j, 13) * couleurs.length)]} />
);

const riziere = parcelle(["#4E8C3A", "#5E9C47", "#6FAE50", "#3F7C4D", "#C7B24A"]);
const campagne = parcelle(["#2E4A36", "#35553E", "#3D5E44", "#27402F"]);

const Monde: React.FC<Vue & { pas: number; seconde: number; premier: boolean }> = (v) => {
  const { t, s } = v;
  return (
    <g>
      <Trame {...v} cellule={0.4} de={12} a={26} dessin={carreau} />
      <Trame {...v} cellule={2.4} de={24} a={31} dessin={herbe} />
      <Trame {...v} cellule={9} de={30} a={38} dessin={vague} />
      <Trame {...v} cellule={90} de={37} a={46} dessin={vague} />
      <Trame {...v} cellule={170} de={45} a={51} dessin={dune} />
      <Trame {...v} cellule={260} de={50} a={57} dessin={riziere} />
      <Trame {...v} cellule={1500} de={55} a={62} dessin={riziere} />
      <Trame {...v} cellule={7000} de={60} a={80} dessin={campagne} />
      <Damier s={s} />
      <Objet {...v} x={0} y={0.125} metres={0.107} dessin={300}>
        <Tasse />
      </Objet>
      <Objet {...v} x={0} y={0.62} metres={0.6} dessin={400}>
        <Sac />
      </Objet>
      <Objet {...v} x={0} y={4} metres={6} dessin={520}>
        <Elephant t={t} />
      </Objet>
      <Objet {...v} x={0} y={12.6} metres={30} dessin={830}>
        <Baleine t={t} />
      </Objet>
      <Objet {...v} x={0} y={126} metres={400} dessin={1104}>
        <Navire />
      </Objet>
      <Objet {...v} x={0} y={320} metres={230} dessin={252}>
        <Pyramide />
      </Objet>
      <Tas {...v} />
      <Grains {...v} />
    </g>
  );
};

// Le petit échiquier : une case par seconde, c'est la barre de progression
const Progression: React.FC<{ x: number; y: number; taille: number; fait: number; age: number }> = ({ x, y, taille, fait, age }) => {
  const cote = taille / 8;
  return (
    <g>
      <rect x={x - 7} y={y - 7} width={taille + 14} height={taille + 14} fill="#2C1E2F" />
      {Array.from({ length: 64 }, (_, k) => {
        const ligne = Math.floor(k / 8);
        const colonne = ligne % 2 === 0 ? k % 8 : 7 - (k % 8);
        const sombre = (colonne + ligne) % 2 === 0;
        const courante = k === fait - 1;
        const remplie = k < fait;
        const vide = sombre ? "#5A3522" : "#84532F";
        const plein = sombre ? RIZ_OMBRE : RIZ;
        const couleur = courante && age < 0.5 ? "#F2B53A" : remplie ? plein : vide;
        return <rect key={k} x={x + colonne * cote} y={y + (7 - ligne) * cote} width={cote + 0.5} height={cote + 0.5} fill={couleur} />;
      })}
    </g>
  );
};

// De côté : le tas et l'Everest à la même échelle
const Cote: React.FC<{ t: number }> = ({ t }) => {
  const sol = 1130;
  const parKm = 29;
  const pousse = interpolate(partEntre(t, calcul.t_limite, calcul.t_limite + 0.6), [0, 1], [calcul.hauteur_avant_m / calcul.hauteur_finale_m, 1]);
  const h = (calcul.hauteur_finale_m / 1000) * parKm * pousse;
  const demi = (calcul.rayon_final_m / 1000) * parKm * pousse;
  const everest = (calcul.everest_m / 1000) * parKm;
  const cx = 640;
  const pic = 250;
  return (
    <g>
      <rect x={0} y={sol} width={LARGEUR} height={HAUTEUR - sol} fill="#26344A" />
      <path d={`M${pic - 230} ${sol} L${pic - 120} ${sol - everest * 0.56} L${pic - 66} ${sol - everest * 0.72} L${pic} ${sol - everest} L${pic + 60} ${sol - everest * 0.7} L${pic + 170} ${sol - everest * 0.46} L${pic + 300} ${sol} Z`} fill="#54657E" />
      <path d={`M${pic - 66} ${sol - everest * 0.72} L${pic} ${sol - everest} L${pic + 60} ${sol - everest * 0.7} L${pic + 18} ${sol - everest * 0.78} L${pic - 22} ${sol - everest * 0.68} Z`} fill="#F4EFE6" />
      <path d={`M${cx - demi} ${sol} L${cx} ${sol - h} L${cx + demi} ${sol} Z`} fill={RIZ} />
      <path d={`M${cx} ${sol - h} L${cx + demi} ${sol} L${cx + demi * 0.25} ${sol} Z`} fill={RIZ_OMBRE} />
      <line x1={40} y1={sol - everest} x2={1040} y2={sol - everest} stroke="#8FC7FF" strokeWidth={6} strokeDasharray="26 20" />
    </g>
  );
};

const R_TERRE = 300;
const Y_TERRE = 800;

const Baguette: React.FC<{ haut: number; bas: number }> = ({ haut, bas }) => (
  <path d={`M${haut - 20} -700 L${haut + 20} -700 L${bas + 8} ${Y_TERRE} L${bas - 8} ${Y_TERRE} Z`} fill="#7A2E22" />
);

const Planete: React.FC<{ t: number }> = ({ t }) => {
  const nappe = partEntre(t, calcul.t_planete, calcul.t_planete + 1.7);
  const algue = partEntre(t, calcul.t_boule, calcul.t_boule + 0.5);
  const pince = partEntre(t, calcul.t_boule + 0.6, calcul.t_faim);
  const levee = partEntre(t, calcul.t_faim, calcul.t_chute);
  const decale = -1500 * levee * levee;
  const descente = interpolate(pince, [0, 1], [-1100, 0]);
  return (
    <g>
      {Array.from({ length: 40 }, (_, k) => (
        <circle key={k} cx={hachage(k, 14) * LARGEUR} cy={hachage(k, 15) * HAUTEUR} r={3 + hachage(k, 16) * 3} fill="#F4EFE6" opacity={levee > 0 ? 1 - levee : 1} />
      ))}
      <g transform={`translate(0 ${decale})`}>
        <defs>
          <clipPath id="terre-riz">
            <circle cx={CX} cy={Y_TERRE} r={R_TERRE} />
          </clipPath>
        </defs>
        <circle cx={CX} cy={Y_TERRE} r={R_TERRE} fill="#2A7FA8" />
        <g clipPath="url(#terre-riz)">
          {Array.from({ length: 7 }, (_, k) => {
            const a = k * 0.9 + 0.4;
            return <ellipse key={k} cx={CX + Math.cos(a) * 190} cy={Y_TERRE + Math.sin(a) * 180} rx={70 + hachage(k, 17) * 70} ry={50 + hachage(k, 18) * 50} fill="#5E9C57" />;
          })}
          <circle cx={CX} cy={Y_TERRE - R_TERRE} r={nappe * R_TERRE * 2.2} fill={RIZ} />
          {nappe > 0
            ? Array.from({ length: 120 }, (_, k) => {
                const x = CX + (hachage(k, 19) - 0.5) * 2 * R_TERRE;
                const y = Y_TERRE + (hachage(k, 20) - 0.5) * 2 * R_TERRE;
                const d = Math.hypot(x - CX, y - (Y_TERRE - R_TERRE));
                return d < nappe * R_TERRE * 2.2 ? <ellipse key={k} cx={x} cy={y} rx={15} ry={5} fill={RIZ_OMBRE} transform={`rotate(${hachage(k, 21) * 180} ${x} ${y})`} /> : null;
              })
            : null}
          <rect x={CX - R_TERRE} y={Y_TERRE + R_TERRE - algue * 210} width={R_TERRE * 2} height={320} fill="#1F2A26" />
        </g>
        <g transform={`translate(0 ${descente})`}>
          <Baguette haut={CX + 120} bas={CX - R_TERRE + 6} />
          <Baguette haut={CX + 200} bas={CX + R_TERRE - 6} />
        </g>
      </g>
    </g>
  );
};

export const SceneRice: React.FC<SceneProps> = ({ t }) => {
  const n = pasDecor(t);
  const pas = pasCompteur(t);
  const seconde = Math.floor(pas + 1e-9);
  const s = echelle(n);
  const palette = paletteA(t);
  const monde = 1 - partEntre(t, calcul.t_limite - 0.3, calcul.t_limite) + partEntre(t, calcul.t_chute - 0.4, calcul.t_chute);
  const cote = partEntre(t, calcul.t_limite - 0.3, calcul.t_limite) * (1 - partEntre(t, calcul.t_planete - 0.3, calcul.t_planete));
  const planete = t >= calcul.t_planete - 0.3 && t < calcul.t_chute + 0.2;
  const v: Vue = { t, n, s };
  const age = (t + 0.5) % 1;

  // À la 64e case, l'échiquier vient au milieu de l'image
  const tCase = calcul.t_limite - 3;
  const grand = partEntre(t, tCase, tCase + 0.3) * (1 - partEntre(t, tCase + 2.3, tCase + 2.6));
  const taille = interpolate(grand, [0, 1], [165, 560]);
  const xDamier = interpolate(grand, [0, 1], [762, CX - 280]);
  const yDamier = interpolate(grand, [0, 1], [246, 512]);

  // Le grain tombe et se pose exactement là où la vidéo commence
  const chute = partEntre(t, calcul.t_chute, calcul.t_fin);
  const grainY = interpolate(chute * chute, [0, 1], [40, CY]);

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg width={LARGEUR} height={HAUTEUR} viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`} style={{ position: "absolute" }}>
        {monde > 0 ? (
          <g opacity={Math.min(monde, 1)}>
            <Monde {...v} pas={pas} seconde={seconde} premier={t < calcul.t_chute || t >= calcul.t_fin} />
          </g>
        ) : null}
        {cote > 0 ? (
          <g opacity={cote}>
            <Cote t={t} />
          </g>
        ) : null}
        {planete ? <Planete t={t} /> : null}
        {t >= calcul.t_chute && t < calcul.t_fin ? <Grain x={CX} y={grainY} angle={ANGLE_PREMIER + (1 - chute) * 300} longueur={0.006 * ECHELLE_MAX} /> : null}
        <Progression x={xDamier} y={yDamier} taille={taille} fait={Math.min(seconde + 1, 64)} age={seconde >= 63 ? 0 : age} />
      </svg>
    </AbsoluteFill>
  );
};
