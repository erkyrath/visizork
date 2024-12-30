from zillex import Token, TokType

class ZObject:
    def __init__(self, name, flag, desc, desctok, objtok):
        self.name = name
        self.type = flag
        self.desc = desc
        self.desctok = desctok
        self.objtok = objtok

    def __repr__(self):
        desc = (self.desc or '')
        return '<Z%s %s "%s">' % ('Room' if self.type == 'ROOM' else 'Object', self.name, desc,)

class ZString:
    def __init__(self, text, pos, endpos, rtn=None):
        self.text = text
        self.pos = pos
        self.endpos = endpos
        self.rtn = rtn

    def __repr__(self):
        summary = self.text
        if len(summary) > 40:
            summary = summary[ : 40 ] + '...'
        rtnstr = ''
        if self.rtn:
            rtnstr = '%s:' % (self.rtn,)
        return '<ZString %s"%s">' % (rtnstr, summary)
    
class ZGlobal:
    def __init__(self, name, pos):
        self.name = name
        self.pos = pos

    def __repr__(self):
        return '<ZGlobal %s>' % (self.name,)
    
class ZRoutine:
    def __init__(self, name, rtok):
        self.name = name
        self.rtok = rtok

    def __repr__(self):
        return '<ZRoutine %s>' % (self.name,)
    
def markcomments(ls):
    def setcomment(tok):
        tok.comment = True

    for tok in ls:
        if tok.typ is TokType.GROUP and tok.val == ';':
            tok.itertree(setcomment)
            continue
        if tok.typ is TokType.GROUP:
            markcomments(tok.children)
            
def stripcomments(ls):
    newls = []
    for tok in ls:
        if tok.typ is TokType.GROUP and tok.val == ';':
            continue
        newls.append(tok)
        if tok.typ is TokType.GROUP:
            stripcomments(tok.children)
    ls.clear()
    ls.extend(newls)

def stripifdefs(ls):
    newls = []
    for tok in ls:
        if tok.typ is TokType.GROUP and tok.val == '%' and tok.children:
            ctok = tok.children[0]
            if ctok.matchform('COND', 0):
                found = None
                for cgrp in ctok.children[ 1 : ]:
                    found = teststaticcond(cgrp)
                    if found:
                        break
                if found:
                    newls.append(found)
                continue
        newls.append(tok)
        if tok.typ is TokType.GROUP:
            stripifdefs(tok.children)
    ls.clear()
    ls.extend(newls)

def teststaticcond(cgrp):
    if cgrp.typ is TokType.GROUP and cgrp.val == '()' and len(cgrp.children) == 2:
        condgrp = cgrp.children[0]
        resgrp = cgrp.children[1]

    if condgrp.matchform('OR', 2):
        for subcond in condgrp.children[1:]:
            if iseqzorknum(subcond, 1):
                return resgrp
        return None
    if condgrp.typ is TokType.ID and condgrp.val == 'T':
        return resgrp
    if condgrp.matchform('GASSIGNED?', 1):
        return resgrp
    if iseqzorknum(condgrp, 1):
        return resgrp
    return None
    
def iseqzorknum(condgrp, zorknum):
    if condgrp.matchform('==?', 2):
        keytok = condgrp.children[1]
        valtok = condgrp.children[2]
        if keytok.typ is TokType.GROUP and keytok.val == "," and keytok.children:
            kidtok = keytok.children[0]
            if kidtok.typ is TokType.ID and kidtok.val == 'ZORK-NUMBER':
                if valtok.typ is TokType.NUM:
                    return (valtok.num == zorknum)
                    

