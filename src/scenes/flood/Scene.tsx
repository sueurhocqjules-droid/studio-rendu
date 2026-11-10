import React from "react";
import { AbsoluteFill, interpolate, interpolateColors } from "remotion";
import calcul from "../../../sujets/flood.calcul.json";
import type { SceneProps } from "../../cadre/types";
import { entre, hauteurM, lisse, paletteA, pasDecor } from "./temps";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Y_EAU = 1240;
const FLAQUE = 60;
// Un pas vers le haut sur l'échelle : ln(1,4) x 200 px. L'échelle est logarithmique, chaque repère descend à vitesse constante
const PAS_PX = 67.3;
const X_POTEAU = 930;
const X_CANARD = 300;
const R_PLAT = 60000;
const R_COURBE_FIN = 620;
const R_GOUTTE = 430;
const CY_GOUTTE = 900;
const R_TERRE_PX = R_GOUTTE / (calcul.rayon_globe_m / calcul.rayon_terre_m);
const ANGLE_CANARD_DEBUT = Math.asin((X_CANARD - 540) / R_COURBE_FIN);
const ANGLE_CANARD_GOUTTE = 0.66;

const BLEU = "#2C9BD6";
const IMPOSSIBLE = "#12B59A";
const TROTTOIR = "#C9B08A";
const BOIS = "#7A5230";
const BOIS_CLAIR = "#A0713F";

const hachage = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const pasDe = (cle: string) => calcul.paliers.find((p) => p.cle === cle)?.pas ?? 0;

const rayonCourbe = (n: number) =>
  Math.exp(interpolate(n, [44, 60], [Math.log(R_PLAT), Math.log(R_COURBE_FIN)], borne));

const courbe = (x: number, r: number) => {
  const d = x - 540;
  return r - Math.sqrt(Math.max(r * r - d * d, 0));
};

const Etagere: React.FC<{ h: number }> = ({ h }) => (
  <g>
    <polygon points={`-90,${h + 14} 0,${h + 14} 0,${h + 96}`} fill={BOIS} />
    <rect x={-320} y={h} width={320} height={16} fill={BOIS_CLAIR} />
  </g>
);

const Pied: React.FC<{ n: number; y: number }> = ({ n, y }) => {
  const envol = 2400 * lisse(entre(n, 7.2, 10));
  return (
    <g transform={`translate(790 ${y - envol})`}>
      <rect x={-115} y={-1700} width={255} height={1700} fill="#2E4E8C" />
      <rect x={-115} y={-34} width={255} height={34} fill="#4A6DB0" />
      <rect x={-95} y={0} width={215} height={80} fill="#F6F3E8" />
      <path d="M-95 70 L120 70 L152 470 L-262 470 C-272 386 -180 330 -95 250 Z" fill="#E8483A" />
      <rect x={-272} y={468} width={432} height={63} rx={26} fill="#F6F3E8" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={-120 - i * 34} y={250 + i * 38} width={120} height={14} rx={7} fill="#F6F3E8" transform={`rotate(-34 ${-120 - i * 34} ${250 + i * 38})`} />
      ))}
    </g>
  );
};

const Voiture: React.FC = () => (
  <g>
    <path d="M-300 118 C-296 86 -262 80 -228 76 L-186 26 C-178 16 -166 12 -152 12 L-92 12 C-76 12 -66 18 -58 30 L-34 76 C-16 80 -8 96 -10 118 Z" fill="#E8483A" />
    <path d="M-214 74 L-180 34 L-132 34 L-132 74 Z" fill="#BFE6F5" />
    <path d="M-118 74 L-118 34 L-90 34 C-80 34 -74 38 -70 46 L-56 74 Z" fill="#BFE6F5" />
    <rect x={-300} y={112} width={290} height={22} rx={8} fill="#B5362A" />
    <circle cx={-236} cy={136} r={34} fill="#22262C" />
    <circle cx={-236} cy={136} r={14} fill="#C8CCD2" />
    <circle cx={-74} cy={136} r={34} fill="#22262C" />
    <circle cx={-74} cy={136} r={14} fill="#C8CCD2" />
  </g>
);

