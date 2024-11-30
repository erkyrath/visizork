#!/usr/bin/env python3

import sys
from zillex import Lexer, dumptokens
from zilana import Zcode
from zilana import markcomments, stripcomments
from zilana import stripifdefs
from txdparse import TXDData

'''
for filename in sys.argv[1:]:
    lex = Lexer(filename)
    ls = lex.readfile(includes=True)
    stripcomments(ls)
    stripifdefs(ls)
    #dumptokens(ls, withpos=False, skipdead=False)
    zcode = Zcode(ls)
    zcode.build()
    for val in reversed(zcode.objects):
        print(val)
'''

dat = TXDData()
dat.readdump('gamedat/game-dump.txt')
print('routines:', len(dat.routines))
print('strings:', len(dat.strings))
print('istrings:', len(dat.istrings))
