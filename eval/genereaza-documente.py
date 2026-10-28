"""Generează documente de test FICTIVE (text randat ca imagine), în același stil ca test-docs/.

Nume, CNP, IBAN, CUI sunt inventate; au doar forma reală, ca să testăm mascarea.
    python eval/genereaza-documente.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent.parent / "test-docs"
FONT = "C:/Windows/Fonts/arial.ttf"
FONT_B = "C:/Windows/Fonts/arialbd.ttf"
SCALE = 2  # randat la 2x, ca lizibilitatea să nu fie problema


def randeaza(linii, latime=900, fundal="white", text="black"):
    f = ImageFont.truetype(FONT, 18 * SCALE)
    fb = ImageFont.truetype(FONT_B, 20 * SCALE)
    inaltime = (60 + 30 * len(linii)) * SCALE
    img = Image.new("RGB", (latime * SCALE, inaltime), fundal)
    d = ImageDraw.Draw(img)
    y = 30 * SCALE
    for l in linii:
        bold = l.startswith("**")
        d.text((40 * SCALE, y), l.strip("*"), fill=text, font=fb if bold else f)
        y += 30 * SCALE
    return img


DOCUMENTE = {
    "extras-cont.png": [
        "**BANCA EXEMPLU S.A. - EXTRAS DE CONT",
        "Titular: Andreea Popescu   CNP: 2950612400123",
        "IBAN: RO49AAAA1B31007593840000   Perioada: 01.09.2026 - 30.09.2026",
        "Sold inițial: 3.412,18 lei",
        "02.09.2026  Salariu ALFA SOFT SRL               +6.940,00",
        "05.09.2026  Plată chirie către I. Marinescu       -2.000,00",
        "10.09.2026  ENGIE ROMANIA - factură gaz            -318,40",
        "12.09.2026  Netflix                                  -59,99",
        "18.09.2026  Kaufland                                -412,77",
        "25.09.2026  Transfer economii                     -1.000,00",
        "Sold final: 6.561,02 lei",
    ],
    "factura-pfa-emisa.pdf": [
        "**FACTURĂ nr. 0042 / 15.10.2026",
        "Furnizor: POPESCU ANDREEA PERSOANĂ FIZICĂ AUTORIZATĂ",
        "CIF: 41234567   Nr. ONRC: F40/1234/2021   Neplătitor de TVA",
        "Activitate: 7410 - Activități de design specializat",
        "Cumpărător: BETA MEDIA SRL, CUI RO12345678",
        "Descriere: Identitate vizuală (logo, manual de brand)",
        "Cantitate: 1   Preț unitar: 4.500,00 lei",
        "Total de plată: 4.500,00 lei",
        "IBAN furnizor: RO12BBBB0000123456789012",
        "Scadență: 30.10.2026",
    ],
    "extras-pilon2.png": [
        "**FOND DE PENSII ADMINISTRAT PRIVAT EXEMPLU - Pilon II",
        "Situația contului participantului la 31.12.2025",
        "Participant: Mihai Ionescu   CNP: 1880304123456",
        "Data aderării: 15.05.2008",
        "Contribuții virate în 2025: 5.130,00 lei (4,75% din venitul brut)",
        "Total contribuții de la aderare: 41.220,00 lei",
        "Valoarea activului personal: 63.874,15 lei",
        "Randament 2025: 9,8%",
        "Angajator care a virat: GAMMA LOGISTICS SRL",
    ],
    "bon-fiscal.png": [
        "**SUPERMARKET EXEMPLU SRL",
        "CIF: RO23456789   Str. Florilor 10, București",
        "BON FISCAL   28.10.2026 18:42",
        "Pâine albă 500 g             1 x 6,49      6,49 C",
        "Lapte 1,5% 1 l               2 x 8,99     17,98 C",
        "Mere Golden 1 kg             1 x 7,50      7,50 C",
        "Detergent 2 l                1 x 34,90    34,90 A",
        "TOTAL                                     66,87",
        "TVA A 21%: 6,06   TVA C 11%: 3,15",
        "Plată card",
    ],
    "fluturas-it-2026.png": [
        "**ALFA SOFT SRL - CAEN 6201 Activități de realizare a soft-ului la comandă",
        "FLUTURAȘ DE SALARIU - septembrie 2026",
        "Salariat: Andrei Dumitru   Funcția: inginer software",
        "Salariu de bază brut: 10.000 lei",
        "CAS 25%: 2.500 lei (din care 4,75% Pilon II)",
        "CASS 10%: 1.000 lei",
        "Impozit pe venit: 0 lei (scutire IT, art. 60 pct. 2 Cod fiscal)",
        "Salariu net: 6.500 lei",
        "Zile lucrate: 22",
    ],
    "cupon-pensie-rotit.png": [
        "**CASA JUDEȚEANĂ DE PENSII EXEMPLU",
        "Talon de pensie - octombrie 2026",
        "Titular: Elena Stan   Data nașterii: 07.11.1961",
        "Categoria: pensie pentru limită de vârstă",
        "Cuantum pensie: 2.800 lei",
        "CASS reținut: 0 lei   Impozit: 0 lei",
        "Total de plată: 2.800 lei",
    ],
}

if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    for nume, linii in DOCUMENTE.items():
        if nume == "cupon-pensie-rotit.png":
            # contrast scăzut + rotit 90°, ca o poză făcută cu telefonul pe lângă
            img = randeaza(linii, fundal="#d8d4c8", text="#6f6a60").rotate(90, expand=True)
        else:
            img = randeaza(linii)
        cale = OUT / nume
        if nume.endswith(".pdf"):
            img.save(cale, "PDF", resolution=150)
        else:
            img.save(cale)
        print("ok", cale.name)