const Maison: React.FC = () => (
  <g>
    <rect x={-270} y={96} width={230} height={164} fill="#F2E3C6" />
    <polygon points="-300,100 -155,0 -10,100" fill="#B5472F" />
    <rect x={-250} y={120} width={52} height={48} fill="#7CC4E4" />
    <rect x={-112} y={120} width={52} height={48} fill="#7CC4E4" />
    <rect x={-250} y={192} width={52} height={48} fill="#7CC4E4" />
    <rect x={-180} y={184} width={52} height={76} fill="#6B4226" />
  </g>
);

const Statue: React.FC<{ allumee: boolean }> = ({ allumee }) => (
  <g fill="#5FB39A">
    <rect x={-222} y={232} width={124} height={68} fill="#D8CDB4" />
    <rect x={-204} y={208} width={88} height={26} fill="#C4B89C" />
    <path d="M-204 208 L-192 100 C-188 84 -132 84 -128 100 L-116 208 Z" />
    <circle cx={-160} cy={74} r={26} />
    {[-2, -1, 0, 1, 2].map((i) => (
      <rect key={i} x={-163} y={22} width={6} height={32} transform={`rotate(${i * 26} -160 74)`} />
    ))}
    <rect x={-136} y={36} width={22} height={70} rx={10} transform="rotate(12 -126 100)" />
    <rect x={-120} y={10} width={18} height={30} fill="#D9A93A" />
    {allumee ? <path d="M-111 -2 C-122 -12 -116 -24 -110 -34 C-104 -22 -98 -12 -111 -2 Z" fill="#FF8A2B" /> : null}
  </g>
);

const Tour: React.FC = () => (
  <g fill="#8AA0B4">
    <rect x={-162} y={0} width={6} height={80} />
    <rect x={-172} y={70} width={26} height={60} />
    <rect x={-186} y={124} width={54} height={70} />
    <rect x={-202} y={188} width={86} height={72} />
    <rect x={-216} y={254} width={114} height={66} />
    <rect x={-160} y={136} width={8} height={184} fill="#BFD2E2" />
    <rect x={-194} y={204} width={8} height={116} fill="#BFD2E2" />
  </g>
);

const Seau: React.FC = () => (
  <g>
    <path d="M18 112 L120 112 L132 18 L6 18 Z" fill="#9AA4AE" transform="rotate(180 69 65)" />
    <rect x={6} y={106} width={126} height={10} fill="#7A838D" />
    <rect x={0} y={118} width={150} height={14} fill={BOIS_CLAIR} />
  </g>
);

const Montagne: React.FC = () => (
  <g>
    <polygon points="-316,300 -160,0 -6,300" fill="#6E7884" />
    <polygon points="-218,112 -160,0 -104,112 -128,92 -148,122 -176,90 -194,118" fill="#F6F3E8" />
    <polygon points="-160,0 -6,300 -92,300" fill="#59626D" />
  </g>
);

const Fusee: React.FC = () => (
  <g>
    <path d="M-200 240 L-200 86 C-200 44 -176 12 -160 0 C-144 12 -120 44 -120 86 L-120 240 Z" fill="#F0ECE2" />
    <path d="M-200 240 L-236 240 L-200 170 Z" fill="#E8483A" />
    <path d="M-120 240 L-84 240 L-120 170 Z" fill="#E8483A" />
    <path d="M-192 56 C-186 34 -172 16 -160 0 C-148 16 -134 34 -128 56 Z" fill="#E8483A" />
    <circle cx={-160} cy={112} r={26} fill="#1F5AA6" stroke="#C8CCD2" strokeWidth={7} />
  </g>
);

