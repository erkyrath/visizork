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

        self.prefix, self.id = checktoken(token, linenum=linenum)

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
                res.append(['', text[ pos : ]])
                break
            newpos = match.start()
            if newpos > pos:
                res.append(['', text[ pos : newpos ]])
                pos = newpos
            
            ch = match.group()
            if ch == '\n':
                res.append(['br', ''])
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

        return res

    def linkify(self, val):
        if '|' in val:
            text, _, url = val.partition('|')
            text = text.strip()
            url = url.strip()
            if not url.startswith('http'):
                raise Exception('url link looks wrong: ' + val)
            return ['extlink', text, url]
        
        val = val.strip().upper()
        
        cla = 'loc'
        if val.startswith('*'):
            cla = 'loccom'
            val = val[ 1 : ].strip()

        checktoken(val, linenum=self.linenum) 
        return [ cla, val ]

def checktoken(token, linenum=None):
    if ':' in token:
        prefix, _, id = token.partition(':')
    else:
        prefix = None
        id = token
        
    if prefix not in (None, 'OBJ', 'GLOB', 'RTN'):
        raise Exception('invalid prefix %s: line %s' % (token, linenum))
    
    if prefix == 'OBJ':
        if id not in objectnames:
            raise Exception('invalid OBJ %s: line %s' % (id, linenum))
    if prefix == 'GLOB':
        if id not in globalnames:
            raise Exception('invalid GLOB %s: line %s' % (id, linenum))
    if prefix == 'RTN':
        if id not in routinenames:
            raise Exception('invalid RTN %s: line %s' % (id, linenum))
        
    return prefix, id

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

routinenames = set([ obj['name'] for obj in routines ])
globalnames = set([ obj['name'] for obj in globals ])
objectnames = set([ obj['name'] for obj in objects ])

entries = parse(sys.argv[1])

for ent in entries:
    ls = ent.build()
    print(ent, ls)
    
    
