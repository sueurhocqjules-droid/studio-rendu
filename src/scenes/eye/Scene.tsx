import type { FC } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import calcul from "../../../sujets/eye.calcul.json";
import type { SceneProps } from "../../cadre/types";
import { entre, lisse, paletteA } from "./temps";

const CX = 540;
const CY = 930;
const RV = 300;
const RI = 390;

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Ce que l'on voit dans la pupille, en coordonnées locales (cercle de rayon 300 centré en 0)
const Aigle: FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={-320} y={-320} width={640} height={640} fill="#8FC9EA" />
    <circle cx={170} cy={-170} r={60} fill="#FFE08A" />
    <path d="M -320 120 Q -150 40 0 110 Q 150 170 320 80 L 320 320 L -320 320 Z" fill="#6BA34F" />
    <path d="M -320 200 Q -100 150 120 210 Q 240 240 320 200 L 320 320 L -320 320 Z" fill="#4E8A3C" />
    <g transform={`translate(${-60 + 20 * Math.sin(t)} ${-60 + 10 * Math.cos(t * 1.3)})`}>
      <path d="M -150 0 Q -80 -50 -20 -10 L 0 -16 L 20 -10 Q 80 -50 150 0 Q 80 -14 22 10 L 10 40 L -10 40 L -22 10 Q -80 -14 -150 0 Z" fill="#4A2E1C" />
      <circle cx={0} cy={-22} r={11} fill="#F4F1E6" />
      <path d="M 6 -24 L 18 -20 L 6 -16 Z" fill="#E8B23A" />
    </g>
  </g>
);

const Sol = ({ fond }: { fond: string }) => (
  <g>
    <rect x={-320} y={-320} width={640} height={640} fill={fond} />
    {[-240, -120, 0, 120, 240].map((x) => (
      <rect key={x} x={x - 8} y={-320} width={16} height={640} fill="#C9C2B0" opacity={0.6} />
    ))}
    {[-200, 0, 200].map((y) => (
      <rect key={y} x={-320} y={y - 8} width={640} height={16} fill="#C9C2B0" opacity={0.6} />
    ))}
  </g>
);

const Tennis = () => (
  <g>
    <Sol fond="#7FA36A" />
    <rect x={-60} y={-110} width={120} height={220} fill="#3B7FB0" stroke="#FFFFFF" strokeWidth={4} />
    <rect x={-42} y={-110} width={84} height={220} fill="none" stroke="#FFFFFF" strokeWidth={3} />
    <line x1={-60} x2={60} y1={0} y2={0} stroke="#FFFFFF" strokeWidth={5} />
    <rect x={150} y={-280} width={40} height={140} fill="#C9A23A" />
    <rect x={200} y={-280} width={40} height={140} fill="#C9A23A" />
  </g>
);

const Plage = () => (
  <g>
    <rect x={-320} y={-320} width={640} height={640} fill="#EBD9A7" />
    <path d="M -320 -320 L 320 -320 L 320 -120 Q 0 -60 -320 -160 Z" fill="#3E8FB0" />
    <rect x={-70} y={-10} width={140} height={60} rx={8} fill="#E2574C" />
    <circle cx={-48} cy={20} r={16} fill="#5A3A28" />
    <rect x={-36} y={8} width={80} height={24} rx={12} fill="#2F6FB0" />
    <circle cx={140} cy={120} r={48} fill="#F2C14E" />
  </g>
);

const Voiture = () => (
  <g>
    <rect x={-320} y={-320} width={640} height={640} fill="#55575C" />
    {[-200, -80, 40, 160].map((y) => (
      <rect key={y} x={-6} y={y} width={12} height={60} fill="#F4F1E6" />
    ))}
    <rect x={-170} y={-170} width={130} height={260} rx={36} fill="#C7362B" />
    <rect x={-155} y={-110} width={100} height={70} rx={10} fill="#2B3440" />
    <rect x={-155} y={30} width={100} height={40} rx={8} fill="#2B3440" />
    <rect x={-138} y={84} width={66} height={22} rx={3} fill="#FFFFFF" stroke="#13314A" strokeWidth={3} />
  </g>
);

const Hubble = () => (
  <g>
    <rect x={-320} y={-320} width={640} height={640} fill="#0B1226" />
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
      <circle key={i} cx={-260 + ((i * 173) % 520)} cy={-260 + ((i * 251) % 520)} r={2.5} fill="#FFF6E5" />
    ))}
    <g transform="rotate(-20)">
      <rect x={-150} y={-55} width={300} height={110} rx={20} fill="#C9CED8" />
      <rect x={110} y={-55} width={50} height={110} fill="#9AA3B2" />
      <rect x={-60} y={-200} width={70} height={130} fill="#2F5E9E" stroke="#C9A23A" strokeWidth={4} />
      <rect x={-60} y={70} width={70} height={130} fill="#2F5E9E" stroke="#C9A23A" strokeWidth={4} />
    </g>
  </g>
);