const Station: React.FC = () => (
  <g>
    <rect x={-168} y={62} width={16} height={70} fill="#8D97A2" />
    <rect x={-306} y={40} width={290} height={12} fill="#C8CCD2" />
    {[-300, -248, -82, -30].map((x) => (
      <rect key={x} x={x - 4} y={0} width={40} height={92} fill="#3B69B8" stroke="#C8CCD2" strokeWidth={3} />
    ))}
    <rect x={-206} y={22} width={92} height={48} rx={18} fill="#F0ECE2" />
    <circle cx={-160} cy={46} r={12} fill="#1F5AA6" />
  </g>
);

const Balance: React.FC<{ n: number; t: number; eau: string }> = ({ n, t, eau }) => {
  const vibre = t > calcul.t_limite ? Math.sin(t * 9) * Math.exp(-(t - calcul.t_limite) * 1.6) * 3 : 0;
  const angle = interpolate(n, [57, 60], [14, -14], borne) + vibre;
  const rad = (angle * Math.PI) / 180;
  const bras = 112;
  const axe = { x: -160, y: 50 };
  const gauche = { x: axe.x - bras * Math.cos(rad), y: axe.y - bras * Math.sin(rad) };
  const droite = { x: axe.x + bras * Math.cos(rad), y: axe.y + bras * Math.sin(rad) };
  return (
    <g>
      <rect x={-168} y={50} width={16} height={170} fill="#C8CCD2" />
      <rect x={-214} y={208} width={108} height={14} fill="#8D97A2" />
      <line x1={gauche.x} y1={gauche.y} x2={droite.x} y2={droite.y} stroke="#F0ECE2" strokeWidth={12} strokeLinecap="round" />
      <circle cx={axe.x} cy={axe.y} r={12} fill="#FFD54A" />
      {[gauche, droite].map((b, i) => (
        <g key={i}>
          <line x1={b.x} y1={b.y} x2={b.x} y2={b.y + 66} stroke="#C8CCD2" strokeWidth={5} />
          <rect x={b.x - 50} y={b.y + 66} width={100} height={10} rx={5} fill="#F0ECE2" />
        </g>
      ))}
      <path d={`M${gauche.x} ${gauche.y + 12} C${gauche.x - 46} ${gauche.y + 48} ${gauche.x - 28} ${gauche.y + 66} ${gauche.x} ${gauche.y + 66} C${gauche.x + 28} ${gauche.y + 66} ${gauche.x + 46} ${gauche.y + 48} ${gauche.x} ${gauche.y + 12} Z`} fill={eau} />
      <circle cx={droite.x} cy={droite.y + 44} r={22} fill={TROTTOIR} />
    </g>
  );
};

const Canard: React.FC<{ x: number; y: number; echelle: number; angle: number; casque: number }> = ({ x, y, echelle, angle, casque }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${echelle})`}>
    <polygon points="82,-96 148,-156 118,-52" fill="#FFD23F" />
    <ellipse cx={0} cy={-52} rx={110} ry={70} fill="#FFD23F" />
    <circle cx={-56} cy={-150} r={58} fill="#FFD23F" />
    <ellipse cx={-122} cy={-142} rx={36} ry={15} fill="#F08A24" />
    <circle cx={-76} cy={-166} r={10} fill="#14110D" />
    <ellipse cx={26} cy={-62} rx={58} ry={34} fill="#F2B705" />
    {casque > 0 ? <circle cx={-56} cy={-150} r={82} fill="#CDEBFF" fillOpacity={0.25 * casque} stroke="#F6F3E8" strokeWidth={7} opacity={casque} /> : null}
  </g>
);

const Nuage: React.FC<{ x: number; y: number; e: number }> = ({ x, y, e }) => (
  <g transform={`translate(${x} ${y}) scale(${e})`} fill="#F6F3E8">
    <ellipse cx={0} cy={0} rx={110} ry={40} />
    <circle cx={-44} cy={-24} r={44} />
    <circle cx={32} cy={-34} r={56} />
  </g>
);

const Mouette: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  const b = Math.sin(t * 7 + x) * 12;
  return <path d={`M${x - 46} ${y - b} Q${x - 20} ${y - 26} ${x} ${y} Q${x + 20} ${y - 26} ${x + 46} ${y - b}`} fill="none" stroke="#10304A" strokeWidth={8} strokeLinecap="round" />;
};

const Avion: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`} fill="#F0ECE2">
    <rect x={-92} y={-12} width={184} height={24} rx={12} />
    <polygon points="-24,0 34,0 -36,66" fill="#C8CCD2" />
    <polygon points="62,-8 92,-8 96,-52" fill="#E8483A" />
  </g>
);

