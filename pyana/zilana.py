from zillex import Token, TokType


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
    def __init__(self, tokls):
        self.tokls = tokls
        self.globals = []
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
                    self.globals.append( (idtok.val, tok.pos) )
            if tok.matchform('ROUTINE', 1):
                idtok = tok.children[1]
                if idtok.typ is TokType.ID:
                    self.routines.append( (idtok.val, tok.pos) )
            isobj = tok.matchform('OBJECT', 1)
            isroom = tok.matchform('ROOM', 1)
            if isobj or isroom:
                flag = 'ROOM' if isroom else 'OBJ'
                desc = None
                idtok = tok.children[1]
                if idtok.typ is TokType.ID:
                    for proptok in tok.children[2:]:
                        if proptok.matchgroup('DESC', 1):
                            if proptok.children[1].typ is TokType.STR:
                                desc = proptok.children[1].val
                    self.objects.append( (idtok.val, flag, desc, tok.pos) )
                    if isroom:
                        self.roomnames.append(idtok.val)
                
    def mapconnections(self):
        exitmap = dict()
        for room in self.roomnames:
            exitmap[room] = []
            
        directions = set(['NORTH', 'EAST', 'WEST', 'SOUTH', 'NE', 'NW', 'SE', 'SW', 'UP', 'DOWN', 'IN', 'OUT', 'LAND'])
        
        for tok in self.tokls:
            if tok.matchform('ROOM', 1):
                room = tok.children[1].val
                for prop in tok.children[2:]:
                    if prop.typ is TokType.GROUP and prop.val == '()' and len(prop.children) >= 3:
                        itok = prop.children[0]
                        totok = prop.children[1]
                        desttok = prop.children[2]
                        if itok.typ is TokType.ID and itok.val in directions:
                            if totok.typ is TokType.ID and totok.val == 'TO':
                                if desttok.typ is TokType.ID and desttok.val in exitmap:
                                    #print(room, itok.val, desttok.val)
                                    exitmap[room].append( (itok.val, desttok.val) )

        # Special cases...
        exitmap['GRATING-CLEARING'].append( ('DOWN', 'GRATING-ROOM') )
        exitmap['LIVING-ROOM'].append( ('DOWN', 'CELLAR') )
        exitmap['STUDIO'].append( ('UP', 'KITCHEN') )
        exitmap['MAZE-2'].append( ('DOWN', 'MAZE-4') )
        exitmap['MAZE-7'].append( ('DOWN', 'DEAD-END-1') )
        exitmap['MAZE-9'].append( ('DOWN', 'MAZE-11') )
        exitmap['MAZE-12'].append( ('DOWN', 'MAZE-5') )

        return exitmap
        
                        
