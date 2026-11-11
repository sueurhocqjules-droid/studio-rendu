import type { FC } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import calcul from "../../../sujets/dive.calcul.json";
import type { SceneProps } from "../../cadre/types";
import { entre, paletteA, pasDecor } from "./temps";

const SUB_X = 540;
const SUB_Y = 860;
// Pixels par seconde de règle : le décor défile d'un cran fixe pendant que le compteur s'emballe
const V = 300;
const QUILLE = 92;

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const pasDe = (cle: string) => calcul.paliers.find((p) => p.cle === cle)?.pas ?? 0;
const metresDe = (cle: string) => calcul.paliers.find((p) => p.cle === cle)?.m ?? 0;

// Pseudo-hasard stable : même image à chaque rendu
const bruit = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const SousMarin: FC<{ t: number; lest: boolean; phare: number }> = ({ t, lest, phare }) => (
  <g>
    {phare > 0 && <polygon points="150,10 760,-90 760,330" fill="#FFE7A1" opacity={0.2 * phare} />}
    <rect x={-40} y={-104} width={86} height={60} rx={16} fill="#D99A00" />
    <rect x={-6} y={-140} width={10} height={40} fill="#5B4300" />
    <rect x={-150} y={-58} width={300} height={116} rx={58} fill="#F2B705" />
    <rect x={-150} y={8} width={300} height={50} rx={25} fill="#D99A00" />
    <circle cx={70} cy={-6} r={30} fill="#0E3B55" stroke="#5B4300" strokeWidth={9} />
    <path d="M 52 -18 A 20 20 0 0 1 72 -28" fill="none" stroke="#BFE9F2" strokeWidth={6} strokeLinecap="round" />
    <circle cx={-20} cy={-8} r={14} fill="#0E3B55" stroke="#5B4300" strokeWidth={6} />
    <circle cx={146} cy={22} r={10} fill="#FFF2C4" />
    <rect x={-176} y={-10} width={30} height={20} fill="#5B4300" />
    <ellipse cx={-180} cy={0} rx={9} ry={8 + 36 * Math.abs(Math.cos(t * 14))} fill="#3A3A3A" />
    <rect x={-90} y={66} width={190} height={10} rx={5} fill="#5B4300" />
    {[-60, 70].map((x) => (
      <rect key={x} x={x} y={54} width={8} height={16} fill="#5B4300" />
    ))}
    {lest && [-50, 30].map((x) => <rect key={x} x={x} y={36} width={34} height={28} rx={4} fill="#4A4A4A" />)}
  </g>
);

const Plongeur: FC<{ couleur: string; masque: string }> = ({ couleur, masque }) => (
  <g>
    <circle cx={62} cy={-6} r={20} fill={couleur} />
    <rect x={56} y={-14} width={22} height={12} rx={4} fill={masque} />
    <rect x={-50} y={-14} width={104} height={34} rx={17} fill={couleur} />
    <rect x={-36} y={-36} width={70} height={20} rx={10} fill={couleur} />
    <polygon points="-50,-6 -120,-26 -112,4 -50,16" fill={couleur} />
    <polygon points="-50,10 -118,22 -100,42 -46,22" fill={couleur} />
    <rect x={40} y={14} width={40} height={10} rx={5} fill={couleur} transform="rotate(30 40 14)" />
  </g>
);

const Ballon: FC<{ atm: number }> = ({ atm }) => {
  const R = 92;
  const r = R / Math.cbrt(atm);
  return (
    <g>
      <circle cx={0} cy={0} r={R} fill="none" stroke="#FFF4DC" strokeWidth={6} strokeDasharray="18 14" />
      <circle cx={0} cy={R - r} r={r} fill="#E8452C" />
      <circle cx={-r * 0.35} cy={R - r * 1.35} r={r * 0.18} fill="#FF9A86" />
      <path d={`M 0 ${R} Q 18 ${R + 60} 0 ${R + 120}`} fill="none" stroke="#FFF4DC" strokeWidth={4} />
      {[0, 90, 180, 270].map((a) => (
        <g key={a} transform={`rotate(${a} 0 ${R - r})`}>
          <polygon points={`0,${R - r - r - 20} -16,${R - r - r - 56} 16,${R - r - r - 56}`} fill="#05283A" />
          <rect x={-5} y={R - r - r - 92} width={10} height={40} fill="#05283A" />
        </g>
      ))}
    </g>
  );
};

