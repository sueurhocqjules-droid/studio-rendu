"""Calcule les paliers du sujet wifi : le débit part de 1 bit/s et double chaque seconde.

Le débit vaut 2^n bit/s. Chaque palier tombe à la première seconde où l'on télécharge la référence en une seconde.
Retournement : la seconde où un téléphone de 128 Go est plein (somme des bits téléchargés), et la part de tout
le téléchargement qu'il a pu garder à la fin.

Usage : python scripts/calcul_wifi.py
Entrée : sujets/wifi.json (références sourcées)
Sortie : sujets/wifi.calcul.json
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "wifi.json").read_text(encoding="utf-8"))
regle = sujet["regle_physique"]

MONTEE_S = 0.5
D0 = regle["debit_0_bit_s"]
F = regle["facteur"]

paliers = []
for cle, ref in sujet["references"].items():
    pas = math.ceil(math.log(ref["bits"] / D0) / math.log(F))
    paliers.append({"cle": cle, "bits": ref["bits"], "pas": pas, "arrivee_s": pas - MONTEE_S, "source": ref["source"]})
paliers.sort(key=lambda p: p["pas"])
assert paliers[-1]["cle"] == "vie"
ecarts = [b["pas"] - a["pas"] for a, b in zip(paliers, paliers[1:])]
assert min(ecarts) >= 2, [(p["cle"], p["pas"]) for p in paliers]

n_max = paliers[-1]["pas"]


# Bits téléchargés pendant les secondes 0 à n (débit D0 x F^k pendant la seconde k)
def cumul(n):
    return sum(D0 * F**k for k in range(n + 1))


capacite = regle["telephone_octets"] * 8
n_plein = next(n for n in range(200) if cumul(n) >= capacite)
total = cumul(n_max)
part_pct = capacite / total * 100
pct_texte = f"{part_pct:.3f}"

t_limite = n_max - MONTEE_S
t_coupe = t_limite + 2.8
t_qui = t_coupe + 3.6
t_patte = t_qui + 3.8
t_retour = t_patte + 3.6
t_fin = t_retour + 3.0
duree = t_fin + 0.6
assert 62 <= duree <= 75, duree


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


valeurs = {
    "n_sms": seconde("sms"),
    "n_apollo": seconde("apollo"),
    "n_film": seconde("film"),
    "n_wikipedia": seconde("wikipedia"),
    "n_internet": seconde("internet"),
    "n_plein": n_plein,
}
descriptions = {}
for langue in ("en", "es", "pt"):
    pct = pct_texte if langue == "en" else pct_texte.replace(".", ",")
    descriptions[langue] = sujet[langue]["description"].format(pct=pct, **valeurs)

sortie = {
    "n_max": n_max,
    "d0": D0,
    "facteur": F,
    "n_plein": n_plein,
    "part_pct": part_pct,
    "pct_texte": pct_texte,
    "paliers": paliers,
    "t_limite": t_limite,
    "t_coupe": t_coupe,
    "t_qui": t_qui,
    "t_patte": t_patte,
    "t_retour": t_retour,
    "t_fin": t_fin,
    "duree_s": duree,
    "descriptions": descriptions,
    "son": {
        "duree_s": duree,
        "tics": [s - 1 for s in range(1, n_max + 1)],
        "paliers": [p["arrivee_s"] for p in paliers],
        "retournements": [t_coupe, t_qui, t_patte],
        "fin": t_fin,
        "base_hz": 130,
        "tic_hz": 2400,
        # Un sifflement de modem qui monte avec le débit, coupé net quand le téléphone est plein
        "bourdon": [
            [0, 300, 0.0],
            [5, 330, 0.03],
            [30, 660, 0.06],
            [t_limite, 1320, 0.09],
            [t_coupe - 0.05, 1320, 0.09],
            [t_coupe, 1320, 0.0],
            [t_retour, 300, 0.0],
            [t_fin, 300, 0.02],
            [duree, 300, 0.0],
        ],
    },
}
(RACINE / "sujets" / "wifi.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for p in paliers:
    print(f"seconde {p['pas']:>2} à {p['arrivee_s']:>5.1f} s : {p['cle']:<10} {p['bits']:>10.4g} bits, débit {D0 * F ** p['pas']:>10.4g} bit/s")
print(f"téléphone plein à la seconde {n_plein} ; gardé {part_pct:.4f} % de {total:.3g} bits ; durée {duree:.1f} s")
