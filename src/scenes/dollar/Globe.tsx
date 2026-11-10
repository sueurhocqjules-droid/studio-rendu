import React from "react";
import { interpolateColors } from "remotion";

const RAD = Math.PI / 180;

// Contours grossiers (longitude, latitude) : à la taille d'un téléphone, le globe doit juste se reconnaître
const TERRES: [number, number][][] = [
  [[-168, 66], [-156, 71], [-125, 70], [-95, 72], [-80, 72], [-78, 62], [-92, 58], [-80, 52], [-65, 60], [-55, 52], [-66, 45], [-75, 38], [-81, 31], [-81, 25], [-90, 30], [-97, 26], [-96, 19], [-88, 16], [-83, 9], [-78, 8], [-86, 12], [-105, 20], [-115, 31], [-124, 40], [-125, 49], [-135, 58], [-152, 59], [-165, 55]],
  [[-78, 9], [-60, 10], [-50, 0], [-35, -6], [-39, -17], [-48, -26], [-58, -38], [-65, -48], [-70, -55], [-75, -48], [-72, -30], [-70, -18], [-81, -5]],
  [[-55, 82], [-20, 82], [-20, 70], [-43, 60], [-52, 65], [-60, 76]],
  [[-17, 15], [-16, 25], [-6, 35], [10, 37], [32, 31], [35, 25], [43, 12], [51, 11], [40, -5], [40, -15], [33, -26], [20, -35], [15, -25], [12, -5], [9, 4], [-5, 5]],
  [[-10, 37], [-9, 44], [-2, 44], [0, 50], [8, 54], [5, 60], [15, 68], [28, 71], [60, 69], [80, 73], [105, 78], [140, 73], [180, 69], [180, 65], [163, 60], [155, 52], [140, 54], [130, 43], [127, 35], [122, 30], [118, 23], [108, 20], [108, 11], [100, 7], [98, 15], [92, 22], [80, 15], [77, 8], [72, 20], [60, 25], [50, 30], [57, 24], [45, 13], [36, 28], [30, 33], [36, 36], [25, 36], [22, 38], [16, 40], [10, 44], [3, 43], [-5, 36]],
  [[113, -22], [130, -12], [142, -11], [153, -27], [150, -38], [138, -35], [115, -34]],
  [[-180, -72], [-120, -74], [-60, -66], [0, -70], [60, -68], [120, -67], [180, -72], [180, -90], [-180, -90]],
];

// Découpe chaque côté pour que le contour suive la courbure du globe
const affine = (contour: [number, number][]) => {
  const points: [number, number][] = [];
  contour.forEach(([lon, lat], index) => {
    const [lonB, latB] = contour[(index + 1) % contour.length];
    const pas = Math.max(1, Math.ceil(Math.max(Math.abs(lonB - lon), Math.abs(latB - lat)) / 5));
    for (let k = 0; k < pas; k++) {
      points.push([lon + ((lonB - lon) * k) / pas, lat + ((latB - lat) * k) / pas]);
    }
  });
  return points;
};
const CONTOURS = TERRES.map(affine);

const MAILLE = 3;
type Case = { lon: number; lat: number; paire: boolean; x: number; y: number; z: number };
const CASES: Case[] = [];
for (let lat = -90, j = 0; lat < 90; lat += MAILLE, j++) {
  for (let lon = -180, i = 0; lon < 180; lon += MAILLE, i++) {
    const milieuLat = (lat + MAILLE / 2) * RAD;
    const milieuLon = (lon + MAILLE / 2) * RAD;
    // Les méridiens se resserrent vers les pôles : on regroupe les colonnes pour garder des cases carrées
    const largeur = Math.max(1, Math.round(1 / Math.cos(milieuLat)));
    CASES.push({
      lon,
      lat,
      paire: (Math.floor(i / largeur) + j) % 2 === 0,
      x: Math.cos(milieuLat) * Math.cos(milieuLon),
      y: Math.cos(milieuLat) * Math.sin(milieuLon),
      z: Math.sin(milieuLat),
    });
  }
}

type Vue = { lon: number; lat: number; rayon: number; cx: number; cy: number };

// Projection orthographique : z > 0, le point est sur la face visible
const projette = (lon: number, lat: number, vue: Vue) => {
  const phi = lat * RAD;
  const dLon = (lon - vue.lon) * RAD;
  const phi0 = vue.lat * RAD;
  const x = Math.cos(phi) * Math.sin(dLon);
  const y = Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * Math.cos(phi) * Math.cos(dLon);
  const z = Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * Math.cos(phi) * Math.cos(dLon);
  return { x: vue.cx + vue.rayon * x, y: vue.cy - vue.rayon * y, z, nx: x, ny: y };
};

const cheminTerres = (vue: Vue) =>
  CONTOURS.map((contour) => {
    const points = contour.map(([lon, lat]) => {
      const p = projette(lon, lat, vue);
      if (p.z >= 0) {
        return [p.x, p.y];
      }
      // Derrière le globe : le point se plaque sur le bord
      const norme = Math.hypot(p.nx, p.ny) || 1;
      return [vue.cx + (vue.rayon * p.nx) / norme, vue.cy - (vue.rayon * p.ny) / norme];
    });
    return `M${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}Z`;
  }).join("");

const cheminsTapis = (vue: Vue, centre: { lon: number; lat: number }, angle: number) => {
  const phi = centre.lat * RAD;
  const lambda = centre.lon * RAD;
  const cx = Math.cos(phi) * Math.cos(lambda);
  const cy = Math.cos(phi) * Math.sin(lambda);
  const cz = Math.sin(phi);
  const seuil = Math.cos(angle);
  const pairs: string[] = [];
  const impairs: string[] = [];
  for (const c of CASES) {
    if (c.x * cx + c.y * cy + c.z * cz < seuil) {
      continue;
    }
    const coins = [
      projette(c.lon, c.lat, vue),
      projette(c.lon + MAILLE, c.lat, vue),
      projette(c.lon + MAILLE, c.lat + MAILLE, vue),
      projette(c.lon, c.lat + MAILLE, vue),
    ];
    if (coins.every((p) => p.z < 0)) {
      continue;
    }
    (c.paire ? pairs : impairs).push(`M${coins.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join("L")}Z`);
  }
  return { pairs: pairs.join(""), impairs: impairs.join("") };
};

export const Globe: React.FC<{
  vue: Vue;
  centre: { lon: number; lat: number };
  // Angle au centre de la zone couverte, en radians
  angle: number;
  opaciteTapis: number;
  or: number;
}> = ({ vue, centre, angle, opaciteTapis, or }) => {
  const tapis = cheminsTapis(vue, centre, angle);
  const clair = interpolateColors(or, [0, 1], ["#3E9A62", "#FFD65A"]);
  const sombre = interpolateColors(or, [0, 1], ["#2F7D51", "#F2B01E"]);
  return (
    <g>
      <circle cx={vue.cx} cy={vue.cy} r={vue.rayon} fill="#1D5FA8" />
      <path d={cheminTerres(vue)} fill="#C9A85A" stroke="#7F6A34" strokeWidth={2} />
      <g opacity={opaciteTapis}>
        <path d={tapis.pairs} fill={clair} stroke={clair} strokeWidth={0.8} />
        <path d={tapis.impairs} fill={sombre} stroke={sombre} strokeWidth={0.8} />
      </g>
      <circle cx={vue.cx} cy={vue.cy} r={vue.rayon} fill="none" stroke="#FFF6E6" strokeOpacity={0.5} strokeWidth={4} />
    </g>
  );
};
