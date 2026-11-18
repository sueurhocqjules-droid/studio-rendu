import type { FC } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import calcul from "../../../sujets/ant.calcul.json";
import type { SceneProps } from "../../cadre/types";
import { entre, lisse, paletteA } from "./temps";

const SOL_Y = 1130;
const CX = 540;
const LOUPE_Y = 1690;
const LOUPE_R = 170;
const FEUILLE_M = 0.015; // morceau de feuille porté, pour le dessin seulement
const FOURMI = "#6B2A14";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Une ouvrière coupe-feuille de profil, 100 unités de long, pattes posées sur y = 0
const Fourmi = ({ t, couleur = FOURMI }: { t: number; couleur?: string }) => {
  const pas = Math.sin(t * 14) * 4;
  return (
    <g>
      <g stroke={couleur} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d={`M 2 -24 L -14 -36 L ${-26 + pas} 0`} />
        <path d={`M 8 -24 L 8 -38 L ${10 - pas} 0`} />
        <path d={`M 14 -24 L 28 -36 L ${36 + pas} 0`} />
        <path d="M 38 -42 Q 46 -60 58 -62" />
        <path d="M 34 -43 Q 38 -62 50 -68" />
        <path d="M 42 -30 L 52 -38 M 42 -27 L 54 -30" />
      </g>
      <ellipse cx={-28} cy={-28} rx={22} ry={16} fill={couleur} />
      <circle cx={-6} cy={-27} r={5} fill={couleur} />
      <ellipse cx={9} cy={-29} rx={14} ry={8} fill={couleur} />
      <ellipse cx={32} cy={-35} rx={12} ry={10} fill={couleur} />
      <circle cx={36} cy={-38} r={2.4} fill="#120804" />
      <ellipse cx={-33} cy={-34} rx={8} ry={4} fill="#FFFFFF" opacity={0.18} />
    </g>
  );
};

type Objet = { w: number; h: number; teinte: string; C: FC };

const Feuille = () => (
  <g>
    <path d="M -56 -8 L -50 -40 L -58 -62 L -36 -70 L -30 -96 L -8 -86 L 10 -100 L 22 -78 L 50 -82 L 46 -56 L 60 -36 L 40 -22 L 44 0 L 10 -10 Z" fill="#5FA23B" />
    <path d="M -40 -6 Q -6 -44 30 -84 M -16 -32 L -36 -52 M 4 -54 L -12 -78 M 6 -50 L 34 -54" stroke="#3E7A24" strokeWidth={4} fill="none" strokeLinecap="round" />
  </g>
);

const Trombone = () => (
  <path
    d="M 10 -6 L 10 -80 A 12 12 0 0 0 -14 -80 L -14 -20 A 9 9 0 0 0 4 -20 L 4 -74 A 6 6 0 0 0 -8 -74 L -8 -30"
    transform="scale(1.3 1.05) translate(2 -1)"
    stroke="#8C96A3"
    strokeWidth={5}
    fill="none"
    strokeLinecap="round"
  />
);

const Oeuf = () => (
  <g>
    <path d="M 0 -100 C 30 -100 38 -46 38 -36 C 38 -12 22 0 0 0 C -22 0 -38 -12 -38 -36 C -38 -46 -30 -100 0 -100 Z" fill="#FFF4DE" stroke="#D9C49F" strokeWidth={3} />
    <ellipse cx={-14} cy={-62} rx={7} ry={14} fill="#FFFFFF" opacity={0.7} />
  </g>
);

const Chat = () => (
  <g>
    <path d="M 26 -10 Q 58 -6 52 -40" stroke="#D9803A" strokeWidth={9} fill="none" strokeLinecap="round" />
    <ellipse cx={0} cy={-34} rx={30} ry={34} fill="#E8954A" />
    <circle cx={0} cy={-78} r={20} fill="#E8954A" />
    <polygon points="-18,-88 -14,-108 -2,-94" fill="#E8954A" />
    <polygon points="18,-88 14,-108 2,-94" fill="#E8954A" />
    {[-44, -30, -16].map((y) => (
      <path key={y} d={`M -24 ${y} L -10 ${y + 2} M 24 ${y} L 10 ${y + 2}`} stroke="#B9682A" strokeWidth={4} strokeLinecap="round" />
    ))}
    <circle cx={-7} cy={-80} r={3} fill="#1E2A12" />
    <circle cx={7} cy={-80} r={3} fill="#1E2A12" />
    <ellipse cx={-12} cy={-2} rx={9} ry={5} fill="#F5C08A" />
    <ellipse cx={12} cy={-2} rx={9} ry={5} fill="#F5C08A" />
  </g>
);

