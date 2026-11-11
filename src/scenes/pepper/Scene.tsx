import type { FC } from "react";
import { AbsoluteFill, interpolate, interpolateColors } from "remotion";
import calcul from "../../../sujets/pepper.calcul.json";
import type { SceneProps } from "../../cadre/types";
import { depuisEtape, entre, etapeA, lisse, paletteA, pasDecor } from "./temps";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const PLAN_Y = 1150; // bord avant de la planche, début du plan de travail
const PIMENT_Y = 1000;
const ETAGERE_Y = 640;
const TIGE = "#3E7A2A";

// Corps de piment couché : épais côté tige (à gauche), effilé vers la pointe
const corps = (L: number, h: number, pointe: number) =>
  `M ${-L / 2} ${-h} C ${-L / 6} ${-h * 1.15} ${L / 4} ${-h * 0.7} ${L / 2} ${pointe} C ${L / 4} ${h * 0.9} ${-L / 6} ${h * 1.1} ${-L / 2} ${h} Q ${-L / 2 - h * 0.45} 0 ${-L / 2} ${-h} Z`;

const Tige = ({ x, h }: { x: number; h: number }) => (
  <g>
    <ellipse cx={x + 4} cy={0} rx={h * 0.28} ry={h * 0.8} fill={TIGE} />
    <path d={`M ${x - 4} 0 Q ${x - 30} -6 ${x - 44} -34`} fill="none" stroke={TIGE} strokeWidth={13} strokeLinecap="round" />
  </g>
);

const Reflet = ({ L, h }: { L: number; h: number }) => (
  <path d={`M ${-L / 2 + 20} ${-h * 0.55} Q ${0} ${-h * 0.95} ${L / 4} ${-h * 0.45}`} fill="none" stroke="#FFFFFF" strokeOpacity={0.4} strokeWidth={h * 0.22} strokeLinecap="round" />
);

const Plis = ({ xs, h, couleur }: { xs: number[]; h: number; couleur: string }) => (
  <g>
    {xs.map((x) => (
      <path key={x} d={`M ${x} ${-h * 0.8} Q ${x + 12} 0 ${x} ${h * 0.75}`} fill="none" stroke={couleur} strokeWidth={6} strokeLinecap="round" />
    ))}
  </g>
);

const Pepperoncini = () => (
  <g>
    <path d={corps(250, 40, 28)} fill="#C8D36A" />
    <Plis xs={[-70, -10, 50]} h={34} couleur="#A9B44C" />
    <Reflet L={250} h={40} />
    <Tige x={-125} h={40} />
  </g>
);

const Jalapeno = () => (
  <g>
    <path d={corps(250, 58, 14)} fill="#2E6B2B" />
    <Reflet L={250} h={58} />
    <Tige x={-125} h={58} />
  </g>
);

const Cayenne = () => (
  <g>
    <path d={corps(360, 30, 46)} fill="#D3261B" />
    <Reflet L={360} h={30} />
    <Tige x={-180} h={30} />
  </g>
);

const Habanero = () => (
  <g transform="scale(0.72)">
    <path d="M -80 -70 C -20 -96 70 -80 92 -20 C 104 20 80 70 20 80 C -40 88 -90 60 -96 0 C -100 -40 -94 -60 -80 -70 Z" fill="#F5821F" />
    <Plis xs={[-50, -8, 36]} h={66} couleur="#D9620E" />
    <path d="M -60 -50 Q -10 -76 40 -56" fill="none" stroke="#FFFFFF" strokeOpacity={0.4} strokeWidth={14} strokeLinecap="round" />
    <Tige x={-92} h={56} />
  </g>
);

// Bosses posées sur le corps : la peau fripée des piments extrêmes
const Bosses = ({ points, couleur }: { points: [number, number, number][]; couleur: string }) => (
  <g>
    {points.map(([x, y, r]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y * 0.86} r={r * 0.75} fill={couleur} />
    ))}
  </g>
);

const Fantome = () => (
  <g>
    <path d={corps(320, 50, 30)} fill="#B3140F" />
    <Bosses
      couleur="#B3140F"
      points={[
        [-110, -46, 18],
        [-60, -50, 20],
        [-5, -44, 18],
        [50, -34, 16],
        [100, -16, 13],
        [-90, 46, 16],
        [-30, 48, 17],
        [30, 40, 15],
      ]}
    />
    <Plis xs={[-90, -30, 30, 90]} h={42} couleur="#86100B" />
    <Reflet L={300} h={46} />
    <Tige x={-160} h={50} />
  </g>
);

