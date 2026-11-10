import React from "react";
import { Composition, Folder } from "remotion";
import { Video } from "./cadre/Video";
import type { Langue } from "./cadre/types";
import { SUJETS } from "./sujets";

const LANGUES: Langue[] = ["en", "es", "pt"];
const FPS = 30;

const majuscule = (texte: string) => texte.charAt(0).toUpperCase() + texte.slice(1);

export const RemotionRoot: React.FC = () => (
  <>
    {SUJETS.map((sujet) => (
      <Folder key={sujet.nom} name={majuscule(sujet.nom)}>
        {LANGUES.map((langue) => (
          <Composition
            key={langue}
            id={`${majuscule(sujet.nom)}-${majuscule(langue)}`}
            component={Video}
            defaultProps={{ sujet: sujet.nom, langue }}
            durationInFrames={Math.round(sujet.dureeS * FPS)}
            fps={FPS}
            width={1080}
            height={1920}
          />
        ))}
      </Folder>
    ))}
  </>
);
