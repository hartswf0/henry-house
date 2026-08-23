#!/usr/bin/env python3
"""Make an assets/traces/ drop-in, so the traces appear in the picker.

The reader auto-opens idx.traces[0] on load and honours ?trace=<file>, but both
read from its own assets/traces/ directory. A file opened through "Open a trace"
works and cannot be linked to; a file IN that directory can be sent to someone
as a URL. This produces the folder to copy in, with an index.json that keeps the
depot's existing traces and adds ours after them.

  python3 tools/trace/make-dropin.py <depot-clone> <out-dir>
"""
import sys, json, os, shutil, glob

depot, out = sys.argv[1], sys.argv[2]
src_index = os.path.join(depot, 'assets/traces/index.json')
os.makedirs(out, exist_ok=True)

idx = json.load(open(src_index))
existing = {t['file'] for t in idx['traces']}
added = []

def add(path, name, note, builder, intent):
    dest = os.path.join(out, name)
    shutil.copyfile(path, dest)
    d = json.load(open(path))
    turns = len(d.get('turns') or d.get('history') or [])
    added.append({
        'file': name, 'note': note, 'builder': builder, 'intent': intent,
        'model': d.get('engine') or d.get('model'),
        'reference_name': d.get('who') or d.get('reference_name'),
        'exported_at': d.get('exported_at') or '',
        'cycles': turns, 'parts': len(d.get('current_world') or []),
        'scores': ([d['view_scores'][k]['score'] for k in d['view_scores']] if d.get('view_scores') else []),
        'bytes': os.path.getsize(dest),
    })

T = 'out/traces'
add(f'{T}/project/henry-house-transcript.json', 'henry-house-transcript.json',
    'the actual session, verbatim', 'human',
    'Henry House — the conversation that designed it')
add(f'{T}/project/henry-house-process.json', 'henry-house-process.json',
    'the commit history, pictures as they were', 'human',
    'Henry House — the build process')
for p in sorted(glob.glob(f'{T}/houses/*/trace.json')):
    slug = os.path.basename(os.path.dirname(p))
    d = json.load(open(p))
    add(p, f'henry-{slug}.json', d['intent'].split('—')[-1].strip(), 'operative', d['intent'])

idx['traces'] = [t for t in idx['traces'] if t['file'] not in {a['file'] for a in added}] + added
json.dump(idx, open(os.path.join(out, 'index.json'), 'w'), indent=1)
print(f'  {len(added)} traces + a merged index.json ({len(idx["traces"])} total) → {out}')
for a in added[:3]:
    print(f'     {a["file"]}')
print(f'     … and {len(added)-3} more')
