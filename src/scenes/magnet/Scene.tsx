import type { FC } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import calcul from "../../../sujets/magnet.calcul.json";
import type { SceneProps } from "../../cadre/types";
import { entre, paletteA, pasDecor } from "./temps";

const MX = 540;
const MY = 830;
const ROUGE = "#D7263D";
const METAL = "#9AA3B2";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const pas = (cle: string) => calcul.paliers.find((p) => p.cle === cle)?.pas ?? 99;

// Objets métalliques qui volent vers l'aimant : seuil d'apparition (pas), point de départ, place finale, forme
const OBJETS: { n: number; de: [number, number]; a: [number, number]; r: number; Forme: FC }[] = [
  { n: 3, de: [-200, 700], a: [-70, -40], r: -30, Forme: () => <path d="M -20 -8 h 34 a 8 8 0 0 1 0 16 h -30 a 5 5 0 0 1 0 -10 h 24" fill="none" stroke={METAL} strokeWidth={4} /> },
  { n: 5, de: [1250, 600], a: [72, -50], r: 40, Forme: () => <path d="M -20 -8 h 34 a 8 8 0 0 1 0 16 h -30 a 5 5 0 0 1 0 -10 h 24" fill="none" stroke={METAL} strokeWidth={4} /> },
  {
    n: 8,
    de: [-250, 1100],
    a: [-80, 50],
    r: -60,
    Forme: () => (
      <g fill="#C9A23A">
        <circle cx={-26} cy={0} r={18} />
        <rect x={-10} y={-5} width={52} height={10} />
        <rect x={30} y={4} width={6} height={10} />
        <circle cx={-26} cy={0} r={6} fill="#8A6A1E" />
      </g>
    ),
  },
  {
    n: 12,
    de: [1300, 1000],
    a: [90, 40],
    r: 70,
    Forme: () => (
      <g fill={METAL}>
        <ellipse cx={-40} cy={0} rx={22} ry={14} />
        <rect x={-20} y={-4} width={80} height={8} rx={4} />
      </g>
    ),
  },
  {
    n: 14,
    de: [-300, 400],
    a: [-40, -95],
    r: -100,
    Forme: () => (
      <g fill={METAL}>
        <rect x={-50} y={-4} width={70} height={8} rx={4} />
        {[-8, -2, 4, 10].map((y) => (
          <rect key={y} x={20} y={y - 2} width={34} height={3} />
        ))}
      </g>
    ),
  },
  {
    n: 17,
    de: [1300, 300],
    a: [50, 100],
    r: 20,
    Forme: () => (
      <g>
        <path d="M -10 -4 L 60 -14 L 60 -8 Z M -10 4 L 60 14 L 60 8 Z" fill={METAL} />
        <circle cx={-26} cy={-12} r={14} fill="none" stroke="#2F6FB0" strokeWidth={8} />
        <circle cx={-26} cy={12} r={14} fill="none" stroke="#2F6FB0" strokeWidth={8} />
      </g>
    ),
  },
  {
    n: 22,
    de: [-400, 900],
    a: [-120, 100],
    r: -20,
    Forme: () => (
      <g>
        <circle r={60} fill="#3A3F46" />
        <circle r={46} fill="#4E5560" />
        <rect x={56} y={-9} width={90} height={18} rx={8} fill="#2B2B2E" />
      </g>
    ),
  },
];

const Icone: FC<{ cle: string; t: number }> = ({ cle, t }) => {
  switch (cle) {
    case "tache":
      return (
        <g>
          <circle r={80} fill="#FFB238" />
          <circle cx={-20} cy={-10} r={20} fill="#7A3B0E" />
          <circle cx={22} cy={22} r={12} fill="#7A3B0E" />
        </g>
      );
    case "irm":
      return (
        <g>
          <circle r={84} fill="#F4F6FF" />
          <circle r={44} fill="#2F4A66" />
          <rect x={-110} y={30} width={220} height={22} rx={8} fill="#D9DEE6" />
        </g>
      );
    case "record":
      return (
        <g>
          {[-60, -30, 0, 30, 60].map((x) => (
            <rect key={x} x={x - 12} y={-80} width={24} height={160} rx={10} fill="#C46A2B" />
          ))}
          <rect x={-90} y={-14} width={180} height={28} fill="#3A3F46" />
        </g>
      );
    case "explosion":
      return <polygon points={Array.from({ length: 16 }, (_, i) => `${Math.cos((i * Math.PI) / 8) * (i % 2 ? 50 : 100)},${Math.sin((i * Math.PI) / 8) * (i % 2 ? 50 : 100)}`).join(" ")} fill="#FFF1C1" transform={`rotate(${t * 40})`} />;
    case "naine":
      return (
        <g>
          <circle r={90} fill="#9FD8FF" opacity={0.3} />
          <circle r={56} fill="#F4F6FF" />
        </g>
      );
    default:
      return null;
  }
};