// Un pictogramme, pas une personne
const Humain = () => (
  <g fill="#2D3A4A">
    <circle cx={0} cy={-89} r={11} />
    <rect x={-14} y={-75} width={28} height={40} rx={10} />
    <rect x={-13} y={-40} width={11} height={40} rx={5} />
    <rect x={2} y={-40} width={11} height={40} rx={5} />
    <rect x={-22} y={-74} width={8} height={34} rx={4} />
    <rect x={14} y={-74} width={8} height={34} rx={4} />
  </g>
);

const Trex = () => (
  <g fill="#4F7A34">
    <path d="M -86 -66 Q -40 -74 -8 -62 Q 18 -54 30 -70 L 34 -84 Q 40 -96 62 -94 L 84 -90 L 84 -78 L 62 -76 L 70 -70 L 56 -66 Q 46 -50 30 -40 Q 6 -28 -24 -38 Q -56 -50 -86 -66 Z" />
    <path d="M -18 -40 L -26 -6 L -12 -6 L -6 -36 Z" />
    <path d="M 6 -36 L 12 -4 L 26 -4 L 18 -40 Z" />
    <path d="M -30 -6 L -6 -6 L -6 0 L -30 0 Z M 8 -4 L 30 -4 L 30 0 L 8 0 Z" />
    <path d="M 34 -54 L 44 -46 L 42 -42" stroke="#4F7A34" strokeWidth={4} fill="none" />
    <circle cx={60} cy={-88} r={3} fill="#F2E4B0" />
  </g>
);

const Liberte = () => (
  <g fill="#6DB5A0">
    <path d="M -20 0 L -14 -62 L 14 -62 L 22 0 Z" />
    <circle cx={0} cy={-70} r={8} />
    {[-50, -25, 0, 25, 50].map((a) => (
      <rect key={a} x={-1.5} y={-90} width={3} height={12} transform={`rotate(${a} 0 -74)`} />
    ))}
    <rect x={10} y={-104} width={6} height={44} rx={3} transform="rotate(10 13 -60)" />
    <path d="M 16 -114 Q 26 -122 20 -132 Q 12 -122 16 -114 Z" fill="#F6B13B" />
    <rect x={-22} y={-50} width={10} height={16} rx={2} fill="#5A9C88" />
  </g>
);

const Eiffel = () => (
  <g fill="#7B5A43">
    <path d="M -34 0 L -10 -54 L -4 -100 L 4 -100 L 10 -54 L 34 0 L 22 0 Q 0 -26 -22 0 Z" />
    <rect x={-20} y={-34} width={40} height={5} />
    <rect x={-12} y={-58} width={24} height={4} />
    <rect x={-1} y={-112} width={2} height={14} />
  </g>
);

const Porteavions = () => (
  <g>
    <path d="M -110 -16 L 112 -16 L 98 0 L -98 0 Z" fill="#5C6670" />
    <rect x={-112} y={-20} width={224} height={5} fill="#3F474F" />
    <rect x={36} y={-44} width={18} height={24} fill="#7A848E" />
    <rect x={43} y={-56} width={3} height={12} fill="#7A848E" />
    <path d="M -96 -21 L -40 -21 M -20 -21 L 20 -21" stroke="#E6E2D6" strokeWidth={1.5} />
  </g>
);

const Barrage = () => (
  <g>
    <path d="M -100 0 L -74 -100 L 74 -100 L 100 0 Z" fill="#D7C8A8" />
    <rect x={-78} y={-104} width={156} height={6} fill="#B8A887" />
    {[-60, -24, 24, 60].map((x) => (
      <rect key={x} x={x - 5} y={-116} width={10} height={14} fill="#B8A887" />
    ))}
    <path d="M -86 -50 L 86 -50" stroke="#C3B392" strokeWidth={3} />
  </g>
);

