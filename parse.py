#!/usr/bin/env python3

import sys
from zillex import Lexer, dumptokens

for filename in sys.argv[1:]:
    lex = Lexer(filename)
    ls = lex.readfile(includes=True)
    dumptokens(ls, withpos=True)
