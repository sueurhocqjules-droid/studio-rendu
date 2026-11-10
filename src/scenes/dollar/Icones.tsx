import React from "react";

const ENCRE = "#14352A";
const VERT = "#2F7D51";
const OR = "#E8B52A";
const ROUGE = "#C8261C";

const Voiture = () => (
  <>
    <path d="M20 118 L34 84 Q40 72 56 70 L92 44 Q98 40 110 40 H162 Q174 40 182 50 L200 72 Q226 76 232 92 L236 118 Z" fill={ROUGE} stroke={ENCRE} strokeWidth={6} />
    <path d="M104 52 H130 V72 H78 Z M140 52 H164 L180 72 H140 Z" fill="#BFE3F2" stroke={ENCRE} strokeWidth={4} />
    <circle cx={70} cy={122} r={24} fill={ENCRE} />
    <circle cx={70} cy={122} r={9} fill="#E8E2D0" />
    <circle cx={188} cy={122} r={24} fill={ENCRE} />
    <circle cx={188} cy={122} r={9} fill="#E8E2D0" />
  </>
);

const Maison = () => (
  <>
    <rect x={62} y={78} width={136} height={76} fill="#F3EAD7" stroke={ENCRE} strokeWidth={6} />
    <path d="M40 84 L130 16 L220 84 Z" fill={ROUGE} stroke={ENCRE} strokeWidth={6} />
    <rect x={116} y={106} width={32} height={48} fill={VERT} stroke={ENCRE} strokeWidth={4} />
    <rect x={76} y={98} width={26} height={24} fill="#BFE3F2" stroke={ENCRE} strokeWidth={4} />
    <rect x={162} y={98} width={26} height={24} fill="#BFE3F2" stroke={ENCRE} strokeWidth={4} />
  </>
);

const Piece: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <>
    <ellipse cx={x} cy={y} rx={46} ry={15} fill={OR} stroke={ENCRE} strokeWidth={5} />
  </>
);

const Pieces = () => (
  <>
    {[140, 122, 104, 86, 68, 50, 32].map((y) => (
      <Piece key={`a${y}`} x={100} y={y} />
    ))}
    {[140, 122, 104, 86].map((y) => (
      <Piece key={`b${y}`} x={178} y={y} />
    ))}
  </>
);

const Fusee = () => (
  <g transform="rotate(35 130 84)">
    <path d="M130 0 Q162 34 162 92 V130 H98 V92 Q98 34 130 0 Z" fill="#F3EAD7" stroke={ENCRE} strokeWidth={6} />
    <path d="M98 100 L66 148 H98 Z M162 100 L194 148 H162 Z" fill={ROUGE} stroke={ENCRE} strokeWidth={6} />
    <circle cx={130} cy={68} r={16} fill="#BFE3F2" stroke={ENCRE} strokeWidth={5} />
    <path d="M110 134 H150 L130 172 Z" fill={OR} stroke={ENCRE} strokeWidth={5} />
  </g>
);

const Usines = () => (
  <>
    <path d="M18 150 V88 L66 116 V88 L114 116 V88 L162 116 V40 H200 V150 Z" fill="#6B7684" stroke={ENCRE} strokeWidth={6} />
    <rect x={212} y={70} width={32} height={80} fill={VERT} stroke={ENCRE} strokeWidth={6} />
    <circle cx={182} cy={24} r={13} fill="#E8E2D0" stroke={ENCRE} strokeWidth={4} />
    <circle cx={208} cy={12} r={9} fill="#E8E2D0" stroke={ENCRE} strokeWidth={4} />
  </>
);

const Lingot: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <path d={`M${x} ${y} h64 l14 44 h-92 Z`} fill={OR} stroke={ENCRE} strokeWidth={6} />
);

const Lingots = () => (
  <>
    <Lingot x={98} y={18} />
    <Lingot x={50} y={62} />
    <Lingot x={146} y={62} />
    <Lingot x={4} y={106} />
    <Lingot x={98} y={106} />
    <Lingot x={192} y={106} />
  </>
);

const DESSINS: Record<string, React.FC> = {
  car: Voiture,
  house: Maison,
  milliard: Pieces,
  apollo: Fusee,
  pib: Usines,
  richesse: Lingots,
};

export const Icone: React.FC<{ cle: string }> = ({ cle }) => {
  const Dessin = DESSINS[cle];
  return (
    <svg viewBox="0 0 260 170" width={400} height={262}>
      <Dessin />
    </svg>
  );
};

export const aIcone = (cle: string) => cle in DESSINS;

export const Bonbon: React.FC = () => (
  <svg viewBox="0 0 400 220" width={760} height={418}>
    <path d="M110 110 L10 40 L34 110 L10 180 Z" fill="#FFE36B" stroke={ENCRE} strokeWidth={8} />
    <path d="M290 110 L390 40 L366 110 L390 180 Z" fill="#FFE36B" stroke={ENCRE} strokeWidth={8} />
    <circle cx={200} cy={110} r={96} fill="#FFF6E6" stroke={ENCRE} strokeWidth={8} />
    <path d="M128 60 Q200 110 150 188 M200 16 Q270 90 216 204 M272 62 Q300 110 280 160" fill="none" stroke="#C8261C" strokeWidth={22} strokeLinecap="round" />
  </svg>
);