const Meduse = () => (
  <g>
    {[-40, -14, 12, 38].map((x, i) => (
      <path key={x} d={`M ${x} 0 q ${i % 2 ? 16 : -16} 50 0 100 q ${i % 2 ? -16 : 16} 50 0 100`} fill="none" stroke="#F4D9E8" strokeWidth={6} opacity={0.75} />
    ))}
    <path d="M -70 4 Q -70 -80 0 -80 Q 70 -80 70 4 Q 35 -12 0 4 Q -35 -12 -70 4 Z" fill="#F4D9E8" opacity={0.85} />
  </g>
);

const Baudroie: FC<{ t: number }> = ({ t }) => {
  const lueur = 0.6 + 0.4 * Math.sin(t * 5);
  return (
    <g>
      <path d="M -40 -80 Q -10 -150 60 -120" fill="none" stroke="#5E6A7C" strokeWidth={6} />
      <circle cx={60} cy={-120} r={30} fill="#8CF2C9" opacity={0.25 * lueur} />
      <circle cx={60} cy={-120} r={12} fill="#8CF2C9" opacity={lueur} />
      <polygon points="-130,0 -210,-60 -200,60" fill="#4E5A6B" />
      <ellipse cx={-30} cy={0} rx={110} ry={86} fill="#4E5A6B" />
      <path d="M 40 -30 L 92 -8 L 40 40 Z" fill="#06182F" />
      {[0, 1, 2, 3].map((i) => (
        <polygon key={i} points={`${48 + i * 11},${-20 + i * 9} ${56 + i * 11},${-6 + i * 9} ${44 + i * 11},${-8 + i * 9}`} fill="#F6F1E2" />
      ))}
      <circle cx={6} cy={-36} r={10} fill="#F6F1E2" />
      <circle cx={8} cy={-36} r={5} fill="#06182F" />
    </g>
  );
};

const Baleine = () => (
  <g>
    <path d="M 260 0 Q 240 -60 120 -70 L -160 -54 Q -230 -40 -260 -10 L -320 -60 L -300 0 L -320 60 L -260 10 Q -230 40 -160 50 L 120 64 Q 240 60 260 0 Z" fill="#7C8794" />
    <path d="M 250 8 Q 200 46 110 56 L -150 44 Q -190 36 -220 20 Q -100 30 110 26 Q 200 22 250 8 Z" fill="#A9B2BC" />
    <path d="M 260 -2 L 320 6 L 258 14 Z" fill="#7C8794" />
    <circle cx={200} cy={-14} r={8} fill="#1B1F24" />
    <polygon points="-40,-60 -10,-110 10,-64" fill="#7C8794" />
    <polygon points="90,40 50,110 30,46" fill="#6A7480" />
  </g>
);

const Epave = () => (
  <g>
    <path d="M -40 -140 L 330 -140 L 330 120 L 60 120 Q -20 40 -60 -100 Z" fill="#7A4632" />
    <rect x={-50} y={-160} width={380} height={24} fill="#5C3324" />
    <rect x={-46} y={-60} width={376} height={14} fill="#5C3324" />
    {Array.from({ length: 8 }, (_, i) => (
      <circle key={i} cx={30 + i * 38} cy={-96} r={9} fill="#2A1810" />
    ))}
    {Array.from({ length: 10 }, (_, i) => (
      <rect key={i} x={-30 + i * 34} y={-196} width={5} height={38} fill="#5C3324" />
    ))}
    <rect x={-40} y={-200} width={370} height={6} fill="#5C3324" />
    <polygon points="140,-160 156,-160 210,-420 196,-424" fill="#5C3324" />
    <polygon points="0,30 40,80 -10,90" fill="#4A2A1E" />
    <path d="M -200 160 Q -60 110 60 120 L 400 116 L 400 260 L -200 260 Z" fill="#2B3038" />
  </g>
);

const Limace = () => (
  <g>
    <path d="M 90 0 Q 90 -46 30 -50 Q -40 -50 -90 -20 Q -150 4 -200 0 Q -150 14 -90 24 Q -40 50 30 50 Q 90 46 90 0 Z" fill="#F0C3BE" />
    <path d="M -40 -44 Q -110 -40 -190 -4" fill="none" stroke="#E2A8A2" strokeWidth={8} />
    <path d="M -40 44 Q -110 40 -190 4" fill="none" stroke="#E2A8A2" strokeWidth={8} />
    <circle cx={52} cy={-12} r={9} fill="#1B1F24" />
    <path d="M 20 30 Q 0 70 -30 64" fill="none" stroke="#E2A8A2" strokeWidth={7} />
  </g>
);

