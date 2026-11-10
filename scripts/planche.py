"""Rend des images fixes d'une composition et les assemble en une planche.

Usage : python scripts/planche.py Paper-En 0 180 352 810
Sortie : out/planches/<Composition>-<image>.png, et out/planches/<Composition>.png pour la planche
"""
import subprocess
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
composition, images = sys.argv[1], sys.argv[2:]
dossier = RACINE / "out" / "planches"
dossier.mkdir(parents=True, exist_ok=True)

fichiers = []
for image in images:
    sortie = dossier / f"{composition}-{int(image):04d}.png"
    rendu = subprocess.run(
        f'npx remotion still {composition} "{sortie}" --frame={image} --scale=0.5',
        shell=True, cwd=RACINE, capture_output=True, text=True, encoding="utf-8", errors="replace",
    )
    if rendu.returncode != 0:
        sys.exit(f"Image {image} : ÉCHEC\n{rendu.stderr[-1500:]}\n{rendu.stdout[-1500:]}")
    fichiers.append(sortie)
    print(sortie.name, flush=True)

if len(fichiers) < 2:
    sys.exit(0)

entrees = [argument for fichier in fichiers for argument in ("-i", str(fichier))]
colonnes = min(len(fichiers), 6)
lignes = -(-len(fichiers) // colonnes)
filtre = "".join(f"[{i}:v]" for i in range(len(fichiers)))
disposition = "|".join(f"{(i % colonnes) * 540}_{(i // colonnes) * 960}" for i in range(len(fichiers)))
subprocess.run(
    ["ffmpeg", "-v", "error", "-y", *entrees, "-filter_complex",
     f"{filtre}xstack=inputs={len(fichiers)}:layout={disposition}:fill=black,scale=iw/2:-1",
     str(dossier / f"{composition}.png")],
    check=True,
)
print(f"planche : {composition}.png ({colonnes} x {lignes})")
