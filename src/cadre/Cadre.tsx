import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { ANTON, MONO } from "./polices";
import type { Etat } from "./types";

// Zone sûre de Shorts, TikTok et Reels : texte entre y=250 et y=1450, à plus de 130 px du bord droit
const GAUCHE = 70;
const LARGEUR = 880;
const HAUT = 250;
const BAS = 1450;

const Compteur: React.FC<{ etat: Etat }> = ({ etat }) => (
  <div style={{ position: "absolute", left: GAUCHE, top: HAUT, width: LARGEUR }}>
    <div
      style={{
        fontFamily: MONO,
        fontWeight: 800,
        fontSize: 160,
        lineHeight: 1,
        letterSpacing: -4,
        color: etat.palette.encre,
        transformOrigin: "left center",
        scale: String(1 + etat.pop * 0.07),
      }}
    >
      {etat.nombre}
    </div>
    <div
      style={{
        fontFamily: ANTON,
        fontSize: 68,
        lineHeight: 1.15,
        color: etat.palette.accent,
        textTransform: "uppercase",
      }}
    >
      {etat.etiquette}
    </div>
  </div>
);

const MARGE_BANDEAU = 44;
const LARGEUR_LETTRE_ANTON = 0.47;

// Couleur du texte sur le bandeau : le contraire de l'encre, quel que soit le fond du moment
const texteSur = (couleur: string) => {
  const hex = couleur.match(/^#(..)(..)(..)$/);
  const canaux = hex ? hex.slice(1).map((c) => parseInt(c, 16)) : (couleur.match(/\d+/g) ?? []).slice(0, 3).map(Number);
  const clarte = 0.3 * canaux[0] + 0.59 * canaux[1] + 0.11 * canaux[2];
  return clarte > 128 ? "#14110D" : "#FFFDF6";
};

const Legende: React.FC<{ etat: Etat }> = ({ etat }) => {
  const longueur = Math.max(...etat.legende.map((ligne) => ligne.length));
  const taille = Math.max(64, Math.min(100, Math.floor((LARGEUR - MARGE_BANDEAU) / (LARGEUR_LETTRE_ANTON * longueur))));
  return (
    <div
      style={{
        position: "absolute",
        left: GAUCHE,
        width: LARGEUR,
        bottom: 1920 - BAS,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 10,
        transformOrigin: "left bottom",
        scale: String(
          interpolate(etat.ageLegende, [0, 0.18], [0.86, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.back(2.2)),
          }),
        ),
      }}
    >
      {etat.legende.map((ligne) => (
        <div
          key={ligne}
          style={{
            fontFamily: ANTON,
            fontSize: taille,
            lineHeight: 1.12,
            padding: "4px 22px 8px",
            whiteSpace: "nowrap",
            color: texteSur(etat.palette.encre),
            backgroundColor: etat.palette.encre,
          }}
        >
          {ligne}
        </div>
      ))}
    </div>
  );
};

export const Cadre: React.FC<{ etat: Etat }> = ({ etat }) => (
  <AbsoluteFill>
    <Compteur etat={etat} />
    <Legende etat={etat} />
  </AbsoluteFill>
);