const Etoile: FC<{ t: number; rouge: boolean }> = ({ t, rouge }) => {
  const r = rouge ? 170 : 230;
  const couleurs = rouge ? ["#7A1E12", "#B83A1C", "#E2652E"] : ["#C9620F", "#F29B1E", "#FFD15A"];
  return (
    <g>
      <rect x={-320} y={-320} width={640} height={640} fill={rouge ? "#1A0608" : "#0B1226"} />
      {rouge && <path d={`M ${r * 0.6} ${-r * 0.7} q ${80 + 10 * Math.sin(t * 3)} -90 ${150} 10`} fill="none" stroke="#FF8A4A" strokeWidth={14} strokeLinecap="round" />}
      <circle r={r} fill={couleurs[0]} />
      <circle r={r * 0.92} fill={couleurs[1]} />
      <circle r={r * 0.7} fill={couleurs[2]} />
      {Array.from({ length: 14 }, (_, i) => {
        const a = i * 2.39;
        const d = r * 0.15 + ((i * 37) % 10) * r * 0.06;
        return <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={r * 0.07} fill={couleurs[1]} opacity={0.7} />;
      })}
      {rouge && <circle cx={-r * 0.35} cy={r * 0.3} r={r * 0.12} fill={couleurs[0]} />}
    </g>
  );
};

const Lune = () => (
  <g>
    <rect x={-320} y={-320} width={640} height={640} fill="#8E9096" />
    {[
      [-180, -150, 70],
      [150, -200, 50],
      [190, 160, 90],
      [-200, 190, 40],
    ].map(([x, y, r]) => (
      <g key={`${x}${y}`}>
        <circle cx={x} cy={y} r={r} fill="#7A7C82" />
        <circle cx={x + r * 0.15} cy={y + r * 0.15} r={r * 0.8} fill="#6B6D72" />
      </g>
    ))}
    {[0, 1, 2, 3, 4].map((i) => (
      <ellipse key={i} cx={-120 + i * 40} cy={60 + (i % 2) * 24} rx={10} ry={16} fill="#6B6D72" />
    ))}
    <circle cx={40} cy={10} r={58} fill="#FAFAF5" />
    <polygon points="40,-12 58,1 51,22 29,22 22,1" fill="#1D1D1F" />
    {[0, 72, 144, 216, 288].map((a) => (
      <circle key={a} cx={40 + 48 * Math.cos(((a - 90) * Math.PI) / 180)} cy={10 + 48 * Math.sin(((a - 90) * Math.PI) / 180)} r={10} fill="#1D1D1F" />
    ))}
  </g>
);

const TrouNoir: FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={-320} y={-320} width={640} height={640} fill="#050505" />
    <circle r={170} fill="none" stroke="#7A2A08" strokeWidth={90} />
    <circle r={170} fill="none" stroke="#D4570F" strokeWidth={56} />
    <circle r={170} fill="none" stroke="#FFB347" strokeWidth={20} strokeDasharray="300 120" transform={`rotate(${100 + 6 * Math.sin(t)})`} />
    <circle r={115} fill="#050505" />
  </g>
);

const SCENES: Record<string, FC<{ t: number }>> = {
  aigle: Aigle,
  tennis: Tennis,
  personne: Plage,
  plaque: Voiture,
  hubble: Hubble,
  alphaa: ({ t }) => <Etoile t={t} rouge={false} />,
  proxima: ({ t }) => <Etoile t={t} rouge />,
  ballon: Lune,
  trounoir: TrouNoir,
};

const Miroir = () => (
  <g>
    <rect x={-320} y={-320} width={640} height={640} fill="#0B1226" />
    {[
      [0, 0],
      [0, -1],
      [0, 1],
      [1, -0.5],
      [1, 0.5],
      [-1, -0.5],
      [-1, 0.5],
      [0, -2],
      [0, 2],
      [2, 0],
      [-2, 0],
      [1, -1.5],
      [1, 1.5],
      [-1, -1.5],
      [-1, 1.5],
      [2, -1],
      [2, 1],
      [-2, -1],
      [-2, 1],
    ].map(([q, r]) => {
      const x = q * 90;
      const y = r * 104;
      const points = Array.from({ length: 6 }, (_, i) => `${x + 56 * Math.cos((i * Math.PI) / 3)},${y + 56 * Math.sin((i * Math.PI) / 3)}`).join(" ");
      return <polygon key={`${q}${r}`} points={points} fill={q === 0 && r === 0 ? "#0B1226" : "#E8B23A"} stroke="#8A5A10" strokeWidth={4} />;
    })}
  </g>
);

