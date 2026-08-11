// Camera set. Feet, three.js frame: +x east along the house, +y up,
// +z DOWNHILL (the view direction).  Model X/12 = x, Z/12 = y, -Y/12 = z.
//
// Every exterior view is a LEVEL camera with a shifted frame, so vertical lines
// stay vertical. Only the site aerial is allowed to pitch, because it is a
// bird's-eye and is read as one.

export const VIEWS = {
  'ext-sse-air': {
    title: 'THE DOWNHILL FACE',
    caption: 'Glass, terrace and view all face the same way — the reason the bar is turned to this azimuth.',
    pos: [-34, 27, 150], target: [46, 27, -13], focal: 44, shift: -0.05,
    sun: { dayOfYear: 288, hour: 14.6 }, exposure: 0.80, w: 2000, h: 1250,
  },
  'ext-sse-terrace': {
    title: 'FROM THE LOWER TERRACE',
    caption: 'The walkout level the hill gives you almost for free, and the deck above it.',
    pos: [14, 6.5, 46], target: [46, 6.5, -12], focal: 28, shift: 0.42,
    sun: { dayOfYear: 288, hour: 14.8 }, exposure: 1.05, w: 2000, h: 1250,
  },
  'ext-arrival': {
    title: 'ARRIVAL — THE UPHILL SIDE',
    caption: 'Motor court, entry bridge over the drain gap, detached garage. The cold side is nearly solid.',
    pos: [104, 15.5, -62], target: [40, 15.5, -14], focal: 30, shift: 0.20,
    sun: { dayOfYear: 172, hour: 10.0 }, exposure: 1.0, w: 2000, h: 1250,
  },
  'ext-east': {
    title: 'THE STEPPED SECTION',
    caption: 'Three levels stepping with the hill; the roof step lights the great room.',
    pos: [128, 12, 62], target: [34, 12, -12], focal: 35, shift: 0.24,
    sun: { dayOfYear: 288, hour: 13.4 }, exposure: 1.0, w: 2000, h: 1250,
  },
  'int-great': {
    title: 'GREAT ROOM — TOWARD THE VIEW',
    caption: 'Ceiling falls from 16\'-4" at the spine to 9\'-10" at the glass: compression toward the view.',
    pos: [46, 15.2, -20], target: [40, 15.2, 60], focal: 24, shift: 0.02,
    sun: { dayOfYear: 288, hour: 13.8 }, exposure: 1.35, interior: true, w: 1900, h: 1300,
  },
  'int-great-west': {
    title: 'GREAT ROOM — TOWARD THE MASONRY MASS',
    caption: 'The stone mass holds the stove and the flue and stores heat. The gallery is beyond.',
    pos: [54, 15.2, -9], target: [4, 15.2, -13], focal: 28, shift: 0.06,
    sun: { dayOfYear: 288, hour: 14.6 }, exposure: 1.3, interior: true, w: 1900, h: 1300,
  },
  'site-aerial': {
    title: 'THE HOUSE ON THE HILL',
    caption: 'Built along the contour, not across it. Cut behind, terraces below.',
    pos: [-60, 150, 235], target: [55, 14, -18], focal: 42, shift: 0, pitch: true,
    sun: { dayOfYear: 288, hour: 13.2 }, exposure: 1.0, w: 2100, h: 1200,
  },
};

export const VIEW_ORDER = [
  'ext-sse-air', 'ext-arrival', 'ext-east', 'ext-sse-terrace',
  'int-great', 'int-great-west', 'site-aerial',
];