const Grenouille: FC<{ t: number }> = ({ t }) => (
  <g transform={`translate(0 ${12 * Math.sin(t * 3)})`}>
    <ellipse cx={0} cy={0} rx={70} ry={46} fill="#5FA34A" />
    <circle cx={-30} cy={-40} r={20} fill="#5FA34A" />
    <circle cx={30} cy={-40} r={20} fill="#5FA34A" />
    <circle cx={-30} cy={-42} r={9} fill="#13302B" />
    <circle cx={30} cy={-42} r={9} fill="#13302B" />
    <path d="M -64 20 l -36 30 M 64 20 l 36 30" stroke="#5FA34A" strokeWidth={16} strokeLinecap="round" />
  </g>
);

const Lignes: FC<{ n: number; t: number; couleur: string; echelle: number }> = ({ n, t, couleur, echelle }) => {
  const nombre = Math.min(9, 2 + Math.floor(n / 5));
  const battement = 1 + 0.04 * Math.sin((t - Math.floor(t)) * Math.PI);
  return (
    <g transform={`scale(${echelle * battement})`} fill="none" stroke={couleur} strokeWidth={6} strokeLinecap="round">
      {Array.from({ length: nombre }, (_, i) => {
        const r = 70 + i * 45;
        return (
          <g key={i} opacity={0.75 - i * 0.06}>
            <ellipse cx={-r} cy={0} rx={r} ry={r * 0.55} />
            <ellipse cx={r} cy={0} rx={r} ry={r * 0.55} />
          </g>
        );
      })}
    </g>
  );
};

