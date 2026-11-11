"""Build web/public/img assets from assets-src. Run from repo root: python scripts/prep_assets.py"""
from pathlib import Path

import fitz  # PyMuPDF
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "web/public/img"
PDF = ROOT / "assets-src/bi/cultureland/2025_Cultureland_BI,AppIcon,조합형.pdf"
CHARS = {
    "catsh-question.webp": "15_Question_catsh.png",
    "kid-thumb.webp": "08_엄지척.png",
    "catsh-safety.webp": "16_SafetyCatsh.png",
}
RED = (255, 0x38, 0x38)


def logo():
    page = fitz.open(PDF)[0]
    # The red horizontal logo appears twice: in the grid box (top) and in the colour-type row
    # (y≈505-521pt) with no grid. Take the vector red fills of the gridless copy to get the bbox.
    box = fitz.Rect()
    for d in page.get_drawings():
        f = d.get("fill")
        if f and abs(f[0] - 1) < .01 and abs(f[1] - .22) < .01 and 480 < d["rect"].y0 < 560 and d["rect"].x1 < 380:
            box |= d["rect"]
    assert not box.is_empty, "red logo not found in PDF"
    pix = page.get_pixmap(clip=box + (-2, -2, 2, 2), dpi=600)
    rgb = np.frombuffer(pix.samples, np.uint8).reshape(pix.h, pix.w, pix.n)[..., :3].astype(float)
    bg = rgb[0, 0]  # page grey (241)
    # Alpha from blend with background on the green channel; only reddish pixels count.
    a = np.clip((bg[1] - rgb[..., 1]) / (bg[1] - RED[1]), 0, 1)
    a[rgb[..., 0] < 200] = 0
    out = np.zeros((pix.h, pix.w, 4), np.uint8)
    out[..., :3] = RED
    out[..., 3] = (a * 255).round()
    img = Image.fromarray(out, "RGBA")
    img = img.crop(img.getbbox())
    img = img.resize((round(img.width * 64 / img.height), 64), Image.LANCZOS)
    img.save(OUT / "logo.png", optimize=True)


def chars():
    for out, src in CHARS.items():
        img = Image.open(ROOT / "assets-src/char" / src).convert("RGBA")
        img = img.crop(img.getchannel("A").getbbox())
        img = img.resize((360, round(img.height * 360 / img.width)), Image.LANCZOS)
        img.save(OUT / out, "WEBP", quality=80)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    logo()
    chars()
    for f in ["logo.png", *CHARS]:
        size = (OUT / f).stat().st_size
        assert size <= 200 * 1024, f"{f} too big: {size}"
        print(f, Image.open(OUT / f).size, size)
