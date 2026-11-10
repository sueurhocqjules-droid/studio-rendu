import React from "react";
import { AbsoluteFill, interpolate, interpolateColors } from "remotion";
import calcul from "../../../sujets/volume.calcul.json";
import texte from "../../../sujets/volume.json";
import { ANTON } from "../../cadre/polices";
import type { SceneProps } from "../../cadre/types";
import { entre, lisse, paletteA, pasDecor } from "./temps";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const COLS = [90, 390, 690];
const ROWS = [510, 730, 950];
const L_PIECE = 300;
const H_PIECE = 220;
const Y_SOL = 1170;
const X_ENCEINTE = 540;
const Y_ENCEINTE = 824;

const ENCRE = "#2A2230";
const DALLE = "#3A2E28";
const VERRE = "#BFE3F2";
const CREME = "#F6F0DF";

const hachage = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const pasDe = (cle: string) => calcul.paliers.find((p) => p.cle === cle)?.pas ?? 0;

type Etat = { n: number; t: number };

// Une pièce du bâtiment : les colonnes latérales sont soufflées à Krakatoa, la colonne centrale tient
const Piece: React.FC<{ col: number; row: number; fond: string; n: number; children: React.ReactNode }> = ({
  col,
  row,
  fond,
  n,
  children,
}) => {
  const decale = hachage(col * 3 + row, 9);
  const souffle = col === 1 ? 0 : entre(n, pasDe("krakatoa") - 1.5 + decale, pasDe("krakatoa") + decale);
  if (souffle >= 1) {
    return null;
  }
  const mur = col === 1 ? 1 - entre(n, pasDe("tympan") - 1, pasDe("tympan") + 1) : 1;
  const fissure = entre(n, pasDe("petard") - 0.5, pasDe("petard") + 1);
  const dx = (col - 1) * 1500 * souffle * souffle;
  const dy = (row - 1) * 700 * souffle * souffle - 200 * Math.sin(souffle * Math.PI);
  const tourne = (col - 1) * (60 + decale * 70) * souffle;
  const zig = (k: number) => 40 + hachage(col + row * 3, k) * 220;
  return (
    <g transform={`translate(${COLS[col] + dx} ${ROWS[row] + dy}) rotate(${tourne} 150 110)`}>
      <rect width={L_PIECE} height={H_PIECE} fill={fond} opacity={mur} />
      {children}
      {fissure > 0 ? (
        <path
          d={`M${zig(1)} 0 L${zig(2)} 70 L${zig(3)} 120 L${zig(4)} ${H_PIECE}`}
          fill="none"
          stroke={ENCRE}
          strokeWidth={7}
          opacity={fissure * mur}
        />
      ) : null}
      <rect x={-8} y={H_PIECE - 12} width={L_PIECE + 16} height={14} fill={DALLE} />
      <rect x={-8} y={0} width={10} height={H_PIECE} fill={DALLE} />
      <rect x={L_PIECE - 2} y={0} width={10} height={H_PIECE} fill={DALLE} />
    </g>
  );
};

const Chat: React.FC<Etat> = ({ n, t }) => {
  const reveil = entre(n, pasDe("conversation") - 0.5, pasDe("conversation"));
  const panique = entre(n, pasDe("risque") - 0.5, pasDe("risque"));
  const saut = panique * Math.abs(Math.sin(t * 14)) * 30;
  return (
    <g>
      <rect x={34} y={146} width={232} height={44} rx={8} fill="#7A5A3C" />
      <rect x={34} y={122} width={232} height={32} rx={12} fill="#E7EEF2" />
      <g transform={`translate(150 ${100 - saut})`}>
        <ellipse rx={78} ry={36 + panique * 12} fill="#E08A36" />
        <circle cx={62} cy={-18} r={32} fill="#E08A36" />
        <polygon points="38,-40 46,-72 66,-48" fill="#C8701F" />
        <polygon points="70,-48 90,-72 96,-38" fill="#C8701F" />
        {reveil > 0.5 ? (
          <g fill={ENCRE}>
            <circle cx={52} cy={-22} r={6 + panique * 4} />
            <circle cx={78} cy={-22} r={6 + panique * 4} />
          </g>
        ) : (
          <g stroke={ENCRE} strokeWidth={5}>
            <line x1={44} y1={-22} x2={60} y2={-22} />
            <line x1={70} y1={-22} x2={86} y2={-22} />
          </g>
        )}
        <path d={`M-74 8 Q-120 ${-20 - panique * 40} -104 ${-56 - panique * 30}`} fill="none" stroke="#C8701F" strokeWidth={16} strokeLinecap="round" />
      </g>
    </g>
  );
};

