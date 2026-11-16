import type { FC } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import calcul from "../../../sujets/candle.calcul.json";
import type { SceneProps } from "../../cadre/types";
import { entre, paletteA, pasDecor } from "./temps";

const CX = 540;
const PIED = 1300;
const ICONE_Y = 690;

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Icone: FC<{ cle: string; t: number }> = ({ cle, t }) => {
  switch (cle) {
    case "cheval":
      return (
        <g fill="#2A1405">
          <path d="M -110 -10 Q -100 -60 -40 -60 L 50 -60 L 80 -110 L 120 -120 L 130 -96 L 100 -80 L 90 -30 L 80 0 L 70 80 L 54 80 L 54 10 L -40 10 L -60 80 L -76 80 L -80 0 Q -110 20 -130 60 L -140 52 Q -120 10 -110 -10 Z" />
        </g>
      );
    case "eolienne":
      return (
        <g>
          <polygon points="-8,-40 8,-40 14,140 -14,140" fill="#F4F1E6" />
          <g transform={`translate(0 -50) rotate(${t * 120})`}>
            {[0, 120, 240].map((a) => (
              <path key={a} d="M -6 0 Q -10 -60 0 -130 Q 10 -60 6 0 Z" fill="#F4F1E6" transform={`rotate(${a})`} />
            ))}
            <circle r={12} fill="#C9CED8" />
          </g>
        </g>
      );
    case "barrage":
      return (
        <g>
          <path d="M -150 -100 L 40 -100 L 80 120 L -150 120 Z" fill="#2F6FB0" />
          <path d="M 20 -110 L 70 -110 Q 90 0 140 120 L 60 120 Q 40 0 20 -110 Z" fill="#D8D2C2" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={110 + i * 14} y={80} width={8} height={40} fill="#FFF6E5" opacity={0.7} />
          ))}
        </g>
      );
    case "humanite":
      return (
        <g>
          <circle r={120} fill="#0F1E3A" />
          <path d="M -60 -80 Q -10 -60 -20 -10 Q -60 20 -90 -20 Z M 20 20 Q 70 0 90 40 Q 60 90 20 70 Z" fill="#2B3B2B" />
          {Array.from({ length: 26 }, (_, i) => (
            <circle key={i} cx={-90 + ((i * 47) % 180)} cy={-90 + ((i * 71) % 180)} r={4} fill="#FFD166" opacity={Math.hypot(-90 + ((i * 47) % 180), -90 + ((i * 71) % 180)) < 110 ? 1 : 0} />
          ))}
        </g>
      );
    case "ouragan":
      return (
        <g transform={`rotate(${-t * 60})`}>
          {[0, 120, 240].map((a) => (
            <path key={a} d="M 0 0 Q 80 -20 120 40 Q 60 10 20 30 Z" fill="#F4F6FF" transform={`rotate(${a})`} />
          ))}
          <circle r={18} fill="#5B7FA6" />
        </g>
      );
    case "terre":
      return (
        <g>
          {[-60, -20, 20, 60].map((y) => (
            <line key={y} x1={-260} x2={-140} y1={y} y2={y * 0.6} stroke="#FFF1C1" strokeWidth={8} strokeLinecap="round" />
          ))}
          <circle r={120} fill="#2F6FB0" />
          <path d="M -50 -90 Q 20 -70 10 -10 Q -40 30 -90 0 Z M 30 30 Q 90 20 100 70 Q 60 110 30 80 Z" fill="#4E8A3C" />
          <path d="M 0 -120 A 120 120 0 0 1 0 120 A 60 120 0 0 0 0 -120 Z" fill="#0F1E3A" opacity={0.45} />
        </g>
      );
    case "proxima":
      return (
        <g>
          <circle r={130} fill="#E2652E" opacity={0.3} />
          <circle r={95} fill="#C7361F" />
          <circle cx={-30} cy={20} r={16} fill="#8E1F12" />
        </g>
      );
    default:
      return null;
  }
};

