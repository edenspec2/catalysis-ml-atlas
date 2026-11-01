# Small WebP copies of the paper figures: the map and the rows use these, the full image opens on demand.
from pathlib import Path
from PIL import Image

src, out = Path('public/figures'), Path('public/figures/thumb')
out.mkdir(exist_ok=True)
for f in src.iterdir():
    if f.is_file():
        im = Image.open(f).convert('RGBA')
        page = Image.new('RGBA', im.size, 'white')
        page.alpha_composite(im)
        page.thumbnail((320, 320))
        page.convert('RGB').save(out / (f.stem + '.webp'), quality=74, method=6)
