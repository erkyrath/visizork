#!/usr/bin/env python3

import sys
import optparse
from enum import StrEnum

from zillex import Lexer, TokType, dumptokens

popt = optparse.OptionParser()

popt.add_option('-z', '--zil',
                action='store', dest='zilfile')

(opts, args) = popt.parse_args()

def parse(filename):
    lex = Lexer(filename)
    tokls = lex.readfile(includes=False)
    #dumptokens(tokls, withpos=True)
    res = []
    colorize(tokls, res)
    #dumpcolors(res)
    lines = color_file_lines(filename, res)
    ###
    for ln in lines:
        print(ln)

class Color(StrEnum):
    STR = 'STR'
    ID = 'ID'
    DICT = 'DICT'
    COMMENT = 'COMMENT'

linkids = set(['LOCAL-GLOBALS', 'BOARD', 'BOARD-F', 'ZORK-NUMBER', 'P-NOT-HERE'])

def colorize(tokls, res):
    for tok in tokls:
        if tok.typ is TokType.STR:
            res.append( (tok, Color.STR) )
            continue
        if tok.typ is TokType.ID:
            if tok.val in linkids:
                res.append( (tok, Color.ID) )
            continue
        if tok.typ is TokType.GROUP and tok.val == ';':
            res.append( (tok, Color.COMMENT) )
            continue
        ### %COND
        if tok.typ is TokType.GROUP and tok.val == '()' and tok.children:
            if tok.children[0].idmatch('SYNONYM'):
                for subtok in tok.children[1:]:
                    if subtok.typ is TokType.ID:
                        res.append( (subtok, Color.DICT) )
                continue
            if tok.children[0].idmatch('PSEUDO'):
                for subtok in tok.children[1:]:
                    if subtok.typ is TokType.STR:
                        res.append( (subtok, Color.DICT) )
                    if subtok.typ is TokType.ID and subtok.val in linkids:
                        res.append( (subtok, Color.ID) )
                continue
        ### <SYNTAX>, <SYNONYM>
        if tok.children:
            colorize(tok.children, res)

def dumpcolors(ls):
    for (tok, color) in ls:
        print('%s: %s %s' % (color, tok.posstr(), tok, ))

def color_file_lines(filename, colorls):
    colorls = list(colorls)
    res = []
    
    with open(filename) as infl:
        col = colorls and colorls.pop(0)
        col = [] ###
        
        linenum = 1
        for ln in infl.readlines():
            ln = ln.rstrip()
            
            curline = []
            charnum = 1
            
            while charnum < 1+len(ln):
                lastcharnum = charnum
                while col and posLE(col.endpos, (linenum, charnum)):
                    col = colorls and colorls.pop(0)
                if not col:
                    charnum = 1+len(ln)
                    if lastcharnum < charnum:
                        curline.append( (None, ln[lastcharnum-1 : charnum-1]) )
                    
            res.append(curline)
            linenum += 1

    return res
        
parse(opts.zilfile)
