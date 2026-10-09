#!/usr/bin/env python3
"""Convert new QuickLook + CallNotes captures to WebP assets (run with /usr/bin/python3)."""
import os
from PIL import Image, ImageOps

ROOT = os.path.join(os.path.dirname(__file__), '..')
CAP = os.path.join(ROOT, 'captures')
SRC = os.path.join(ROOT, 'src', 'assets')

def save_webp(src, dst, width=1500, quality=82):
    im = Image.open(src).convert('RGB')
    if im.width > width:
        h = round(im.height * width / im.width)
        im = im.resize((width, h), Image.LANCZOS)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    im.save(dst, 'WEBP', quality=quality, method=6)
    print(f'  {os.path.relpath(dst,ROOT)}  {im.size}')

def save_hero(src, dst, size=(1200, 750), quality=84):
    im = Image.open(src).convert('RGB')
    im = ImageOps.fit(im, size, Image.LANCZOS)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    im.save(dst, 'WEBP', quality=quality, method=6)
    print(f'  HERO {os.path.relpath(dst,ROOT)}  {im.size}')

# ---- QuickLook sub-tiles ----
print('QuickLook:')
ql = ['ql-home','ql-inbox','ql-basics','ql-upload','ql-analyze','ql-questions','ql-review','ql-comments']
for n in ql:
    save_webp(os.path.join(CAP,'quicklook',n+'.png'), os.path.join(SRC,'quicklook',n+'.webp'))
# document (portrait) narrower
save_webp(os.path.join(CAP,'quicklook','ql-document.png'), os.path.join(SRC,'quicklook','ql-document.webp'), width=1000)
# hero
save_hero(os.path.join(CAP,'quicklook','ql-review.png'), os.path.join(SRC,'images','quicklook.webp'))

# ---- CallNotes sub-tiles ----
print('CallNotes:')
cn = ['cn-today','cn-setup','cn-choose','cn-frontmatter','cn-agency-card',
      'cn-transcript','cn-preview','cn-export','cn-primer','cn-diagnostics']
for n in cn:
    save_webp(os.path.join(CAP,'callnotes',n+'.png'), os.path.join(SRC,'callnotes',n+'.webp'))
# refresh CallNotes home hero to the evolved UI
save_hero(os.path.join(CAP,'callnotes','cn-agency-card.png'), os.path.join(SRC,'images','callnotes.webp'))

print('done')