const Balai: React.FC<Etat & { vitesse: number }> = ({ n, t, vitesse }) => {
  const actif = entre(n, pasDe("conversation") - 0.3, pasDe("conversation"));
  const frappe = Math.abs(Math.sin(t * vitesse));
  const haut = actif * frappe * 44;
  const incline = 14 * (1 - actif);
  return (
    <g transform={`translate(150 ${H_PIECE - 12 - haut}) rotate(${incline})`}>
      <rect x={-6} y={-170} width={12} height={170} fill="#9A7A4E" />
      <path d="M-48 -176 L48 -176 L34 -210 L-34 -210 Z" fill="#E2B93F" />
      {[-30, -15, 0, 15, 30].map((x) => (
        <rect key={x} x={x - 2} y={-210} width={4} height={34} fill="#B48A22" />
      ))}
    </g>
  );
};

const Plante: React.FC<Etat> = ({ n, t }) => {
  const secousse = entre(n, 18, 34) * 12 * Math.sin(t * 26);
  return (
    <g transform={`translate(150 ${H_PIECE - 12})`}>
      <polygon points="-46,-74 46,-74 34,0 -34,0" fill="#B5472F" />
      <g transform={`rotate(${secousse} 0 -74)`}>
        <path d="M0 -74 C-70 -96 -90 -146 -66 -176 C-34 -162 -6 -122 0 -74 Z" fill="#3F8A3F" />
        <path d="M0 -74 C70 -96 90 -146 66 -176 C34 -162 6 -122 0 -74 Z" fill="#57AB50" />
        <path d="M0 -74 C-22 -120 -18 -166 0 -190 C18 -166 22 -120 0 -74 Z" fill="#4C9C48" />
      </g>
    </g>
  );
};

const Aquarium: React.FC<Etat> = ({ n, t }) => {
  const casse = entre(n, pasDe("petard"), pasDe("petard") + 1);
  const hauteur = interpolate(casse, [0, 1], [118, 14], borne);
  const amp = entre(n, 10, 40) * 22 * (1 - casse);
  const surface = 208 - hauteur;
  const pts = Array.from({ length: 11 }, (_, i) => {
    const x = 40 + i * 22;
    return `${x},${surface + Math.sin(t * 9 + i * 0.9) * amp}`;
  }).join(" ");
  const poissonX = 150 + Math.sin(t * 1.5) * 50 * (1 - casse);
  const poissonY = interpolate(casse, [0, 1], [150, 196], borne);
  return (
    <g>
      <polygon points={`40,208 ${pts} 260,208`} fill="#4BA6D6" />
      <g transform={`translate(${poissonX} ${poissonY}) rotate(${casse * 80})`}>
        <ellipse rx={30} ry={16} fill="#F2803A" />
        <polygon points="26,0 50,-16 50,16" fill="#F2803A" />
        <circle cx={-16} cy={-4} r={4} fill={ENCRE} />
      </g>
      {casse < 1 ? <rect x={40} y={60} width={220} height={148} fill="none" stroke={VERRE} strokeWidth={8} opacity={1 - casse} /> : null}
    </g>
  );
};

const Enceinte: React.FC<Etat & { amp: number }> = ({ n, t, amp }) => {
  const gonfle = 1 + amp * 0.28 * Math.sin(t * 52);
  const aiguille = -135 + (270 * n) / calcul.n_max;
  return (
    <g>
      <rect x={46} y={10} width={208} height={198} rx={12} fill="#22262E" />
      <circle cx={150} cy={86} r={70} fill="#3A404C" />
      <g transform={`translate(150 86) scale(${gonfle})`}>
        <circle r={56} fill="#16181E" />
        <circle r={22} fill="#70788A" />
      </g>
      <circle cx={104} cy={178} r={18} fill="#3A404C" />
      <g transform={`translate(204 176) rotate(${aiguille})`}>
        <circle r={22} fill="#D63A2E" />
        <rect x={-3} y={-22} width={6} height={18} fill={CREME} />
      </g>
    </g>
  );
};

const Verres: React.FC<Etat> = ({ n, t }) => {
  const casse = entre(n, pasDe("immediat") - 0.2, pasDe("immediat") + 0.4);
  const tremble = entre(n, 18, 33) * 5;
  return (
    <g>
      <rect x={18} y={112} width={264} height={12} fill="#7A5A3C" />
      {Array.from({ length: 6 }, (_, i) => {
        const x = 30 + i * 42;
        return casse < 1 ? (
          <rect
            key={i}
            x={x + Math.sin(t * 40 + i * 2) * tremble}
            y={46}
            width={30}
            height={66}
            rx={5}
            fill={VERRE}
            stroke="#7CB5CF"
            strokeWidth={4}
            opacity={1 - casse}
          />
        ) : null;
      })}
      {casse > 0
        ? Array.from({ length: 22 }, (_, i) => (
            <polygon
              key={i}
              points="0,-12 10,6 -10,8"
              fill={VERRE}
              transform={`translate(${30 + hachage(i, 1) * 240} ${
                interpolate(casse, [0, 1], [80, 186 + hachage(i, 2) * 18], borne)
              }) rotate(${hachage(i, 3) * 360})`}
            />
          ))
        : null}
    </g>
  );
};

