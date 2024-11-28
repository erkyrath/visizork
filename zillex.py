#!/usr/bin/env python3

import sys
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
    def __init__(self, typ, val, pos, children=None):
        self.typ = typ
        self.val = val
        self.pos = pos
        self.prefix = None
        self.comment = False
        self.ifdef = False
        self.children = None

        if typ is TokType.NUM:
            self.num = int(val)
        elif typ is TokType.GROUP:
            self.children = children
            if val == '<':
                self.val = '<>'
            elif val == '(':
                self.val = '()'
            elif val in '\',.%':
                self.val = val
                self.prefix = True
            else:
                raise Exception('bad val for GROUP')

    def __repr__(self):
        if self.typ is TokType.STR or self.typ is TokType.DELIM:
            return '<%s %r>' % (self.typ, self.val,)
        if self.typ is TokType.GROUP:
            return '<%s %s (%d)>' % (self.typ, self.val, len(self.children),)
        return '<%s %s>' % (self.typ, self.val,)

    def posstr(self):
        return '%s:%d:%d' % self.pos

class Lexer:
    def __init__(self, pathname):
        self.pathname = pathname
        _, self.filename = os.path.split(pathname)
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
            if ch in (' ', '\t', '\n'):
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
                return Token(TokType.ID, val, pos)
            if ch in '\',.%':
                self.nextchar()
                return Token(TokType.PREFIX, ch, pos)
            if ch in '<>()':
                self.nextchar()
                return Token(TokType.DELIM, ch, pos)
            if ch.isalpha() or ch == '=':
                val = ch
                self.nextchar()
                while self.curchar.isalpha() or self.curchar.isdigit() or self.curchar in '-=?\\':
                    if self.curchar == '\\':
                        self.nextchar()
                    val += self.curchar
                    self.nextchar()
                return Token(TokType.ID, val, pos)
            if ch.isdigit():
                val = ch
                self.nextchar()
                while self.curchar.isdigit():
                    val += self.curchar
                    self.nextchar()
                val = int(val)
                return Token(TokType.NUM, val, pos)
            if ch == '-':
                val = ''
                self.nextchar()
                if self.curchar.isdigit():
                    while self.curchar.isdigit():
                        val += self.curchar
                        self.nextchar()
                    val = -int(val)
                    return Token(TokType.NUM, val, pos)
                else:
                    return Token(TokType.ID, '-', pos)
                
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
                return Token(TokType.STR, val, pos)
            
            self.nextchar()
            return Token(TokType.ID, ch, pos)

    def readtokens(self, opentok=None):
        res = []
        while True:
            if opentok is not None and opentok.typ == TokType.PREFIX and res:
                break
            tok = self.readtoken()
            if tok is None:
                break
            if tok.typ is TokType.DELIM:
                if tok.val in ')>':
                    break
                ls = self.readtokens(opentok=tok)
                gtok = Token(TokType.GROUP, tok.val, tok.pos, children=ls)
                res.append(gtok)
                continue
            if tok.typ is TokType.PREFIX:
                ls = self.readtokens(opentok=tok)
                gtok = Token(TokType.GROUP, tok.val, tok.pos, children=ls)
                res.append(gtok)
                continue
            res.append(tok)
        if opentok is None:
            if tok:
                raise Exception('unmatched close token: %s' % (tok,))
        elif opentok.typ is TokType.PREFIX:
            pass
        elif opentok.typ is TokType.DELIM:
            if tok is None:
                raise Exception('unclosed open token: %s' % (opentok,))
            if tok.val == ')' and opentok.val != '(':
                raise Exception('mismatched open paren: %s' % (opentok,))
            if tok.val == '>' and opentok.val != '<':
                raise Exception('mismatched open paren: %s' % (opentok,))
        else:
            raise Exception('bad opentok')
        return res

    def dumptokens(self, ls, withpos=False, depth=0, prefix=None):
        for tok in ls:
            if tok.typ is TokType.GROUP and tok.prefix:
                self.dumptokens(tok.children, withpos=withpos, depth=depth, prefix=tok.val)
                continue
            prefstr = '' if prefix is None else prefix
            print('%s%s%r' % ('  '*depth, prefstr, tok,))
            if tok.typ is TokType.GROUP:
                self.dumptokens(tok.children, withpos=withpos, depth=depth+1)
    
    def readfile(self):
        self.infl = open(self.pathname)
        self.nextchar()
        res = self.readtokens()
        self.dumptokens(res, withpos=True)
        self.infl.close()
        self.infl = None
            

for filename in sys.argv[1:]:
    lex = Lexer(filename)
    lex.readfile()
