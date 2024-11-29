#!/usr/bin/env python3

import sys
from zillex import Lexer, dumptokens
from zilana import Zcode

for filename in sys.argv[1:]:
    lex = Lexer(filename)
    ls = lex.readfile(includes=True)
    zcode = Zcode(ls)
    zcode.build()
    dumptokens(ls, withpos=False, skipdead=True)
