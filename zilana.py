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


class Zcode:
    def __init__(self, tokls):
        self.tokls = tokls
        self.globals = []

    def build(self):
        #self.findifdefs(self.tokls)
        self.findglobals()

    def findifdefs(self, ls, inifdef=False):
        for tok in ls:
            subifdef = inifdef
            if tok.typ is TokType.GROUP and tok.val == '%' and tok.children:
                ctok = tok.children[0]
                if ctok.matchform('COND', 0):
                    for cgrp in ctok.children[ 1 : ]:
                        keep = True
                        match = iseqzorknum(cgrp)
                        if match:
                            print('### zorknum', match, cgrp)
                            keep = (match == 1)
                        ###
            if inifdef:
                tok.ifdef = True
            if tok.typ is TokType.GROUP:
                self.findifdefs(tok.children, inifdef=subifdef)
                
    def findglobals(self):
        for tok in self.tokls:
            if tok.comment:
                continue
            if tok.ifdef:
                continue
            if tok.matchform('GLOBAL', 1):
                idtok = tok.children[1]
                if idtok.typ is TokType.ID:
                    self.globals.append( (idtok.val, tok.pos) )
                    
                                     
def iseqzorknum(cgrp):
    if cgrp.typ is TokType.GROUP and cgrp.val == '()' and len(cgrp.children) == 2:
        condgrp = cgrp.children[0]
        resgrp = cgrp.children[1]
        if condgrp.matchform('==?', 2):
            keytok = condgrp.children[1]
            valtok = condgrp.children[2]
            if keytok.typ is TokType.GROUP and keytok.val == "," and keytok.children:
                kidtok = keytok.children[0]
                if kidtok.typ is TokType.ID and kidtok.val == 'ZORK-NUMBER':
                    if valtok.typ is TokType.NUM:
                        return valtok.num
                    