export const SceneMagnet = ({ t }: SceneProps) => {
  const palette = paletteA(t);
  const n = pasDecor(t);
  const magnetar = t >= calcul.t_coupe && t < calcul.t_patte;

  if (magnetar) {
    const carte = entre(t, calcul.t_qui, calcul.t_qui + 0.6);
    const efface = entre(t, calcul.t_qui + 0.8, calcul.t_qui + 2.2);
    return (
      <AbsoluteFill style={{ backgroundColor: palette.fond }}>
        <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
          {Array.from({ length: 30 }, (_, i) => (
            <circle key={i} cx={(i * 263) % 1080} cy={520 + ((i * 397) % 900)} r={2} fill="#F4F6FF" opacity={0.6} />
          ))}
          <g transform={`translate(540 ${interpolate(carte, [0, 1], [900, 760])}) rotate(90)`}>
            <Lignes n={50} t={t} couleur="#9FD8FF" echelle={1.1} />
          </g>
          <circle cx={540} cy={interpolate(carte, [0, 1], [900, 760])} r={34} fill="#FFFFFF" />
          <circle cx={540} cy={interpolate(carte, [0, 1], [900, 760])} r={60} fill="#9FD8FF" opacity={0.3} />
          {carte > 0 && (
            <g transform={`translate(540 1150) scale(${carte})`}>
              <rect x={-170} y={-105} width={340} height={210} rx={22} fill="#2F6FB0" />
              <rect x={-170} y={-60} width={340} height={44} fill={interpolate(efface, [0, 1], [0, 1]) > 0.5 ? "#7C8CA3" : "#14110D"} />
              <rect x={-130} y={20} width={60} height={46} rx={8} fill="#E8C872" />
              {efface > 0 && efface < 1 && <rect x={-170} y={-60} width={340 * efface} height={44} fill="#9FD8FF" />}
            </g>
          )}
        </svg>
      </AbsoluteFill>
    );
  }

  const enfonce = entre(n, 26, 32);
  const boule = entre(n, 32.5, 34);
  const espace = entre(n, 37, 40);
  const aiguilles = entre(n, 43.3, 44.3);
  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s && t < calcul.t_patte);
  const ageIcone = atteint ? t - atteint.arrivee_s : 0;
  const icone = atteint && atteint.cle !== "grenouille" && atteint.cle !== "atome" ? interpolate(ageIcone, [0, 0.3, 3.0, 3.4], [0, 1, 1, 0], borne) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        {espace > 0 &&
          Array.from({ length: 30 }, (_, i) => <circle key={i} cx={(i * 263) % 1080} cy={520 + ((i * 397) % 900)} r={2} fill="#F4F6FF" opacity={espace * 0.6} />)}

        {/* Le frigo : sa porte se creuse vers l'aimant, puis tout se roule en boule */}
        {boule < 1 && (
          <g opacity={1 - boule}>
            <path
              d={`M 230 520 L 850 520 L 850 1500 L 230 1500 Z M 230 980 Q ${MX} ${980 + 200 * enfonce} 850 980`}
              fill="#F4F4F0"
              stroke="#13302B"
              strokeWidth={8}
            />
            <path d={`M 230 ${MY} Q ${MX} ${MY + 120 * enfonce} 850 ${MY}`} fill="none" stroke="#C9CCD2" strokeWidth={6} opacity={enfonce} />
            <rect x={790} y={560} width={22} height={240} rx={10} fill="#C9CCD2" />
          </g>
        )}

        <g transform={`translate(${MX} ${MY})`}>
          <Lignes n={n} t={t} couleur={palette.accent} echelle={1} />

          {boule > 0 && <circle r={120 + 60 * boule} fill="#7E8791" opacity={Math.min(1, boule * 1.5)} />}
          {boule > 0 &&
            [0, 1, 2, 3, 4, 5].map((i) => (
              <path key={i} d={`M ${-100 + i * 30} ${-60 + (i % 3) * 40} l 40 20 l -20 30`} fill="none" stroke="#B9C0CA" strokeWidth={8} opacity={boule} />
            ))}

          {/* Le mot et l'aimant */}
          {boule < 1 && (
            <g transform="rotate(-4)" opacity={1 - boule}>
              <rect x={-110} y={40} width={220} height={210} fill="#FFE27A" />
              {[90, 130, 170, 210].map((y) => (
                <rect key={y} x={-80} y={y} width={y === 210 ? 100 : 160} height={10} rx={5} fill="#C9A23A" />
              ))}
            </g>
          )}
          {boule < 1 &&
            OBJETS.filter((o) => n >= o.n).map((o, i) => {
              const vol = entre(n, o.n, o.n + 0.5);
              const x = interpolate(vol, [0, 1], [o.de[0] - MX, o.a[0]]);
              const y = interpolate(vol, [0, 1], [o.de[1] - MY, o.a[1]]);
              return (
                <g key={i} transform={`translate(${x} ${y}) rotate(${o.r})`} opacity={1 - boule}>
                  <o.Forme />
                </g>
              );
            })}
          <rect x={-52} y={-52} width={104} height={104} rx={26} fill={ROUGE} />
          <rect x={-36} y={-40} width={30} height={14} rx={7} fill="#FF8A95" />

          {n >= pas("grenouille") - 0.5 && n < pas("grenouille") + 4 && (
            <g transform={`translate(0 -230) scale(${entre(n, pas("grenouille") - 0.5, pas("grenouille"))})`}>
              <Grenouille t={t} />
            </g>
          )}

          {aiguilles > 0 &&
            [-300, -150, 150, 300].map((x, i) => (
              <g key={x} transform={`translate(${x} ${i % 2 ? -200 : 220})`}>
                <ellipse rx={40 * (1 - 0.85 * aiguilles)} ry={40 * (1 + 2.5 * aiguilles)} fill="#F4F6FF" opacity={0.85} />
                <circle r={9} fill={ROUGE} />
              </g>
            ))}
        </g>

        {icone > 0 && atteint && (
          <g transform={`translate(860 ${MY - 260}) scale(${icone})`}>
            <Icone cle={atteint.cle} t={t} />
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
