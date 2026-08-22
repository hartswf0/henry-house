#!/usr/bin/env python3
"""THE ACTUAL CONVERSATION, AS A TRACE.

The commit-history trace (tools/export-process-trace.mjs) reconstructs the
process from what the work left behind. This one does not reconstruct anything:
it reads the session transcript and emits what was actually said.

  prompt     the user's words, verbatim
  result     the reply, verbatim
  reasoning  NOT AVAILABLE. All 602 thinking blocks in this transcript carry an
             empty string and an opaque signature — the reasoning text is not
             retained on disk, so it cannot be exported and is not invented.
             The nearest real substitutes are in the file: the verbatim reply,
             and `tool_sequence`, the ordered list of what the model actually
             did that turn, which is a behavioural record of the same thing.
  artifact   the files written or edited in that turn — the code
  image      the picture that came back

A screenshot the user pasted is evidence about the turn BEFORE it — that is what
pasting a screenshot means — so it attaches to the previous turn rather than the
one it arrived with. Pictures the model looked at attach to their own turn.

SCRUBBED before writing: injected system reminders (not anything anyone typed),
session URLs, and anything shaped like an API key. The user's own words are left
exactly as they were, including the swearing, because a trace that tidies up its
own instructions is no longer a record of them.

  python3 tools/trace/export-transcript.py <transcript.jsonl> <out.json>
"""
import sys, json, re, io, base64, collections
from PIL import Image

SRC = sys.argv[1]
DEST = sys.argv[2]
MAXW, QUAL, MAX_IMG_PER_TURN = 620, 55, 2

SCRUB = [
    (re.compile(r'<system-reminder>.*?</system-reminder>', re.S), ''),
    (re.compile(r'Claude-Session:\s*\S+'), ''),
    (re.compile(r'https://claude\.ai/code/session_\S+'), '[session url removed]'),
    (re.compile(r'\bsk-[A-Za-z0-9_\-]{12,}'), '[key removed]'),
    (re.compile(r'\b[\w.+-]+@[\w-]+\.[\w.]+\b'), '[email removed]'),
]
def scrub(s):
    for rx, rep in SCRUB:
        s = rx.sub(rep, s)
    return s.strip()

