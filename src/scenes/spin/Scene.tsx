import React from "react";
import { AbsoluteFill, interpolate, interpolateColors } from "remotion";
import calcul from "../../../sujets/spin.calcul.json";
import { ANTON } from "../../cadre/polices";
import type { SceneProps } from "../../cadre/types";
import { angleGlobe, entre, lisse, paletteA, pasDecor } from "./temps";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const CX = 540;
const CY = 830;
const R0 = 262;
const Y_BUREAU = 1150;
const INCLINE = -16;
const COS_INCLINE = Math.cos((INCLINE * Math.PI) / 180);
const SIN_INCLINE = -Math.sin((INCLINE * Math.PI) / 180);
const ENCRE = "#1F2D2A";
const LAITON = "#B98A3A";
const LAITON_SOMBRE = "#8A6426";
const POIL = "#E08A36";
const POIL_SOMBRE = "#B9651C";

const hachage = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const pasDe = (cle: string) => calcul.paliers.find((p) => p.cle === cle)?.pas ?? 0;

const CONTINENTS = [
  { lon: 0.3, lat: 0.75, dl: 0.75, dh: 0.42 },
  { lon: -1.45, lat: 0.62, dl: 0.62, dh: 0.5 },
  { lon: -1.05, lat: -0.42, dl: 0.34, dh: 0.62 },
  { lon: 0.32, lat: 0.05, dl: 0.46, dh: 0.62 },
  { lon: 1.75, lat: 0.62, dl: 1.05, dh: 0.44 },
  { lon: 2.35, lat: -0.48, dl: 0.42, dh: 0.26 },
];

type Point = { x: number; y: number; z: number };

const projete = (lon: number, lat: number, angle: number, rx: number, ry: number): Point => {
  const l = lon - angle;
  const c = Math.cos(lat);
  return { x: CX + rx * c * Math.sin(l), y: CY - ry * Math.sin(lat), z: c * Math.cos(l) };
};

const Continent: React.FC<{ b: number; angle: number; rx: number; ry: number; fill: string }> = ({ b, angle, rx, ry, fill }) => {
  const c = CONTINENTS[b];
  const pts = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    const r = 0.72 + 0.42 * hachage(b + 1, i);
    const lat = c.lat + c.dh * r * Math.sin(a);
    const lon = c.lon + (c.dl * r * Math.cos(a)) / Math.max(0.3, Math.cos(c.lat));
    const p = projete(lon, lat, angle, rx, ry);
    if (p.z < 0) {
      const signe = p.x >= CX ? 1 : -1;
      return { x: CX + signe * rx * Math.cos(lat), y: p.y, z: p.z };
    }
    return p;
  });
  if (!pts.some((p) => p.z > 0)) {
    return null;
  }
  return <polygon points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill={fill} />;
};

const Objet: React.FC<{ k: number }> = ({ k }) => {
  if (k === 0) {
    return (
      <g>
        <rect x={-16} y={-24} width={32} height={24} fill="#F6F0DF" />
        <polygon points="-22,-24 22,-24 0,-44" fill="#C8361F" />
      </g>
    );
  }
  if (k === 1) {
    return (
      <g>
        <rect x={-4} y={-18} width={8} height={18} fill="#7A5A3C" />
        <circle cy={-34} r={20} fill="#2F7D3B" />
      </g>
    );
  }
  if (k === 2) {
    return (
      <g>
        <polygon points="-11,0 11,0 7,-52 -7,-52" fill="#F6F0DF" />
        <rect x={-9} y={-34} width={18} height={9} fill="#C8361F" />
        <circle cy={-58} r={8} fill="#FFD23F" />
      </g>
    );
  }
  return (
    <g>
      <rect x={-17} y={-58} width={34} height={58} fill="#4A5868" />
      {[-46, -32, -18].map((y) => (
        <rect key={y} x={-11} y={y} width={22} height={7} fill="#FFD23F" />
      ))}
    </g>
  );
};

const Aeronef: React.FC<{ type: number }> = ({ type }) => {
  if (type === 0) {
    return (
      <g>
        <polygon points="-110,0 96,-11 130,0 96,11" fill="#F6F0DF" />
        <polygon points="-58,0 40,0 -60,44" fill="#D8D2C0" />
        <polygon points="-96,-4 -66,-4 -96,-44" fill="#D8D2C0" />
      </g>
    );
  }
  if (type === 1) {
    return (
      <g>
        <polygon points="-110,-13 90,-13 136,0 90,13 -110,13" fill="#23262E" />
        <polygon points="-60,8 20,8 -40,40" fill="#3A404C" />
        <polygon points="-104,-13 -66,-13 -96,-46" fill="#3A404C" />
        <polygon points="-110,-10 -176,0 -110,10" fill="#FF8A1A" />
      </g>
    );
  }
  return (
    <g>
      <polygon points="-92,12 -92,-8 130,0" fill="#E6E6EE" />
      <polygon points="-92,8 -92,32 -24,6" fill="#4A5868" />
      <polygon points="-92,-6 -140,0 -92,8" fill="#FFD23F" />
    </g>
  );
};

