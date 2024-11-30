#!/usr/bin/env python3

import sys
from zillex import Lexer, dumptokens
from zilana import Zcode, markcomments, stripcomments

for filename in sys.argv[1:]:
    lex = Lexer(filename)
    ls = lex.readfile(includes=True)
    stripcomments(ls)
    dumptokens(ls, withpos=False, skipdead=False)
    #zcode = Zcode(ls)
    #zcode.build()
