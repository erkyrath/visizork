#!/usr/bin/env python3

import sys
from zillex import Lexer, dumptokens
from zilana import Zcode
from zilana import markcomments, stripcomments
from zilana import stripifdefs

for filename in sys.argv[1:]:
    lex = Lexer(filename)
    ls = lex.readfile(includes=True)
    stripifdefs(ls)
    dumptokens(ls, withpos=False, skipdead=False)
    #zcode = Zcode(ls)
    #zcode.build()
