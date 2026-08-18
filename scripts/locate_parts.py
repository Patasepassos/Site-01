"""Find the exact placement of each clean part inside the original assembled art
(mascote.png) via multi-scale masked template matching. Outputs each part's
bounding box in a normalized 0..1 space relative to the dog, ready for CSS %.
"""
import cv2, numpy as np, json, glob, os

REF = "public/mascote.png"
PARTS_DIR = "public/parts"

ref = cv2.imread(REF, cv2.IMREAD_COLOR)
ref_gray = cv2.cvtColor(ref, cv2.COLOR_BGR2GRAY)
RH, RW = ref_gray.shape
print(f"ref {RW}x{RH}")

parts = sorted(glob.glob(os.path.join(PARTS_DIR, "*.png")))
scales = np.linspace(0.45, 2.6, 44)
results = {}

for p in parts:
    name = os.path.basename(p)[:-4]
    img = cv2.imread(p, cv2.IMREAD_UNCHANGED)
    if img.shape[2] == 4:
        bgr = img[..., :3]
        alpha = img[..., 3]
    else:
        bgr = img
        alpha = np.full(img.shape[:2], 255, np.uint8)
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)

    best = (-1, None, None, None)  # score, scale, x, y
    for s in scales:
        w = int(gray.shape[1] * s)
        h = int(gray.shape[0] * s)
        if w < 8 or h < 8 or w > RW or h > RH:
            continue
        t = cv2.resize(gray, (w, h), interpolation=cv2.INTER_AREA)
        m = cv2.resize(alpha, (w, h), interpolation=cv2.INTER_AREA)
        m3 = (m > 30).astype(np.uint8) * 255
        try:
            res = cv2.matchTemplate(ref_gray, t, cv2.TM_CCORR_NORMED, mask=m3)
        except cv2.error:
            continue
        res[~np.isfinite(res)] = -1
        _, mx, _, mxloc = cv2.minMaxLoc(res)
        if mx > best[0]:
            best = (mx, s, mxloc[0], mxloc[1])

    score, s, x, y = best
    w = gray.shape[1] * s
    h = gray.shape[0] * s
    results[name] = dict(score=round(float(score), 3), scale=round(float(s), 3),
                         x=int(x), y=int(y), w=int(w), h=int(h))
    print(f"{name:16s} score={score:.3f} scale={s:.2f}  box=({x},{y},{int(w)},{int(h)})")

# overall dog bbox from matched parts (exclude low-confidence)
good = {k: v for k, v in results.items() if v["score"] > 0.3}
xs0 = min(v["x"] for v in good.values())
ys0 = min(v["y"] for v in good.values())
xs1 = max(v["x"] + v["w"] for v in good.values())
ys1 = max(v["y"] + v["h"] for v in good.values())
DW, DH = xs1 - xs0, ys1 - ys0
print(f"\ndog bbox in ref: ({xs0},{ys0}) {DW}x{DH}")

# normalized to dog bbox (0..1)
norm = {}
for k, v in results.items():
    norm[k] = dict(
        left=round((v["x"] - xs0) / DW, 4),
        top=round((v["y"] - ys0) / DH, 4),
        width=round(v["w"] / DW, 4),
        height=round(v["h"] / DH, 4),
        score=v["score"],
    )
print("\n=== normalized (relative to dog bbox) ===")
for k, v in norm.items():
    print(f"{k:16s} L={v['left']:.4f} T={v['top']:.4f} W={v['width']:.4f} "
          f"H={v['height']:.4f}  (score {v['score']})")

with open("scripts/parts_layout.json", "w") as f:
    json.dump(dict(dog=dict(w=DW, h=DH, aspect=round(DW/DH, 4)), parts=norm), f, indent=2)
print("\nwrote scripts/parts_layout.json")