def shrink(b64, media):
    try:
        im = Image.open(io.BytesIO(base64.b64decode(b64))).convert('RGB')
    except Exception:
        return None
    if im.width > MAXW:
        im = im.resize((MAXW, max(1, round(im.height * MAXW / im.width))), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'JPEG', quality=QUAL, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()

FILE_TOOLS = {'Write', 'Edit', 'NotebookEdit'}
turns, cur = [], None
stats = collections.Counter()

def close(t):
    if t is None: return
    t['result'] = scrub('\n\n'.join(t.pop('_text'))) or '(no visible reply — the turn was all tool work)'
    think = scrub('\n\n'.join(t.pop('_think')))
    t['reasoning'] = think or None
    t['reasoning_available'] = bool(think)
    files = list(dict.fromkeys(t.pop('_files')))
    t['artifact'] = (f"{len(files)} file{'' if len(files)==1 else 's'}: " + ', '.join(files[:6])
                     + (f' +{len(files)-6}' if len(files) > 6 else '')) if files else None
    t['files'] = files
    shots = t.pop('_shots')[:MAX_IMG_PER_TURN]
    t['image'] = shots[0] if shots else None
    t['images'] = shots
    t['tools'] = dict(t.pop('_tools'))
    t['tool_sequence'] = t.pop('_seq')
    turns.append(t)

with open(SRC, errors='replace') as fh:
    for line in fh:
        line = line.strip()
        if not line: continue
        try: d = json.loads(line)
        except Exception: continue
        m = d.get('message')
        if not isinstance(m, dict): continue
        blocks = m.get('content')
        if isinstance(blocks, str): blocks = [{'type': 'text', 'text': blocks}]
        if not isinstance(blocks, list): continue
        kinds = {b.get('type') for b in blocks if isinstance(b, dict)}

        if d.get('type') == 'user' and 'tool_result' not in kinds:
            # a screenshot arriving with a prompt is evidence about the LAST turn
            pasted = []
            for b in blocks:
                if isinstance(b, dict) and b.get('type') == 'image':
                    src = b.get('source') or {}
                    u = shrink(src.get('data', ''), src.get('media_type', ''))
                    if u: pasted.append(u); stats['pasted'] += 1
            if pasted and turns:
                turns[-1]['images'] = (turns[-1].get('images') or [])[:1] + pasted[:1]
                turns[-1]['image'] = turns[-1]['image'] or pasted[0]
                turns[-1]['pasted_by_user'] = True
            text = scrub('\n'.join(b.get('text', '') for b in blocks
                                   if isinstance(b, dict) and b.get('type') == 'text'))
            if not text: continue
            # Not everything arriving on the user channel was typed by the user.
            # Background task notifications, wake events and hook feedback come
            # in the same way, and a dataset that counts them as prompts is
            # wrong about who said what. Labelled, not dropped: they are real
            # turns and they did drive the next move.
            src = ('system-event' if re.match(r'\s*<(task-notification|wake|system-reminder)', text)
                   or text.lstrip().startswith('Stop hook feedback:') else 'user')
            stats[src] += 1
            close(cur); stats['turns'] += 1
            cur = {'i': len(turns), 'ts': d.get('timestamp'), 'source': src, 'prompt': text,
                   '_text': [], '_think': [], '_files': [], '_shots': [],
                   '_seq': [], '_tools': collections.Counter()}
            continue

        if cur is None: continue
        if d.get('type') == 'assistant':
            for b in blocks:
                if not isinstance(b, dict): continue
                if b.get('type') == 'text' and b.get('text', '').strip():
                    cur['_text'].append(b['text'])
                elif b.get('type') == 'thinking' and b.get('thinking', '').strip():
                    cur['_think'].append(b['thinking']); stats['thinking'] += 1
                elif b.get('type') == 'tool_use':
                    name = b.get('name', '?'); cur['_tools'][name] += 1; stats['tools'] += 1
                    cur['_seq'].append(name)
                    inp = b.get('input') or {}
                    if name in FILE_TOOLS and inp.get('file_path'):
                        cur['_files'].append(str(inp['file_path']).replace('/home/user/henry-house/', ''))
        else:  # tool results carry the pictures the model actually looked at
            for b in blocks:
                if not isinstance(b, dict) or b.get('type') != 'tool_result': continue
                cc = b.get('content')
                if not isinstance(cc, list): continue
                for x in cc:
                    if isinstance(x, dict) and x.get('type') == 'image':
                        src = x.get('source') or {}
                        u = shrink(src.get('data', ''), src.get('media_type', ''))
                        if u: cur['_shots'].append(u); stats['shots'] += 1
close(cur)

doc = {
    'format': 'HUMAN_CORRESPONDENCE_V1',
    'intent': 'Henry House — the conversation that designed eleven houses for one steep parcel',
    'who': 'Watson Hartsoe',
    'note': ('The actual session transcript, not a reconstruction. Every prompt is verbatim and '
             'every reply is verbatim. Each turn also carries the model\'s reasoning for that turn, '
             'the files it wrote, and the pictures it looked at — the reader shows the prompt, the '
             'reply and one picture; the rest is in the file for whatever reads it next. '
             'A screenshot pasted with a prompt is evidence about the turn before it, so it is '
             'attached there. Injected system reminders, session URLs, emails and anything shaped '
             'like a key were removed; nothing anyone typed was edited. '
             'REASONING IS NOT IN HERE: all 602 thinking blocks in the source transcript hold an '
             'empty string and an opaque signature, so the model\'s reasoning text was never '
             'written to disk and cannot be recovered. Every turn carries reasoning_available: '
             'false rather than a plausible-looking substitute. What is real and does stand in '
             'for it: the verbatim reply, and tool_sequence — the ordered list of what the model '
             'actually did that turn.'),
    'engine': 'Claude Code — henry-house repository',
    'critic': 'the user, and tools/build-plans.mjs + tools/check/*.mjs',
    'capture': 'renders from tools/render/, screenshots pasted by the user, drawing sheets',
    'turns': turns,
}
body = json.dumps(doc)
open(DEST, 'w').write(body)
print(f"  turns {stats['turns']} — {stats['user']} typed by the user, "
      f"{stats['system-event']} background events · tool calls {stats['tools']}")
print(f"  reasoning: {stats['thinking']} blocks carried text "
      f"(the source keeps thinking as an empty string — it is not recoverable)")
print(f"  pictures: {stats['shots']} looked at, {stats['pasted']} pasted by the user")
print(f"  → {DEST}  {len(body)/1024/1024:.1f} MB")