export const SceneDive = ({ t }: SceneProps) => {
  const pas = pasDecor(t);
  const palette = paletteA(t);
  const y = (p: number) => SUB_Y + (p - pas) * V;
  const visible = (p: number, marge = 700) => Math.abs(y(p) - SUB_Y) < 1100 + marge;
  // Une silhouette qui remonte vers le compteur s'efface pour le laisser lisible
  const fondu = (yc: number) => interpolate(yc, [360, 660], [0, 1], borne);

  const surfaceY = y(0) - 150;
  const solY = y(calcul.pas_fond) + QUILLE;
  const pasLumiere = pasDe("lumiere");
  const auFond = t >= calcul.t_fond && t < calcul.t_remonte;
  const remonte = t >= calcul.t_remonte;
  const phare = entre(pas, pasLumiere - 8, pasLumiere);

  // Le sous-marin pique du nez en descendant, se pose à plat, puis se cabre pour remonter
  const assiette = remonte
    ? interpolate(t, [calcul.t_remonte, calcul.t_remonte + 0.6, calcul.t_fin - 1, calcul.t_fin], [0, -14, -14, 10], borne)
    : interpolate(t, [calcul.t_fond - 0.4, calcul.t_fond], [10, 0], borne);
  const choc = auFond ? Math.exp(-(t - calcul.t_fond) * 5) * 14 * Math.sin((t - calcul.t_fond) * 60) : 0;
  const serre = t >= calcul.t_poids && t < calcul.t_remonte ? 3 * Math.sin(t * 40) : 0;
  const houle = auFond ? 0 : 7 * Math.sin(t * 2.2);

  // Bulles : un filet en descente, un panache quand on lâche le lest
  const bulles = [];
  const cadence = remonte ? 0.1 : 0.4;
  const debut = remonte ? calcul.t_remonte : 0;
  if (!auFond) {
    for (let k = Math.max(0, Math.floor((t - 2.6 - debut) / cadence)); debut + k * cadence <= t; k++) {
      const age = t - (debut + k * cadence);
      bulles.push({ k, x: SUB_X - 10 + (remonte ? (bruit(k) - 0.5) * 260 : 0) + Math.sin(age * 4 + k) * 14, y: SUB_Y - 120 - age * (remonte ? 260 : 380), r: 5 + (k % 3) * 4, o: 1 - age / 2.6 });
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fond }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        {/* Rayons du soleil : ils s'effilent et meurent vers 200 m */}
        {visible(0, 4000) &&
          [140, 380, 620, 860].map((x, i) => (
            <polygon key={x} points={`${x - 60},${surfaceY} ${x + 60},${surfaceY} ${x + 140 + i * 20},${y(pasLumiere)} ${x + 130 + i * 20},${y(pasLumiere)}`} fill="#FFFBEA" opacity={0.13} />
          ))}

        {/* Neige marine, posée dans l'eau : elle file vers le haut à la descente */}
        {Array.from({ length: 240 }, (_, i) => {
          const p = 3 + i * 0.24;
          if (p > calcul.pas_fond || !visible(p, 0)) {
            return null;
          }
          return <circle key={i} cx={40 + bruit(i) * 1000} cy={y(p)} r={3 + (i % 3) * 1.5} fill="#FFFFFF" opacity={0.22} />;
        })}

        {/* Bioluminescence ponctuelle, sous la zone de minuit */}
        {Array.from({ length: 64 }, (_, i) => {
          const p = pasDe("minuit") + i * 0.24;
          if (p > calcul.pas_fond + 0.2 || !visible(p, 0)) {
            return null;
          }
          const lueur = Math.max(0, Math.sin(t * (1.6 + bruit(i + 7)) + i * 1.7));
          const x = 60 + bruit(i + 3) * 960;
          return (
            <g key={i} opacity={lueur}>
              <circle cx={x} cy={y(p)} r={16} fill="#8CF2C9" opacity={0.2} />
              <circle cx={x} cy={y(p)} r={5} fill="#8CF2C9" />
            </g>
          );
        })}

        {/* Règle de profondeur au bord gauche : un trait par seconde */}
        {Array.from({ length: 14 }, (_, i) => {
          const k = Math.floor(pas) - 5 + i * 0.5;
          if (k < 0 || k > calcul.pas_fond) {
            return null;
          }
          return <rect key={k} x={0} y={y(k) - 3} width={Number.isInteger(k) ? 54 : 26} height={6} fill={palette.encre} opacity={0.35} />;
        })}

        {/* Paliers : chaque silhouette est posée à sa profondeur et croise le sous-marin */}
        {visible(pasDe("double")) && (
          <g transform={`translate(220 ${y(pasDe("double")) - 40})`} opacity={fondu(y(pasDe("double")) - 40)}>
            <Ballon atm={1 + metresDe("double") / calcul.m_par_atmosphere} />
          </g>
        )}
        {visible(pasDe("loisir")) && (
          <g opacity={fondu(y(pasDe("loisir")) - 60)}>
            <rect x={0} y={y(pasDe("loisir")) + 40} width={1080} height={6} fill="#FFF4DC" opacity={0.7} />
            {[150, 420, 690, 960].map((x) => (
              <circle key={x} cx={x} cy={y(pasDe("loisir")) + 43} r={14} fill="#E8452C" />
            ))}
            <g transform={`translate(200 ${y(pasDe("loisir")) - 60}) scale(1.3)`}>
              <Plongeur couleur="#0A1F2E" masque="#FFC83A" />
            </g>
            <g transform={`translate(860 ${y(pasDe("loisir")) - 110}) scale(-1.1 1.1)`}>
              <Plongeur couleur="#0A1F2E" masque="#FFC83A" />
            </g>
          </g>
        )}
        {visible(pasLumiere) && (
          <g transform={`translate(860 ${y(pasLumiere) - 80}) scale(1.3)`} opacity={fondu(y(pasLumiere) - 80)}>
            <Meduse />
          </g>
        )}
        {visible(pasDe("gabr")) && (
          <g>
            <rect x={196} y={y(pasDe("gabr")) - 1400} width={6} height={1400} fill="#E9E4D6" opacity={0.8} />
            <rect x={180} y={y(pasDe("gabr")) - 10} width={38} height={46} rx={6} fill="#E9E4D6" />
            <polygon points={`202,${y(pasDe("gabr")) - 300} 262,${y(pasDe("gabr")) - 282} 202,${y(pasDe("gabr")) - 264}`} fill="#FFC83A" />
            <g transform={`translate(236 ${y(pasDe("gabr")) - 130}) rotate(90) scale(1.25)`} opacity={fondu(y(pasDe("gabr")) - 130)}>
              <Plongeur couleur="#E9E4D6" masque="#FFC83A" />
            </g>
          </g>
        )}
        {visible(pasDe("minuit")) && (
          <g transform={`translate(850 ${y(pasDe("minuit")) - 30}) scale(-1.35 1.35)`} opacity={fondu(y(pasDe("minuit")) - 30)}>
            <Baudroie t={t} />
          </g>
        )}
        {visible(pasDe("baleine"), 1200) && (
          <g transform={`translate(250 ${y(pasDe("baleine")) + 80}) rotate(34) scale(1.1)`} opacity={fondu(y(pasDe("baleine")) - 80)}>
            <Baleine />
          </g>
        )}
        {visible(pasDe("titanic"), 1200) && (
          <g transform={`translate(740 ${y(pasDe("titanic")) + 40}) rotate(-6) scale(1.1)`} opacity={fondu(y(pasDe("titanic")))}>
            <Epave />
          </g>
        )}

        {/* Parois de la fosse : elles se resserrent jusqu'au fond */}
        {visible(calcul.pas_fond, 1600) && (
          <g>
            <polygon
              points={`-10,${y(calcul.pas_fond - 6)} 40,${y(calcul.pas_fond - 4.5)} 90,${y(calcul.pas_fond - 3.2)} 70,${y(calcul.pas_fond - 2.2)} 150,${y(calcul.pas_fond - 1.2)} 130,${solY} -10,${solY}`}
              fill="#262B33"
            />
            <polygon
              points={`1090,${y(calcul.pas_fond - 5.5)} 1030,${y(calcul.pas_fond - 4.2)} 1000,${y(calcul.pas_fond - 3)} 1020,${y(calcul.pas_fond - 2)} 930,${y(calcul.pas_fond - 1)} 950,${solY} 1090,${solY}`}
              fill="#262B33"
            />
            <path d={`M 40 ${y(calcul.pas_fond - 4.5)} L 90 ${y(calcul.pas_fond - 3.2)} L 70 ${y(calcul.pas_fond - 2.2)} L 150 ${y(calcul.pas_fond - 1.2)}`} fill="none" stroke="#434B57" strokeWidth={6} />
            <path d={`M 1030 ${y(calcul.pas_fond - 4.2)} L 1000 ${y(calcul.pas_fond - 3)} L 1020 ${y(calcul.pas_fond - 2)} L 930 ${y(calcul.pas_fond - 1)}`} fill="none" stroke="#434B57" strokeWidth={6} />
            <path d={`M -10 ${solY + 10} Q 200 ${solY - 24} 400 ${solY} Q 620 ${solY + 20} 820 ${solY - 8} Q 980 ${solY - 22} 1090 ${solY + 4} L 1090 ${solY + 1200} L -10 ${solY + 1200} Z`} fill="#4A4134" />
            {Array.from({ length: 9 }, (_, i) => (
              <ellipse key={i} cx={80 + i * 115} cy={solY + 70 + (i % 3) * 50} rx={26} ry={8} fill="#3A3228" />
            ))}
          </g>
        )}
        {visible(pasDe("limace")) && (
          // Le poisson-limace accompagne le sous-marin jusqu'au fond, puis y reste
          <g transform={`translate(270 ${(remonte ? y(calcul.pas_fond) : Math.max(y(pasDe("limace")), SUB_Y)) - 20}) scale(1.5)`}>
            <Limace />
          </g>
        )}

        {/* Ce que la règle exige encore : le fantôme du sous-marin, enfoui dans la vase */}
        {auFond && (
          <g transform={`translate(${SUB_X} ${y(calcul.n_regle) + 120})`} opacity={0.5 + 0.4 * Math.sin((t - calcul.t_fond) * 6)}>
            <rect x={-150} y={-58} width={300} height={116} rx={58} fill="none" stroke="#FFC83A" strokeWidth={8} strokeDasharray="26 18" />
            <rect x={-40} y={-104} width={86} height={46} rx={16} fill="none" stroke="#FFC83A" strokeWidth={8} strokeDasharray="20 14" />
          </g>
        )}

        {/* Le lest lâché reste au fond pendant que le sous-marin remonte */}
        {remonte && visible(calcul.pas_fond) &&
          [-50, 30].map((x) => <rect key={x} x={SUB_X + x} y={solY - 30 + Math.min(t - calcul.t_remonte, 0.4) * 40} width={34} height={28} rx={4} fill="#4A4A4A" />)}

        {/* Nuage de vase au posé */}
        {t >= calcul.t_fond &&
          t < calcul.t_remonte + 2 &&
          [-1, 1].flatMap((s) =>
            [0, 1, 2].map((i) => {
              const age = t - calcul.t_fond;
              return (
                <ellipse
                  key={`${s}${i}`}
                  cx={SUB_X + s * (110 + i * 70 + age * (60 + i * 30))}
                  cy={solY - 20 - i * 24 - age * 10}
                  rx={60 + age * 30}
                  ry={30 + age * 12}
                  fill="#6B5E4A"
                  opacity={interpolate(age, [0, 0.2, 4.5], [0, 0.75, 0], borne)}
                />
              );
            }),
          )}

        {bulles.map((b) => (
          <circle key={b.k} cx={b.x} cy={b.y} r={b.r} fill="none" stroke="#E8FBFF" strokeWidth={3} opacity={Math.max(0, b.o) * 0.8} />
        ))}

        {/* Surface et ciel : la première et la dernière image */}
        {surfaceY > -100 && (
          <g>
            <rect x={0} y={-2000} width={1080} height={surfaceY + 2000} fill="#FCE6B0" />
            <circle cx={880} cy={surfaceY - 430} r={80} fill="#FFB238" />
            <path
              d={`M 0 ${surfaceY} ${Array.from({ length: 13 }, (_, i) => `Q ${i * 90 + 45} ${surfaceY + (i % 2 ? 18 : -18) * Math.cos(t * 2)} ${(i + 1) * 90} ${surfaceY}`).join(" ")} L 1080 ${surfaceY + 40} L 0 ${surfaceY + 40} Z`}
              fill="#3CC6C3"
            />
            <rect x={0} y={surfaceY + 4} width={1080} height={10} fill="#E9FBF8" opacity={0.6} />
          </g>
        )}

        {/* Les tonnes d'eau qui serrent la coque */}
        {t >= calcul.t_poids && t < calcul.t_remonte && (
          <g>
            {Array.from({ length: 8 }, (_, i) => {
              const d = 330 - 40 * Math.abs(Math.sin((t - calcul.t_poids) * 3));
              return (
                <g key={i} transform={`translate(${SUB_X} ${SUB_Y}) rotate(${i * 45}) translate(${d} 0)`}>
                  <polygon points="-30,0 10,-28 10,28" fill="#FFC83A" />
                  <rect x={10} y={-10} width={60} height={20} fill="#FFC83A" />
                </g>
              );
            })}
          </g>
        )}

        <g transform={`translate(${SUB_X + serre} ${SUB_Y + houle + choc}) rotate(${assiette})`}>
          <SousMarin t={t} lest={!remonte} phare={remonte ? phare * (1 - entre(t, calcul.t_fin - 2, calcul.t_fin)) : phare} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
