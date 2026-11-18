import type { ReactNode } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import calcul from "../../../sujets/popcorn.calcul.json";
import type { SceneProps } from "../../cadre/types";
import { entre, kcalA, lisse, paletteA, pasDecor } from "./temps";

const SOL_Y = 1150;
const CX = 540;
const BEURRE = "#F6D27A";
const CREME = "#FFF6E2";
const BORD = "#C98E2E";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const hasard = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// Un grain éclaté, rayon 1
const Grain = ({ teinte = CREME }: { teinte?: string }) => (
  <g stroke={BORD} strokeWidth={0.07}>
    <circle cx={-0.42} cy={0.12} r={0.52} fill={teinte} />
    <circle cx={0.42} cy={0.16} r={0.48} fill={teinte} />
    <circle cx={0.02} cy={-0.38} r={0.54} fill={teinte} />
    <circle cx={0.04} cy={0.42} r={0.42} fill={BEURRE} />
    <circle cx={0.12} cy={0.5} r={0.14} fill="#D9922B" stroke="none" />
  </g>
);

// Les grains du tas : positions fixes dans une demi-ellipse, ceux du fond d'abord
const GRAINS = Array.from({ length: 70 }, (_, i) => {
  const x = hasard(i) * 2 - 1;
  const y = hasard(i + 100) * Math.sqrt(1 - x * x) * 0.6;
  return { x, y, teinte: i % 5 === 0 ? "#FCE7B4" : CREME, angle: hasard(i + 200) * 360 };
}).sort((a, b) => b.y - a.y);

// Le tas de pop-corn, vu de côté : base centrée sur (cx, baseY), largeur l, il saute à chaque seconde
const Tas = ({ cx, baseY, l, t }: { cx: number; baseY: number; l: number; t: number }) => {
  const f = t - Math.floor(t);
  const saut = 1 + 0.06 * Math.sin(Math.PI * Math.min(f / 0.3, 1));
  const r = l / 2;
  const h = r * 0.6 * saut;
  const bosses = Array.from({ length: 13 }, (_, i) => {
    const a = Math.PI - (i / 12) * Math.PI;
    return `${cx + Math.cos(a) * r} ${baseY - Math.sin(a) * h - (i % 2) * r * 0.05}`;
  });
  return (
    <g>
      <path d={`M ${cx - r} ${baseY} L ${bosses.join(" L ")} L ${cx + r} ${baseY} Z`} fill="#F9E3A8" stroke={BORD} strokeWidth={Math.max(2, r * 0.012)} strokeLinejoin="round" />
      {GRAINS.map((g, i) => (
        <g key={i} transform={`translate(${cx + g.x * r * 0.92} ${baseY - g.y * r * saut - r * 0.05}) rotate(${g.angle}) scale(${r * 0.12})`}>
          <Grain teinte={g.teinte} />
        </g>
      ))}
      <Eclats cx={cx} haut={baseY - h} r={r} t={t} />
    </g>
  );
};

// Chaque seconde, une poignée de grains saute du sommet
const Eclats = ({ cx, haut, r, t }: { cx: number; haut: number; r: number; t: number }) => {
  const s = Math.floor(t);
  const f = t - s;
  if (f > 0.8) {
    return null;
  }
  return (
    <g opacity={1 - f / 0.8}>
      {Array.from({ length: 6 }, (_, k) => {
        const vx = (hasard(s * 7 + k) - 0.5) * 520;
        const vy = 380 + hasard(s * 11 + k) * 360;
        const x = cx + (hasard(s * 3 + k) - 0.5) * r * 0.6 + vx * f;
        const y = haut - vy * f + 900 * f * f;
        return (
          <g key={k} transform={`translate(${x} ${y}) rotate(${f * 400 + k * 60}) scale(16)`}>
            <Grain />
          </g>
        );
      })}
    </g>
  );
};