const passage = (n: number, p: number) => interpolate(n, [p - 0.6, p + 2.2], [-260, 1340], borne);

export const SceneSpin: React.FC<SceneProps> = ({ t }) => {
  const n = pasDecor(t);
  const palette = paletteA(t);
  const angle = angleGlobe(t);
  const { t_limite, t_coupe, t_patte, t_retour, t_fin } = calcul;

  const aplati = lisse(entre(n, 33, pasDe("apesanteur")));
  const rx = R0 * (1 + 0.28 * aplati);
  const ry = R0 * (1 - 0.3 * aplati);
  const rebond = entre(t, t_patte, t_patte + 0.12) * (1 - entre(t, t_patte + 0.12, t_patte + 0.5));
  const silence = t >= t_coupe && t < t_retour;
  // Le pied suit le bas de l'arceau quand le globe s'aplatit
  const piedX = CX - 8 * COS_INCLINE + (ry + 45) * SIN_INCLINE;
  const piedY = CY + 8 * SIN_INCLINE + (ry + 45) * COS_INCLINE;

  const secousseMax = silence ? 0 : entre(n, 30, 58) * 11;
  const sx = Math.sin(t * 73) * secousseMax + rebond * -16;
  const sy = Math.cos(t * 67) * secousseMax * 0.7;

  const bandes = entre(n, 16, 26);
  const jupiter = entre(n, pasDe("jupiter") - 0.6, pasDe("jupiter")) * (1 - entre(n, pasDe("jupiter") + 2.6, pasDe("jupiter") + 3.4));
  const nu = entre(n, 56, pasDe("apesanteur"));
  const mer = interpolateColors(nu, [0, 1], ["#2C73B8", "#6C7480"]);
  const terreCouleur = interpolateColors(nu, [0, 1], ["#5DAA56", "#5B6470"]);
  const bande1 = interpolateColors(jupiter, [0, 1], [mer, "#D9B38C"]);
  const bande2 = interpolateColors(jupiter, [0, 1], [terreCouleur, "#B0713F"]);
  const bande3 = interpolateColors(jupiter, [0, 1], ["#3E8FCF", "#EBD5B8"]);

  const bureau = interpolateColors(n, [0, 31, 44, 52, 59], ["#A7774A", "#94602F", "#6E2A1C", "#26130D", "#17151E"]);

  const anneau = entre(n, pasDe("moitie"), pasDe("apesanteur"));
  const anneauRx = rx + 20 + anneau * 900;

  const OBJETS = 14;
  const tasseSort = entre(n, pasDe("quart"), pasDe("quart") + 1.6);
  const tasseTremble = entre(n, pasDe("x15") - 2, pasDe("x15")) * 5 * Math.sin(t * 55);
  const horlogeSort = entre(n, pasDe("x43") + 2, pasDe("x43") + 4);
  const calendrierSort = entre(n, pasDe("x43") + 1, pasDe("x43") + 3);
  const heures = angle * 2;
  const retourJour = t >= t_retour ? 1 - lisse(entre(t, t_retour, t_fin)) : 1;
  const jourAffiche = Math.floor((angle / (2 * Math.PI)) * retourJour) % 31;
  const feuilles = entre(n, pasDe("douze_h") - 1, pasDe("douze_h")) * (1 - calendrierSort);

  const entreePatte = lisse(entre(t, t_patte - 0.45, t_patte));
  const sortiePatte = lisse(entre(t, t_fin, t_fin + 0.5));
  const patte = entreePatte * (1 - sortiePatte);
  const xPatte = CX + rx + 26 + (1 - patte) * 560;
  const tete = lisse(entre(t, t_patte, t_patte + 0.45)) * (1 - lisse(entre(t, t_fin - 0.4, t_fin)));

  const rotationVisible = Math.max(0, entre(n, 22, 50));
  const traits = silence ? rotationVisible * 0.4 : rotationVisible;
  const limite = t >= t_limite - 0.1 && t < t_coupe ? entre(t, t_limite - 0.1, t_limite + 0.4) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <defs>
          <clipPath id="clip-globe">
            <ellipse cx={CX} cy={CY} rx={rx} ry={ry} />
          </clipPath>
        </defs>

        {limite > 0
          ? Array.from({ length: 22 }, (_, i) => (
              <rect
                key={i}
                x={((t * (260 + hachage(i, 1) * 500) + hachage(i, 2) * 1080) % 1180) - 60}
                y={520 + hachage(i, 3) * 620}
                width={60 + hachage(i, 4) * 120}
                height={6}
                fill={palette.accent}
                opacity={limite * 0.5}
              />
            ))
          : null}

        {calendrierSort < 1 ? (
          <g transform={`translate(${70 - calendrierSort * 420} ${575 + calendrierSort * 180}) rotate(${-calendrierSort * 130} 70 80)`}>
            <rect width={140} height={160} fill="#F6F0DF" />
            <rect width={140} height={36} fill="#C8361F" />
            <text x={70} y={136} textAnchor="middle" fontFamily={ANTON} fontSize={84} fill={ENCRE}>
              {jourAffiche + 1}
            </text>
          </g>
        ) : null}
        {feuilles > 0
          ? Array.from({ length: 6 }, (_, i) => {
              const p = (t * 0.9 + i / 6) % 1;
              return (
                <rect
                  key={i}
                  x={-50}
                  y={-60}
                  width={100}
                  height={118}
                  fill="#F6F0DF"
                  opacity={feuilles * (1 - p)}
                  transform={`translate(${140 + p * 300} ${690 - p * 20 + Math.sin(p * 9 + i) * 36}) rotate(${p * 280})`}
                />
              );
            })
          : null}

        {horlogeSort < 1 ? (
          <g transform={`translate(${896 + horlogeSort * 400} ${640 - horlogeSort * 200}) rotate(${horlogeSort * 200})`}>
            <circle r={78} fill="#F6F0DF" stroke={ENCRE} strokeWidth={10} />
            <g transform={`rotate(${(heures * 180) / Math.PI})`}>
              <rect x={-5} y={-42} width={10} height={48} fill={ENCRE} />
            </g>
            <g transform={`rotate(${(heures * 12 * 180) / Math.PI})`}>
              <rect x={-3} y={-64} width={6} height={72} fill="#C8361F" />
            </g>
          </g>
        ) : null}

        <rect x={0} y={Y_BUREAU} width={1080} height={770} fill={bureau} />

        {tasseSort < 1 ? (
          <g transform={`translate(${170 + tasseTremble - tasseSort * 360} ${Y_BUREAU + tasseSort * tasseSort * 300}) rotate(${-tasseSort * 170})`}>
            <rect x={-46} y={-104} width={92} height={104} rx={8} fill="#E8E2D0" />
            <path d="M46 -82 C86 -82 86 -28 46 -28" fill="none" stroke="#E8E2D0" strokeWidth={15} />
          </g>
        ) : null}

        <g transform={`translate(${sx} ${sy})`}>
          <rect x={CX - 170} y={Y_BUREAU - 26} width={340} height={32} rx={10} fill={LAITON_SOMBRE} />
          <polygon points={`${CX - 18},${Y_BUREAU - 20} ${CX + 18},${Y_BUREAU - 20} ${piedX + 11},${piedY} ${piedX - 11},${piedY}`} fill={LAITON} />

          <g transform={`rotate(${INCLINE} ${CX} ${CY})`}>
            <g clipPath="url(#clip-globe)">
              <ellipse cx={CX} cy={CY} rx={rx} ry={ry} fill={mer} />
              {CONTINENTS.map((_, b) => (
                <Continent key={b} b={b} angle={angle} rx={rx} ry={ry} fill={terreCouleur} />
              ))}
              {Math.max(bandes, jupiter) > 0
                ? Array.from({ length: 11 }, (_, i) => {
                    const y = CY - ry + (i * 2 * ry) / 11;
                    const fill = i % 3 === 0 ? bande1 : i % 3 === 1 ? bande2 : bande3;
                    return <rect key={i} x={CX - rx} y={y} width={2 * rx} height={(2 * ry) / 11 + 1} fill={fill} opacity={Math.max(bandes, jupiter) * 0.92} />;
                  })
                : null}
              {Array.from({ length: OBJETS }, (_, i) => {
                const parti = entre(n, pasDe("quart") + i, pasDe("quart") + i + 0.4);
                if (parti >= 1) {
                  return null;
                }
                const lat = (i % 3) * 0.16 - 0.1;
                const p = projete((i / OBJETS) * Math.PI * 2, lat, angle, rx, ry);
                if (p.z <= 0.05) {
                  return null;
                }
                const leve = entre(n, pasDe("x43"), pasDe("quart")) * 14 * Math.abs(Math.sin(t * 16 + i));
                return (
                  <g key={i} transform={`translate(${p.x} ${p.y - leve}) rotate(${-INCLINE}) scale(${0.72 + 0.5 * p.z})`}>
                    <Objet k={i % 4} />
                  </g>
                );
              })}
              <ellipse cx={CX + rx * 0.42} cy={CY} rx={rx} ry={ry * 1.1} fill="#000000" opacity={0.13} />
            </g>

            <path
              d={`M${CX - 8} ${CY - ry - 34} A${rx + 44} ${ry + 34} 0 0 0 ${CX - 8} ${CY + ry + 34}`}
              fill="none"
              stroke={LAITON}
              strokeWidth={18}
            />
            <rect x={CX - 8} y={CY - ry - 44} width={16} height={22} fill={LAITON_SOMBRE} />
            <rect x={CX - 8} y={CY + ry + 22} width={16} height={22} fill={LAITON_SOMBRE} />
          </g>
        </g>

        {traits > 0
          ? Array.from({ length: 8 }, (_, i) => {
              const a = angle * 0.5 + (i / 8) * Math.PI * 2;
              const rxTrait = rx + 44 + (i % 3) * 22;
              const ryTrait = ry + 44 + (i % 3) * 22;
              const b = a + 0.5;
              return (
                <path
                  key={i}
                  d={`M${CX + rxTrait * Math.cos(a)} ${CY + ryTrait * Math.sin(a)} A${rxTrait} ${ryTrait} 0 0 1 ${CX + rxTrait * Math.cos(b)} ${CY + ryTrait * Math.sin(b)}`}
                  fill="none"
                  stroke={palette.encre}
                  strokeWidth={7}
                  strokeLinecap="round"
                  opacity={traits * 0.5}
                />
              );
            })
          : null}

        {anneau > 0 ? (
          <g transform={`rotate(${INCLINE} ${CX} ${CY})`}>
            <ellipse cx={CX} cy={CY} rx={anneauRx} ry={36 + anneau * 110} fill="none" stroke="#3E8FCF" strokeWidth={18 + anneau * 14} opacity={0.9 * (1 - entre(n, pasDe("apesanteur") - 0.4, pasDe("apesanteur")) * 0.4)} />
          </g>
        ) : null}

        {Array.from({ length: OBJETS }, (_, i) => {
          const debut = pasDe("quart") + i;
          const p = entre(n, debut, debut + 2.2);
          if (p <= 0 || p >= 1) {
            return null;
          }
          const cote = i % 2 ? 1 : -1;
          const x = CX + cote * (rx + p * p * 900);
          const y = CY + (hachage(i, 8) - 0.5) * 300 - cote * (rx + p * p * 900) * 0.2;
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${p * 720 * cote}) scale(1.4)`}>
              <Objet k={i % 4} />
            </g>
          );
        })}

        {[
          { cle: "concorde", type: 0, y: 610 },
          { cle: "x15", type: 1, y: 560 },
          { cle: "x43", type: 2, y: 1040 },
        ].map(({ cle, type, y }) => {
          const x = passage(n, pasDe(cle));
          if (x <= -260 || x >= 1340) {
            return null;
          }
          return (
            <g key={cle} transform={`translate(${x} ${y})`}>
              <Aeronef type={type} />
            </g>
          );
        })}

        {tete > 0 ? (
          <g transform={`translate(905 ${Y_BUREAU + 190 - tete * 190})`}>
            <polygon points="-104,-110 -76,-212 -22,-136" fill={POIL} />
            <polygon points="22,-136 76,-212 104,-110" fill={POIL} />
            <ellipse cy={-74} rx={122} ry={96} fill={POIL} />
            <rect x={-34} y={-170} width={13} height={46} fill={POIL_SOMBRE} />
            <rect x={21} y={-170} width={13} height={46} fill={POIL_SOMBRE} />
            <circle cx={-50} cy={-82} r={15} fill={ENCRE} />
            <circle cx={50} cy={-82} r={15} fill={ENCRE} />
            <polygon points="-10,-46 10,-46 0,-34" fill="#D65A5A" />
          </g>
        ) : null}

        {patte > 0 ? (
          <g transform={`translate(${xPatte} ${CY})`}>
            <rect x={36} y={-44} width={700} height={88} fill={POIL} />
            <ellipse cx={22} cy={0} rx={62} ry={60} fill={POIL} />
            {[-36, 0, 36].map((y) => (
              <ellipse key={y} cx={-30} cy={y} rx={18} ry={14} fill="#F2B28C" />
            ))}
            {[90, 190, 290].map((x) => (
              <rect key={x} x={x} y={-44} width={30} height={88} fill={POIL_SOMBRE} />
            ))}
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
