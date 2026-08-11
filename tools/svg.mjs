// HENRY HOUSE — SVG drawing primitives with architectural conventions.
//
// Sheet units are 1/100 inch. An ARCH D sheet (36" x 24") is 3600 x 2400 units.
// Model units are INCHES (see model/units.mjs). `scale` converts model -> sheet.
//
// PLAN ORIENTATION: model +Y is UPHILL (NNW). Plans put uphill at the TOP, so
// sheet Y is flipped. Sections/elevations put +Z up, also flipped.

import { dim } from '../model/units.mjs';

export const SHEETS = {
  ARCH_D: { w: 3600, h: 2400, name: 'ARCH D 36x24' },
  ARCH_C: { w: 2400, h: 1800, name: 'ARCH C 24x18' },
  ARCH_E: { w: 4800, h: 3600, name: 'ARCH E 48x36' },
};

/** Drawing scale: sheet units per model inch. e.g. quarter inch = 1'-0" */
export const SCALES = {
  '1/32"=1\'-0"': (0.03125 / 12) * 100,
  '1/16"=1\'-0"': (0.0625 / 12) * 100,
  '1/8"=1\'-0"': (0.125 / 12) * 100,
  '3/16"=1\'-0"': (0.1875 / 12) * 100,
  '1/4"=1\'-0"': (0.25 / 12) * 100,
  '3/8"=1\'-0"': (0.375 / 12) * 100,
  '1/2"=1\'-0"': (0.5 / 12) * 100,
  '3/4"=1\'-0"': (0.75 / 12) * 100,
  '1"=1\'-0"': (1 / 12) * 100,
  '1-1/2"=1\'-0"': (1.5 / 12) * 100,
  '3"=1\'-0"': (3 / 12) * 100,
  '1"=10\'': (1 / 120) * 100,
  '1"=20\'': (1 / 240) * 100,
  '1"=30\'': (1 / 360) * 100,
  '1"=40\'': (1 / 480) * 100,
};

// Line weights (sheet units). Print-realistic hierarchy.
export const LW = {
  hair: 0.6,
  thin: 1.0,
  light: 1.4,
  medium: 2.2,
  heavy: 3.4,
  xheavy: 5.0,
  cut: 4.2,
};

