"""Fabrique la bande son d'un sujet : nappe, tic du compteur, montée, impact. Aucune musique extérieure.

Usage : python scripts/son.py paper
Entrée : section "son" de sujets/<nom>.calcul.json
Sortie : public/sons/<nom>.wav (mono, 44,1 kHz), volume moyen réglé à -18 dB
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
alea = np.random.default_rng(sum(nom.encode()))


def ajouter(piste, debut_s, morceau):
    debut = int(debut_s * FREQUENCE)
    if debut >= len(piste):
        return
    fin = min(len(piste), debut + len(morceau))
    piste[debut:fin] += morceau[: fin - debut]


def tic(hauteur_hz):
    t = np.arange(int(0.06 * FREQUENCE)) / FREQUENCE
    return np.sin(2 * np.pi * hauteur_hz * t) * np.exp(-t * 90)


def impact():
    t = np.arange(int(1.2 * FREQUENCE)) / FREQUENCE
    grave = np.sin(2 * np.pi * (46 + 60 * np.exp(-t * 18)) * t) * np.exp(-t * 4.5)
    claque = alea.standard_normal(len(t)) * np.exp(-t * 55) * 0.35
    return grave + claque


def montee(longueur_s):
    t = np.arange(int(longueur_s * FREQUENCE)) / FREQUENCE
    progression = t / longueur_s
    bruit = np.cumsum(alea.standard_normal(len(t)))
    bruit -= np.convolve(bruit, np.ones(400) / 400, mode="same")
    bruit /= np.abs(bruit).max()
    balayage = np.sin(2 * np.pi * np.cumsum(180 + 900 * progression ** 2) / FREQUENCE)
    return (bruit * 0.6 + balayage * 0.25) * progression ** 2.5


# Nappe : trois sinus qui montent doucement avec la vidéo, puis se taisent au retournement
progres = np.clip(temps / son["retournements"][0], 0, 1)
fondamentale = son.get("base_hz", 55) * 2 ** (progres * 1.5)
phase = 2 * np.pi * np.cumsum(fondamentale) / FREQUENCE
nappe = np.sin(phase) + 0.5 * np.sin(phase * 1.5) + 0.3 * np.sin(phase * 2.01)
nappe *= 0.10 + 0.14 * progres
nappe *= 1 + 0.25 * np.sin(2 * np.pi * temps)  # souffle d'une seconde, le rythme de la règle
nappe *= np.where(temps < son["retournements"][0], 1, 0.15)

effets = np.zeros(n)
for index, debut in enumerate(son["tics"]):
    ajouter(effets, debut, tic(son.get("tic_hz", 900) * 2 ** (index / max(len(son["tics"]), 1))) * 0.34)
for debut in son["paliers"]:
    ajouter(effets, max(debut - 1.4, 0), montee(1.4) * 0.32)
    ajouter(effets, debut, impact() * 0.85)
for debut in son["retournements"]:
    ajouter(effets, debut, impact() * 1.0)

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