const Baignoire: React.FC<Etat> = ({ n, t }) => {
  const amp = entre(n, 14, 40) * 24;
  const pts = Array.from({ length: 11 }, (_, i) => {
    const x = 44 + i * 21;
    return `${x},${120 + Math.sin(t * 11 + i) * amp}`;
  }).join(" ");
  return (
    <g>
      <polygon points={`44,190 ${pts} 254,190`} fill="#5FB7E0" />
      <path d="M34 108 L266 108 L252 196 C252 204 246 206 240 206 L60 206 C54 206 48 204 48 196 Z" fill="none" stroke={CREME} strokeWidth={14} />
      {entre(n, 30, 34) > 0
        ? Array.from({ length: 8 }, (_, i) => {
            const p = (t * 1.6 + hachage(i, 4)) % 1;
            return <circle key={i} cx={60 + hachage(i, 5) * 180} cy={110 - Math.sin(p * Math.PI) * 90} r={8} fill="#5FB7E0" />;
          })
        : null}
    </g>
  );
};

const Lampe: React.FC<Etat> = ({ n, t }) => {
  const balance = entre(n, 18, 30) * 34 * Math.sin(t * 7);
  const mur = 1 - entre(n, pasDe("tympan") - 1, pasDe("tympan") + 1);
  return (
    <g opacity={mur}>
      <g transform={`rotate(${balance} 150 0)`}>
        <rect x={147} y={0} width={6} height={96} fill={ENCRE} />
        <polygon points="104,146 196,146 172,92 128,92" fill="#D63A2E" />
      </g>
      <rect x={72} y={188} width={156} height={20} fill="#7A5A3C" />
    </g>
  );
};

const Assiettes: React.FC<Etat> = ({ n }) => {
  const debut = pasDe("deux_min");
  return (
    <g>
      <rect x={70} y={140} width={200} height={68} fill="#8C6C4A" />
      {Array.from({ length: 8 }, (_, i) => {
        const chute = entre(n, debut + i * 0.35 - 0.6, debut + i * 0.35);
        const y = interpolate(chute, [0, 1], [130 - i * 12, 200], borne);
        const x = interpolate(chute, [0, 1], [170, 30 + i * 8], borne);
        const r = chute * (40 + i * 22);
        return <rect key={i} x={x - 54} y={y - 6} width={108} height={12} rx={6} fill={CREME} stroke="#9BA6AC" strokeWidth={2} transform={`rotate(${r} ${x} ${y})`} />;
      })}
    </g>
  );
};

const Volcan: React.FC<{ apparition: number; t: number }> = ({ apparition, t }) => (
  <g transform={`translate(840 ${Y_SOL + 420 * (1 - apparition)})`}>
    {Array.from({ length: 16 }, (_, i) => {
      const p = (t * 0.55 + i / 16) % 1;
      return (
        <circle
          key={i}
          cx={(hachage(i, 6) - 0.5) * 260 * p}
          cy={-460 - p * 520}
          r={70 + p * 120}
          fill={i % 2 ? "#3A2A2E" : "#55404A"}
        />
      );
    })}
    <polygon points="-340,0 -70,-470 70,-470 340,0" fill="#231A20" />
    <path d="M-40 -470 L-70 -280 L-20 -180 L-80 0 L60 0 L10 -190 L50 -300 L40 -470 Z" fill="#FF7A1A" />
  </g>
);

