"""Use the dog's OWN tail as the animated layer (identical art, single tail).
1) mask the tail out of dog-full -> public/dog-tail.png
2) erase that same region from dog-body.png so the static tail is gone
Prints CSS placement (left/top/width %, transform-origin) for MascotDog.tsx.
"""
import numpy as np
from PIL import Image, ImageDraw

NAT_W, NAT_H = 601, 747
full = Image.open("public/dog-full.png").convert("RGBA")

# polygon tracing the tail crescent; rear leg/hip stay left of the V-notch
POLY = [(549, 452), (566, 456), (585, 472), (598, 495), (601, 520),
        (601, 620), (560, 620), (551, 582), (544, 558), (540, 532),
        (541, 500), (546, 474)]
BASE = (556, 596)  # pivot where the tail meets the rump

mask = Image.new("L", full.size, 0)
ImageDraw.Draw(mask).polygon(POLY, fill=255)
m = np.array(mask)

# ---- tail layer = full alpha limited to the polygon ----
tarr = np.array(full)
tarr[..., 3] = np.where(m > 0, tarr[..., 3], 0)
tail = Image.fromarray(tarr)
tbox = tail.getbbox()
tail = tail.crop(tbox)
tail.save("public/dog-tail.png")

# ---- erase the tail from the body ----
body = Image.open("public/dog-body.png").convert("RGBA")
barr = np.array(body)
barr[..., 3] = np.where(m > 0, 0, barr[..., 3])
Image.fromarray(barr).save("public/dog-body.png")

x0, y0, x1, y1 = tbox
print("tail bbox", tbox, "size", (x1 - x0, y1 - y0))
print("CSS left%%=%.2f top%%=%.2f width%%=%.2f" % (
    x0 / NAT_W * 100, y0 / NAT_H * 100, (x1 - x0) / NAT_W * 100))
print("transform-origin %.1f%% %.1f%%" % (
    (BASE[0] - x0) / (x1 - x0) * 100, (BASE[1] - y0) / (y1 - y0) * 100))

# previews
for name, img in (("_tail2", tail), ("_body2", Image.fromarray(barr))):
    bg = Image.new("RGBA", img.size, (110, 130, 165, 255))
    bg.alpha_composite(img)
    bg.convert("RGB").save(f"scripts/{name}.png")
