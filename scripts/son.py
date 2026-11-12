"""Fabrique la bande son d'un sujet : nappe, tic du compteur, montée, impact. Aucune musique extérieure.

Usage : python scripts/son.py paper
Entrée : section "son" de sujets/<nom>.calcul.json
Sortie : public/sons/<nom>.wav (mono, 44,1 kHz), volume moyen réglé à -18 dB

Tic, montée et impacts sont de vrais enregistrements CC0 (sons/banque, sources dans sons/banque/CREDITS.md).
La nappe et le bourdon restent calculés : ils suivent la hauteur propre à chaque sujet.
"""
import json
import sys
import wave
from pathlib import Path

import numpy as np

RACINE = Path(__file__).resolve().parent.parent
FREQUENCE = 44100
VOLUME_CIBLE_DB = -18.0

nom = sys.argv[1]
son = json.loads((RACINE / "sujets" / f"{nom}.calcul.json").read_text(encoding="utf-8"))["son"]
duree = son["duree_s"]
n = int(duree * FREQUENCE)
temps = np.arange(n) / FREQUENCE


BANQUE = RACINE / "sons" / "banque"


def echantillon(nom_fichier):
    with wave.open(str(BANQUE / f"{nom_fichier}.wav")) as fichier:
        assert fichier.getframerate() == FREQUENCE and fichier.getnchannels() == 1
        return np.frombuffer(fichier.readframes(fichier.getnframes()), dtype="<i2") / 32768


TICS = [echantillon("tic_1"), echantillon("tic_2")]
IMPACT = echantillon("impact")
MONTEE = echantillon("montee_impact")
FRAPPE_S = json.loads((BANQUE / "banque.json").read_text(encoding="utf-8"))["montee_impact"]["frappe_s"]


def ajouter(piste, debut_s, morceau):
    debut = int(round(debut_s * FREQUENCE))
    if debut < 0:  # un palier trop tôt : la montée commence avant la vidéo, on n'en garde que la fin
        morceau, debut = morceau[-debut:], 0
    if debut >= len(piste):
        return
    fin = min(len(piste), debut + len(morceau))
    piste[debut:fin] += morceau[: fin - debut]


def transposer(morceau, rapport):
    """Plus aigu (et plus court) d'un rapport donné, par rééchantillonnage."""
    return np.interp(np.arange(0, len(morceau) - 1, rapport), np.arange(len(morceau)), morceau)


# Nappe : trois sinus qui montent doucement avec la vidéo, puis se taisent au retournement
progres = np.clip(temps / son["retournements"][0], 0, 1)
fondamentale = son.get("base_hz", 55) * 2 ** (progres * 1.5)
phase = 2 * np.pi * np.cumsum(fondamentale) / FREQUENCE
nappe = np.sin(phase) + 0.5 * np.sin(phase * 1.5) + 0.3 * np.sin(phase * 2.01)
nappe *= 0.10 + 0.14 * progres
nappe *= 1 + 0.25 * np.sin(2 * np.pi * temps)  # souffle d'une seconde, le rythme de la règle
nappe *= np.where(temps < son["retournements"][0], 1, 0.15)

effets = np.zeros(n)
# Le tic monte d'une octave au fil du compteur, comme avant ; les deux coups de l'horloge alternent
for index, debut in enumerate(son["tics"]):
    ajouter(effets, debut, transposer(TICS[index % 2], 2 ** (index / max(len(son["tics"]), 1))) * 0.34)
for debut in son["paliers"]:
    ajouter(effets, debut - FRAPPE_S, MONTEE * 0.6)
for debut in son["retournements"]:
    ajouter(effets, debut, IMPACT * 1.0)

# Bourdon facultatif : liste de [temps, hauteur, force], pour un sujet qui a sa propre voix
bourdon = np.zeros(n)
if "bourdon" in son:
    points = np.array(son["bourdon"])
    hauteur = 2 ** np.interp(temps, points[:, 0], np.log2(points[:, 1]))
    vibrato = 1 + 0.012 * np.sin(2 * np.pi * 7 * temps)
    phase_bourdon = 2 * np.pi * np.cumsum(hauteur * vibrato) / FREQUENCE
    bourdon = sum(np.sin(phase_bourdon * rang) / rang for rang in range(1, 6))
    bourdon = bourdon * np.interp(temps, points[:, 0], points[:, 2]) * 0.5

melange = nappe + effets + bourdon

# Fondu de fin : le dernier instant retrouve le silence du début, pour la boucle
fondu = int(0.25 * FREQUENCE)
melange[-fondu:] *= np.linspace(1, 0, fondu)
melange[: int(0.01 * FREQUENCE)] *= np.linspace(0, 1, int(0.01 * FREQUENCE))

moyenne = np.sqrt(np.mean(melange ** 2))
melange *= 10 ** (VOLUME_CIBLE_DB / 20) / moyenne
crete = np.abs(melange).max()
if crete > 0.98:
    melange = np.tanh(melange / crete * 1.6) / np.tanh(1.6) * 0.98
    melange *= 10 ** (VOLUME_CIBLE_DB / 20) / np.sqrt(np.mean(melange ** 2))
    melange = np.clip(melange, -1, 1)

sortie = RACINE / "public" / "sons" / f"{nom}.wav"
with wave.open(str(sortie), "wb") as fichier:
    fichier.setnchannels(1)
    fichier.setsampwidth(2)
    fichier.setframerate(FREQUENCE)
    fichier.writeframes((melange * 32767).astype("<i2").tobytes())

niveau = 20 * np.log10(np.sqrt(np.mean(melange ** 2)))
print(f"{sortie.name} : {duree:.1f} s, moyenne {niveau:.1f} dB, crête {20 * np.log10(np.abs(melange).max()):.1f} dB")