export const SceneVolume: React.FC<SceneProps> = ({ t, langue }) => {
  const n = pasDecor(t);
  const palette = paletteA(t);
  const { t_limite, t_coupe, t_mot, t_retour } = calcul;
  const note = texte[langue].note;
  const silence = t >= t_coupe && t < t_retour;

  const secousseMax = silence ? 0 : entre(n, 18, 50) * 16;
  const sx = Math.sin(t * 71) * secousseMax;
  const sy = Math.cos(t * 83) * secousseMax * 0.7;
  const amp = silence ? 0 : 0.2 + entre(n, 6, 30) * 0.8;

  const nbAnneaux = 7;
  const anneaux = silence ? 0 : entre(n, 4, 18) * 0.75;
  const epaisseur = interpolate(n, [4, 34, 58], [5, 22, 60], borne);
  const rMax = interpolate(n, [4, 30, 50], [230, 800, 1250], borne);

  const krakatoa = entre(n, pasDe("krakatoa") - 1.2, pasDe("krakatoa")) * (1 - entre(n, pasDe("tympan") - 0.5, pasDe("tympan") + 0.5));
  const vide = t >= t_limite - 0.1 && t < t_coupe ? entre(t, t_limite - 0.1, t_limite + 0.3) : 0;
  const sol = interpolateColors(n, [0, 26, 44, 51, 58], ["#8FB65A", "#A99A47", "#7C4A2A", "#3E1A20", "#16141C"]);

  const vitesseBalai = silence ? 7 : interpolate(n, [14, 44], [9, 24], borne);

  const entreeNote = lisse(entre(t, t_mot - 0.8, t_mot));
  const sortieNote = lisse(entre(t, t_retour, t_retour + 0.5));
  const yNote = interpolate(entreeNote, [0, 1], [660, 850]);
  const eclats = entre(n, pasDe("petard"), pasDe("petard") + 2) * (silence ? 0 : 1);

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        {vide > 0
          ? Array.from({ length: 8 }, (_, i) => (
              <circle
                key={i}
                cx={X_ENCEINTE}
                cy={Y_ENCEINTE}
                r={(8 - i) * 260 - ((t * 620) % 520)}
                fill={i % 2 ? "#565664" : "#0A0A10"}
                opacity={vide}
              />
            ))
          : null}
        {krakatoa > 0 ? <Volcan apparition={krakatoa} t={t} /> : null}

        <rect x={0} y={Y_SOL} width={1080} height={760} fill={sol} />

        <g transform={`translate(${sx} ${sy})`}>
          <Piece col={0} row={0} fond="#E8C9A0" n={n}><Chat n={n} t={t} /></Piece>
          <Piece col={1} row={0} fond="#BFD8C2" n={n}><Balai n={n} t={t} vitesse={vitesseBalai} /></Piece>
          <Piece col={2} row={0} fond="#F0D0D8" n={n}><Plante n={n} t={t} /></Piece>
          <Piece col={0} row={1} fond="#C9D6EC" n={n}><Aquarium n={n} t={t} /></Piece>
          <Piece col={1} row={1} fond="#F1E0A8" n={n}><Enceinte n={n} t={t} amp={amp} /></Piece>
          <Piece col={2} row={1} fond="#E6D5B8" n={n}><Verres n={n} t={t} /></Piece>
          <Piece col={0} row={2} fond="#CDE6E3" n={n}><Baignoire n={n} t={t} /></Piece>
          <Piece col={1} row={2} fond="#EAD3C0" n={n}><Lampe n={n} t={t} /></Piece>
          <Piece col={2} row={2} fond="#DADFC4" n={n}><Assiettes n={n} t={t} /></Piece>
          <rect x={80} y={498} width={920} height={14} fill={DALLE} opacity={1 - entre(n, pasDe("krakatoa") - 1, pasDe("krakatoa"))} />
        </g>

        {eclats > 0
          ? Array.from({ length: 26 }, (_, i) => {
              const p = (t * 0.9 + hachage(i, 7)) % 1;
              const a = hachage(i, 8) * Math.PI * 2;
              const r = p * 1100;
              return (
                <rect
                  key={i}
                  x={-14}
                  y={-9}
                  width={28}
                  height={18}
                  fill={i % 2 ? "#E8C9A0" : "#6B5A50"}
                  opacity={eclats}
                  transform={`translate(${X_ENCEINTE + Math.cos(a) * r} ${Y_ENCEINTE + Math.sin(a) * r}) rotate(${p * 720})`}
                />
              );
            })
          : null}

        {anneaux > 0
          ? Array.from({ length: nbAnneaux }, (_, i) => {
              const p = (t * 1.3 + i / nbAnneaux) % 1;
              return (
                <circle
                  key={i}
                  cx={X_ENCEINTE}
                  cy={Y_ENCEINTE}
                  r={40 + p * rMax}
                  fill="none"
                  stroke={palette.encre}
                  strokeWidth={epaisseur * (1 - p * 0.5)}
                  opacity={anneaux * (1 - p)}
                />
              );
            })
          : null}

        {entreeNote > 0 && sortieNote < 1 ? (
          <g
            transform={`translate(${540 + sortieNote * 900} ${yNote}) rotate(${-4 + sortieNote * 30}) scale(${interpolate(entreeNote, [0, 1], [0.35, 1])})`}
          >
            <rect x={-270} y={-130} width={540} height={260} fill="#FFE27A" />
            <text textAnchor="middle" y={-22} fontFamily={ANTON} fontSize={76} fill={ENCRE}>
              {note[0]}
            </text>
            <text textAnchor="middle" y={78} fontFamily={ANTON} fontSize={76} fill={ENCRE}>
              {note[1]}
            </text>
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
