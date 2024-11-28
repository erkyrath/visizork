#!/usr/bin/env python3

import sys
import os, os.path

class Lexer:
    def __init__(self, pathname):
        self.pathname = pathname
        _, self.filename = os.path.split(pathname)
        self.linenum = 0
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
                return val, pos
            if ch.isalpha():
                val = ch
                self.nextchar()
                while self.curchar.isalpha() or self.curchar.isdigit() or self.curchar in '-?\\':
                    if self.curchar == '\\':
                        self.nextchar()
                    val += self.curchar
                    self.nextchar()
                return val, pos
            if ch.isdigit():
                val = ch
                self.nextchar()
                while self.curchar.isdigit():
                    val += self.curchar
                    self.nextchar()
                val = int(val)
                return val, pos
            if ch == '-':
                val = ''
                self.nextchar()
                if self.curchar.isdigit():
                    while self.curchar.isdigit():
                        val += self.curchar
                        self.nextchar()
                    val = -int(val)
                    return val, pos
                else:
                    return '-', pos
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
                return val, pos
            self.nextchar()
            return ch, pos

    def readfile(self):
        self.infl = open(self.pathname)
        self.nextchar()
        while True:
            tok = self.readtoken()
            if tok is None:
                break
            print(tok)
        self.infl.close()
        self.infl = None
            

for filename in sys.argv[1:]:
    lex = Lexer(filename)
    lex.readfile()
