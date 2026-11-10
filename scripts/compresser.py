"""Compresse un rendu sous 10 Mo, la limite d'envoi de fichier de Claude in Chrome.

Usage : python scripts/compresser.py borboletinha
Entrée : out/<nom>.mp4
Sortie : out/<nom>-yt.mp4 (~9,3 Mo, H.264 + AAC 96k)
"""
import subprocess
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
nom = sys.argv[1]
entree = RACINE / "out" / f"{nom}.mp4"
sortie = RACINE / "out" / f"{nom}-yt.mp4"

duree = float(subprocess.run(
    ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(entree)],
    capture_output=True, text=True, check=True,
).stdout)
video_k = int(9.3 * 8 * 1024 / duree - 96)

subprocess.run(
    ["ffmpeg", "-v", "error", "-y", "-i", str(entree),
     "-c:v", "libx264", "-preset", "slow", "-b:v", f"{video_k}k", "-maxrate", f"{video_k}k",
     "-bufsize", f"{video_k * 2}k", "-pix_fmt", "yuv420p",
     "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", str(sortie)],
    check=True,
)
taille = sortie.stat().st_size / 1024 / 1024
print(f"{sortie.name} : {taille:.1f} Mo ({video_k}k vidéo, {duree:.1f} s)")
if taille >= 10:
    sys.exit("Trop gros pour l'envoi (10 Mo maximum)")