const OBJETS: Record<string, Objet> = {
  feuille: { w: 120, h: 100, teinte: "#5FA23B", C: Feuille },
  trombone: { w: 40, h: 100, teinte: "#8C96A3", C: Trombone },
  oeuf: { w: 76, h: 100, teinte: "#FFF4DE", C: Oeuf },
  chat: { w: 90, h: 108, teinte: "#E8954A", C: Chat },
  humain: { w: 44, h: 100, teinte: "#2D3A4A", C: Humain },
  trex: { w: 170, h: 100, teinte: "#4F7A34", C: Trex },
  liberte: { w: 52, h: 132, teinte: "#6DB5A0", C: Liberte },
  eiffel: { w: 70, h: 112, teinte: "#7B5A43", C: Eiffel },
  porteavions: { w: 224, h: 56, teinte: "#5C6670", C: Porteavions },
  barrage: { w: 200, h: 116, teinte: "#D7C8A8", C: Barrage },
};

const HAUTEURS: Record<string, number> = {
  feuille: FEUILLE_M,
  ...Object.fromEntries(calcul.paliers.map((p) => [p.cle, p.hauteur_m])),
};

// Taille à l'écran de l'objet : il remplit la scène, la fourmi garde l'échelle réelle
const echelleObjet = (cle: string) => {
  const o = OBJETS[cle];
  return cle === "feuille" ? 300 / o.h : Math.min(440 / o.h, 680 / o.w);
};
const fourmiPx = (cle: string) => (echelleObjet(cle) * OBJETS[cle].h * calcul.fourmi_longueur_m) / HAUTEURS[cle];

