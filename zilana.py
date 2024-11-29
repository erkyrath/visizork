from zillex import Token, TokType

class Zcode:
    def __init__(self, tokls):
        self.tokls = tokls
        self.globals = []

    def build(self):
        self.findcomments(self.tokls)
        self.findglobals()

    def findcomments(self, ls, incomment=False):
        for tok in ls:
            subcomment = incomment
            if tok.typ is TokType.GROUP and tok.val == ';':
                tok.comment = True
                subcomment = True
            if incomment:
                tok.comment = True
            if tok.typ is TokType.GROUP:
                self.findcomments(tok.children, incomment=subcomment)
                
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
                    
                                     
