// HENRY HOUSE — DOORWAYS. THE PART THAT MAKES A PLAN A HOUSE.
//
// The plans had rooms, fixtures and furniture and NO INTERIOR DOORS. Every
// partition was solid, so nothing connected to anything: you could not walk
// from the great room to the dining room, and the drawing showed a house that
// could not be occupied. Exterior doors were drawn because the builders
// declared them; interior ones were never declared by anybody, so they never
// existed anywhere in the model.
//
// Doorways are not decoration and they are not free-hand. They are derived:
//
//   1. Every pair of rooms sharing at least 3 ft of wall is a POSSIBLE door.
//   2. Each possible door carries a COST that says what kind of route it is.
//      Walking through circulation is nearly free. Walking through a bedroom
//      to reach anything else is very expensive. Walking through a bathroom
//      is prohibitive.
//   3. A minimum-cost spanning tree rooted at the ENTRY guarantees every room
//      is reachable, by the cheapest available route.
//   4. Public rooms that touch each other get cased openings on top of that,
//      because a kitchen next to a dining room with one 3 ft door is a
//      corridor plan pretending to be an open one.
//
// The same list is drawn in plan, punched through the partitions in 3D, and
// checked for reachability. So a door you can see is a door you can walk
// through in the model, and a room nobody can reach is an ERROR, not a
// drafting oversight.

const FT = 12;
const LEAF = 3;                                    // 3 ft nominal leaf
const MIN_SHARED = 3.2;                            // wall needed for a leaf + jambs

// What it costs to route THROUGH a room to reach something beyond it.
// This is the architecture in this file: it is why a plan will put the hall
// door on the hall and not through the child's bedroom.
const THROUGH_COST = {
  circ: 1, entry: 1,
  living: 3, dining: 3, kitchen: 5,
  work: 8, store: 9, laundry: 10, mech: 12,
  bed: 40,                                         // reaching a room through a bedroom
  bath: 120,                                       // reaching a room through a bathroom
};
const PUBLIC = new Set(['living', 'dining', 'kitchen', 'circ', 'entry']);
const PRIVATE_LEAF = new Set(['bed', 'bath', 'laundry', 'mech']);

/** The wall two rooms share, or null. Returns the segment in FEET. */
function sharedWall(a, b) {
  const ax1 = a.x0 + a.w, ay1 = a.y0 + a.d, bx1 = b.x0 + b.w, by1 = b.y0 + b.d;
  const EPS = 0.4;
  // vertical wall — rooms side by side in x
  if (Math.abs(ax1 - b.x0) < EPS || Math.abs(bx1 - a.x0) < EPS) {
    const x = Math.abs(ax1 - b.x0) < EPS ? ax1 : a.x0;
    const y0 = Math.max(a.y0, b.y0), y1 = Math.min(ay1, by1);
    if (y1 - y0 >= MIN_SHARED) return { axis: 'Y', x, y0, y1, len: y1 - y0 };
  }
  // horizontal wall — rooms stacked in y
  if (Math.abs(ay1 - b.y0) < EPS || Math.abs(by1 - a.y0) < EPS) {
    const y = Math.abs(ay1 - b.y0) < EPS ? ay1 : a.y0;
    const x0 = Math.max(a.x0, b.x0), x1 = Math.min(ax1, bx1);
    if (x1 - x0 >= MIN_SHARED) return { axis: 'X', y, x0, x1, len: x1 - x0 };
  }
  return null;
}

/**
 * Where on a shared wall the door goes.
 *
 * Not the centre. A door in the middle of a wall cuts the room in two and
 * leaves no usable corner; pushing it toward one end keeps a furnishable wall
 * on the long side, which is what makes the difference between a room and a
 * lobby. Deterministic, so plan and model agree.
 */
function doorPos(seg) {
  const half = LEAF / 2;
  if (seg.axis === 'Y') {
    const t = seg.len > 8 ? seg.y0 + 2 + half : (seg.y0 + seg.y1) / 2;
    return { x: seg.x, y: Math.min(Math.max(t, seg.y0 + half + 0.4), seg.y1 - half - 0.4) };
  }
  const t = seg.len > 8 ? seg.x0 + 2 + half : (seg.x0 + seg.x1) / 2;
  return { x: Math.min(Math.max(t, seg.x0 + half + 0.4), seg.x1 - half - 0.4), y: seg.y };
}

/**
 * Every interior doorway in a plan, level by level.
 * Returns doors in FEET, plus the reachability result so a checker can use it.
 */
