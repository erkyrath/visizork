#!/usr/bin/env python3

import sys
import re
import json

from writer import sourcefile_map

def loadjsonp(filename):
    with open(filename) as infl:
        dat = infl.read()
    dat = dat.strip()
    if dat.endswith(';'):
        dat = dat[ : -1 ]
    pos = dat.find('=')
    dat = dat[ pos+1 : ]
    return json.loads(dat)

class Entry:
    def __init__(self, token, linenum=None):
        self.token = token
        self.linenum = linenum
        self.text = None
        self.outls = None

        self.prefix, self.id, self.srcloc = checktoken(token, linenum=linenum)

    def __repr__(self):
        return '<Entry %s>' % (self.token,)

    def add(self, ln):
        if not self.text:
            self.text = ln
        else:
            self.text += ('\n' + ln)

    PAT_MARK = re.compile('[\n*`[]', re.MULTILINE)
    PAT_CLOSEQUOTE = re.compile('`')
    PAT_CLOSESTAR = re.compile('[*]')
    PAT_CLOSEBRACKET = re.compile('[]]')
            
    def build(self):
        text = self.text
        res = []
        pos = 0

        while pos < len(text):
            match = self.PAT_MARK.search(text, pos)
            if not match:
                res.append(text[ pos : ])
                break
            newpos = match.start()
            if newpos > pos:
                res.append(text[ pos : newpos ])
                pos = newpos
            
            ch = match.group()
            if ch == '\n':
                res.append(['br'])
                pos += 1
                continue

            newmatch = None
            if ch == '`':
                newmatch = self.PAT_CLOSEQUOTE.search(text, pos+1)
                cla = 'code'
            elif ch == '*':
                newmatch = self.PAT_CLOSESTAR.search(text, pos+1)
                cla = 'emph'
            elif ch == '[':
                newmatch = self.PAT_CLOSEBRACKET.search(text, pos+1)
                cla = 'a'
            else:
                raise Exception('weird char at %s' % (self.linenum,))
            if not newmatch:
                raise Exception('mismatched group at %s' % (self.linenum,))
            newpos = newmatch.start()
            val = text[ pos+1 : newpos ]
            if cla == 'a':
                res.append(self.linkify(val))
            else:
                res.append([cla, val])
            pos = newpos+1

        self.outls = res

    def linkify(self, val):
        if '|' in val:
            label, _, dest = val.partition('|')
            label = label.strip()
            dest = dest.strip()
        else:
            label = None
            dest = val.strip()

        if dest.startswith('http:') or dest.startswith('https:'):
            return ['extlink', dest, (label or '') ]
        
        dest = dest.upper()

        use = None
        if dest.startswith('*'):
            use = 'locsrc'
            dest = dest[ 1 : ].strip()
        elif dest.startswith('~'):
            use = 'loc'
            dest = dest[ 1 : ].strip()
        # defaults to locsrc

        prefix, id, _ = checktoken(dest, linenum=self.linenum)

        if not prefix:
            cla = 'com'
        elif use == 'loc':
            cla = 'src'
        else:
            cla = 'comsrc'

        if cla in ('com', 'comsrc'):
            if dest not in linkedtopics:
                linkedtopics[dest] = []
            linkedtopics[dest].append(self)
        
        return [ cla, id, (prefix or ''), (label or '') ]

def checktoken(token, linenum=None):
    dest = None
    if ':' in token:
        prefix, _, id = token.partition(':')
    else:
        prefix = None
        id = token
        
    if prefix not in (None, 'OBJ', 'GLOB', 'CONST', 'RTN', 'SRC'):
        raise Exception('invalid prefix %s: line %s' % (token, linenum))
    
    if prefix == 'OBJ':
        if id not in objectnames:
            raise Exception('invalid OBJ %s: line %s' % (id, linenum))
        dest = objectnames[id]['sourceloc']
    if prefix == 'GLOB':
        if id not in globalnames:
            raise Exception('invalid GLOB %s: line %s' % (id, linenum))
        dest = globalnames[id]['sourceloc']
    if prefix == 'CONST':
        if id not in constantnames:
            raise Exception('invalid CONST %s: line %s' % (id, linenum))
        dest = constantnames[id]['sourceloc']
    if prefix == 'RTN':
        if id not in routinenames:
            raise Exception('invalid RTN %s: line %s' % (id, linenum))
        dest = routinenames[id]['sourceloc']
    if prefix == 'SRC':
        file, _, flineno = id.partition('-')
        if not file or not flineno:
            raise Exception('invalid SRC %s: line %s' % (id, linenum))
        flineno = int(flineno)
        file = file.lower() + '.zil'
        filekey = sourcefile_map[file]
        dest = '%s:%d:1' % (filekey, flineno,)
        
    return prefix, id, dest

def parse(filename):
    entries = []
    pat_head = re.compile(r'^\s*([a-zA-Z0-9-_?:]+):')
    
    with open(filename) as infl:
        entry = None
        for (linenum, ln) in enumerate(infl, start=1):
            ln = ln.strip()
            if ln.startswith('#'):
                continue
            if not ln:
                entry = None
                continue
            if entry is None:
                match = pat_head.match(ln)
                if not match:
                    raise Exception('line %d: no head token' % (linenum,))
                token = match.group(1)
                ln = ln[ match.end() : ].strip()
                entry = Entry(token.upper(), linenum=linenum)
                entries.append(entry)
            entry.add(ln)
                
    return entries

def dump(entries, sourcekeymap, filename):
    map = dict([ (entry.token, entry.outls) for entry in entries ])
    fl = open(filename, 'w')
    fl.write('window.gamedat_commentary = ');
    json.dump(map, fl, separators=(',', ':'))
    fl.write(';\n')
    
    map = dict()
    for key, submap in sourcekeymap.items():
        ls = list(submap.items())
        ls.sort()
        flatls = [ val for subls in ls for val in subls ]
        map[key] = flatls
    fl.write('window.gamedat_commentarymap = ');
    json.dump(map, fl, separators=(',', ':'))
    fl.write(';\n')
    fl.close()


routines = loadjsonp('src/game/routines.js')
globals = loadjsonp('src/game/globals.js')
constants = loadjsonp('src/game/constants.js')
objects = loadjsonp('src/game/objects.js')

routinenames = dict([ (obj['name'], obj) for obj in routines ])
globalnames = dict([ (obj['name'], obj) for obj in globals ])
constantnames = dict([ (obj['name'], obj) for obj in constants ])
objectnames = dict([ (obj['name'], obj) for obj in objects ])

entries = parse(sys.argv[1])

linkedtopics = {}
sourcekeymap = dict([ (ch, {}) for ch in 'ABCDEFGHIJ' ])

for ent in entries:
    ent.build()
    if ent.srcloc:
        srcls = ent.srcloc.split(':')
        filekey = srcls[0]
        linenum = int(srcls[1])
        if linenum in sourcekeymap[filekey]:
            raise Exception('two entries for srcloc %s, %s' % (ent.srcloc, ent,))
        sourcekeymap[filekey][linenum] = ent.token

entrytopics = set([ ent.token for ent in entries ])
    
for key in linkedtopics:
    if key not in entrytopics:
        fromls = [ ent.token for ent in linkedtopics[key] ]
        print('missing topic:', key, 'from', ', '.join(fromls))

print('found', len(entries), 'topics')
dump(entries, sourcekeymap, 'src/game/commentary.js')

