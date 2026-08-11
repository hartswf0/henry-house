// HENRY HOUSE — SCHEME CRITIQUES, GENERATED.
//
// Written by tools/build-critiques.mjs. DO NOT HAND-EDIT.
//
// The gauntlet template's fan-out rule: "one builder, one separate critic with
// fresh context. The builder never grades itself." These come from critics that
// did not draw the plan they are judging and cannot see the builder's note.
//
// 0 critiques.

export const CRITIQUES = [];

export const critiqueFor = (id) => CRITIQUES.find(c => c.id === id) ?? null;

export default CRITIQUES;