const PepperX = () => (
  <g>
    <path d={corps(270, 62, 20)} fill="#B9C23A" />
    <Bosses
      couleur="#B9C23A"
      points={[
        [-100, -58, 20],
        [-50, -66, 24],
        [10, -58, 22],
        [60, -40, 18],
        [-80, 58, 20],
        [-20, 60, 22],
        [40, 46, 18],
      ]}
    />
    <Plis xs={[-80, -20, 40]} h={56} couleur="#8E9726" />
    <path d="M 128 18 Q 170 30 168 -12 Q 166 -36 146 -40" fill="none" stroke="#B9C23A" strokeWidth={16} strokeLinecap="round" />
    <Reflet L={250} h={56} />
    <Tige x={-135} h={62} />
  </g>
);

// Un éclat de cristal : prisme hexagonal allongé, une face claire, une face ombrée
const Eclat = ({ x, y, w, h, angle }: { x: number; y: number; w: number; h: number; angle: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle})`}>
    <polygon points={`0,${-h} ${w / 2},${-h + w / 2} ${w / 2},0 0,${w / 3} ${-w / 2},0 ${-w / 2},${-h + w / 2}`} fill="#FFFFFF" stroke="#F0B98A" strokeWidth={4} />
    <polygon points={`0,${-h} ${w / 2},${-h + w / 2} ${w / 2},0 0,${w / 3}`} fill="#FBE6D2" />
  </g>
);

const Cristal = ({ taille, lueur }: { taille: number; lueur: number }) => (
  <g transform={`scale(${taille})`}>
    <ellipse cx={0} cy={-40} rx={170} ry={130} fill="#FFFFFF" opacity={lueur} />
    <Eclat x={-60} y={60} w={54} h={150} angle={-24} />
    <Eclat x={60} y={60} w={50} h={140} angle={22} />
    <Eclat x={0} y={64} w={70} h={200} angle={0} />
    <Eclat x={-100} y={64} w={36} h={80} angle={-48} />
    <Eclat x={104} y={64} w={34} h={76} angle={46} />
  </g>
);

const PIMENTS: FC[] = [Pepperoncini, Jalapeno, Cayenne, Habanero, Fantome, PepperX];

// Euphorbia resinifera : tiges dressées à quatre angles, épines par paires
const Colonne = ({ x, h, l }: { x: number; h: number; l: number }) => (
  <g>
    <rect x={x - l / 2} y={-h} width={l} height={h} rx={l * 0.3} fill="#6E9E7A" />
    <rect x={x - l / 10} y={-h + 8} width={l / 5} height={h - 8} fill="#57846A" />
    {Array.from({ length: Math.floor(h / 34) }, (_, i) => (
      <g key={i}>
        <path d={`M ${x - l / 2} ${-h + 24 + i * 34} l -12 -8 M ${x - l / 2} ${-h + 24 + i * 34} l -12 6`} stroke="#5A3A1E" strokeWidth={4} strokeLinecap="round" />
        <path d={`M ${x + l / 2} ${-h + 24 + i * 34} l 12 -8 M ${x + l / 2} ${-h + 24 + i * 34} l 12 6`} stroke="#5A3A1E" strokeWidth={4} strokeLinecap="round" />
      </g>
    ))}
  </g>
);

const Plante = ({ t }: { t: number }) => {
  const goutte = entre(t, calcul.t_seve + 0.2, calcul.t_seve + 1.2);
  const flaque = entre(t, calcul.t_seve + 1.1, calcul.t_lait);
  return (
    <g>
      <path d="M -150 70 L 150 70 L 120 150 L -120 150 Z" fill="#C8643A" />
      <rect x={-162} y={52} width={324} height={30} rx={8} fill="#A9502C" />
      <g transform="translate(0 56)">
        <Colonne x={-96} h={190} l={46} />
        <Colonne x={-40} h={270} l={52} />
        <Colonne x={20} h={320} l={56} />
        <Colonne x={80} h={240} l={50} />
        <Colonne x={128} h={150} l={42} />
      </g>
      {/* La sève blanche perle d'une tige coupée */}
      {t >= calcul.t_seve && (
        <g>
          <rect x={-8} y={-268} width={56} height={10} fill="#FFFFFF" />
          <path d={`M 20 ${-258 + goutte * 300} m -14 0 a 14 14 0 1 0 28 0 L 20 ${-282 + goutte * 300} Z`} fill="#FFFFFF" opacity={1 - flaque * 0.5} />
          <ellipse cx={20} cy={170} rx={80 * flaque} ry={14 * flaque} fill="#FFFFFF" />
        </g>
      )}
    </g>
  );
};

const VerreDeLait = ({ t }: { t: number }) => {
  const arrivee = lisse(entre(t, calcul.t_lait, calcul.t_lait + 0.6));
  const bascule = lisse(entre(t, calcul.t_lait + 0.6, calcul.t_lait + 1.1));
  const depart = lisse(entre(t, calcul.t_fin - 1.0, calcul.t_fin - 0.3));
  const x = interpolate(arrivee, [0, 1], [1300, 760]) + depart * 600;
  const angle = -70 * bascule * (1 - depart);
  const verse = bascule > 0.6 && depart === 0;
  return (
    <g>
      {verse && <path d={`M ${x - 110} ${PIMENT_Y - 300} Q ${x - 200} ${PIMENT_Y - 200} ${560} ${PIMENT_Y + 60}`} fill="none" stroke="#FFFFFF" strokeWidth={34} strokeLinecap="round" />}
      <g transform={`translate(${x} ${PIMENT_Y - 280}) rotate(${angle})`}>
        <path d="M -80 -130 L 80 -130 L 66 130 L -66 130 Z" fill="#E9F1F2" opacity={0.85} stroke="#FFFFFF" strokeWidth={8} />
        <path d={`M -76 ${-90 + bascule * 60} L 76 ${-90 + bascule * 60} L 66 130 L -66 130 Z`} fill="#FFFFFF" />
      </g>
    </g>
  );
};

const Vagues = ({ t, n, couleur }: { t: number; n: number; couleur: string }) => {
  const nombre = Math.min(1 + Math.floor(n / 4), 9);
  const ampleur = 10 + n * 0.8;
  const hauteur = Math.min(100 + n * 1.2, 125);
  return (
    <g opacity={0.75}>
      {Array.from({ length: nombre }, (_, i) => {
        const x = 540 + (i - (nombre - 1) / 2) * 70;
        const montee = ((t * 0.9 + i * 0.37) % 1) * 40;
        const y0 = PIMENT_Y - 150 - montee;
        const d = Array.from({ length: 7 }, (_, k) => {
          const y = y0 - (k * hauteur) / 6;
          const dx = Math.sin(k * 1.4 + t * 5 + i) * ampleur;
          return `${k === 0 ? "M" : "L"} ${x + dx} ${y}`;
        }).join(" ");
        return <path key={i} d={d} fill="none" stroke={couleur} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />;
      })}
    </g>
  );
};

const Flammes = ({ t, force }: { t: number; force: number }) => (
  <g>
    {Array.from({ length: 9 }, (_, i) => {
      const x = 180 + i * 90;
      const h = (50 + 40 * Math.abs(Math.sin(t * 7 + i * 1.7))) * force;
      return (
        <g key={i}>
          <path d={`M ${x - 34} ${PLAN_Y} Q ${x - 20} ${PLAN_Y - h * 0.6} ${x} ${PLAN_Y - h} Q ${x + 20} ${PLAN_Y - h * 0.6} ${x + 34} ${PLAN_Y} Z`} fill="#FF8A1E" />
          <path d={`M ${x - 16} ${PLAN_Y} Q ${x - 8} ${PLAN_Y - h * 0.35} ${x} ${PLAN_Y - h * 0.55} Q ${x + 8} ${PLAN_Y - h * 0.35} ${x + 16} ${PLAN_Y} Z`} fill="#FFE27A" />
        </g>
      );
    })}
  </g>
);

export const ScenePepper = ({ t }: SceneProps) => {
  const n = pasDecor(t);
  const palette = paletteA(t);
  const etape = etapeA(t);
  const age = depuisEtape(t);
  const epilogue = t >= calcul.t_coupe && t < calcul.t_fin;
  const retour = t >= calcul.t_fin;
  const ageFin = t - calcul.t_fin;

  const plan = epilogue ? "#2C3E31" : interpolateColors(n, [0, 9, 14, 26, 31, 52], ["#7C8F55", "#4E6A2E", "#7A2E1E", "#2A0906", "#B98A5E", "#D9BC95"]);
  const planche = epilogue ? "#C99A66" : interpolateColors(n, [0, 31, 52], ["#D9A066", "#C98A52", "#8A4F24"]);
  const tranche = epilogue ? "#9C6E40" : interpolateColors(n, [0, 31, 52], ["#A86F3A", "#93582C", "#5E3214"]);

  // Le nouveau piment surgit à chaque palier, avec un rebond
  const echelleArrivee = interpolate(age, [0, 0.14, 0.4], [0.55, 1.12, 1], borne);
  const echelleCoupe = interpolate(t - calcul.t_coupe, [0, 0.14, 0.4], [0.55, 1.12, 1], borne);
  const echelleRetour = interpolate(ageFin, [0, 0.14, 0.4], [0.55, 1.12, 1], borne);

  const objet = (() => {
    if (epilogue) {
      return (
        <g transform={`translate(540 ${PIMENT_Y - 10}) scale(${1.25 * echelleCoupe})`}>
          <Plante t={t} />
        </g>
      );
    }
    if (etape >= 6) {
      const taille = [1, 1.25, 1.5, 1.75][etape - 6];
      const lueur = 0.15 + 0.12 * (etape - 6) + 0.05 * Math.sin(t * 8);
      return (
        <g transform={`translate(540 ${PIMENT_Y + 40}) scale(${taille * echelleArrivee})`}>
          <Cristal taille={1} lueur={lueur} />
        </g>
      );
    }
    const Piment = PIMENTS[etape];
    const balance = Math.sin(t * 9) * Math.min(n / 30, 1) * 4;
    const echelle = retour ? echelleRetour : t < 1 ? 1 : echelleArrivee;
    return (
      <g transform={`translate(540 ${PIMENT_Y}) rotate(${balance - 6}) scale(${2 * echelle})`}>
        <Piment />
      </g>
    );
  })();

  // Le lait recouvre la planche puis se retire sur le pepperoncini
  const nappe = epilogue ? lisse(entre(t, calcul.t_lait + 1.0, calcul.t_retour + 1.0)) * (1 - lisse(entre(t, calcul.t_fin - 0.9, calcul.t_fin - 0.1))) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        {/* Carrelage de cuisine */}
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={`v${i}`} x={i * 135 - 3} y={0} width={6} height={PLAN_Y} fill="#FFFFFF" opacity={0.16} />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={`h${i}`} x={0} y={i * 135 - 3} width={1080} height={6} fill="#FFFFFF" opacity={0.16} />
        ))}

        {/* Étagère des piments déjà battus */}
        {!epilogue && !retour && etape >= 1 && (
          <g>
            <rect x={60} y={ETAGERE_Y} width={960} height={22} fill={tranche} />
            {PIMENTS.slice(0, Math.min(etape, 6)).map((Piment, i) => {
              const surgi = i === etape - 1 ? interpolate(age, [0, 0.3], [0, 1], borne) : 1;
              return (
                <g key={i} transform={`translate(${150 + i * 156} ${ETAGERE_Y - 30}) scale(${0.36 * surgi})`}>
                  <Piment />
                </g>
              );
            })}
          </g>
        )}

        <rect x={0} y={PLAN_Y} width={1080} height={1920 - PLAN_Y} fill={plan} />
        {/* Portes de placard sous le plan de travail */}
        <rect x={0} y={PLAN_Y + 60} width={1080} height={10} fill="#000000" opacity={0.18} />
        {[30, 555].map((x) => (
          <g key={x}>
            <rect x={x} y={PLAN_Y + 100} width={495} height={700} rx={12} fill="none" stroke="#000000" strokeOpacity={0.18} strokeWidth={10} />
            <rect x={x === 30 ? 465 : 575} y={PLAN_Y + 360} width={40} height={14} rx={7} fill="#000000" opacity={0.25} />
          </g>
        ))}

        {/* Planche à découper */}
        <rect x={120} y={PLAN_Y - 230} width={840} height={230} rx={34} fill={planche} />
        <rect x={120} y={PLAN_Y - 18} width={840} height={52} rx={14} fill={tranche} />
        <circle cx={900} cy={PLAN_Y - 180} r={22} fill={palette.fond} />
        {!epilogue && etape >= 6 && (
          <g fill="#3A1A0A" opacity={0.5}>
            <ellipse cx={400} cy={PLAN_Y - 70} rx={90} ry={26} />
            <ellipse cx={690} cy={PLAN_Y - 90} rx={70} ry={20} />
            {etape >= 8 && <ellipse cx={250} cy={PLAN_Y - 140} rx={60} ry={18} />}
          </g>
        )}

        {!epilogue && <Vagues t={t} n={n} couleur={palette.accent} />}
        {objet}
        {!epilogue && etape >= 8 && <Flammes t={t} force={etape >= 9 ? 1.4 : 1} />}

        {nappe > 0 && <ellipse cx={540} cy={PLAN_Y - 100} rx={440 * nappe} ry={130 * nappe} fill="#FFFFFF" />}
        {t >= calcul.t_lait && t < calcul.t_fin && <VerreDeLait t={t} />}

        {/* Éclair blanc à l'arrivée du dernier palier */}
        {etape === 9 && !epilogue && <rect x={0} y={0} width={1080} height={1920} fill="#FFFFFF" opacity={interpolate(age, [0, 0.35], [0.9, 0], borne)} />}
      </svg>
    </AbsoluteFill>
  );
};
