import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { sujetNomme } from "../sujets";
import { Cadre } from "./Cadre";
import type { Langue } from "./types";

type Props = { sujet: string; langue: Langue };

const Image: React.FC<Props> = ({ sujet, langue }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { etat: etatA, Scene } = sujetNomme(sujet);
  const etat = etatA(t, langue);
  return (
    <AbsoluteFill style={{ backgroundColor: etat.palette.fond }}>
      <Scene t={t} langue={langue} />
      <Cadre etat={etat} />
    </AbsoluteFill>
  );
};

export const Video: React.FC<Props> = ({ sujet, langue }) => (
  <AbsoluteFill>
    <Image sujet={sujet} langue={langue} />
    <Audio src={staticFile(`sons/${sujet}.wav`)} />
  </AbsoluteFill>
);
