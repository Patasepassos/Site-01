"""Auto-detect facial feature boxes in dog-head.png via connected components
of the dark/red pixels (ear excluded). Prints centroid + bbox for each."""
import numpy as np
from PIL import Image
from scipy import ndimage

a = np.array(Image.open("public/dog-head.png").convert("RGBA"))
r, g, b, al = (a[..., i].astype(int) for i in range(4))
H, W = r.shape
ys, xs = np.mgrid[0:H, 0:W]
mx = np.maximum(np.maximum(r, g), b)

dark = (mx < 85) & (al > 0)
red = (r - np.maximum(g, b) > 20) & (r > 100) & (al > 0)
mask = dark | red
# exclude the dark inner-ear (upper-left wedge)
mask &= ~((xs < 150) & (ys < 170))

lbl, n = ndimage.label(mask)
print("components:", n)
items = []
for i in range(1, n + 1):
    yy, xx = np.where(lbl == i)
    if len(xx) < 60:
        continue
    cls = "red" if red[yy, xx].mean() > 0.5 else "dark"
    items.append((len(xx), xx.min(), xx.max(), yy.min(), yy.max(),
                  int(xx.mean()), int(yy.mean()), cls))
items.sort(reverse=True)
for area, x0, x1, y0, y1, cx, cy, cls in items:
    print(f"area={area:5d} x[{x0:3d}-{x1:3d}] y[{y0:3d}-{y1:3d}] center=({cx:3d},{cy:3d}) {cls}")
