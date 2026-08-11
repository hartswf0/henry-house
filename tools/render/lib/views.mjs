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
    sun: { dayOfYear: 288, hour: 13.6 }, exposure: 1.00, w: 1700, h: 1062,
  },
  'ext-sse-terrace': {
    title: 'FROM THE LOWER TERRACE',
    caption: 'The walkout level the hill gives you almost for free, and the deck above it.',
    pos: [16, -5.5, 40], target: [46, -5.5, -10], focal: 30, shift: 0.52,
    sun: { dayOfYear: 288, hour: 13.9 }, exposure: 1.05, w: 1700, h: 1062,
  },
  'ext-arrival': {
    title: 'ARRIVAL — THE UPHILL SIDE',
    caption: 'Motor court, entry bridge over the drain gap, detached garage. The cold side is nearly solid.',
    pos: [-11, 14.8, -41], target: [78, 14.8, -20], focal: 32, shift: 0.38,
    sun: { dayOfYear: 172, hour: 9.6 }, exposure: 1.05, w: 1700, h: 1062,
  },
  'ext-east': {
    title: 'THE STEPPED SECTION',
    caption: 'Three levels stepping with the hill; the roof step lights the great room.',
    pos: [126, 4, 58], target: [30, 4, -12], focal: 35, shift: 0.44,
    sun: { dayOfYear: 288, hour: 12.9 }, exposure: 1.0, w: 1700, h: 1062,
  },
  'int-great': {
    title: 'GREAT ROOM — TOWARD THE VIEW',
    caption: 'Ceiling falls from 16\'-4" at the spine to 9\'-10" at the glass: compression toward the view.',
    pos: [40, 15.4, -13.4], target: [40, 15.4, 60], focal: 22, shift: 0.04,
    sun: { dayOfYear: 288, hour: 13.4 }, exposure: 0.95, interior: true, w: 1620, h: 1110,
  },
  'int-great-west': {
    title: 'GREAT ROOM — TOWARD THE MASONRY MASS',
    caption: 'The stone mass holds the stove and the flue and stores heat. The gallery is beyond.',
    pos: [60, 15.4, -12.0], target: [16, 15.4, -13], focal: 24, shift: 0.08,
    sun: { dayOfYear: 288, hour: 14.2 }, exposure: 0.92, interior: true, w: 1620, h: 1110,
  },
  'site-aerial': {
    title: 'THE HOUSE ON THE HILL',
    caption: 'Built along the contour, not across it. Cut behind, terraces below.',
    pos: [-70, 168, 250], target: [58, 12, -20], focal: 48, shift: 0, pitch: true,
    sun: { dayOfYear: 288, hour: 13.0 }, exposure: 1.0, w: 1800, h: 1030,
  },
};

export const VIEW_ORDER = [
  'ext-sse-air', 'ext-arrival', 'ext-east', 'ext-sse-terrace',
  'int-great', 'int-great-west', 'site-aerial',
];
