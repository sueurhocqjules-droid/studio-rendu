import type { FC } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import calcul from "../../../sujets/press.calcul.json";
import type { SceneProps } from "../../cadre/types";
import { entre, lisse, paletteA, pasDecor } from "./temps";

const SOL = 1180;
const BLOC_X = 540;
const JAUNE = "#E8B321";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const N_DIAMANT = calcul.paliers.find((p) => p.cle === "diamant")?.pas ?? 33;

const Espresso = () => (
  <g>
    <rect x={-50} y={-70} width={100} height={70} rx={14} fill="#FFFDF6" />
    <path d="M 50 -55 q 30 0 30 20 q 0 20 -30 20" fill="none" stroke="#FFFDF6" strokeWidth={10} />
    <ellipse cx={0} cy={-68} rx={44} ry={8} fill="#5A3A22" />
    <ellipse cx={0} cy={2} rx={70} ry={10} fill="#E4DCCB" />
  </g>
);

const Plongee = () => (
  <g>
    <rect x={-34} y={-200} width={68} height={200} rx={30} fill="#E2B13C" />
    <rect x={-34} y={-150} width={68} height={16} fill="#1F1D1A" />
    <rect x={-10} y={-228} width={20} height={30} fill="#9AA3B2" />
    <rect x={-26} y={-236} width={52} height={12} rx={6} fill="#6B7380" />
  </g>
);

const Acier: FC<{ plie: number }> = ({ plie }) => (
  <g transform={`rotate(${-plie * 25})`}>
    <path d={`M -80 -30 Q 0 ${-30 + plie * 50} 80 -30 L 80 -18 Q 0 ${-18 + plie * 50} -80 -18 Z`} fill="#4E5A66" />
    <path d={`M -80 -12 Q 0 ${-12 + plie * 50} 80 -12 L 80 0 Q 0 ${plie * 50} -80 0 Z`} fill="#4E5A66" />
    <rect x={-80} y={-30} width={10} height={30} fill="#3A434D" />
  </g>
);

const Diamant: FC<{ l: number; eclat: number }> = ({ l, eclat }) => (
  <g>
    <polygon points={`${-l},${-l * 0.35} ${-l * 0.6},${-l * 0.75} ${l * 0.6},${-l * 0.75} ${l},${-l * 0.35} 0,${l * 0.55}`} fill="#BFEFFF" />
    <polygon points={`${-l * 0.6},${-l * 0.75} ${-l * 0.2},${-l * 0.35} ${l * 0.2},${-l * 0.35} ${l * 0.6},${-l * 0.75}`} fill="#E8FAFF" />
    <polygon points={`${-l},${-l * 0.35} ${-l * 0.2},${-l * 0.35} 0,${l * 0.55}`} fill="#8ED8F2" />
    <polygon points={`${l},${-l * 0.35} ${l * 0.2},${-l * 0.35} 0,${l * 0.55}`} fill="#A6E4F7" />
    {eclat > 0 &&
      [0, 1, 2, 3].map((i) => {
        const a = (i * Math.PI) / 2 + 0.4;
        return <line key={i} x1={l * 0.3 + Math.cos(a) * 10} y1={-l * 0.6 + Math.sin(a) * 10} x2={l * 0.3 + Math.cos(a) * 60 * eclat} y2={-l * 0.6 + Math.sin(a) * 60 * eclat} stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" />;
      })}
  </g>
);

// Une enclume de diamant : deux diamants pointe contre pointe dans une monture d'acier
const Enclume: FC<{ ecart: number }> = ({ ecart }) => (
  <g>
    <rect x={-170} y={-260 - ecart} width={340} height={70} rx={10} fill="#8A939E" />
    <rect x={-170} y={190 + ecart} width={340} height={70} rx={10} fill="#8A939E" />
    {[-130, 130].map((x) => (
      <rect key={x} x={x - 12} y={-260 - ecart} width={24} height={520 + 2 * ecart} fill="#5F6873" />
    ))}
    <g transform={`translate(0 ${-ecart})`}>
      <polygon points="-110,-190 110,-190 70,-120 14,-6 -14,-6 -70,-120" fill="#BFEFFF" />
      <polygon points="-70,-120 70,-120 14,-6 -14,-6" fill="#E8FAFF" />
    </g>
    <g transform={`translate(0 ${ecart})`}>
      <polygon points="-110,190 110,190 70,120 14,6 -14,6 -70,120" fill="#BFEFFF" />
      <polygon points="-70,120 70,120 14,6 -14,6" fill="#E8FAFF" />
    </g>
    <circle r={5} fill="#D7263D" />
  </g>
);