const Decor = ({ cle }: { cle: string }) => {
  switch (cle) {
    case "feuille":
      return (
        <g>
          <rect x={0} y={SOL_Y} width={1080} height={790} fill="#8A6A3E" />
          {Array.from({ length: 16 }, (_, i) => (
            <path key={i} d={`M ${i * 72 - 10} ${SOL_Y + 4} L ${i * 72 + 6} ${SOL_Y - 90 - (i % 3) * 40} L ${i * 72 + 22} ${SOL_Y + 4} Z`} fill="#7DB04A" />
          ))}
          <ellipse cx={180} cy={SOL_Y + 120} rx={60} ry={24} fill="#6E5230" />
          <ellipse cx={880} cy={SOL_Y + 200} rx={80} ry={30} fill="#6E5230" />
        </g>
      );
    case "trombone":
      return (
        <g>
          <rect x={0} y={SOL_Y} width={1080} height={790} fill="#B07A43" />
          {[60, 170, 320, 520].map((y) => (
            <path key={y} d={`M 0 ${SOL_Y + y} Q 540 ${SOL_Y + y - 30} 1080 ${SOL_Y + y}`} stroke="#9A6634" strokeWidth={6} fill="none" />
          ))}
          <rect x={-40} y={SOL_Y - 46} width={360} height={40} fill="#F2C230" />
          <polygon points={`320,${SOL_Y - 46} 380,${SOL_Y - 26} 320,${SOL_Y - 6}`} fill="#E8C9A0" />
        </g>
      );
    case "oeuf":
      return (
        <g>
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`v${i}`} x1={i * 150} y1={500} x2={i * 150} y2={SOL_Y} stroke="#D3DEE6" strokeWidth={5} />
          ))}
          {Array.from({ length: 5 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={530 + i * 150} x2={1080} y2={530 + i * 150} stroke="#D3DEE6" strokeWidth={5} />
          ))}
          <rect x={0} y={SOL_Y} width={1080} height={790} fill="#D9D2C3" />
          <rect x={0} y={SOL_Y} width={1080} height={18} fill="#BDB5A4" />
        </g>
      );
    case "chat":
      return (
        <g>
          <rect x={720} y={560} width={230} height={170} fill="#C98B5E" />
          <rect x={738} y={578} width={194} height={134} fill="#E9B98C" />
          <rect x={0} y={SOL_Y} width={1080} height={790} fill="#A8754A" />
          <ellipse cx={540} cy={SOL_Y + 90} rx={420} ry={60} fill="#9C3B2C" />
        </g>
      );
    case "humain":
      return (
        <g>
          <circle cx={170} cy={760} r={130} fill="#5E9E43" />
          <rect x={155} y={860} width={30} height={SOL_Y - 860} fill="#6B4A2E" />
          <ellipse cx={860} cy={620} rx={110} ry={34} fill="#FFFFFF" opacity={0.8} />
          <rect x={0} y={SOL_Y} width={1080} height={790} fill="#6FAF4F" />
        </g>
      );
    case "trex":
      return (
        <g>
          <polygon points={`620,${SOL_Y} 840,620 900,620 1100,${SOL_Y}`} fill="#7C8B5A" />
          <ellipse cx={870} cy={600} rx={40} ry={18} fill="#E9E2C8" opacity={0.7} />
          {[60, 200, 940].map((x) => (
            <path key={x} d={`M ${x} ${SOL_Y} Q ${x - 60} ${SOL_Y - 120} ${x - 110} ${SOL_Y - 90} M ${x} ${SOL_Y} Q ${x + 40} ${SOL_Y - 150} ${x + 100} ${SOL_Y - 130}`} stroke="#3F7A2A" strokeWidth={14} fill="none" />
          ))}
          <rect x={0} y={SOL_Y} width={1080} height={790} fill="#6E8B3D" />
        </g>
      );
    case "liberte":
      return (
        <g>
          {[40, 110, 170, 860, 920, 990].map((x, i) => (
            <rect key={x} x={x} y={SOL_Y - 60 - (i % 3) * 36} width={50} height={60 + (i % 3) * 36} fill="#5F8FA3" />
          ))}
          <rect x={0} y={SOL_Y} width={1080} height={790} fill="#2F7EA0" />
          {[40, 140, 260].map((y) => (
            <path key={y} d={`M 0 ${SOL_Y + y} q 45 -16 90 0 t 90 0 t 90 0 t 90 0 t 90 0 t 90 0 t 90 0 t 90 0 t 90 0 t 90 0 t 90 0 t 90 0`} stroke="#5AA7C6" strokeWidth={6} fill="none" />
          ))}
        </g>
      );
    case "eiffel":
      return (
        <g>
          <circle cx={860} cy={720} r={90} fill="#FFD27A" />
          {[0, 130, 250, 760, 880, 990].map((x, i) => (
            <polygon key={x} points={`${x},${SOL_Y} ${x},${SOL_Y - 90 - (i % 2) * 30} ${x + 50},${SOL_Y - 130 - (i % 2) * 30} ${x + 100},${SOL_Y - 90 - (i % 2) * 30} ${x + 100},${SOL_Y}`} fill="#8E5640" />
          ))}
          <rect x={0} y={SOL_Y} width={1080} height={790} fill="#6B4A3A" />
        </g>
      );
    case "porteavions":
      return (
        <g>
          <rect x={0} y={SOL_Y - 6} width={1080} height={796} fill="#1B4560" />
          {[50, 150, 300, 480].map((y, i) => (
            <path key={y} d={`M ${-40 + i * 30} ${SOL_Y + y} l 120 0 m 200 0 l 160 0 m 220 0 l 140 0`} stroke="#4B7FA0" strokeWidth={8} strokeLinecap="round" />
          ))}
        </g>
      );
    default:
      return (
        <g>
          {Array.from({ length: 18 }, (_, i) => (
            <circle key={i} cx={(i * 263) % 1080} cy={540 + ((i * 137) % 380)} r={3} fill="#FFF2E0" opacity={0.7} />
          ))}
          <polygon points={`0,520 230,640 300,${SOL_Y} 0,${SOL_Y}`} fill="#7A3524" />
          <polygon points={`1080,520 850,640 780,${SOL_Y} 1080,${SOL_Y}`} fill="#7A3524" />
          <rect x={0} y={SOL_Y} width={1080} height={790} fill="#5C2A1E" />
          <path d={`M 360 ${SOL_Y + 40} Q 540 ${SOL_Y + 90} 720 ${SOL_Y + 40}`} stroke="#4C86A8" strokeWidth={30} fill="none" />
        </g>
      );
  }
};

// La fourmi et sa charge, la base de la fourmi au centre du sol
const Porteur = ({ cle, antPx, t, levee, objetY = 0, seul = false }: { cle: string; antPx: number; t: number; levee: number; objetY?: number; seul?: boolean }) => {
  const o = OBJETS[cle];
  const e = echelleObjet(cle);
  const s = antPx / 100;
  const dessus = SOL_Y - 44 * s - levee;
  return (
    <g>
      <g transform={`translate(${CX} ${dessus + objetY}) scale(${e})`}>
        <o.C />
      </g>
      {!seul && (
        <g transform={`translate(${CX - 6 * s} ${SOL_Y}) scale(${s})`}>
          <Fourmi t={t} />
        </g>
      )}
    </g>
  );
};

