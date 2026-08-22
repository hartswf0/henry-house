#!/usr/bin/env python3
"""Shrink every image a trace needs into a small JPEG data URI.

A trace embeds its pictures, so their size IS the file's size. The reference
traces in the depot carry captures of about six kilobytes; our renders are
3.5 MB PNGs, and inlining those would make an eleven-house export about
150 MB — unopenable in a browser page that parses the whole thing as JSON.

Reads a JSON list of paths on stdin, writes {path: dataURI} on stdout.
"""
import sys, json, io, base64
from PIL import Image

MAXW = int(sys.argv[1]) if len(sys.argv) > 1 else 720
QUAL = int(sys.argv[2]) if len(sys.argv) > 2 else 62

out = {}
for p in json.load(sys.stdin):
    try:
        im = Image.open(p).convert('RGB')
    except Exception as e:
        print(f'  ! {p}: {e}', file=sys.stderr)
        continue
    if im.width > MAXW:
        im = im.resize((MAXW, max(1, round(im.height * MAXW / im.width))), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'JPEG', quality=QUAL, optimize=True, progressive=True)
    out[p] = 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()
    print(f'  {p}  {im.width}x{im.height}  {len(buf.getvalue())//1024} kB', file=sys.stderr)
json.dump(out, sys.stdout)
