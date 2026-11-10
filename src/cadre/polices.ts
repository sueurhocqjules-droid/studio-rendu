import { loadFont as chargerAnton } from "@remotion/google-fonts/Anton";
import { loadFont as chargerMono } from "@remotion/google-fonts/JetBrainsMono";

export const ANTON = chargerAnton("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
export const MONO = chargerMono("normal", { weights: ["800"], subsets: ["latin"] }).fontFamily;