export const SceneCandle = ({ t }: SceneProps) => {
  const palette = paletteA(t);
  const n = pasDecor(t);
  const epilogue = t >= calcul.t_coupe && t < calcul.t_retour;

  // La flamme grandit avec le logarithme de la puissance, puis devient une étoile
  const etoile = entre(n, 26, 36);
  const flamme = 1 + 0.09 * n;
  const vacille = 1 + 0.05 * Math.sin(t * 17) + 0.03 * Math.sin(t * 29);
  const rEtoile = interpolate(n, [26, 41], [90, 300], borne);
  const yFlamme = PIED - 260 - 40 * flamme;
  const yEtoile = interpolate(etoile, [0, 1], [yFlamme, 1000]);

  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s && t < calcul.t_coupe);
  const ageIcone = atteint ? t - atteint.arrivee_s : 0;
  const icone = atteint && atteint.cle !== "soleil" ? interpolate(ageIcone, [0, 0.3, 3.0, 3.4], [0, 1, 1, 0], borne) : 0;

  // Épilogue : une Lune de cire qui fond dans l'étoile, le carburant comparé, puis la fusion
  const lune = t >= calcul.t_coupe && t < calcul.t_qui ? entre(t, calcul.t_coupe + 0.3, calcul.t_qui - 0.5) : -1;
  const compare = t >= calcul.t_qui && t < calcul.t_patte ? entre(t, calcul.t_qui, calcul.t_qui + 0.8) : 0;
  const fusion = t >= calcul.t_patte && t < calcul.t_retour;
  const cycle = (t - calcul.t_patte) % 1.4;

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        {/* Halo : des cercles plats de plus en plus grands */}
        {[3, 2, 1].map((i) => (
          <circle key={i} cx={CX} cy={etoile > 0 ? yEtoile : yFlamme} r={(120 + 22 * n) * i * 0.6 * vacille} fill={palette.accent} opacity={0.08 + 0.02 * i} />
        ))}

        {/* La bougie, qui s'efface quand la flamme devient étoile */}
        {etoile < 1 && (
          <g opacity={1 - etoile}>
            <rect x={0} y={PIED} width={1080} height={1920 - PIED} fill="#2E2219" opacity={1 - entre(n, 10, 20)} />
            <rect x={CX - 55} y={PIED - 260} width={110} height={260} rx={10} fill="#F4E9D2" />
            <path d={`M ${CX - 55} ${PIED - 250} q 20 30 10 60 q -10 -30 -10 -60 Z`} fill="#E6D7B8" />
            <rect x={CX - 4} y={PIED - 285} width={8} height={30} fill="#2A1405" />
          </g>
        )}

        {etoile < 1 && (
          <g transform={`translate(${CX} ${PIED - 280}) scale(${flamme * vacille * (1 - etoile * 0.3)})`} opacity={1 - etoile}>
            <path d="M 0 -150 C 40 -90 50 -40 34 -10 C 20 14 -20 14 -34 -10 C -50 -40 -40 -90 0 -150 Z" fill="#FF9F1C" />
            <path d="M 0 -100 C 22 -60 26 -30 16 -12 C 8 2 -8 2 -16 -12 C -26 -30 -22 -60 0 -100 Z" fill="#FFE08A" />
          </g>
        )}
        {etoile > 0 && (
          <g opacity={etoile}>
            <circle cx={CX} cy={yEtoile} r={rEtoile * 1.25} fill="#FFE08A" opacity={0.5} />
            <circle cx={CX} cy={yEtoile} r={rEtoile} fill="#FFD23F" />
            <circle cx={CX - rEtoile * 0.3} cy={yEtoile - rEtoile * 0.2} r={rEtoile * 0.12} fill="#FFF1C1" />
            <circle cx={CX + rEtoile * 0.35} cy={yEtoile + rEtoile * 0.3} r={rEtoile * 0.08} fill="#F29B30" />
          </g>
        )}

        {icone > 0 && atteint && (
          <g transform={`translate(800 ${ICONE_Y}) scale(${icone * 0.72})`}>
            <circle r={170} fill={palette.fond} opacity={0.55} />
            <Icone cle={atteint.cle} t={t} />
          </g>
        )}

        {epilogue && lune >= 0 && (
          <g transform={`translate(${CX} ${interpolate(lune, [0, 1], [560, yEtoile])}) scale(${1 - 0.9 * lune})`}>
            <circle r={150} fill="#F4E9D2" />
            {[
              [-50, -40, 30],
              [50, 30, 22],
              [-10, 70, 18],
            ].map(([x, y, r]) => (
              <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="#E6D7B8" />
            ))}
            <path d="M -150 20 q 20 60 0 120 M 120 60 q 10 40 0 70" stroke="#F4E9D2" strokeWidth={14} fill="none" strokeLinecap="round" />
          </g>
        )}

        {epilogue && compare > 0 && (
          <g opacity={compare}>
            <circle cx={300} cy={620} r={150} fill="#F4E9D2" />
            <circle cx={800} cy={620} r={4} fill="#FFFFFF" stroke="#2A1405" strokeWidth={2} />
            <circle cx={800} cy={620} r={40} fill="none" stroke="#2A1405" strokeWidth={4} strokeDasharray="8 8" />
          </g>
        )}

        {fusion && (
          <g transform={`translate(${CX} 1000) scale(1.8)`}>
            <circle cx={interpolate(cycle, [0, 0.6], [-160, -18], borne)} cy={0} r={34} fill="#D7263D" />
            <circle cx={interpolate(cycle, [0, 0.6], [160, 18], borne)} cy={0} r={34} fill="#2F6FB0" />
            {cycle > 0.6 && <circle r={40 + (cycle - 0.6) * 500} fill="none" stroke="#FFFFFF" strokeWidth={Math.max(0, 22 - (cycle - 0.6) * 30)} />}
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