const Iris = ({ rv, ri }: { rv: number; ri: number }) => (
  <g>
    <circle r={(rv + ri) / 2} fill="none" stroke="#3F7F5E" strokeWidth={ri - rv} />
    {Array.from({ length: 36 }, (_, i) => {
      const a = (i * Math.PI) / 18;
      return <line key={i} x1={Math.cos(a) * rv} y1={Math.sin(a) * rv} x2={Math.cos(a) * ri * 0.96} y2={Math.sin(a) * ri * 0.96} stroke={i % 2 ? "#2E6248" : "#6FA97F"} strokeWidth={8} />;
    })}
    <circle r={ri} fill="none" stroke="#1F3D2E" strokeWidth={18} />
    <circle r={rv + 6} fill="none" stroke="#14110D" strokeWidth={12} />
  </g>
);

export const SceneEye = ({ t }: SceneProps) => {
  const palette = paletteA(t);

  // Choix de la vue : la référence atteinte reste nette 2,6 s, puis la suivante arrive floue et se précise
  const retour = t >= calcul.t_retour;
  const p = retour ? calcul.paliers[0] : (calcul.paliers.find((q) => q.arrivee_s > t - 2.6) ?? calcul.paliers[calcul.paliers.length - 1]);
  const tVue = retour ? t - calcul.duree_s : t;
  const flou = Math.min(16, Math.max(0, (p.arrivee_s - tVue) * 2.2));
  const Vue = t >= calcul.t_patte && !retour ? Miroir : SCENES[p.cle];

  // Épilogue : l'œil recule, puis la pupille devient géante au-dessus d'une ville
  const recul = interpolate(t, [calcul.t_coupe, calcul.t_coupe + 1, calcul.t_qui, calcul.t_qui + 0.01, calcul.t_patte, calcul.t_patte + 1], [1, 0.55, 0.55, 0.55, 0.55, 1], borne);
  const geant = t >= calcul.t_qui && t < calcul.t_patte;
  const croissance = lisse(entre(t, calcul.t_qui, calcul.t_qui + 1.6));
  const cligne = t >= calcul.t_fin - 0.7 && t < calcul.t_fin ? Math.sin(entre(t, calcul.t_fin - 0.7, calcul.t_fin - 0.1) * Math.PI) : 0;

  if (geant) {
    // 1 px = pupille / 1000 px ; les immeubles de la ville sont à la même échelle
    const metresParPx = calcul.pupille_m / 1000;
    const rPupille = 40 + (500 - 40) * croissance;
    const yOeil = 760;
    return (
      <AbsoluteFill style={{ backgroundColor: "#0B1226" }}>
        <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
          <ellipse cx={540} cy={yOeil} rx={rPupille * 2.6} ry={rPupille * 1.5} fill="#F7F3EA" />
          <g transform={`translate(540 ${yOeil})`}>
            <Iris rv={rPupille} ri={rPupille * 1.3} />
            <circle r={rPupille} fill="#050505" />
            <circle cx={rPupille * 0.4} cy={rPupille * 0.3} r={rPupille * 0.1} fill="#FFFFFF" opacity={0.85} />
          </g>
          <rect x={0} y={1300} width={1080} height={620} fill="#3B4A3F" />
          {Array.from({ length: 60 }, (_, i) => {
            const h = (30 + ((i * 53) % 90)) / metresParPx;
            return <rect key={i} x={20 + i * 17} y={1300 - h * croissance} width={12} height={h * croissance} fill="#1B2430" />;
          })}
        </svg>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <defs>
          <filter id="flou" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={flou} />
          </filter>
          <clipPath id="pupille">
            <circle cx={0} cy={0} r={RV} />
          </clipPath>
        </defs>
        <g transform={`translate(${CX} ${CY}) scale(${recul})`}>
          <path d="M -530 0 Q 0 -820 530 0 Q 0 820 -530 0 Z" fill="#F7F3EA" stroke="#14110D" strokeWidth={14} />
          <g clipPath="url(#pupille)">
            <g filter={flou > 0.2 ? "url(#flou)" : undefined}>
              <Vue t={t} />
            </g>
          </g>
          <Iris rv={RV} ri={RI} />
          {cligne > 0 && (
            <g>
              <rect x={-540} y={-560} width={1080} height={560 * cligne} fill={palette.fond} />
              <rect x={-540} y={560 - 560 * cligne} width={1080} height={560 * cligne} fill={palette.fond} />
            </g>
          )}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