const Loupe = ({ cle, t, visible }: { cle: string; t: number; visible: number }) => {
  if (visible <= 0) {
    return null;
  }
  const teinte = OBJETS[cle].teinte;
  return (
    <g opacity={visible}>
      <circle cx={CX} cy={SOL_Y} r={26} fill="none" stroke="#FFFFFF" strokeWidth={7} />
      <circle cx={CX} cy={SOL_Y} r={26} fill="none" stroke="#14110D" strokeWidth={3} />
      <line x1={CX} y1={SOL_Y + 26} x2={CX} y2={LOUPE_Y - LOUPE_R} stroke="#FFFFFF" strokeWidth={7} />
      <defs>
        <clipPath id="loupe-fourmi">
          <circle cx={CX} cy={LOUPE_Y} r={LOUPE_R} />
        </clipPath>
      </defs>
      <circle cx={CX} cy={LOUPE_Y} r={LOUPE_R} fill="#F6EEDC" />
      <g clipPath="url(#loupe-fourmi)">
        <rect x={CX - LOUPE_R} y={LOUPE_Y + 60} width={LOUPE_R * 2} height={LOUPE_R} fill="#8A6A3E" />
        <rect x={CX - LOUPE_R} y={LOUPE_Y - LOUPE_R} width={LOUPE_R * 2} height={LOUPE_R - 30 + Math.sin(t * 7) * 4} fill={teinte} stroke="#14110D" strokeWidth={4} />
        <g transform={`translate(${CX - 12} ${LOUPE_Y + 62}) scale(2.1)`}>
          <Fourmi t={t} />
        </g>
      </g>
      <circle cx={CX} cy={LOUPE_Y} r={LOUPE_R} fill="none" stroke="#14110D" strokeWidth={14} />
    </g>
  );
};

// La colonne : des fourmis en rangs qui défilent, chacune avec son bout de feuille
const Colonne = ({ t, echelle }: { t: number; echelle: number }) => {
  const rangs = 13;
  const parRang = 7;
  return (
    <g transform={`translate(${CX} 960) scale(${echelle}) translate(${-CX} -960)`}>
      {Array.from({ length: rangs }, (_, r) =>
        Array.from({ length: parRang + 1 }, (_, i) => {
          const sens = r % 2 === 0 ? 1 : -1;
          const x = ((((i * 160 + sens * t * 90 + r * 47) % 1280) + 1280) % 1280) - 100;
          const y = 260 + r * 128;
          return (
            <g key={`${r}-${i}`} transform={`translate(${x} ${y}) scale(${0.62 * sens} 0.62)`}>
              <g transform="translate(0 -38) scale(0.28)">
                <Feuille />
              </g>
              <Fourmi t={t + r} couleur="#E2A466" />
            </g>
          );
        }),
      )}
    </g>
  );
};

// Toi au milieu, et tes 2,4 millions de fourmis en anneaux serrés autour
const Chacun = ({ t, age }: { t: number; age: number }) => {
  const recul = interpolate(age, [0, 3.4], [1.25, 0.85], borne);
  const anneaux = 11;
  return (
    <g transform={`translate(${CX} 860) scale(${recul})`}>
      {Array.from({ length: anneaux }, (_, a) => {
        const r = 150 + a * 52;
        const n = Math.floor((2 * Math.PI * r) / 30);
        return Array.from({ length: n }, (_, i) => {
          const angle = (i / n) * 2 * Math.PI + (a % 2 ? 1 : -1) * t * 0.15;
          return <ellipse key={`${a}-${i}`} cx={Math.cos(angle) * r} cy={Math.sin(angle) * r} rx={9} ry={5} transform={`rotate(${(angle * 180) / Math.PI + 90} ${Math.cos(angle) * r} ${Math.sin(angle) * r})`} fill="#E2A466" />;
        });
      })}
      <g transform="translate(0 110) scale(2.2)">
        <g fill="#FFF3DE">
          <circle cx={0} cy={-89} r={11} />
          <rect x={-14} y={-75} width={28} height={40} rx={10} />
          <rect x={-13} y={-40} width={11} height={40} rx={5} />
          <rect x={2} y={-40} width={11} height={40} rx={5} />
          <rect x={-22} y={-74} width={8} height={34} rx={4} />
          <rect x={14} y={-74} width={8} height={34} rx={4} />
        </g>
      </g>
    </g>
  );
};

