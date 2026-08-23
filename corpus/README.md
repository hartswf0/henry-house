# corpus/ — the half of the record that git never held

Each chain exported by `tools/export-chains.mjs` is a loop:

> a reference is pinned → **somebody asks for something** → a builder reasons and
> writes code → the building is captured → a critic reads the capture and says
> what is wrong → that becomes the next ask.

Five of those six are in this repository already. Commit bodies are the
reasoning, written at the time. The files each commit changed are the code. The
captures are recovered with `git show <sha>:<path>`, so they are the picture as
it was, not today's. The findings are the flags baked into
`model/scheme-plans.mjs` and the written critiques in
`model/scheme-critiques.mjs`.

**The ask is not.** The prompts and the images pasted into them lived in a
conversation, and no conversation was ever committed here. So the exporter puts
the commit subject in that slot and *labels it as a stand-in inside the prompt
itself* — a stand-in passed off as a quotation would make the whole export
worthless.

This directory is where the real ones go. Anything dropped here is used instead,
and the export records how many links carry verbatim words.

## Layout

```
corpus/
  S0-SPINE/
    turns.json
    images/
      ref-01.jpg
      pasted-2026-08-11.png
  process/            # the build as a whole, not one house
    turns.json
    images/
```

One directory per house, named by its scheme id (`S0-SPINE` … `S10-SQUARE`), plus
`process` for the whole build. A directory named `example` is ignored.

## turns.json

```json
{
  "house": "S0-SPINE",
  "turns": [
    {
      "sha": "0771630",
      "prompt": "the user's actual words, verbatim",
      "images": ["images/ref-01.jpg"],
      "kind": "reference",
      "note": "optional — anything about where this came from"
    }
  ]
}
```

A turn says **where it belongs** by exactly one of:

| field   | meaning |
|---------|---------|
| `sha`   | the commit this turn produced. Any unique prefix. The exact link. |
| `cycle` | 1-based position in that house's chain, when the sha is not known. |
| `at`    | ISO timestamp of when it was said. Lands on the **first** link at or after it — the ask comes before the work answering it. |

`kind` is `reference` (a bar set *before* the move) or `critique` (a verdict on
what came back). `images` are paths relative to that house's directory; they are
shrunk to the same small JPEG the rest of the trace uses, so originals of any
size are fine.

Nothing is guessed. A turn that matches no link, names a missing image, or gives
two location fields is **reported on stdout and dropped** rather than shifted
onto a link it does not belong to.

## Running it

```
node tools/export-chains.mjs --zip
```

The run prints what the corpus supplied, e.g.

```
corpus: 41 supplied turns (S0-SPINE:12 process:29)
```

and each house's line reports how many of its prompts are verbatim.