const Ballon: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle cx={0} cy={0} r={62} fill="#F0ECE2" />
    <line x1={0} y1={60} x2={0} y2={150} stroke="#C8CCD2" strokeWidth={4} />
    <rect x={-14} y={148} width={28} height={24} fill="#E8483A" />
  </g>
);

const Aurore: React.FC<{ y: number }> = ({ y }) => (
  <g opacity={0.45}>
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <rect key={i} x={50 + i * 74} y={y - hachage(i, 3) * 70} width={46} height={150 + hachage(i, 4) * 120} rx={22} fill={i % 2 ? "#5BE3A0" : "#3FC7B0"} />
    ))}
  </g>
);

const Poisson: React.FC<{ x: number; y: number; e: number; couleur: string }> = ({ x, y, e, couleur }) => (
  <g transform={`translate(${x} ${y}) scale(${e})`} fill={couleur}>
    <ellipse cx={0} cy={0} rx={52} ry={26} />
    <polygon points="-44,0 -86,-28 -86,28" />
    <circle cx={26} cy={-6} r={6} fill="#14110D" />
  </g>
);

const spirale = (cx: number, cy: number, rExt: number, rInt: number, phi: number) => {
  const points: string[] = [];
  for (let k = 0; k <= 44; k++) {
    const f = k / 44;
    const r = rExt - (rExt - rInt) * f;
    const a = phi + f * 4.6;
    points.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return points.join(" ");
};

export const SceneFlood: React.FC<SceneProps> = ({ t }) => {
  const palette = paletteA(t);
  const n = pasDecor(t);
  const r = rayonCourbe(n);
  const eau = interpolateColors(n, [36.8, 37.6], [BLEU, IMPOSSIBLE]);

  const debutZoom = calcul.t_coupe - 1;
  const pZoom = lisse(entre(t, debutZoom, calcul.t_coupe + 0.5));
  const xRetour = entre(t, calcul.t_retour, calcul.t_fin);
  const pIn = lisse(entre(xRetour, 0.3, 0.92));
  const alphaFin = entre(xRetour, 0.82, 0.98);
  const alphaPlat = t < calcul.t_retour ? 1 - entre(t, debutZoom, calcul.t_coupe - 0.5) : alphaFin;
  const alphaEauPlate = t < debutZoom ? 1 : t < calcul.t_retour ? 0 : alphaFin;
  const alphaBoule = t < debutZoom ? 0 : 1 - alphaFin;

  // L'échelle descend avec la courbure de la Terre : le repère touche l'eau pile à sa seconde
  const yPas = (pas: number) => Y_EAU + courbe(X_POTEAU, r) - PAS_PX * (pas - n);
  const yCiel = (pas: number) => Y_EAU - PAS_PX * (pas - n);
  const amp = interpolate(n, [0, 20, 44, 52], [3, 12, 10, 0], borne);
  const yVague = (x: number) => Y_EAU + courbe(x, r) + amp * Math.sin(x * 0.012 + t * 2.1) + amp * 0.5 * Math.sin(x * 0.031 - t * 1.4);

  const surface: string[] = [];
  for (let x = -20; x <= 1100; x += 28) {
    surface.push(`${x},${yVague(x).toFixed(1)}`);
  }
  const ligneSurface = surface.join(" ");

  const ySol = Y_EAU + FLAQUE + PAS_PX * n;
  const hH = (cle: string, h: number) => ({ pas: pasDe(cle), h });
  const yVoiture = Math.min(yPas(pasDe("voiture")), yVague(600) - 128);
  const dxVoiture = -190 * Math.max(0, n - 11.5);
  const rotVoiture = n > 10.5 ? Math.sin(t * 2.4) * 5 : 0;
  // Assez haut pour que le plateau qui bascule reste au-dessus de la légende
  const yBalance = yPas(pasDe("lourd")) - 400;
  const hautPoteau = yBalance - 70;

  // La goutte vue de loin, puis la Terre nue sur laquelle on replonge
  const rZoom = Math.exp(interpolate(pZoom, [0, 1], [Math.log(R_COURBE_FIN), Math.log(R_GOUTTE)]));
  const cyZoom = interpolate(pZoom, [0, 1], [Y_EAU + R_COURBE_FIN, CY_GOUTTE]);
  const rEau = rZoom * (1 + (hauteurM(n) / calcul.rayon_terre_m - (hauteurM(calcul.n_max) / calcul.rayon_terre_m)) / (calcul.rayon_globe_m / calcul.rayon_terre_m));
  const echelleIn = Math.exp(pIn * Math.log(R_PLAT / R_TERRE_PX));
  const rPlanete = (t < calcul.t_retour ? (rZoom * R_TERRE_PX) / R_GOUTTE : R_TERRE_PX) * echelleIn;
  // On garde le sommet de la planète à l'écran pendant la plongée : son bord s'aplatit jusqu'à redevenir le trottoir
  const sommetRetour = interpolate(pIn, [0, 1], [CY_GOUTTE - R_TERRE_PX, Y_EAU + FLAQUE]);
  const cyBoule = t < calcul.t_retour ? cyZoom : sommetRetour + rPlanete;
  const rEauFinal = Math.max(rEau * echelleIn, rPlanete);
  const alphaPlanete = Math.min(pZoom * 2, 1);

  const dxCanard =
    t < calcul.t_retour
      ? rEauFinal * Math.sin(interpolate(pZoom, [0, 1], [ANGLE_CANARD_DEBUT, ANGLE_CANARD_GOUTTE]))
      : Math.sin(ANGLE_CANARD_GOUTTE) * rEau * (1 - pIn) + (X_CANARD - 540) * pIn;
  const theta = Math.asin(Math.max(-1, Math.min(1, dxCanard / rEauFinal)));
  const echelleCanard = t < calcul.t_retour ? interpolate(pZoom, [0, 1], [1, 0.34]) : interpolate(pIn, [0, 1], [0.34, 1]);
  const xBoule = 540 + rEauFinal * Math.sin(theta);
  const yBoule = cyBoule - rEauFinal * Math.cos(theta);
  const enBoule = t >= debutZoom;
  const xCanard = enBoule ? interpolate(alphaFin, [0, 1], [xBoule, X_CANARD]) : X_CANARD;
  const yCanard = enBoule ? interpolate(alphaFin, [0, 1], [yBoule, yVague(X_CANARD)]) : yVague(X_CANARD) + 4;
  const angleCanard = enBoule ? (theta * 180 * (1 - alphaFin)) / Math.PI : Math.sin(t * 2.1) * 3;

  const phi = t * 0.5 + 14 * lisse(entre(t, calcul.t_bouchon, calcul.t_retour + 1));
  const alphaTourbillon = pZoom * (1 - entre(xRetour, 0, 0.25));
  const xBonde = 540 + rEauFinal * 0.766;
  const yBonde = cyBoule + rEauFinal * 0.643;
  const alphaBonde = entre(t, calcul.t_coupe + 0.4, calcul.t_coupe + 0.9) * (1 - entre(t, calcul.t_retour + 0.5, calcul.t_retour + 0.9));
  const tire = lisse(entre(t, calcul.t_bouchon, calcul.t_retour));
  const alphaJet = tire * (1 - entre(xRetour, 0.12, 0.3));

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <g opacity={entre(n, 42, 50)}>
          {Array.from({ length: 70 }, (_, i) => (
            <circle key={i} cx={hachage(i, 1) * 1080} cy={hachage(i, 2) * 1300} r={1.5 + hachage(i, 3) * 2.8} fill="#F6F3E8" />
          ))}
        </g>

        <g opacity={alphaPlat}>
          <circle cx={230} cy={760} r={92} fill={interpolateColors(n, [40, 50], ["#FFD54A", "#FFF4D0"])} />
          {[30, 33, 35, 37, 39, 42].map((p, i) => (
            <Nuage key={p} x={120 + hachage(i, 7) * 400} y={yCiel(p)} e={0.8 + hachage(i, 8) * 0.7} />
          ))}
          {[15, 17, 21, 24, 27].map((p, i) => (
            <Mouette key={p} x={450 + hachage(i, 9) * 190} y={yCiel(p)} t={t} />
          ))}
          <Avion x={340} y={yCiel(43.2)} />
          <Ballon x={180} y={yCiel(45.6)} />
          <g opacity={entre(n, 46, 49)}>
            <Aurore y={yCiel(50.5)} />
          </g>

          <rect x={X_POTEAU - 10} y={hautPoteau} width={20} height={Math.max(ySol - hautPoteau, 0)} fill={BOIS} />
          <circle cx={X_POTEAU} cy={hautPoteau} r={18} fill={BOIS_CLAIR} />
          {Array.from({ length: calcul.n_max }, (_, i) => i + 1).map((p) => {
            const y = yPas(p);
            return y > -20 && y < 1940 ? (
              <rect key={p} x={X_POTEAU - 10} y={y - 3} width={p % 5 === 0 ? 34 : 20} height={6} fill="#F6F3E8" />
            ) : null;
          })}

          <g transform={`translate(${X_POTEAU} ${yPas(pasDe("voiture"))})`}>
            <Etagere h={170} />
          </g>
          <g transform={`translate(${X_POTEAU + dxVoiture} ${yVoiture}) rotate(${rotVoiture} -155 120)`}>
            <Voiture />
          </g>
          {[
            { ...hH("maison", 260), objet: <Maison /> },
            { ...hH("liberte", 300), objet: <Statue allumee={n < pasDe("liberte")} /> },
            { ...hH("tour", 320), objet: <Tour /> },
            { ...hH("everest", 300), objet: <Montagne /> },
            { ...hH("espace", 240), objet: <Fusee /> },
            { ...hH("iss", 132), objet: <Station /> },
          ].map(({ pas, h, objet }) => {
            const y = yPas(pas);
            return y > -420 && y < 1960 ? (
              <g key={pas} transform={`translate(${X_POTEAU} ${y})`}>
                <Etagere h={h} />
                {objet}
              </g>
            ) : null;
          })}
          <g transform={`translate(${X_POTEAU} ${yPas(pasDe("eau"))})`}>
            <Seau />
          </g>
          <g transform={`translate(${X_POTEAU} ${yBalance})`}>
            <Etagere h={222} />
            <Balance n={n} t={t} eau={eau} />
          </g>

          <rect x={0} y={ySol} width={1080} height={Math.max(1920 - ySol, 0)} fill={TROTTOIR} />
          <rect x={0} y={ySol} width={1080} height={12} fill="#A88D67" />
          {n < 10.2 ? <Pied n={n} y={yPas(pasDe("cheville"))} /> : null}
        </g>

        <g opacity={interpolate(n, [30, 44], [1, 0], borne) * alphaPlat}>
          {[0, 1, 2, 3].map((i) => {
            const y = 1520 + i * 104;
            const x = ((t * (70 + i * 30) + i * 410) % 1320) - 120;
            return ySol > y + 60 ? <Poisson key={i} x={x} y={y} e={0.9 + i * 0.15} couleur={i % 2 ? "#F2A33C" : "#E8483A"} /> : null;
          })}
        </g>

        <Canard x={xCanard} y={yCanard} echelle={echelleCanard} angle={angleCanard} casque={entre(n, 47.5, 48.5)} />

        <g opacity={alphaEauPlate}>
          <polygon points={`-20,1940 ${ligneSurface} 1100,1940`} fill={eau} fillOpacity={0.8} />
          <polyline points={ligneSurface} fill="none" stroke="#F6F3E8" strokeWidth={7} strokeOpacity={0.85} />
        </g>

        {t < debutZoom
          ? calcul.paliers.map((p, i) => {
              const a = (t - p.arrivee_s) / 0.7;
              if (a < 0 || a > 1) {
                return null;
              }
              return (
                <g key={p.cle} opacity={1 - a}>
                  {Array.from({ length: 10 }, (_, k) => (
                    <circle
                      key={k}
                      cx={X_POTEAU - 170 + (hachage(i, k + 20) - 0.5) * 420 * a}
                      cy={yVague(X_POTEAU - 170) - (220 + hachage(i, k + 30) * 380) * a + 520 * a * a}
                      r={6 + hachage(i, k + 40) * 8}
                      fill="#F6F3E8"
                    />
                  ))}
                </g>
              );
            })
          : null}

        {alphaBoule > 0 ? (
          <g opacity={alphaBoule}>
            <g opacity={alphaPlanete}>
              <circle cx={540} cy={cyBoule} r={rPlanete} fill={TROTTOIR} />
              {pIn < 0.5
                ? [0, 1, 2, 3].map((i) => (
                    <ellipse
                      key={i}
                      cx={540 + (hachage(i, 50) - 0.5) * rPlanete * 1.1}
                      cy={cyBoule + (hachage(i, 51) - 0.5) * rPlanete * 1.1}
                      rx={rPlanete * (0.16 + hachage(i, 52) * 0.16)}
                      ry={rPlanete * (0.1 + hachage(i, 53) * 0.12)}
                      fill="#A88D67"
                    />
                  ))
                : null}
            </g>
            <circle cx={540} cy={cyBoule} r={rEauFinal} fill={eau} fillOpacity={interpolate(pZoom, [0, 1], [0.8, 0.55]) * entre(rEauFinal / rPlanete, 1.005, 1.06)} />
            {alphaTourbillon > 0 ? (
              <g opacity={alphaTourbillon * 0.5}>
                {[0, 1, 2].map((i) => (
                  <polyline key={i} points={spirale(540, cyBoule, rEauFinal * 0.97, rPlanete * 1.08, phi + (i * Math.PI * 2) / 3)} fill="none" stroke="#F6F3E8" strokeWidth={7} strokeLinecap="round" />
                ))}
              </g>
            ) : null}
            {alphaJet > 0 ? (
              <polygon points={`${xBonde - 34},${yBonde - 20} ${xBonde + 30},${yBonde - 30} 1120,1940 960,1940`} fill={eau} opacity={alphaJet} />
            ) : null}
            {alphaBonde > 0 ? (
              <g opacity={alphaBonde}>
                <line x1={xBonde + 340 * tire * 0.36} y1={yBonde + 460 * tire} x2={1020} y2={1940} stroke="#C8CCD2" strokeWidth={13} strokeDasharray="20 12" />
                <g transform={`translate(${xBonde + 340 * tire * 0.36} ${yBonde + 460 * tire}) rotate(-40)`}>
                  <ellipse cx={0} cy={0} rx={56} ry={30} fill="#22262C" />
                  <ellipse cx={0} cy={-6} rx={38} ry={16} fill="#3B424C" />
                  <circle cx={0} cy={-24} r={10} fill="none" stroke="#C8CCD2" strokeWidth={6} />
                </g>
              </g>
            ) : null}
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