// Seau rayé rouge et blanc, sans marque : bas centré sur (cx, bas), hauteur h
const Seau = ({ cx, bas, h }: { cx: number; bas: number; h: number }) => {
  const haut = bas - h;
  const lh = h * 0.42;
  const lb = h * 0.32;
  const bandes = 7;
  return (
    <g>
      <defs>
        <clipPath id="seau-popcorn">
          <polygon points={`${cx - lh} ${haut} ${cx + lh} ${haut} ${cx + lb} ${bas} ${cx - lb} ${bas}`} />
        </clipPath>
      </defs>
      <g clipPath="url(#seau-popcorn)">
        {Array.from({ length: bandes }, (_, i) => {
          const x0 = -1 + (2 * i) / bandes;
          const x1 = -1 + (2 * (i + 1)) / bandes;
          return (
            <polygon
              key={i}
              points={`${cx + x0 * lh} ${haut} ${cx + x1 * lh} ${haut} ${cx + x1 * lb} ${bas} ${cx + x0 * lb} ${bas}`}
              fill={i % 2 === 0 ? "#D62B2B" : "#FFF4E6"}
            />
          );
        })}
      </g>
      <rect x={cx - lh - 6} y={haut - 6} width={2 * lh + 12} height={14} rx={6} fill="#FFF4E6" stroke="#9E1B1B" strokeWidth={3} />
    </g>
  );
};

const Salle = ({ ecran = 0 }: { ecran?: number }) => (
  <g>
    <rect x={120} y={520} width={840} height={380} fill="#3B0A12" />
    <rect x={140} y={540} width={800} height={340} fill="#F3E6CC" opacity={0.18 + 0.7 * ecran} />
    {ecran > 0 && <polygon points={`540 1910 140 540 940 540`} fill="#FFF6E2" opacity={0.08 * ecran} />}
    {[0, 1].map((cote) => (
      <g key={cote} transform={cote ? "translate(1080 0) scale(-1 1)" : undefined}>
        <path d="M 0 440 L 150 440 Q 120 700 170 980 L 0 980 Z" fill="#8E1426" />
        {[30, 70, 110].map((x) => (
          <path key={x} d={`M ${x} 450 Q ${x - 12} 700 ${x + 14} 970`} stroke="#6E0E1C" strokeWidth={8} fill="none" />
        ))}
      </g>
    ))}
    {[0, 1].map((rang) => (
      <g key={rang}>
        {Array.from({ length: 9 }, (_, i) => {
          const x = -40 + i * 140 + rang * 70;
          const y = 1010 + rang * 60;
          return <rect key={i} x={x} y={y} width={110} height={SOL_Y - y + 10} rx={26} fill={rang ? "#2C0610" : "#3E0A15"} />;
        })}
      </g>
    ))}
    <rect x={0} y={SOL_Y} width={1080} height={770} fill="#22050B" />
    {[1230, 1390, 1560, 1750].map((y, i) => (
      <rect key={y} x={0} y={y} width={1080} height={10 + i * 4} fill="#3A0A14" />
    ))}
  </g>
);

const Elephant = () => (
  <g fill="#8C8781">
    <ellipse cx={0} cy={-200} rx={150} ry={110} />
    <rect x={-120} y={-140} width={52} height={140} rx={16} />
    <rect x={-50} y={-140} width={52} height={140} rx={16} />
    <rect x={40} y={-140} width={52} height={140} rx={16} />
    <rect x={100} y={-150} width={50} height={150} rx={16} fill="#7C7770" />
    <circle cx={160} cy={-250} r={78} />
    <path d="M 120 -310 Q 60 -330 70 -230 Q 80 -160 140 -190 Z" fill="#76716A" />
    <path d="M 220 -230 Q 270 -150 250 -70 Q 245 -40 280 -30" stroke="#8C8781" strokeWidth={34} fill="none" strokeLinecap="round" />
    <path d="M 200 -205 Q 245 -190 262 -168" stroke="#FFF6E2" strokeWidth={12} fill="none" strokeLinecap="round" />
    <circle cx={190} cy={-268} r={7} fill="#1E1A16" />
    <path d="M -150 -210 Q -180 -170 -170 -130" stroke="#8C8781" strokeWidth={10} fill="none" strokeLinecap="round" />
  </g>
);

