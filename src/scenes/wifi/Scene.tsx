import type { FC } from "react";
import { AbsoluteFill } from "remotion";
import calcul from "../../../sujets/wifi.calcul.json";
import type { SceneProps } from "../../cadre/types";
import { paletteA, pasDecor } from "./temps";

const CX = 540;
const CY = 890;
const LT = 440;
const HT = 680;
const ECRAN = "#F7F4EC";

// Icônes des fichiers, dessinées dans une boîte de 240 px centrée en 0
const ICONES: Record<string, FC> = {
  sms: () => (
    <g>
      <path d="M -110 -80 h 220 a 20 20 0 0 1 20 20 v 110 a 20 20 0 0 1 -20 20 h -150 l -50 40 v -40 h -20 a 20 20 0 0 1 -20 -20 v -110 a 20 20 0 0 1 20 -20 Z" fill="#3D8BFD" />
      {[-40, 0, 40].map((y) => (
        <rect key={y} x={-80} y={y - 6} width={y === 40 ? 100 : 160} height={12} rx={6} fill="#FFFFFF" />
      ))}
    </g>
  ),
  apollo: () => (
    <g>
      <rect x={-110} y={-110} width={220} height={220} rx={10} fill="#7A7F86" />
      <rect x={-90} y={-92} width={180} height={64} fill="#1B2A1B" />
      {[-60, -10, 40].map((x) => (
        <rect key={x} x={x - 6} y={-80} width={36} height={40} fill="#57E37A" opacity={0.85} />
      ))}
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3, 4].map((c) => <rect key={`${r}${c}`} x={-90 + c * 37} y={-10 + r * 38} width={30} height={30} rx={4} fill="#E6E2D6" />),
      )}
    </g>
  ),
  chanson: () => (
    <g fill="#2A1405">
      <rect x={-20} y={-110} width={22} height={170} />
      <rect x={-20} y={-110} width={110} height={22} />
      <rect x={70} y={-110} width={22} height={150} />
      <ellipse cx={-40} cy={70} rx={46} ry={34} />
      <ellipse cx={50} cy={50} rx={46} ry={34} />
    </g>
  ),
  genome: () => (
    <g>
      {Array.from({ length: 12 }, (_, i) => {
        const y = -110 + i * 20;
        const x = 70 * Math.sin(i * 0.6);
        return (
          <g key={i}>
            <line x1={-x} y1={y} x2={x} y2={y} stroke={i % 2 ? "#FFD166" : "#F4FFF9"} strokeWidth={8} />
            <circle cx={-x} cy={y} r={11} fill="#F4FFF9" />
            <circle cx={x} cy={y} r={11} fill="#FFD166" />
          </g>
        );
      })}
    </g>
  ),
  film: () => (
    <g>
      <rect x={-110} y={-40} width={220} height={140} rx={8} fill="#1D1D1F" />
      <g transform="rotate(-14 -110 -40)">
        <rect x={-110} y={-90} width={220} height={44} fill="#1D1D1F" />
        {[0, 1, 2, 3].map((i) => (
          <polygon key={i} points={`${-100 + i * 54},-90 ${-76 + i * 54},-90 ${-96 + i * 54},-46 ${-120 + i * 54},-46`} fill="#FFF1E6" />
        ))}
      </g>
    </g>
  ),
  wikipedia: () => (
    <g>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={-110 + i * 44} y={-110 + (i % 2) * 14} width={38} height={220 - (i % 2) * 14} rx={4} fill={["#8E2A0E", "#22170D", "#B5852A", "#2F5E4E", "#5A3A22"][i]} />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={`b${i}`} x={-104 + i * 44} y={-60} width={26} height={8} fill="#E9DDC4" />
      ))}
    </g>
  ),
  fibre: () => (
    <g>
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M -120 ${60 + i * 6} Q 0 ${40 + i * 4} 40 ${-20 + i * 10} T 120 ${-100 + i * 22}`} fill="none" stroke={i % 3 === 0 ? "#6FD6FF" : "#E8FAFF"} strokeWidth={7} strokeLinecap="round" />
      ))}
    </g>
  ),
  internet: () => (
    <g>
      <circle r={110} fill="#2F7FB8" />
      <ellipse rx={50} ry={110} fill="none" stroke="#E8FAFF" strokeWidth={6} />
      <line x1={-110} x2={110} y1={0} y2={0} stroke="#E8FAFF" strokeWidth={6} />
      <path d="M -100 -45 Q 0 -60 100 -45 M -100 45 Q 0 60 100 45" fill="none" stroke="#E8FAFF" strokeWidth={6} />
      <circle r={110} fill="none" stroke="#E8FAFF" strokeWidth={6} />
    </g>
  ),
  vie: () => (
    <g fill="#25110A">
      {[
        [-80, 0.55],
        [0, 0.85],
        [80, 0.8],
      ].map(([x, s], i) => (
        <g key={i} transform={`translate(${x} 100) scale(${s})`}>
          <circle cx={0} cy={-170} r={24} />
          <rect x={-26} y={-140} width={52} height={80} rx={18} />
          <rect x={-24} y={-66} width={20} height={66} rx={8} />
          <rect x={4} y={-66} width={20} height={66} rx={8} />
          {i === 2 && <rect x={30} y={-110} width={8} height={110} />}
        </g>
      ))}
    </g>
  ),
};

export const SceneWifi = ({ t }: SceneProps) => {
  const palette = paletteA(t);
  const n = pasDecor(t);
  const retour = t >= calcul.t_retour;
  const epilogue = t >= calcul.t_coupe && !retour;
  const fige = epilogue ? calcul.t_coupe : t;

  // Le fichier de l'instant : la référence atteinte reste 2,6 s, puis la suivante se télécharge
  const recent = [...calcul.paliers].reverse().find((q) => t >= q.arrivee_s);
  const prochain = calcul.paliers.find((q) => q.arrivee_s > t) ?? calcul.paliers[calcul.paliers.length - 1];
  const p = retour ? calcul.paliers[0] : recent && (t < recent.arrivee_s + 2.6 || recent === prochain) ? recent : prochain;
  const Icone = ICONES[p.cle];
  const progres = epilogue ? 1 : t >= p.arrivee_s ? 1 : t - Math.floor(t);
  const arrivee = t >= p.arrivee_s && t < p.arrivee_s + 0.35 ? 1 + 0.12 * Math.sin(((t - p.arrivee_s) / 0.35) * Math.PI) : 1;

  // Stockage : la somme téléchargée sur 128 Go, en échelle logarithmique pour qu'on la voie monter
  const plein = n >= calcul.n_plein || epilogue;
  const stockage = plein ? 1 : Math.max(0, n / calcul.n_plein);

  // Paquets qui pleuvent vers le téléphone, plus nombreux et plus rapides avec le débit
  const nombre = epilogue ? 0 : Math.min(36, 3 + Math.floor(n * 0.7));
  const vitesse = 300 + 60 * n;
  const paquets = Array.from({ length: nombre }, (_, i) => {
    const x = 90 + ((i * 263) % 900);
    const y = ((fige * vitesse + i * 197) % 1500) - 100;
    return <rect key={i} x={x} y={y} width={26} height={14 + Math.min(80, n * 2)} rx={7} fill={palette.encre} opacity={0.18} />;
  });

  const efface = retour ? Math.max(0, 1 - Math.abs(t - calcul.t_retour - 0.3) * 3) : 0;
  const tranche = epilogue && t >= calcul.t_patte;
  const rouge = "#D7263D";

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        {paquets}

        <g transform={`translate(${CX} ${CY})`}>
          <rect x={-LT / 2 - 18} y={-HT / 2 - 18} width={LT + 36} height={HT + 36} rx={60} fill="#1B1C20" />
          <rect x={-LT / 2} y={-HT / 2} width={LT} height={HT} rx={44} fill={ECRAN} />
          <rect x={-50} y={-HT / 2 + 14} width={100} height={22} rx={11} fill="#1B1C20" />

          {/* Ondes du wifi, qui battent à chaque seconde */}
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M ${-40 - i * 34} -235 A ${50 + i * 34} ${50 + i * 34} 0 0 1 ${40 + i * 34} -235`}
              transform={`translate(0 ${-50 + i * 34})`}
              fill="none"
              stroke={epilogue ? "#B9B4A8" : "#2A6FDB"}
              strokeWidth={14}
              strokeLinecap="round"
              opacity={epilogue ? 0.6 : 0.35 + 0.65 * (1 - Math.abs(((t * 2 - i * 0.3) % 1) - 0.5) * 2)}
            />
          ))}

          {/* Fichier en cours */}
          {!tranche && (
            <g transform={`translate(0 -20) scale(${arrivee})`}>
              {epilogue ? (
                <g>
                  <circle r={120} fill={rouge} />
                  <rect x={-70} y={-16} width={140} height={32} rx={10} fill="#FFFFFF" />
                </g>
              ) : (
                <g transform="scale(0.95)">
                  <circle r={140} fill={palette.fond} opacity={0.9} />
                  <Icone />
                </g>
              )}
            </g>
          )}
          {tranche && (
            <g transform="translate(0 -20)">
              <circle r={150} fill="#C9C4B8" />
              <circle cx={0} cy={-150} r={6} fill={rouge} />
            </g>
          )}

          {/* Barre de téléchargement */}
          <rect x={-170} y={150} width={340} height={30} rx={15} fill="#D9D3C5" />
          <rect x={-170} y={150} width={340 * progres} height={30} rx={15} fill={epilogue ? rouge : "#2A6FDB"} />

          {/* Stockage du téléphone */}
          <rect x={-170} y={220} width={340} height={22} rx={11} fill="#D9D3C5" />
          <rect x={-170} y={220} width={340 * stockage} height={22} rx={11} fill={plein ? rouge : "#4E8F5E"} />
          {plein && (
            <g>
              <circle cx={LT / 2 - 6} cy={-HT / 2 + 6} r={30} fill={rouge} />
              <rect x={LT / 2 - 10} y={-HT / 2 - 10} width={8} height={20} rx={3} fill="#FFFFFF" />
              <circle cx={LT / 2 - 6} cy={-HT / 2 + 20} r={4} fill="#FFFFFF" />
            </g>
          )}

          {efface > 0 && <rect x={-LT / 2} y={-HT / 2} width={LT} height={HT} rx={44} fill="#FFFFFF" opacity={efface} />}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