export function doorways(plan) {
  const out = [];
  const unreachable = [];
  const throughPrivate = [];

  for (const lv of plan.levels ?? []) {
    const rooms = lv.rooms ?? [];
    if (rooms.length < 2) continue;

    // all candidate doors
    const edges = [];
    for (let i = 0; i < rooms.length; i++) {
      for (let j = i + 1; j < rooms.length; j++) {
        const seg = sharedWall(rooms[i], rooms[j]);
        if (!seg) continue;
        const cost = Math.min(THROUGH_COST[rooms[i].use] ?? 10, THROUGH_COST[rooms[j].use] ?? 10);
        edges.push({ i, j, seg, cost });
      }
    }

    // Root at the entry: the room holding this level's exterior entry door,
    // else the entry-use room, else the largest circulation, else room 0.
    const extEntry = (lv.doors ?? []).find(d => d.kind === 'entry');
    let root = 0;
    if (extEntry) {
      const hit = rooms.findIndex(r => extEntry.x >= r.x0 - 1 && extEntry.x <= r.x0 + r.w + 1 &&
                                       extEntry.y >= r.y0 - 1 && extEntry.y <= r.y0 + r.d + 1);
      if (hit >= 0) root = hit;
    }
    if (!extEntry || root === 0) {
      const e = rooms.findIndex(r => r.use === 'entry');
      if (e >= 0) root = e;
      else {
        const c = rooms.map((r, k) => [r, k]).filter(([r]) => r.use === 'circ')
          .sort((a, b) => b[0].w * b[0].d - a[0].w * a[0].d)[0];
        if (c) root = c[1];
      }
    }

    // Prim's algorithm from the root: every room joins by its cheapest link,
    // which is what makes the hall the hall.
    const inTree = new Set([root]);
    const chosen = [];
    const children = new Map();                    // parent -> [child]
    while (inTree.size < rooms.length) {
      let best = null;
      for (const e of edges) {
        const a = inTree.has(e.i), b = inTree.has(e.j);
        if (a === b) continue;                     // both in, or both out
        if (!best || e.cost < best.cost) best = e;
      }
      if (!best) break;                            // island — reported below
      chosen.push(best);
      const parent = inTree.has(best.i) ? best.i : best.j;
      const child = parent === best.i ? best.j : best.i;
      if (!children.has(parent)) children.set(parent, []);
      children.get(parent).push(child);
      inTree.add(best.i); inTree.add(best.j);
    }
    for (const r of rooms) {
      const k = rooms.indexOf(r);
      if (!inTree.has(k)) unreachable.push(`${r.name} (${lv.name ?? 'level'} @ffe ${lv.ffe})`);
    }

    // Public rooms that touch get a cased opening as well as the tree link,
    // so an open plan reads as one.
    const extra = edges.filter(e =>
      PUBLIC.has(rooms[e.i].use) && PUBLIC.has(rooms[e.j].use) &&
      !chosen.includes(e) && e.seg.len >= 5);

    for (const e of [...chosen, ...extra]) {
      const a = rooms[e.i], b = rooms[e.j];
      const p = doorPos(e.seg);
      const cased = PUBLIC.has(a.use) && PUBLIC.has(b.use);
      const wide = cased && e.seg.len >= 9;
      out.push({
        level: lv.ffe, x: p.x, y: p.y, axis: e.seg.axis,
        w: wide ? 6 : LEAF,
        kind: cased ? 'opening' : 'door',
        swing: PRIVATE_LEAF.has(a.use) || PRIVATE_LEAF.has(b.use) ? 'in' : 'out',
        between: [a.name, b.name],
      });

    }

    // A bath or bedroom that is a PARENT in the tree is a room you have to walk
    // THROUGH to reach something else. A bath that is a leaf — entered from a
    // hall and going nowhere — is just a bath, which is why this reads
    // parentage rather than adjacency. Getting that backwards reported every
    // correctly-placed bathroom in the package as a fault.
    for (const [parent, kids] of children) {
      const pr = rooms[parent];
      if (pr.use !== 'bed' && pr.use !== 'bath') continue;
      for (const k of kids) {
        const kid = rooms[k];
        // an en-suite off a bedroom, or a WC off a bath, is not a through-route
        if (pr.use === 'bed' && (kid.use === 'bath' || kid.use === 'store')) continue;
        throughPrivate.push(`${kid.name} (${lv.name ?? 'level'} @ffe ${lv.ffe}) can only be reached by walking through the ${pr.use === 'bed' ? 'bedroom' : 'bathroom'} "${pr.name}"`);
      }
    }
  }
  return { doors: out, unreachable, throughPrivate };
}

/** Doorways on one level, in INCHES, ready to draw or to punch. */
export const doorwaysAt = (plan, ffe) =>
  doorways(plan).doors.filter(d => Math.abs(d.level - ffe) < 0.6)
    .map(d => ({ ...d, xIn: d.x * FT, yIn: d.y * FT, wIn: d.w * FT }));

export default { doorways, doorwaysAt };