const Baleine = ({ t }: { t: number }) => {
  const bouche = 10 + 14 * Math.sin(t * 3);
  return (
    <g>
      <path d={`M -360 0 Q -200 -120 120 -90 Q 300 -70 340 ${-10 - bouche} L 120 -20 L 340 ${10 + bouche} Q 260 90 60 90 Q -200 90 -360 0 Z`} fill="#3D6E99" />
      <path d="M 340 20 Q 240 80 60 84 Q -120 84 -220 50 L 60 40 Z" fill="#A9C6DD" />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M ${-60 + i * 50} 50 L ${-30 + i * 50} 82`} stroke="#7FA3C2" strokeWidth={5} />
      ))}
      <path d="M -360 0 L -460 -70 L -430 0 L -460 70 Z" fill="#3D6E99" />
      <path d="M 0 60 Q -40 130 -110 140 Q -60 90 -40 50 Z" fill="#2F5A80" />
      <circle cx={200} cy={-46} r={8} fill="#0F1F2E" />
    </g>
  );
};

const Titanic = () => (
  <g>
    <path d="M -330 -40 L 330 -40 L 300 40 L -300 40 Z" fill="#14100E" />
    <rect x={-330} y={-44} width={660} height={10} fill="#F2EDE4" />
    <path d="M -300 40 L 300 40 L 296 50 L -296 50 Z" fill="#8E1C1C" />
    <rect x={-250} y={-90} width={460} height={46} fill="#F2EDE4" />
    {Array.from({ length: 16 }, (_, i) => (
      <circle key={i} cx={-230 + i * 28} cy={-66} r={6} fill="#FFD27A" />
    ))}
    {Array.from({ length: 20 }, (_, i) => (
      <circle key={i} cx={-280 + i * 29} cy={-4} r={4} fill="#FFD27A" opacity={0.85} />
    ))}
    {[-170, -60, 50, 160].map((x) => (
      <g key={x}>
        <path d={`M ${x - 26} -90 L ${x - 20} -200 L ${x + 30} -200 L ${x + 26} -90 Z`} fill="#D9A55A" />
        <path d={`M ${x - 21} -180 L ${x - 20} -200 L ${x + 30} -200 L ${x + 29} -180 Z`} fill="#14100E" />
      </g>
    ))}
    <path d="M -300 -90 L -300 -250 M 280 -90 L 280 -240" stroke="#14100E" strokeWidth={5} />
  </g>
);

const Personne = ({ s, canne = false }: { s: number; canne?: boolean }) => (
  <g transform={`scale(${s})`} fill="#2D3A4A">
    <circle cx={0} cy={-89} r={11} />
    <rect x={-14} y={-75} width={28} height={40} rx={10} />
    <rect x={-13} y={-40} width={11} height={40} rx={5} />
    <rect x={2} y={-40} width={11} height={40} rx={5} />
    <rect x={-22} y={-74} width={8} height={34} rx={4} />
    <rect x={14} y={-74} width={8} height={34} rx={4} />
    {canne && <path d="M 26 -46 L 30 0" stroke="#7A4E2A" strokeWidth={5} strokeLinecap="round" />}
  </g>
);

const Stade = () => (
  <g>
    <path d={`M -20 ${SOL_Y} L -20 700 Q 200 620 380 760 L 380 ${SOL_Y} Z`} fill="#9DA7B0" />
    <path d={`M 1100 ${SOL_Y} L 1100 700 Q 880 620 700 760 L 700 ${SOL_Y} Z`} fill="#9DA7B0" />
    {Array.from({ length: 6 }, (_, r) =>
      Array.from({ length: 12 }, (_, i) => {
        const gauche = i < 6;
        const j = i % 6;
        const x = gauche ? 10 + j * 58 + r * 4 : 1070 - j * 58 - r * 4;
        const y = 800 + r * 56 - (gauche ? j : j) * 4;
        const teintes = ["#E63946", "#F1FAEE", "#FFB703", "#219EBC", "#FB8500"];
        return <circle key={`${r}-${i}`} cx={x} cy={y} r={12} fill={teintes[(r * 7 + i * 3) % teintes.length]} />;
      }),
    )}
    <rect x={-20} y={SOL_Y} width={1120} height={770} fill="#4CA15A" />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={0} y={SOL_Y + 60 + i * 150} width={1080} height={70} fill="#43924F" />
    ))}
    <path d={`M 540 ${SOL_Y} L 540 1920`} stroke="#FFFFFF" strokeWidth={8} opacity={0.8} />
    <ellipse cx={540} cy={SOL_Y + 260} rx={260} ry={90} stroke="#FFFFFF" strokeWidth={8} fill="none" opacity={0.8} />
  </g>
);

const Eiffel = () => (
  <g fill="#3B1A24">
    <path d="M -110 0 L -36 -230 L -16 -470 L 16 -470 L 36 -230 L 110 0 L 70 0 Q 0 -90 -70 0 Z" />
    <rect x={-60} y={-160} width={120} height={14} />
    <rect x={-34} y={-260} width={68} height={12} />
    <rect x={-4} y={-520} width={8} height={56} />
  </g>
);

const Toits = () => (
  <g>
    {Array.from({ length: 9 }, (_, i) => {
      const x = i * 130 - 20;
      const h = 150 + (i % 3) * 40;
      return (
        <g key={i}>
          <rect x={x} y={SOL_Y - h} width={124} height={h} fill="#F4DFC0" />
          <path d={`M ${x - 4} ${SOL_Y - h} L ${x + 18} ${SOL_Y - h - 50} L ${x + 106} ${SOL_Y - h - 50} L ${x + 128} ${SOL_Y - h} Z`} fill="#5D6B7E" />
          <rect x={x + 30} y={SOL_Y - h - 74} width={16} height={28} fill="#B9603C" />
          {[0, 1].map((r) => (
            <rect key={r} x={x + 22} y={SOL_Y - h + 30 + r * 60} width={80} height={30} fill="#6E4A3A" opacity={0.7} />
          ))}
        </g>
      );
    })}
    <rect x={0} y={SOL_Y} width={1080} height={770} fill="#4A2A30" />
  </g>
);

const HotDog = () => (
  <g>
    <rect x={-70} y={-22} width={140} height={44} rx={22} fill="#E9B26A" />
    <rect x={-80} y={-12} width={160} height={24} rx={12} fill="#B4442A" />
    <path d="M -60 -4 Q -45 -14 -30 -4 T 0 -4 T 30 -4 T 60 -4" stroke="#F2C230" strokeWidth={6} fill="none" />
    <rect x={-66} y={6} width={132} height={18} rx={9} fill="#D99A55" />
  </g>
);

const PileHotDogs = () => (
  <g>
    {[5, 4, 3, 2, 1].map((n, r) =>
      Array.from({ length: n }, (_, i) => (
        <g key={`${r}-${i}`} transform={`translate(${(i - (n - 1) / 2) * 120} ${-26 - r * 46}) scale(0.75)`}>
          <HotDog />
        </g>
      )),
    )}
  </g>
);

const Nappe = () => (
  <g>
    <rect x={0} y={SOL_Y} width={1080} height={770} fill="#FFF7EA" />
    {Array.from({ length: 10 }, (_, i) =>
      Array.from({ length: 10 }, (_, j) =>
        (i + j) % 2 === 0 ? <rect key={`${i}-${j}`} x={i * 108} y={SOL_Y + j * 80} width={108} height={80} fill="#D43A3A" /> : null,
      ),
    )}
    <path d="M 0 600 Q 270 680 540 610 Q 810 680 1080 600" stroke="#6B4A2E" strokeWidth={4} fill="none" />
    {Array.from({ length: 10 }, (_, i) => {
      const x = 40 + i * 108;
      const y = 610 + Math.sin((i / 9) * Math.PI) * 50;
      const teintes = ["#C21A2E", "#FFFFFF", "#1F4E9C"];
      return <polygon key={i} points={`${x - 34} ${y} ${x + 34} ${y} ${x} ${y + 70}`} fill={teintes[i % 3]} />;
    })}
  </g>
);

// États-Unis contigus, simplifiés, vus de haut
const CARTE =
  "M 120 620 L 260 600 L 520 610 L 640 600 L 700 640 L 780 620 L 840 560 L 900 540 L 960 600 L 930 650 L 900 700 L 850 760 L 860 860 L 900 960 L 880 980 L 830 900 L 760 880 L 700 900 L 640 900 L 600 960 L 560 1000 L 520 940 L 470 900 L 400 910 L 330 860 L 240 850 L 170 800 L 120 720 Z";

const Terre = ({ t }: { t: number }) => (
  <g>
    <circle cx={CX} cy={1420} r={500} fill="#2A6FB0" />
    <g transform={`rotate(${t * 4} ${CX} 1420)`}>
      <path d="M 300 1100 Q 380 1000 480 1060 Q 560 1120 520 1220 Q 440 1260 380 1200 Q 300 1180 300 1100 Z" fill="#5FA35A" />
      <path d="M 640 1000 Q 760 990 820 1080 Q 840 1160 760 1180 Q 680 1150 660 1090 Z" fill="#5FA35A" />
      <path d="M 420 1300 Q 520 1280 600 1340 Q 620 1420 540 1440 Q 450 1420 420 1300 Z" fill="#5FA35A" />
    </g>
    <circle cx={CX} cy={1420} r={500} fill="none" stroke="#9CC9F0" strokeWidth={16} opacity={0.6} />
  </g>
);

const Etoiles = () => (
  <g>
    {Array.from({ length: 40 }, (_, i) => (
      <circle key={i} cx={hasard(i + 300) * 1080} cy={300 + hasard(i + 400) * 1400} r={2 + hasard(i + 500) * 3} fill="#FFF4DC" opacity={0.7} />
    ))}
  </g>
);

const Flash = ({ age }: { age: number }) => {
  const o = interpolate(age, [0, 0.35], [0.8, 0], borne);
  return o > 0 ? <rect x={0} y={0} width={1080} height={1920} fill="#FFFFFF" opacity={o} /> : null;
};

const largeurTas = (t: number, cle: string, kcalBesoin: number) => {
  const r = kcalA(pasDecor(t)) / kcalBesoin;
  return cle === "salle" ? Math.min(240 * Math.cbrt(r), 920) : Math.min(340 * Math.cbrt(r), 900);
};

// Le décor du palier, la référence qui entre par la gauche, et le tas qui grossit
const Palier = ({ cle, t, age, kcalBesoin }: { cle: string; t: number; age: number; kcalBesoin: number }) => {
  const entree = interpolate(age, [0, 0.4], [-500, 0], { ...borne, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const l = largeurTas(t, cle, kcalBesoin) * interpolate(age, [0, 0.3], [0.6, 1], borne);
  const tas = (cx: number, baseY = SOL_Y) => <Tas cx={cx} baseY={baseY} l={l} t={t} />;
  let decor: ReactNode;
  let devant: ReactNode = null;
  switch (cle) {
    case "elephant":
      decor = (
        <g>
          <circle cx={820} cy={620} r={90} fill="#FFE6A3" />
          <rect x={0} y={SOL_Y} width={1080} height={770} fill="#C2853A" />
          <path d={`M 850 ${SOL_Y} L 860 860`} stroke="#5C3B1E" strokeWidth={20} />
          <ellipse cx={860} cy={850} rx={170} ry={40} fill="#6E8B3D" />
          {Array.from({ length: 14 }, (_, i) => (
            <path key={i} d={`M ${i * 80 + 20} ${SOL_Y + 2} l 10 -36 l 10 36`} stroke="#9C6A2C" strokeWidth={6} fill="none" />
          ))}
          <g transform={`translate(${250 + entree} ${SOL_Y})`}>
            <Elephant />
          </g>
        </g>
      );
      devant = tas(720);
      break;
    case "baleine":
      decor = (
        <g>
          <rect x={0} y={SOL_Y} width={1080} height={770} fill="#D9C08A" />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${i * 400 - 60} 560 q 60 -20 120 0 t 120 0`} stroke="#4F87B3" strokeWidth={6} fill="none" />
          ))}
          {Array.from({ length: 12 }, (_, i) => (
            <circle key={i} cx={hasard(i + 50) * 1080} cy={600 + ((hasard(i + 60) * 500 - t * 60) % 500 + 500) % 500} r={6} fill="#9CC9F0" opacity={0.6} />
          ))}
        </g>
      );
      devant = (
        <g>
          {tas(700)}
          <g transform={`translate(${330 + entree} 820) rotate(10)`}>
            <Baleine t={t} />
          </g>
        </g>
      );
      break;
    case "titanic":
      decor = (
        <g>
          <circle cx={170} cy={600} r={50} fill="#F4EBD0" />
          {Array.from({ length: 16 }, (_, i) => (
            <circle key={i} cx={hasard(i + 70) * 1080} cy={520 + hasard(i + 80) * 260} r={3} fill="#FFF4E0" />
          ))}
          <g transform={`translate(${330 + entree} ${SOL_Y - 30})`}>
            <Titanic />
          </g>
        </g>
      );
      devant = (
        <g>
          {tas(800, SOL_Y - 10)}
          <rect x={0} y={SOL_Y - 20} width={1080} height={790} fill="#0B1A33" />
          {[30, 120, 260, 420].map((y, i) => (
            <path key={y} d={`M ${-60 + ((i * 70 + t * 40) % 120)} ${SOL_Y + y} l 140 0 m 180 0 l 120 0 m 200 0 l 160 0 m 160 0 l 140 0`} stroke="#29466E" strokeWidth={8} strokeLinecap="round" />
          ))}
        </g>
      );
      break;
    case "vie":
      decor = (
        <g>
          <rect x={620} y={520} width={300} height={260} fill="#BFE0F2" stroke="#8A5A33" strokeWidth={14} />
          <path d="M 770 520 L 770 780 M 620 650 L 920 650" stroke="#8A5A33" strokeWidth={10} />
          {Array.from({ length: 12 }, (_, i) =>
            Array.from({ length: 10 }, (_, j) =>
              (i + j) % 2 === 0 ? <rect key={`${i}-${j}`} x={i * 90} y={SOL_Y + j * 80} width={90} height={80} fill="#2F3B48" /> : <rect key={`${i}-${j}`} x={i * 90} y={SOL_Y + j * 80} width={90} height={80} fill="#E9DCC4" />,
            ),
          )}
          <g transform={`translate(${entree} ${SOL_Y})`}>
            {[
              [80, 1.2, false],
              [170, 1.9, false],
              [280, 2.6, false],
              [390, 2.4, true],
            ].map(([x, s, c]) => (
              <g key={String(x)} transform={`translate(${x} 0)`}>
                <Personne s={Number(s)} canne={Boolean(c)} />
              </g>
            ))}
          </g>
        </g>
      );
      devant = tas(760);
      break;
    case "stade":
      decor = <Stade />;
      devant = tas(540);
      break;
    case "paris":
      decor = (
        <g>
          <circle cx={800} cy={700} r={110} fill="#FFD9A0" />
          <g transform={`translate(${200 + entree} ${SOL_Y - 150})`}>
            <Eiffel />
          </g>
          <Toits />
        </g>
      );
      devant = tas(700);
      break;
    case "hotdogs":
      decor = (
        <g>
          <Nappe />
          <g transform={`translate(${260 + entree} ${SOL_Y})`}>
            <PileHotDogs />
          </g>
        </g>
      );
      devant = tas(770);
      break;
    case "usa": {
      // Vue de haut : le pop-corn s'étale sur la carte
      const r = l / 2;
      decor = (
        <g>
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M ${-40 + i * 300} ${1180 + (i % 2) * 120} q 50 -20 100 0 t 100 0`} stroke="#6FAFD0" strokeWidth={6} fill="none" />
          ))}
          <g transform={`translate(${entree} 0)`}>
            <path d={CARTE} fill="#E8D3A2" stroke="#8C6A3A" strokeWidth={8} strokeLinejoin="round" />
          </g>
        </g>
      );
      devant = (
        <g>
          <ellipse cx={560} cy={790} rx={r * 1.05} ry={r * 0.74} fill="#F9E3A8" stroke={BORD} strokeWidth={4} />
          {GRAINS.map((g, i) => {
            const a = g.angle * (Math.PI / 180);
            const d = Math.sqrt(hasard(i + 600)) * r;
            return (
              <g key={i} transform={`translate(${560 + Math.cos(a) * d} ${790 + Math.sin(a) * d * 0.7}) scale(${Math.max(10, r * 0.09)})`}>
                <Grain teinte={g.teinte} />
              </g>
            );
          })}
        </g>
      );
      break;
    }
    default:
      decor = (
        <g>
          <Etoiles />
          <g transform={`translate(0 ${-entree * 0.6})`}>
            <Terre t={t} />
          </g>
        </g>
      );
      devant = <g transform={`translate(0 ${-entree * 0.6})`}>{tas(CX, 935)}</g>;
  }
  return (
    <g>
      {decor}
      {devant}
      <Flash age={age} />
    </g>
  );
};

// Le tout premier plan : la salle, le seau, et son pop-corn qui déborde
const Depart = ({ t, l, ecran = 0 }: { t: number; l: number; ecran?: number }) => {
  const hSeau = 300;
  const bord = SOL_Y - hSeau;
  const baseY = interpolate(l, [240, 700], [bord + 8, SOL_Y], borne);
  return (
    <g>
      <Salle ecran={ecran} />
      <Seau cx={CX} bas={SOL_Y} h={hSeau} />
      <Tas cx={CX} baseY={baseY} l={l} t={t} />
    </g>
  );
};

// L'assiette d'une journée : 60 % de pop-corn
const Assiette = ({ age }: { age: number }) => {
  const part = (calcul.pct_jour / 100) * lisse(entre(age, 0.2, 1.4));
  const cy = 820;
  const r = 300;
  const a = part * 2 * Math.PI;
  const x = CX + Math.sin(a) * r;
  const y = cy - Math.cos(a) * r;
  const secteur = `M ${CX} ${cy} L ${CX} ${cy - r} A ${r} ${r} 0 ${a > Math.PI ? 1 : 0} 1 ${x} ${y} Z`;
  return (
    <g>
      <Salle />
      <circle cx={CX} cy={cy} r={r + 40} fill="#FFFDF6" stroke="#D8CBB3" strokeWidth={6} />
      <circle cx={CX} cy={cy} r={r} fill="#F4EDE0" />
      <defs>
        <clipPath id="assiette-popcorn">
          <path d={secteur} />
        </clipPath>
      </defs>
      <path d={secteur} fill="#F9E3A8" />
      <g clipPath="url(#assiette-popcorn)">
        {Array.from({ length: 90 }, (_, i) => {
          const ang = hasard(i + 700) * 2 * Math.PI;
          const d = Math.sqrt(hasard(i + 800)) * r;
          return (
            <g key={i} transform={`translate(${CX + Math.cos(ang) * d} ${cy + Math.sin(ang) * d}) rotate(${i * 37}) scale(30)`}>
              <Grain />
            </g>
          );
        })}
      </g>
      <path d={`M ${CX} ${cy - r} L ${CX} ${cy}`} stroke="#C98E2E" strokeWidth={6} />
      <rect x={130} y={620} width={18} height={420} rx={9} fill="#C9CED6" />
      <rect x={932} y={620} width={18} height={420} rx={9} fill="#C9CED6" />
    </g>
  );
};

export const ScenePopcorn = ({ t }: SceneProps) => {
  const palette = paletteA(t);
  const lDepart = largeurTas(0, "salle", calcul.k0_kcal);

  let contenu;
  if (t >= calcul.t_fin) {
    contenu = <Depart t={t} l={lDepart} />;
  } else if (t >= calcul.t_film) {
    // L'écran s'allume : le film commence enfin, puis la salle retrouve le premier plan
    const ecran = entre(t, calcul.t_film, calcul.t_film + 0.8) * (1 - entre(t, calcul.t_retour, calcul.t_fin));
    contenu = (
      <g>
        <Depart t={t} l={lDepart} ecran={ecran} />
        <Flash age={(t - calcul.t_film) * 2} />
      </g>
    );
  } else if (t >= calcul.t_jour) {
    contenu = (
      <g>
        <Assiette age={t - calcul.t_jour} />
        <Flash age={t - calcul.t_jour} />
      </g>
    );
  } else if (t >= calcul.t_vrai) {
    contenu = (
      <g>
        <Depart t={t} l={lDepart} />
        <Flash age={t - calcul.t_vrai} />
      </g>
    );
  } else {
    const index = calcul.paliers.filter((p) => t >= p.arrivee_s).length;
    if (index === 0) {
      contenu = <Depart t={t} l={largeurTas(t, "salle", calcul.k0_kcal)} />;
    } else {
      const p = calcul.paliers[index - 1];
      contenu = <Palier cle={p.cle} t={t} age={t - p.arrivee_s} kcalBesoin={p.kcal} />;
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        {contenu}
      </svg>
    </AbsoluteFill>
  );
};