// Neuf fourmis dessinées dans la feuille : son vrai poids
const NeufFourmis = ({ t, age }: { t: number; age: number }) => {
  const s = fourmiPx("feuille") / 100;
  const dessus = SOL_Y - 44 * s;
  const e = echelleObjet("feuille");
  return (
    <g>
      {Array.from({ length: calcul.rapport }, (_, i) => {
        const apparu = entre(age, 0.4 + i * 0.12, 0.6 + i * 0.12);
        const x = CX - 30 * e + (i % 3) * 30 * e - 0.2 * e;
        const y = dessus - 80 * e + Math.floor(i / 3) * 24 * e;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${0.46 * apparu})`}>
            <Fourmi t={t} couleur="#FFF3DE" />
          </g>
        );
      })}
    </g>
  );
};

const Flash = ({ age }: { age: number }) => {
  const o = interpolate(age, [0, 0.35], [0.85, 0], borne);
  return o > 0 ? <rect x={0} y={0} width={1080} height={1920} fill="#FFFFFF" opacity={o} /> : null;
};

const Depart = ({ t, levee }: { t: number; levee: number }) => (
  <g>
    <Decor cle="feuille" />
    <Porteur cle="feuille" antPx={fourmiPx("feuille")} t={t} levee={levee} />
  </g>
);

export const SceneAnt = ({ t }: SceneProps) => {
  const palette = paletteA(t);
  // Chaque seconde, la fourmi soulève sa charge d'un coup
  const fraction = t - Math.floor(t);
  const levee = 16 * Math.sin(Math.PI * Math.min(fraction / 0.45, 1));

  let contenu;
  if (t >= calcul.t_fin) {
    contenu = (
      <g>
        <Depart t={t} levee={levee} />
        <Flash age={t - calcul.t_fin} />
      </g>
    );
  } else if (t >= calcul.t_retour) {
    // On plonge dans la colonne jusqu'à retrouver une seule fourmi et sa feuille
    const part = lisse(entre(t, calcul.t_retour, calcul.t_fin));
    contenu = (
      <g>
        <g opacity={part}>
          <Depart t={t} levee={levee} />
        </g>
        <g opacity={1 - part}>
          <Colonne t={t} echelle={1 + part * 4} />
        </g>
      </g>
    );
  } else if (t >= calcul.t_chacun) {
    contenu = (
      <g>
        <Chacun t={t} age={t - calcul.t_chacun} />
        <Flash age={(t - calcul.t_chacun) * 2} />
      </g>
    );
  } else if (t >= calcul.t_nombre) {
    contenu = (
      <g>
        <Colonne t={t} echelle={interpolate(t - calcul.t_nombre, [0, 3.8], [1.6, 1], borne)} />
        <Flash age={t - calcul.t_nombre} />
      </g>
    );
  } else if (t >= calcul.t_vrai) {
    contenu = (
      <g>
        <Depart t={t} levee={0} />
        <NeufFourmis t={t} age={t - calcul.t_vrai} />
        <Flash age={t - calcul.t_vrai} />
      </g>
    );
  } else {
    const index = calcul.paliers.filter((p) => t >= p.arrivee_s).length;
    const cle = index === 0 ? "feuille" : calcul.paliers[index - 1].cle;
    const avant = index <= 1 ? "feuille" : calcul.paliers[index - 2].cle;
    const age = index === 0 ? 99 : t - calcul.paliers[index - 1].arrivee_s;
    const k = lisse(entre(age, 0, 0.6));
    const antPx = Math.exp(interpolate(k, [0, 1], [Math.log(fourmiPx(avant)), Math.log(fourmiPx(cle))]));
    // L'ancienne charge rétrécit à sa vraie taille à côté de la nouvelle, puis s'efface
    const ancienne = (echelleObjet(cle) * OBJETS[cle].h * HAUTEURS[avant]) / HAUTEURS[cle] / OBJETS[avant].h / echelleObjet(avant);
    const chute = interpolate(age, [0, 0.35], [-900, 0], { ...borne, easing: (x) => 1 - Math.pow(1 - x, 3) });
    const loupe = entre(-Math.log(antPx), -Math.log(60), -Math.log(36));
    contenu = (
      <g>
        <Decor cle={cle} />
        {age < 1 && (
          <g opacity={1 - entre(age, 0.4, 1)} transform={`translate(${CX - 300 * k} ${SOL_Y}) scale(${interpolate(k, [0, 1], [1, ancienne])}) translate(${-CX} ${-SOL_Y})`}>
            <Porteur cle={avant} antPx={fourmiPx(avant)} t={t} levee={0} seul />
          </g>
        )}
        <Porteur cle={cle} antPx={antPx} t={t} levee={levee} objetY={chute} />
        <Loupe cle={cle} t={t} visible={loupe} />
      </g>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        {contenu}
      </svg>
    </AbsoluteFill>
  );
};
