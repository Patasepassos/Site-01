from PIL import Image
import numpy as np

sheet = Image.open("SVG mascote.png").convert("RGBA")
# crop the tail crescent (avoid the 'Tail' label / pill)
tail = sheet.crop((240, 742, 350, 905))

# drop near-transparent + any stray text by keeping content bbox
arr = np.asarray(tail)
alpha = arr[..., 3]
# zero-out very faint pixels
a2 = np.where(alpha > 40, alpha, 0).astype(np.uint8)
tail.putalpha(Image.fromarray(a2, "L"))
bbox = tail.getbbox()
if bbox:
    tail = tail.crop(bbox)
tail.save("public/dog-tail.png")

prev = Image.new("RGBA", tail.size, (245, 248, 255, 255))
prev.alpha_composite(tail)
prev.convert("RGB").save("scripts/_tail.png")
print("tail", tail.size)