export const INK = {
  line: '#111418',
  mid: '#4a5560',
  light: '#8d99a6',
  faint: '#c6cfd8',
  poche: '#1b2026',
  pocheConc: '#5c6670',
  ground: '#6d5b4a',
  water: '#1d6fa5',
  waste: '#6b4a2f',
  air: '#2f8f6b',
  power: '#c2801a',
  storm: '#3a6ea5',
  fire: '#b03535',
  paper: '#ffffff',
  accent: '#b8562f',
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const n = (v) => (Math.abs(v) < 1e-9 ? 0 : Math.round(v * 1000) / 1000);

export class Sheet {
  constructor({
    size = 'ARCH_D', scale = SCALES['1/4"=1\'-0"'],
    number = 'A-000', title = 'UNTITLED', subtitle = '',
    originX = 300, originY = 1900, flipY = true, notes = [],
  } = {}) {
    const s = SHEETS[size];
    this.W = s.w; this.H = s.h; this.sizeName = s.name;
    this.scale = scale;
    this.number = number; this.title = title; this.subtitle = subtitle;
    this.ox = originX; this.oy = originY; this.flipY = flipY;
    this.notes = notes;
    this.defs = [];
    this.body = [];
    this._clipId = 0;
    this.titleBlockW = 620;
  }

  // ── coordinate transform ───────────────────────────────────────────────────
  X(mx) { return this.ox + mx * this.scale; }
  Y(my) { return this.flipY ? this.oy - my * this.scale : this.oy + my * this.scale; }
  P(mx, my) { return [this.X(mx), this.Y(my)]; }
  L(mlen) { return mlen * this.scale; }

  raw(s) { this.body.push(s); return this; }
  def(s) { this.defs.push(s); return this; }

  // ── primitives (model coords) ──────────────────────────────────────────────
  line(x1, y1, x2, y2, { w = LW.thin, color = INK.line, dash = null, cap = 'butt', opacity = 1 } = {}) {
    const [a, b] = this.P(x1, y1), [c, d] = this.P(x2, y2);
    this.body.push(`<line x1="${n(a)}" y1="${n(b)}" x2="${n(c)}" y2="${n(d)}" stroke="${color}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''} stroke-linecap="${cap}"${opacity !== 1 ? ` opacity="${opacity}"` : ''}/>`);
    return this;
  }

  /** polyline/polygon from model points [[x,y],...] */
  poly(pts, { w = LW.thin, color = INK.line, fill = 'none', dash = null, close = true, opacity = 1, join = 'miter' } = {}) {
    const d = pts.map(([x, y]) => { const [a, b] = this.P(x, y); return `${n(a)},${n(b)}`; }).join(' ');
    const tag = close ? 'polygon' : 'polyline';
    this.body.push(`<${tag} points="${d}" fill="${fill}" stroke="${color}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''} stroke-linejoin="${join}"${opacity !== 1 ? ` opacity="${opacity}"` : ''}/>`);
    return this;
  }

  rect(x, y, w, h, opts = {}) {
    return this.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], opts);
  }

  circle(x, y, rModel, { w = LW.thin, color = INK.line, fill = 'none', dash = null, opacity = 1 } = {}) {
    const [a, b] = this.P(x, y);
    this.body.push(`<circle cx="${n(a)}" cy="${n(b)}" r="${n(this.L(rModel))}" fill="${fill}" stroke="${color}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''}${opacity !== 1 ? ` opacity="${opacity}"` : ''}/>`);
    return this;
  }

  arc(cx, cy, rModel, a0deg, a1deg, { w = LW.thin, color = INK.line, dash = null, fill = 'none' } = {}) {
    const r = this.L(rModel);
    const [px, py] = this.P(cx, cy);
    const f = this.flipY ? -1 : 1;
    const p0 = [px + r * Math.cos(a0deg * Math.PI / 180), py + f * r * Math.sin(a0deg * Math.PI / 180)];
    const p1 = [px + r * Math.cos(a1deg * Math.PI / 180), py + f * r * Math.sin(a1deg * Math.PI / 180)];
    let delta = a1deg - a0deg;
    const large = Math.abs(delta) > 180 ? 1 : 0;
    const sweep = this.flipY ? (delta > 0 ? 0 : 1) : (delta > 0 ? 1 : 0);
    this.body.push(`<path d="M ${n(p0[0])} ${n(p0[1])} A ${n(r)} ${n(r)} 0 ${large} ${sweep} ${n(p1[0])} ${n(p1[1])}" fill="${fill}" stroke="${color}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`);
    return this;
  }

  /** Text placed in MODEL coords. size is in SHEET units. */
  text(mx, my, str, { size = 22, color = INK.line, anchor = 'start', weight = 400, rotate = 0, dy = 0, family = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace', spacing = 0, opacity = 1 } = {}) {
    const [a, b] = this.P(mx, my);
    const tr = rotate ? ` transform="rotate(${rotate} ${n(a)} ${n(b + dy)})"` : '';
    this.body.push(`<text x="${n(a)}" y="${n(b + dy)}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}" letter-spacing="${spacing}"${opacity !== 1 ? ` opacity="${opacity}"` : ''}${tr}>${esc(str)}</text>`);
    return this;
  }

  /** Text placed directly in SHEET coords. */
  stext(a, b, str, { size = 22, color = INK.line, anchor = 'start', weight = 400, rotate = 0, family = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace', spacing = 0, opacity = 1 } = {}) {
    const tr = rotate ? ` transform="rotate(${rotate} ${n(a)} ${n(b)})"` : '';
    this.body.push(`<text x="${n(a)}" y="${n(b)}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}" letter-spacing="${spacing}"${opacity !== 1 ? ` opacity="${opacity}"` : ''}${tr}>${esc(str)}</text>`);
    return this;
  }

  sline(x1, y1, x2, y2, { w = LW.thin, color = INK.line, dash = null } = {}) {
    this.body.push(`<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${color}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`);
    return this;
  }

  srect(x, y, w, h, { fill = 'none', color = INK.line, lw = LW.thin, dash = null, rx = 0 } = {}) {
    this.body.push(`<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${rx}" fill="${fill}" stroke="${color}" stroke-width="${lw}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`);
    return this;
  }

  // ── architectural symbols ──────────────────────────────────────────────────

  /** Wall poché: a filled band from (x1,y1) to (x2,y2) of given thickness. */
  wall(x1, y1, x2, y2, t, { fill = INK.poche, color = INK.line, w = LW.medium } = {}) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = (-dy / len) * (t / 2), ny = (dx / len) * (t / 2);
    this.poly([[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]],
      { fill, color, w });
    return this;
  }

  /** Door: opening in a wall + leaf + swing arc. dir: +1/-1 side, hand: +1/-1 */
  door(x, y, width, angleDeg, { side = 1, hand = 1, wallT = 5, color = INK.line, leafW = LW.medium } = {}) {
    const a = angleDeg * Math.PI / 180;
    const ux = Math.cos(a), uy = Math.sin(a);
    const px = -uy * side, py = ux * side;
    const hx = x + ux * (hand > 0 ? 0 : width), hy = y + uy * (hand > 0 ? 0 : width);
    // opening: break the wall (white infill)
    this.wall(x, y, x + ux * width, y + uy * width, wallT, { fill: INK.paper, color: INK.line, w: LW.thin });
    // leaf, swung 90 deg
    this.line(hx, hy, hx + px * width, hy + py * width, { w: leafW, color });
    // swing arc
    const start = Math.atan2(py, px) * 180 / Math.PI;
    const end = Math.atan2(uy * hand, ux * hand) * 180 / Math.PI;
    this.arc(hx, hy, width, start, end, { w: LW.hair, color: INK.mid, dash: '6 5' });
    return this;
  }

  /** Sliding / lift-slide door glazing symbol in a wall run. */
  slider(x, y, width, angleDeg, { wallT = 10, panels = 2, color = INK.line } = {}) {
    const a = angleDeg * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a);
    this.wall(x, y, x + ux * width, y + uy * width, wallT, { fill: INK.paper, color: INK.line, w: LW.thin });
    const px = -uy, py = ux;
    for (let i = 0; i < panels; i++) {
      const t0 = (i / panels) * width, t1 = ((i + 1) / panels) * width;
      const off = (i % 2 ? 1 : -1) * wallT * 0.18;
      this.line(x + ux * t0 + px * off, y + uy * t0 + py * off,
                x + ux * t1 + px * off, y + uy * t1 + py * off, { w: LW.medium, color });
    }
    return this;
  }

  /** Window symbol: glazing line(s) inside the wall thickness. */
  window(x, y, width, angleDeg, { wallT = 10, color = INK.line } = {}) {
    const a = angleDeg * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a);
    const px = -uy, py = ux;
    this.wall(x, y, x + ux * width, y + uy * width, wallT, { fill: INK.paper, color: INK.line, w: LW.thin });
    for (const off of [-wallT * 0.16, wallT * 0.16]) {
      this.line(x + ux * 0 + px * off, y + uy * 0 + py * off,
                x + ux * width + px * off, y + uy * width + py * off, { w: LW.light, color });
    }
    this.line(x, y, x + ux * width, y + uy * width, { w: LW.hair, color: INK.mid });
    return this;
  }

  /** Dimension string with architectural tick marks. Horizontal or vertical. */
  dimH(x1, x2, y, label = null, { above = true, size = 19, color = INK.line, witness = 14, ext = 6 } = {}) {
    const yy = y;
    this.line(x1, yy, x2, yy, { w: LW.thin, color });
    for (const x of [x1, x2]) {
      const [a, b] = this.P(x, yy);
      this.body.push(`<line x1="${n(a - 8)}" y1="${n(b + 8)}" x2="${n(a + 8)}" y2="${n(b - 8)}" stroke="${color}" stroke-width="${LW.medium}"/>`);
      this.line(x, yy - witness / this.scale, x, yy + ext / this.scale, { w: LW.hair, color: INK.mid });
    }
    const mid = (x1 + x2) / 2;
    const [mx, my] = this.P(mid, yy);
    this.stext(mx, my + (above ? -10 : size + 8), label ?? dim(Math.abs(x2 - x1)), { size, anchor: 'middle', color });
    return this;
  }

  dimV(y1, y2, x, label = null, { size = 19, color = INK.line, right = true, witness = 14, ext = 6 } = {}) {
    this.line(x, y1, x, y2, { w: LW.thin, color });
    for (const y of [y1, y2]) {
      const [a, b] = this.P(x, y);
      this.body.push(`<line x1="${n(a - 8)}" y1="${n(b + 8)}" x2="${n(a + 8)}" y2="${n(b - 8)}" stroke="${color}" stroke-width="${LW.medium}"/>`);
      this.line(x - witness / this.scale, y, x + ext / this.scale, y, { w: LW.hair, color: INK.mid });
    }
    const mid = (y1 + y2) / 2;
    const [mx, my] = this.P(x, mid);
    this.stext(mx + (right ? 12 : -12), my, label ?? dim(Math.abs(y2 - y1)), {
      size, anchor: 'middle', color, rotate: -90,
    });
    return this;
  }

  /** Grid bubble at model point, with an optional gridline to (x2,y2). */
  gridBubble(x, y, id, { r = 26, to = null, color = INK.mid } = {}) {
    if (to) this.line(x, y, to[0], to[1], { w: LW.hair, color: INK.faint, dash: '30 8 4 8' });
    const [a, b] = this.P(x, y);
    this.body.push(`<circle cx="${n(a)}" cy="${n(b)}" r="${r}" fill="${INK.paper}" stroke="${color}" stroke-width="${LW.medium}"/>`);
    this.stext(a, b + 8, id, { size: 24, anchor: 'middle', weight: 700, color: INK.line });
    return this;
  }

  /** Room tag: name over area. */
  roomTag(x, y, name, area, { size = 20, color = INK.line, sub = null } = {}) {
    // white backing so the tag stays readable where it lands on a fixture
    const [a, b] = this.P(x, y);
    const wpx = name.length * size * 0.62 + 16;
    this.body.push(`<rect x="${n(a - wpx / 2)}" y="${n(b - size)}" width="${n(wpx)}" height="${n(size * (area != null ? 2.1 : 1.35))}" fill="${INK.paper}" opacity="0.82"/>`);
    this.text(x, y, name, { size, anchor: 'middle', weight: 700, color, spacing: 1.2 });
    if (area != null) this.text(x, y, `${area} SF`, { size: size - 4, anchor: 'middle', color: INK.mid, dy: size + 4 });
    if (sub) this.text(x, y, sub, { size: size - 5, anchor: 'middle', color: INK.mid, dy: size * 2 + 4 });
    return this;
  }

  /** Elevation/level marker used on sections. */
  levelTag(x, z, label, { color = INK.line, size = 18, anchor = 'start' } = {}) {
    const [a, b] = this.P(x, z);
    this.body.push(`<path d="M ${n(a)} ${n(b)} l 10 -10 l 10 10 l -10 10 z" fill="${INK.paper}" stroke="${color}" stroke-width="${LW.light}"/>`);
    this.stext(a + 28, b - 6, label, { size, color, anchor });
    return this;
  }

  northArrow(sx, sy, r = 52, azimuthOfPlusX = 70) {
    // Plan +X points at `azimuthOfPlusX`. Sheet +x is model +X, sheet -y is model +Y.
    // North (azimuth 0) sits at sheet angle: rotate so it points correctly.
    const rot = -azimuthOfPlusX + 90;
    const g = [];
    g.push(`<circle cx="0" cy="0" r="${r}" fill="none" stroke="${INK.mid}" stroke-width="${LW.thin}"/>`);
    g.push(`<path d="M 0 ${-r - 12} L ${r * 0.34} ${r * 0.5} L 0 ${r * 0.16} L ${-r * 0.34} ${r * 0.5} Z" fill="${INK.line}"/>`);
    this.body.push(`<g transform="translate(${sx},${sy}) rotate(${-rot})">${g.join('')}</g>`);
    this.stext(sx, sy + r + 40, 'TRUE NORTH', { size: 16, anchor: 'middle', color: INK.mid, spacing: 1.5 });
    return this;
  }

  scaleBar(sx, sy, { scaleName = '', feetTicks = [0, 4, 8, 16], label = true } = {}) {
    const upi = this.scale; // sheet units per model inch
    const h = 12;
    let x = sx;
    for (let i = 0; i < feetTicks.length - 1; i++) {
      const wpx = (feetTicks[i + 1] - feetTicks[i]) * 12 * upi;
      this.body.push(`<rect x="${n(x)}" y="${n(sy)}" width="${n(wpx)}" height="${h}" fill="${i % 2 ? INK.paper : INK.line}" stroke="${INK.line}" stroke-width="${LW.thin}"/>`);
      this.stext(x, sy - 8, String(feetTicks[i]), { size: 15, anchor: 'middle', color: INK.mid });
      x += wpx;
    }
    this.stext(x, sy - 8, String(feetTicks[feetTicks.length - 1]), { size: 15, anchor: 'middle', color: INK.mid });
    this.stext(x + 16, sy + h, 'FT', { size: 15, color: INK.mid });
    if (label && scaleName) this.stext(sx, sy + h + 26, `SCALE: ${scaleName}`, { size: 16, color: INK.line, spacing: 1 });
    return this;
  }

  /** Section cut marker on a plan. */
  sectionMark(x1, y1, x2, y2, id, { color = INK.accent } = {}) {
    this.line(x1, y1, x2, y2, { w: LW.medium, color, dash: '40 10 8 10' });
    for (const [px, py, ox, oy] of [[x1, y1, x2 - x1, y2 - y1], [x2, y2, x1 - x2, y1 - y2]]) {
      const [a, b] = this.P(px, py);
      const len = Math.hypot(ox, oy) || 1;
      const ang = Math.atan2(-oy / len, ox / len) * 180 / Math.PI;
      this.body.push(`<g transform="translate(${n(a)},${n(b)}) rotate(${n(ang)})"><circle cx="0" cy="0" r="24" fill="${INK.paper}" stroke="${color}" stroke-width="${LW.medium}"/><path d="M 24 -14 L 46 -14 L 46 14 L 24 14" fill="none" stroke="${color}" stroke-width="${LW.medium}"/></g>`);
      this.stext(a, b + 8, id, { size: 21, anchor: 'middle', weight: 700, color });
    }
    return this;
  }

  /** Keynote bubble. */
  keynote(x, y, num, { color = INK.line, r = 20 } = {}) {
    const [a, b] = this.P(x, y);
    this.body.push(`<circle cx="${n(a)}" cy="${n(b)}" r="${r}" fill="${INK.paper}" stroke="${color}" stroke-width="${LW.light}"/>`);
    this.stext(a, b + 7, String(num), { size: 19, anchor: 'middle', weight: 700, color });
    return this;
  }

  /** Leader line with text (model coords for the point, sheet offset for text). */
  leader(mx, my, dxs, dys, str, { size = 17, color = INK.line, anchor = null } = {}) {
    const [a, b] = this.P(mx, my);
    const ex = a + dxs, ey = b + dys;
    this.body.push(`<path d="M ${n(a)} ${n(b)} L ${n(ex)} ${n(ey)} L ${n(ex + (dxs >= 0 ? 26 : -26))} ${n(ey)}" fill="none" stroke="${color}" stroke-width="${LW.hair}"/>`);
    this.body.push(`<circle cx="${n(a)}" cy="${n(b)}" r="3.4" fill="${color}"/>`);
    this.stext(ex + (dxs >= 0 ? 32 : -32), ey + 6, str, { size, color, anchor: anchor ?? (dxs >= 0 ? 'start' : 'end') });
    return this;
  }

  // ── hatch patterns ─────────────────────────────────────────────────────────
  hatchDef(id, { angle = 45, spacing = 10, color = INK.mid, w = 0.8, cross = false } = {}) {
    this.defs.push(`<pattern id="${id}" width="${spacing}" height="${spacing}" patternTransform="rotate(${angle})" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="${spacing}" stroke="${color}" stroke-width="${w}"/>${cross ? `<line x1="0" y1="0" x2="${spacing}" y2="0" stroke="${color}" stroke-width="${w}"/>` : ''}</pattern>`);
    return `url(#${id})`;
  }

  dotDef(id, { spacing = 9, r = 1.1, color = INK.mid } = {}) {
    this.defs.push(`<pattern id="${id}" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse"><circle cx="${spacing / 2}" cy="${spacing / 2}" r="${r}" fill="${color}"/></pattern>`);
    return `url(#${id})`;
  }

  /** Earth / grade hatch below a line — used on sections and site drawings. */
  earthHatch(pts, { color = INK.ground, spacing = 11 } = {}) {
    const id = `earth${this._clipId++}`;
    const f = this.hatchDef(id, { angle: 45, spacing, color, w: 0.9 });
    this.poly(pts, { fill: f, color: 'none', w: 0 });
    return this;
  }

  // ── sheet furniture ────────────────────────────────────────────────────────
  border() {
    this.body.unshift(`<rect x="0" y="0" width="${this.W}" height="${this.H}" fill="${INK.paper}"/>`);
    this.srect(40, 40, this.W - 80, this.H - 80, { color: INK.line, lw: LW.medium });
    this.srect(52, 52, this.W - 104, this.H - 104, { color: INK.faint, lw: LW.hair });
    return this;
  }

  titleBlock({ project = 'HENRY HOUSE', location = 'JOHNSON COUNTY, TENNESSEE', client = 'HENRY', phase = 'SCHEMATIC DESIGN — NOT FOR CONSTRUCTION', issued = '', rev = '—', scaleName = '', extra = [] } = {}) {
    const w = this.titleBlockW, x = this.W - 40 - w, y = 40, h = this.H - 80;
    this.srect(x, y, w, h, { color: INK.line, lw: LW.medium, fill: INK.paper });

    let cy = y + 62;
    this.stext(x + 26, cy, project, { size: 40, weight: 700, spacing: 3 });
    cy += 30;
    this.stext(x + 26, cy, location, { size: 15, color: INK.mid, spacing: 1.6 });
    cy += 26;
    this.sline(x + 20, cy, x + w - 20, cy, { w: LW.light });

    cy += 34;
    this.stext(x + 26, cy, 'THE HOUSE WORKS LIKE A BODY', { size: 15, color: INK.accent, weight: 700, spacing: 1.8 });
    cy += 22;
    for (const l of ['STRUCTURE = SKELETON   WATER = CIRCULATION',
                     'WASTE = DIGESTION      HVAC  = RESPIRATION',
                     'POWER = NERVOUS SYS.   SKIN  = ENVELOPE']) {
      this.stext(x + 26, cy, l, { size: 12, color: INK.mid }); cy += 16;
    }
    cy += 12;
    this.sline(x + 20, cy, x + w - 20, cy, { w: LW.hair, color: INK.faint });

    // notes block
    cy += 30;
    this.stext(x + 26, cy, 'SHEET NOTES', { size: 14, weight: 700, spacing: 1.6, color: INK.line });
    cy += 20;
    for (const nt of this.notes.slice(0, 26)) {
      const lines = wrapText(nt, 62);
      for (const l of lines) { this.stext(x + 26, cy, l, { size: 12.2, color: INK.mid }); cy += 15; }
      cy += 4;
    }

    // bottom stack
    let by = y + h - 250;
    this.sline(x + 20, by, x + w - 20, by, { w: LW.light });
    by += 30;
    this.stext(x + 26, by, 'PHASE', { size: 12, color: INK.light, spacing: 1.4 });
    this.stext(x + 26, by + 20, phase, { size: 13.5, color: INK.fire ?? INK.line, weight: 700 });
    by += 48;
    for (const e of extra) { this.stext(x + 26, by, e, { size: 12, color: INK.mid }); by += 16; }

    by = y + h - 130;
    this.sline(x + 20, by, x + w - 20, by, { w: LW.light });
    this.stext(x + 26, by + 26, 'SCALE', { size: 12, color: INK.light, spacing: 1.4 });
    this.stext(x + 26, by + 46, scaleName || '—', { size: 15, weight: 700 });
    this.stext(x + 250, by + 26, 'ISSUED', { size: 12, color: INK.light, spacing: 1.4 });
    this.stext(x + 250, by + 46, issued || '—', { size: 15, weight: 700 });
    this.stext(x + 430, by + 26, 'REV', { size: 12, color: INK.light, spacing: 1.4 });
    this.stext(x + 430, by + 46, rev, { size: 15, weight: 700 });

    this.sline(x + 20, by + 62, x + w - 20, by + 62, { w: LW.hair, color: INK.faint });
    this.stext(x + 26, by + 96, this.number, { size: 44, weight: 700, spacing: 2 });
    this.stext(x + w - 26, by + 96, this.sizeName, { size: 13, color: INK.light, anchor: 'end' });
    return this;
  }

  sheetTitle(sx = 300, sy = 150) {
    this.stext(sx, sy, this.title, { size: 46, weight: 700, spacing: 2.5 });
    if (this.subtitle) this.stext(sx, sy + 34, this.subtitle, { size: 18, color: INK.mid, spacing: 1.4 });
    this.sline(sx, sy + 56, this.W - 40 - this.titleBlockW - 60, sy + 56, { w: LW.medium });
    return this;
  }

  toString() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${this.W}" height="${this.H}" viewBox="0 0 ${this.W} ${this.H}">
<defs>${this.defs.join('')}</defs>
${this.body.join('\n')}
</svg>`;
  }
}

export function wrapText(str, cols) {
  const words = String(str).split(/\s+/);
  const out = []; let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > cols) { if (cur) out.push(cur); cur = w; }
    else cur = (cur ? cur + ' ' : '') + w;
  }
  if (cur) out.push(cur);
  return out;
}

export const fmt = dim;