export const ScenePress = ({ t }: SceneProps) => {
  const palette = paletteA(t);
  const n = pasDecor(t);
  const enChaine = t < calcul.t_coupe || t >= calcul.t_retour;

  // Chaque seconde, un coup de presse : la platine descend un peu plus, puis se stabilise
  const frac = t - Math.floor(t);
  const coup = t < calcul.t_limite + 0.5 ? Math.exp(-frac * 9) * Math.sin(frac * 30) * 10 : 0;
  const diamant = n >= N_DIAMANT - 0.5;
  const hBloc = diamant ? 170 : 300 - 150 * Math.min(1, n / N_DIAMANT);
  const lBloc = diamant ? 0 : 260 + 90 * Math.min(1, n / N_DIAMANT);
  const platine = SOL - hBloc - 50 + Math.max(0, coup);
  const fissures = entre(n, 20, 30);
  const eclat = diamant && t < calcul.t_coupe ? Math.max(0, 1 - Math.abs(t - (N_DIAMANT - 0.5)) * 1.5) : 0;

  // Épilogue : la presse rétrécit, l'enclume de diamant apparaît
  const echellePresse = interpolate(t, [calcul.t_coupe, calcul.t_coupe + 1.2, calcul.t_retour, calcul.t_retour + 1.2], [1, 0, 0, 1], borne);
  const enclume = interpolate(t, [calcul.t_coupe + 0.6, calcul.t_coupe + 1.6, calcul.t_retour - 0.4, calcul.t_retour + 0.4], [0, 1, 1, 0], borne);
  const zoomPointes = lisse(entre(t, calcul.t_qui, calcul.t_qui + 1.2)) * (1 - lisse(entre(t, calcul.t_patte, calcul.t_patte + 1)));
  const poids = entre(t, calcul.t_patte + 0.6, calcul.t_patte + 1.4) * (1 - entre(t, calcul.t_retour - 0.6, calcul.t_retour));

  // Fond : on « descend » dans la Terre après le diamant
  const profondeur = entre(n, 34, calcul.n_max);
  const couches = n > 33.5 && (
    <g opacity={entre(n, 33.5, 35)}>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const y = 1920 - ((i * 380 + profondeur * 2400) % 2280);
        return <ellipse key={i} cx={(i * 397) % 1080} cy={y} rx={160} ry={40} fill="#FFFFFF" opacity={0.08} />;
      })}
    </g>
  );

  const reference = calcul.paliers.filter((p) => p.cle !== "diamant" && t >= p.arrivee_s && t < p.arrivee_s + 3.2 && enChaine && t < calcul.t_coupe).pop();
  const ageRef = reference ? t - reference.arrivee_s : 0;
  const echelleRef = reference ? interpolate(ageRef, [0, 0.25, 2.8, 3.2], [0, 1, 1, 0], borne) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        {couches}

        <g transform={`translate(540 ${SOL}) scale(${echellePresse}) translate(-540 ${-SOL})`} opacity={echellePresse > 0.02 ? 1 : 0}>
          {/* Bâti */}
          <rect x={150} y={SOL} width={780} height={90} fill="#3A3F46" />
          <rect x={190} y={540} width={56} height={SOL - 540} fill={JAUNE} />
          <rect x={834} y={540} width={56} height={SOL - 540} fill={JAUNE} />
          <rect x={160} y={510} width={760} height={100} rx={10} fill={JAUNE} />
          <rect x={160} y={590} width={760} height={20} fill="#C99512" />
          <rect x={BLOC_X - 50} y={610} width={100} height={platine - 610} fill="#C9CED8" />
          <rect x={BLOC_X - 260} y={platine} width={520} height={50} rx={6} fill="#4E5A66" />
          <rect x={BLOC_X - 260} y={platine + 40} width={520} height={10} fill="#3A434D" />

          {/* Manomètre */}
          <g transform="translate(330 560)">
            <circle r={40} fill="#FFFDF6" stroke="#1F1D1A" strokeWidth={6} />
            <line x1={0} y1={0} x2={30 * Math.cos(-2.4 + 4.8 * frac)} y2={30 * Math.sin(-2.4 + 4.8 * frac)} stroke="#C0392B" strokeWidth={5} strokeLinecap="round" />
          </g>

          {/* Le bloc : graphite qui s'aplatit, puis diamant */}
          {diamant ? (
            <g transform={`translate(${BLOC_X} ${SOL - 95})`}>
              <Diamant l={110} eclat={eclat} />
            </g>
          ) : (
            <g>
              <rect x={BLOC_X - lBloc / 2} y={SOL - hBloc} width={lBloc} height={hBloc} rx={10} fill="#2E3136" />
              {[0.25, 0.5, 0.75].map((f) => (
                <rect key={f} x={BLOC_X - lBloc / 2 + 10} y={SOL - hBloc * f} width={lBloc - 20} height={4} fill="#4A4F57" />
              ))}
              {fissures > 0 && (
                <path
                  d={`M ${BLOC_X - lBloc * 0.3} ${SOL - hBloc} l 20 ${hBloc * 0.3} l -16 ${hBloc * 0.25} l 24 ${hBloc * 0.3} M ${BLOC_X + lBloc * 0.25} ${SOL - hBloc} l -18 ${hBloc * 0.4} l 20 ${hBloc * 0.35}`}
                  fill="none"
                  stroke="#9AA3B2"
                  strokeWidth={5}
                  opacity={fissures}
                />
              )}
            </g>
          )}

          {/* La référence se pose à droite du bloc */}
          {reference && (
            <g transform={`translate(760 ${SOL}) scale(${echelleRef})`}>
              {reference.cle === "espresso" && <Espresso />}
              {reference.cle === "plongee" && <Plongee />}
              {reference.cle === "acier" && (
                <g transform="translate(0 -40)">
                  <Acier plie={entre(ageRef, 0.2, 1.2)} />
                </g>
              )}
              {(reference.cle === "manteau" || reference.cle === "noyau" || reference.cle === "centre") && (
                <g transform="translate(0 -90)">
                  <circle r={80} fill="#5B7FA6" />
                  <path d="M 0 0 L 0 -80 A 80 80 0 0 1 80 0 Z" fill="#B5481B" />
                  <path d="M 0 0 L 0 -44 A 44 44 0 0 1 44 0 Z" fill="#F2A33A" />
                  <path d="M 0 0 L 0 -19 A 19 19 0 0 1 19 0 Z" fill="#FFF1C1" />
                  <circle
                    cx={reference.cle === "manteau" ? 18 : reference.cle === "noyau" ? 31 : 0}
                    cy={reference.cle === "manteau" ? -62 : reference.cle === "noyau" ? -31 : 0}
                    r={10}
                    fill="#FFFFFF"
                    stroke="#1F1D1A"
                    strokeWidth={4}
                  />
                </g>
              )}
            </g>
          )}
        </g>

        {enclume > 0 && (
          <g transform={`translate(540 ${900 + 100 * zoomPointes}) scale(${enclume * (1 + 0.8 * zoomPointes)})`} opacity={enclume}>
            {poids > 0 && (
              <g transform={`translate(0 ${-330 - 80 * (1 - poids)})`} opacity={poids}>
                <path d="M -90 0 L 90 0 L 70 -110 L -70 -110 Z" fill="#2B2B2E" />
                <rect x={-30} y={-150} width={60} height={50} rx={20} fill="none" stroke="#2B2B2E" strokeWidth={18} />
              </g>
            )}
            <Enclume ecart={20 * (1 - zoomPointes)} />
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
