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

    def build(self):
        self.findglobals()
        self.findroutines()

    def findglobals(self):
        for tok in self.tokls:
            if tok.matchform('GLOBAL', 1):
                idtok = tok.children[1]
                if idtok.typ is TokType.ID:
                    self.globals.append( (idtok.val, tok.pos) )
                    
    def findroutines(self):
        for tok in self.tokls:
            if tok.matchform('ROUTINE', 1):
                idtok = tok.children[1]
                if idtok.typ is TokType.ID:
                    self.routines.append( (idtok.val, tok.pos) )
