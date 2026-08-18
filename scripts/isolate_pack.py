"""
Turn the white-background thumbnail cards in public/mascot-pack/*.png into clean
transparent cutout layers in public/mascot-pack/parts/*.png.

Method (robust against the white dog fur):
  1. Crop the rounded card frame (a few px on each side; extra on the tail card
     which has a baked-in "07_tail.svg" caption).
  2. Mark near-white pixels, label connected components, and erase only the
     components that touch the border (the card background). Enclosed whites -
     fur, eye-whites, teeth - are NOT border-connected, so they survive.
  3. Feather a 1px light-grey anti-alias halo into transparency.
  4. Autocrop to the content bbox and save, recording the offset so the original
     layout coordinates still line up.
"""
import json
import numpy as np
from PIL import Image
from scipy import ndimage

SRC = "public/mascot-pack"
OUT = "public/mascot-pack/parts"

# per-file frame crop: (left, top, right, bottom)
CROP = {
    "01_body":   (6, 6, 6, 6),
    "02_head":   (6, 6, 6, 6),
    "03_eyes":   (6, 6, 6, 6),
    "04_ears":   (6, 6, 6, 6),
    "05_mouth":  (6, 6, 6, 6),
    "06_tongue": (6, 6, 6, 6),
    "07_tail":   (6, 6, 6, 12),   # bottom caption
}
WHITE_TOL = 22      # a pixel is "card-white" if every channel >= 255-tol
HALO_BRIGHT = 200   # light pixels touching bg get feathered

import os
os.makedirs(OUT, exist_ok=True)
meta = {}

for name, (cl, ct, cr, cb) in CROP.items():
    im = Image.open(f"{SRC}/{name}.png").convert("RGBA")
    W, H = im.size
    im = im.crop((cl, ct, W - cr, H - cb))
    arr = np.array(im)
    rgb = arr[:, :, :3].astype(int)
    h, w = rgb.shape[:2]

    bright = rgb.max(axis=2)
    sat = rgb.max(axis=2) - rgb.min(axis=2)

    def border_connected(mask):
        lbl, _ = ndimage.label(mask)            # 4-conn by default
        edge = set(lbl[0, :]) | set(lbl[-1, :]) | set(lbl[:, 0]) | set(lbl[:, -1])
        edge.discard(0)
        return np.isin(lbl, list(edge))

    # Pass A: erase the white card field. Label WHITE ONLY so the dog's grey
    # outline stays an intact wall - enclosed fur/eye-whites/teeth are not
    # border-connected and survive.
    whiteish = (rgb >= (255 - WHITE_TOL)).all(axis=2)
    bgA = border_connected(whiteish)

    # Pass B: erase the thin rounded card frame. Label the light-grey frame band
    # ALONE (never merged with white), capped below fur-white (<236) and above
    # the dark outline (>150) so it cannot bridge fur to background.
    greyframe = (bright > 150) & (bright < 236) & (sat < 24)
    bgB = border_connected(greyframe)

    bg = bgA | bgB

    # also fold any leftover bright/low-sat anti-alias fringe that hugs the bg
    # into the background (one dilation step), so no faint frame ghost survives.
    fringe = ndimage.binary_dilation(bg, iterations=1) & ~bg
    fringe &= (bright > HALO_BRIGHT) & (sat < 22)
    bg = bg | fringe

    arr[:, :, 3] = np.where(bg, 0, 255).astype(np.uint8)
    out = Image.fromarray(arr, "RGBA")
    bbox = out.getbbox()
    out = out.crop(bbox)
    out.save(f"{OUT}/{name}.png")

    # offset of the content's top-left inside the ORIGINAL (uncropped) card
    ox, oy = cl + bbox[0], ct + bbox[1]
    meta[name] = {"w": out.width, "h": out.height, "src_off": [ox, oy]}
    touch = bbox[0] == 0 or bbox[1] == 0 or bbox[2] == w or bbox[3] == h
    print(f"{name:10s} -> {out.width}x{out.height}  off=({ox},{oy})"
          + ("  *EDGE-TOUCH*" if touch else ""))

with open(f"{OUT}/parts_meta.json", "w") as fp:
    json.dump(meta, fp, indent=2)
print("meta written")
