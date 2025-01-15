import os, os.path
from enum import StrEnum

class TokType(StrEnum):
    STR = 'STR'
    NUM = 'NUM'
    ID = 'ID'
    GROUP = 'GROUP'
    PREFIX = 'PREFIX'
    DELIM = 'DELIM'

class Token:
    PREFIXCHARS = '\',.;!%'
    DELIMCHARS = '<>()'
    
    def __init__(self, typ, val, pos, children=None, endpos=None):
        self.typ = typ
        self.val = val
        self.pos = pos
        self.endpos = endpos
        self.prefix = None
        self.comment = False
        self.ifdef = False
        self.children = None

        # Filled in by Zcode.findall().
        self.defentity = None

        if typ is TokType.NUM:
            self.num = int(val)
        elif typ is TokType.GROUP:
            self.children = children
            if val == '<':
                self.val = '<>'
            elif val == '(':
                self.val = '()'
            elif val in Token.PREFIXCHARS:
                self.val = val
                self.prefix = True
            else:
                raise Exception('bad val for GROUP')

    def __repr__(self):
        if self.typ is TokType.STR or self.typ is TokType.DELIM:
            return '<%s %r>' % (self.typ, self.val,)
        if self.typ is TokType.GROUP:
            val = self.val
            if self.children and self.children[0].typ == TokType.ID:
                val = val[0] + self.children[0].val + val[1:]
            return '<%s %s (%d els)>' % (self.typ, val, len(self.children),)
        return '<%s %s>' % (self.typ, self.val,)

    def posstr(self, altpos=None):
        pos = altpos or self.pos
        val = '%s:%s:%s' % pos
        if self.endpos:
            val += ' - %s:%s:%s' % self.endpos
        return val

    def itertree(self, func):
        res = func(self)
        if res:
            return True
        if self.typ is TokType.GROUP:
            for subtok in self.children:
                res = subtok.itertree(func)
                if res:
                    return True
        return False

    def idmatch(self, key):
        if self.typ is TokType.ID:
            if type(key) is str:
                return (self.val ==key)
            if type(key) in (list, tuple, set):
                return (self.val in key)
            if callable(key):
                return key(self.val)
            raise Exception('idmatch could not cope with key %s' % (key,))

    def matchform(self, key, minlen):
        if self.typ is TokType.GROUP and self.val == '<>' and self.children:
            itok = self.children[0]
            if itok.typ is TokType.ID and itok.val == key and len(self.children) >= 1+minlen:
                return True

    def matchgroup(self, key, minlen):
        if self.typ is TokType.GROUP and self.val == '()' and self.children:
            itok = self.children[0]
            if itok.typ is TokType.ID and itok.idmatch(key) and len(self.children) >= 1+minlen:
                return True

