"""Rend des compositions l'une après l'autre, puis les compresse pour l'envoi YouTube.

Usage : python scripts/rendre.py Dentinhos:dentinhos Sapinho:sapinho ...
Sortie : out/<nom>.mp4 et out/<nom>-yt.mp4 (scripts/compresser.py)
Une vidéo dont le -yt.mp4 existe déjà est sautée : relancer la même commande reprend où on s'est arrêté.
"""
import subprocess
import sys
import time
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent

for argument in sys.argv[1:]:
    composition, nom = argument.split(":")
    if (RACINE / "out" / f"{nom}-yt.mp4").exists():
        print(composition, "déjà rendu, sauté", flush=True)
        continue
    debut = time.time()
    rendu = subprocess.run(
        f"npx remotion render {composition} out/{nom}.mp4 --concurrency=2",
        shell=True, cwd=RACINE, capture_output=True, text=True, encoding="utf-8", errors="replace",
    )
    if rendu.returncode != 0:
        print(composition, "ÉCHEC", rendu.stderr[-1500:], flush=True)
        continue
    compression = subprocess.run(
        [sys.executable, str(RACINE / "scripts" / "compresser.py"), nom],
        capture_output=True, text=True, encoding="utf-8", errors="replace",
    )
    print(composition, f"rendu en {time.time() - debut:.0f} s,", compression.stdout.strip(), compression.stderr.strip(), flush=True)
