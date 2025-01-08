#!/usr/bin/env python3

import sys
import re
import json

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

        if ':' in token:
            self.prefix, _, self.id = token.partition(':')
        else:
            self.prefix = None
            self.id = token

        if self.prefix not in (None, 'OBJ', 'GLOB'):
            raise Exception('invalid prefix %s: line %s' % (self.prefix, self.linenum,))

    def __repr__(self):
        return '<Entry %s>' % (self.token,)

    def add(self, ln):
        if not self.text:
            self.text = ln
        else:
            self.text += ('\n' + ln)

def parse(filename):
    entries = []
    pat_head = re.compile(r'^\s*([a-zA-Z0-9-_:]+):')
    
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

routines = loadjsonp('src/game/routines.js')
globals = loadjsonp('src/game/globals.js')
objects = loadjsonp('src/game/objects.js')

entries = parse(sys.argv[1])
print(entries)
