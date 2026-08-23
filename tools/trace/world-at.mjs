// THE GEOMETRY OF EVERY HOUSE, AS IT STOOD AT ONE COMMIT.
//
// tools/export-chains.mjs runs this against a `model/` directory extracted from
// an old commit, so a cycle can carry the world BEFORE it and the world AFTER
// it rather than one snapshot of today repeated down the file. That is the
// difference between a trace you can step through and a slideshow.
//
// It is deliberately forgiving about the model it is handed. The early commits
// have no scheme-plans.mjs at all and only seven schemes; a house with no
// checked plan gets its roofs and nothing else, which is exactly what was true
// of it at the time.
//
//   node tools/trace/world-at.mjs <model-dir>
//     → {schemeId: {parts, rooms, roofs, flags, name, tag}} on stdout
//
// TWO GEOMETRIES COME OUT, because two readers want different things.
//
//   parts   OPERATIVE_BUILDER_TRACE_V1 — metres, y up, flat roof slabs. That
//           schema's part carries rotation_y and nothing else, so a 3:12 pitch
//           cannot be stated in it and is not faked.
//   rooms   RURAL_STUDIO_TRACE_V1 — feet, the drawing's own units, with the room
//           +roofs  NAME and USE kept and the roof's real pitch and base. Our own
//           reader builds gables from these, because this project's roofs are
//           pitched and a slab is a lie about the building.
//
// The flags travel with the parts on purpose. They are the machine critic's
// findings AS THEY STOOD at that commit, baked into scheme-plans.mjs at the
// time, so a chain can show a score that actually falls when a fault is fixed
// instead of one number stamped on every cycle.
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const dir = resolve(process.argv[2] ?? 'model');
const url = (f) => pathToFileURL(`${dir}/${f}`).href;
const M = 0.3048;                                   // feet → metres

const USE_COLOR = {
  bed: '#8d7f6a', bath: '#6f8b93', kitchen: '#7d8b6e', living: '#a3927a',
  dining: '#9b8c74', circ: '#6e6a63', mech: '#5f6a72', store: '#67635c',
  work: '#87806e', laundry: '#6b7a80',
};

const schemes = await import(url('schemes.mjs'));
let planFor = () => null;
try { planFor = (await import(url('scheme-plans.mjs'))).planFor ?? planFor; } catch { /* not yet written */ }

// One box per room, in metres, y up, and z negated because the drawing's +y is
// uphill while the viewer's +z comes toward you. Roof planes are emitted flat:
// an operative part carries rotation_y only, so a 3:12 pitch cannot be stated
// in this schema and is not faked — it is a thin slab at its own mean height.
function worldFor(scheme) {
  const plan = planFor(scheme.id);
  const parts = [];
  for (const lv of plan?.levels ?? []) {
    for (const r of lv.rooms ?? []) {
      parts.push({
        id: `${lv.name ?? 'L'}_${r.name}`.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        primitive: 'box', role: r.use,
        position: [+((r.x0 + r.w / 2) * M).toFixed(3), +((lv.ffe + 4.4) * M).toFixed(3),
                   +(-(r.y0 + r.d / 2) * M).toFixed(3)],
        size: [+(r.w * M).toFixed(3), +(8.8 * M).toFixed(3), +(r.d * M).toFixed(3)],
        rotation_y: 0, color: USE_COLOR[r.use] || '#8a8578',
        material: 'matte', scale: [1, 1, 1],
      });
    }
  }
  for (const r of scheme.roofs ?? []) {
    const y0 = r.y0 / 12, y1 = r.y1 / 12, x0 = r.x0 / 12, x1 = r.x1 / 12;
    const rise = (r.pitch / 12) * (y1 - y0);
    const base = 10.5 + Math.max(0, ...(plan?.levels ?? []).map((l) => l.ffe));
    parts.push({
      id: `roof_${r.id}`.toLowerCase(), primitive: 'box', role: 'roof',
      position: [+(((x0 + x1) / 2) * M).toFixed(3), +((base + rise / 2) * M).toFixed(3),
                 +(-((y0 + y1) / 2) * M).toFixed(3)],
      size: [+((x1 - x0) * M).toFixed(3), +(0.6 * M).toFixed(3), +((y1 - y0) * M).toFixed(3)],
      rotation_y: 0, color: '#3a4046', material: 'matte', scale: [1, 1, 1],
    });
  }
  return parts;
}

// The same house in the units it was drawn in, with everything the operative
// schema has to drop on the way through it.
function nativeFor(scheme) {
  const plan = planFor(scheme.id);
  const rooms = [];
  for (const lv of plan?.levels ?? []) {
    for (const r of lv.rooms ?? []) {
      rooms.push({
        id: `${lv.name ?? 'L'}_${r.name}`.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        name: r.name, use: r.use, level: lv.name ?? 'L', ffe: lv.ffe,
        x0: r.x0, y0: r.y0, w: r.w, d: r.d, h: 8.8,
      });
    }
  }
  // WHERE THE ROOF ACTUALLY STARTS. schemes.mjs derives this — the underside at
  // the low edge, taken from the highest top plate the plane really covers — and
  // it exists because taking zLow literally once put the Spine's roof twelve feet
  // up through its own volume. Use the model's answer; approximating it here
  // would be the same mistake in a second place, which is how the section and the
  // 3D came to disagree in the first place. The fallback is for the early
  // commits, where the function had not been written yet.
  const top = Math.max(0, ...(plan?.levels ?? []).map((l) => l.ffe));
  const roofs = (scheme.roofs ?? []).map((r) => {
    let base = 10.5 + top;
    try { if (schemes.roofBase) base = schemes.roofBase(scheme, r) / 12; } catch { /* older model */ }
    return {
      id: `roof_${r.id}`.toLowerCase(),
      x0: r.x0 / 12, x1: r.x1 / 12, y0: r.y0 / 12, y1: r.y1 / 12,
      pitch: r.pitch, base,
    };
  });
  return { rooms, roofs };
}

const out = {};
for (const s of schemes.SCHEMES ?? []) {
  let parts = [], native = { rooms: [], roofs: [] };
  try { parts = worldFor(s); } catch { /* the model of the day would not build it */ }
  try { native = nativeFor(s); } catch { /* likewise */ }
  out[s.id] = {
    parts, rooms: native.rooms, roofs: native.roofs,
    flags: planFor(s.id)?.flags ?? [],
    name: s.name ?? s.id, tag: s.tag ?? '',
  };
}
process.stdout.write(JSON.stringify(out));
