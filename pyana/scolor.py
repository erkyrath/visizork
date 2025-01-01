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
    dumpcolors(res)

class Color(StrEnum):
    STR = 'STR'
    COMMENT = 'COMMENT'
    
def colorize(tokls, res):
    for tok in tokls:
        if tok.typ is TokType.STR:
            res.append( (tok, Color.STR) )
            continue
        if tok.typ is TokType.GROUP and tok.val == ';':
            res.append( (tok, Color.COMMENT) )
            continue
        if tok.children:
            colorize(tok.children, res)

def dumpcolors(ls):
    for (tok, color) in ls:
        print('%s: %s %s' % (color, tok.posstr(), tok, ))
            
parse(opts.zilfile)