class Lexer:
    def __init__(self, pathname):
        self.pathname = pathname
        self.dirname, self.filename = os.path.split(pathname)
        self.linenum = 1
        self.charnum = 0
        self.infl = None
        self.curchar = None

    def nextchar(self):
        ch = self.infl.read(1)
        if not ch:
            self.curchar = ''
            return
        if ch == '\n':
            self.linenum += 1
            self.charnum = 0
        else:
            self.charnum += 1
        self.curchar = ch

    def getpos(self):
        return (self.filename, self.linenum, self.charnum)

    def readtoken(self):
        while True:
            ch = self.curchar
            if not ch:
                return None
            if ch in (' ', '\t', '\x0C', '\n'):
                self.nextchar()
                continue
            pos = self.getpos()
            if ch == '\\':
                self.nextchar()
                if self.curchar == '\x0C':
                    self.nextchar()
                    continue
                val = self.curchar
                self.nextchar()
                return Token(TokType.ID, val, pos, endpos=self.getpos())
            if ch in Token.PREFIXCHARS:
                self.nextchar()
                return Token(TokType.PREFIX, ch, pos, endpos=self.getpos())
            if ch in Token.DELIMCHARS:
                self.nextchar()
                return Token(TokType.DELIM, ch, pos, endpos=self.getpos())
            if ch.isalpha() or ch == '=':
                val = ch
                self.nextchar()
                while self.curchar.isalpha() or self.curchar.isdigit() or self.curchar in '-=?\\':
                    if self.curchar == '\\':
                        self.nextchar()
                    val += self.curchar
                    self.nextchar()
                return Token(TokType.ID, val, pos, endpos=self.getpos())
            if ch.isdigit():
                val = ch
                self.nextchar()
                while self.curchar.isdigit():
                    val += self.curchar
                    self.nextchar()
                val = int(val)
                return Token(TokType.NUM, val, pos, endpos=self.getpos())
            if ch == '-':
                val = ''
                self.nextchar()
                if self.curchar.isdigit():
                    while self.curchar.isdigit():
                        val += self.curchar
                        self.nextchar()
                    val = -int(val)
                    return Token(TokType.NUM, val, pos, endpos=self.getpos())
                else:
                    return Token(TokType.ID, '-', pos, endpos=self.getpos())
                
            if ch == '"':
                val = ''
                self.nextchar()
                while self.curchar and self.curchar != '"':
                    if self.curchar == '|':
                        val += '\n'
                        self.nextchar()
                        if self.curchar == '"':
                            break
                        if self.curchar == '\n':
                            self.nextchar()
                        continue
                    elif self.curchar == '\\':
                        self.nextchar()
                        if self.curchar != '"':
                            raise Exception('\\ not followed by "')
                        val += '"'
                    elif self.curchar == '\n':
                        val += ' '
                    else:
                        val += self.curchar
                    self.nextchar()
                if not self.curchar:
                    raise Exception('unterminated string')
                self.nextchar()
                return Token(TokType.STR, val, pos, endpos=self.getpos())
            
            self.nextchar()
            return Token(TokType.ID, ch, pos, endpos=self.getpos())

    def readtokens(self, opentok=None):
        res = []
        closetok = None
        while True:
            if opentok is not None and opentok.typ == TokType.PREFIX and res:
                closetok = res[-1]
                break
            tok = self.readtoken()
            if tok is None:
                closetok = None
                break
            if tok.typ is TokType.DELIM:
                if tok.val in ')>':
                    closetok = tok
                    break
                (ls, endls) = self.readtokens(opentok=tok)
                endpos = endls.endpos if endls else None
                gtok = Token(TokType.GROUP, tok.val, tok.pos, children=ls, endpos=endpos)
                res.append(gtok)
                continue
            if tok.typ is TokType.PREFIX:
                (ls, endls) = self.readtokens(opentok=tok)
                endpos = endls.endpos if endls else None
                gtok = Token(TokType.GROUP, tok.val, tok.pos, children=ls, endpos=endpos)
                res.append(gtok)
                continue
            res.append(tok)
        if opentok is None:
            if tok:
                raise Exception('unmatched close token: %s' % (tok,))
        elif opentok.typ is TokType.PREFIX:
            if tok is None:
                raise Exception('unclosed prefix: %s' % (opentok,))
        elif opentok.typ is TokType.DELIM:
            if tok is None:
                raise Exception('unclosed open token: %s' % (opentok,))
            if tok.val == ')' and opentok.val != '(':
                raise Exception('mismatched open paren: %s' % (opentok,))
            if tok.val == '>' and opentok.val != '<':
                raise Exception('mismatched open paren: %s' % (opentok,))
        else:
            raise Exception('bad opentok')
        return (res, closetok)

    def resolveincludes(self, ls):
        res = []
        for tok in ls:
            if tok.matchform('IFILE', 1):
                val = tok.children[1].val
                val = val.lower()+'.zil'
                incpath = os.path.join(self.dirname, val)
                inclen = Lexer(incpath)
                incls = inclen.readfile(includes=True)
                res.extend(incls)
            else:
                res.append(tok)
        return res

    def readfile(self, includes=False):
        self.infl = open(self.pathname)
        self.nextchar()
        (res, _) = self.readtokens()
        self.infl.close()
        self.infl = None
        if includes:
            res = self.resolveincludes(res)
        return res


# Compare the positions of two sourceloc tuples. (Ignoring filename.)
# True if tup1 <= tup2.
def posLE(tup1, tup2):
    if len(tup1) > 2:
        tup1 = tup1[ -2 : ]
    if len(tup2) > 2:
        tup2 = tup2[ -2 : ]
    return (tup1 <= tup2)

# True if tup1 > tup2.
def posGT(tup1, tup2):
    return not posLE(tup1, tup2)

# Return whether tok1 is contained inside tok2.
# (Both must have both pos and endpos.)
def tokIN(tok1, tok2):
    if tok1.pos[0] == tok2.pos[0]:
        if posLE(tok2.pos, tok1.pos) and posLE(tok1.endpos, tok2.endpos):
            return True

def dumptokens(ls, withpos=False, skipdead=False, depth=0, prefix='', atpos=None):
    for tok in ls:
        if skipdead and (tok.comment or tok.ifdef):
            continue
        pos = atpos or tok.pos
        endpos = tok.endpos
        if tok.typ is TokType.GROUP and tok.prefix:
            dumptokens(tok.children, withpos=withpos, skipdead=skipdead, depth=depth, prefix=prefix+tok.val, atpos=pos)
            continue
        
        posstr = ''
        if withpos:
            posstr = ' ' + tok.posstr(altpos=pos)
        print('%s%s%r%s' % ('  '*depth, prefix, tok, posstr))
        if tok.typ is TokType.GROUP:
            dumptokens(tok.children, withpos=withpos, skipdead=skipdead, depth=depth+1)
    