class Zcode:
    directions = set(['NORTH', 'EAST', 'WEST', 'SOUTH', 'NE', 'NW', 'SE', 'SW', 'UP', 'DOWN', 'IN', 'OUT', 'LAND'])
        
    def __init__(self, tokls):
        self.tokls = tokls
        self.globals = []
        self.strings = []
        self.istrings = []
        self.routines = []
        self.objects = []
        self.roomnames = []

    def build(self):
        self.findall()

    def findall(self):
        for tok in self.tokls:
            if tok.matchform('GLOBAL', 1):
                idtok = tok.children[1]
                if idtok.typ is TokType.ID:
                    self.globals.append(ZGlobal(idtok.val, tok.pos))
                if len(tok.children) >= 3:
                    globtok = tok.children[2]
                    if globtok.typ is TokType.STR:
                        self.strings.append(ZString(globtok.val, globtok.pos, globtok.endpos))
                    if globtok.typ is TokType.GROUP and globtok.children:
                        if globtok.children[0].val in ('TABLE', 'LTABLE'):
                            self.findstringsintok(globtok)
            if tok.matchform('ROUTINE', 1):
                idtok = tok.children[1]
                if idtok.typ is TokType.ID:
                    self.routines.append(ZRoutine(idtok.val, tok))
                    self.findstringsinroutine(tok, idtok.val)
            if tok.typ is TokType.GROUP and tok.val == "'" and tok.children[0].matchform('ROUTINE', 1):
                qtok = tok.children[0]
                idtok = qtok.children[1]
                if idtok.typ is TokType.ID:
                    self.routines.append(ZRoutine(idtok.val, qtok))
                    self.findstringsinroutine(qtok, idtok.val)
            isobj = tok.matchform('OBJECT', 1)
            isroom = tok.matchform('ROOM', 1)
            if isobj or isroom:
                flag = 'ROOM' if isroom else 'OBJ'
                desc = None
                desctok = None
                idtok = tok.children[1]
                if idtok.typ is TokType.ID:
                    for proptok in tok.children[2:]:
                        if proptok.matchgroup(('DESC', 'LDESC', 'FDESC', 'TEXT'), 1):
                            if proptok.children[1].typ is TokType.STR:
                                strtok = proptok.children[1]
                                if proptok.children[0].val == 'DESC':
                                    desc = strtok.val
                                    desctok = strtok
                                else:
                                    self.strings.append(ZString(strtok.val, strtok.pos, strtok.endpos))
                        if proptok.matchgroup(Zcode.directions, 1):
                            self.findstringsintok(proptok)
                    self.objects.append(ZObject(idtok.val, flag, desc, desctok, tok))
                    if isroom:
                        self.roomnames.append(idtok.val)

    def findstringsintok(self, tok):
        for stok in tok.children:
            if stok.typ is TokType.STR:
                if stok.val:
                    self.strings.append(ZString(stok.val, stok.pos, stok.endpos))
            if stok.typ is TokType.GROUP and stok.val == '<>' and stok.children:
                self.findstringsintok(stok)
        
    def findstringsinroutine(self, tok, rname):
        for stok in tok.children:
            if stok.typ is TokType.STR:
                if stok.val not in ('', 'AUX', 'OPTIONAL'):
                    self.strings.append(ZString(stok.val, stok.pos, stok.endpos, rname))
            if stok.typ is TokType.GROUP and stok.val in ('<>', '()', "'") and stok.children:
                if stok.children[0].typ is TokType.ID and stok.children[0].val in ('TELL', 'PRINTI'):
                    self.findstringsintell(stok, rname)
                else:
                    self.findstringsinroutine(stok, rname)

    def findstringsintell(self, tok, rname):
        for stok in tok.children:
            if stok.typ is TokType.STR:
                self.istrings.append(ZString(stok.val, stok.pos, stok.endpos, rname))
            
    def mapconnections(self):
        exitmap = dict()
        for room in self.roomnames:
            exitmap[room] = []
            
        for tok in self.tokls:
            if tok.matchform('ROOM', 1):
                room = tok.children[1].val
                for prop in tok.children[2:]:
                    if prop.typ is TokType.GROUP and prop.val == '()' and len(prop.children) >= 3:
                        itok = prop.children[0]
                        totok = prop.children[1]
                        desttok = prop.children[2]
                        if itok.typ is TokType.ID and itok.val in Zcode.directions:
                            if totok.typ is TokType.ID and totok.val == 'TO':
                                if desttok.typ is TokType.ID and desttok.val in exitmap:
                                    #print(room, itok.val, desttok.val)
                                    exitmap[room].append( (itok.val, desttok.val) )

        # Special cases...
        #exitmap['GRATING-CLEARING'].append( ('DOWN', 'GRATING-ROOM') )
        exitmap['LIVING-ROOM'].append( ('DOWN', 'CELLAR') )
        exitmap['STUDIO'].append( ('UP', 'KITCHEN') )
        exitmap['MAZE-2'].append( ('DOWN', 'MAZE-4') )
        exitmap['MAZE-7'].append( ('DOWN', 'DEAD-END-1') )
        exitmap['MAZE-9'].append( ('DOWN', 'MAZE-11') )
        exitmap['MAZE-12'].append( ('DOWN', 'MAZE-5') )

        # We could get these from RIVER-LAUNCH
        exitmap['DAM-BASE'].append( ('LAUNCH', 'RIVER-1') )
        exitmap['WHITE-CLIFFS-NORTH'].append( ('LAUNCH', 'RIVER-3') )
        exitmap['WHITE-CLIFFS-SOUTH'].append( ('LAUNCH', 'RIVER-4') )
        exitmap['SHORE'].append( ('LAUNCH', 'RIVER-5') )
        exitmap['SANDY-BEACH'].append( ('LAUNCH', 'RIVER-4') )
        exitmap['RESERVOIR-SOUTH'].append( ('LAUNCH', 'RESERVOIR') )
        exitmap['RESERVOIR-NORTH'].append( ('LAUNCH', 'RESERVOIR') )
        exitmap['STREAM-VIEW'].append( ('LAUNCH', 'IN-STREAM') )

        return exitmap
        
                        
