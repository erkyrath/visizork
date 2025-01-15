from enum import StrEnum

from zillex import Lexer, TokType, dumptokens
from zilana import teststaticcond

linkids = {}
loctoentity = {}

def prep_syntax_coloring(zcode):
    absorb_entities([ (obj, obj.objtok) for obj in zcode.objects ])
    absorb_entities([ (rtn, rtn.rtok) for rtn in zcode.routines ])
    absorb_entities([ (glo, glo.gtok) for glo in zcode.globals ])
    absorb_entities([ (con, con.ctok) for con in zcode.constants ])

def colorize_file(filename, zcode):
    # This is awkward. We just parsed the ZIL for the zcode object,
    # but we want to do it again for the syntax coloring. (The first
    # time we stripped out comments and conditional compilation, but
    # now we leave them in.)
    
    lex = Lexer(filename)
    tokls = lex.readfile(includes=False)
    #dumptokens(tokls, withpos=True)
    
    res = []
    colorize(tokls, res, None)
    #dumpcolors(res)
    lines = color_file_lines(filename, res)
    return lines

def absorb_entities(ls):
    for obj, tok in ls:
        linkids[obj.name] = tok
        if tok:
            lockey = tok.posstr()
            if lockey in loctoentity:
                raise Exception('location clash (%s): %s' % (obj, lockey,))
            loctoentity[lockey] = obj

class Color(StrEnum):
    STR = 'STR'
    ID = 'ID'
    IDDEF = 'IDDEF'
    DICT = 'DICT'
    COMMENT = 'COMMENT'
    IFNDEF = 'IFNDEF'

def colorize(tokls, res, defentity):
    for tok in tokls:
        if tok.typ is TokType.STR:
            if tok.val in ('AUX', 'OPTIONAL') and False: ###
                ### check arg span!
                # not really a string
                continue
            res.append( (tok, Color.STR) )
            continue
        if tok.typ is TokType.ID:
            if tok.val in linkids:
                if defentity and defentity.name == tok.val:
                    res.append( (tok, Color.IDDEF) )
                else:
                    res.append( (tok, Color.ID) )
            continue
        
        if tok.typ is TokType.GROUP and tok.val == ';':
            res.append( (tok, Color.COMMENT) )
            continue
        
        if tok.typ is TokType.GROUP and tok.val == '%' and tok.children:
            ctok = tok.children[0]
            if ctok.matchform('COND', 0):
                colorize([ ctok.children[0] ], res, defentity)
                found = None
                for cgrp in ctok.children[ 1 : ]:
                    if found:
                        res.append( (cgrp, Color.IFNDEF) )
                        continue
                    found = teststaticcond(cgrp)
                    if found:
                        colorize([ cgrp ], res, defentity)
                    else:
                        res.append( (cgrp, Color.IFNDEF) )
                        continue
                continue
        if tok.typ is TokType.GROUP and tok.val == '()' and tok.children:
            if tok.children[0].idmatch(('SYNONYM', 'ADJECTIVE')):
                for subtok in tok.children[1:]:
                    if subtok.typ is TokType.ID:
                        res.append( (subtok, Color.DICT) )
                    if subtok.typ is TokType.GROUP and subtok.val == ';':
                        res.append( (subtok, Color.COMMENT) )
                continue
            if tok.children[0].idmatch('PSEUDO'):
                for subtok in tok.children[1:]:
                    if subtok.typ is TokType.STR:
                        res.append( (subtok, Color.DICT) )
                    if subtok.typ is TokType.ID and subtok.val in linkids:
                        res.append( (subtok, Color.ID) )
                continue
        ### <SYNTAX>, <SYNONYM>, <BUZZ>
        
        if tok.children:
            subentity = defentity
            if not subentity:
                lockey = tok.posstr()
                if lockey in loctoentity:
                    subentity = loctoentity[lockey]
            colorize(tok.children, res, subentity)

def dumpcolors(ls):
    for (tok, color) in ls:
        print('%s: %s %s' % (color, tok.posstr(), tok, ))

def posLE(tup1, tup2):
    if len(tup1) > 2:
        tup1 = tup1[ -2 : ]
    if len(tup2) > 2:
        tup2 = tup2[ -2 : ]
    return (tup1 <= tup2)

def posGT(tup1, tup2):
    return not posLE(tup1, tup2)

def tokIN(tok1, tok2):
    if posLE(tok2.pos, tok1.pos) and posLE(tok1.endpos, tok2.endpos):
        return True

def color_file_lines(filename, colorls):
    colorls = list(colorls)
    res = []
    
    with open(filename) as infl:
        col = colorls and colorls.pop(0)
        
        linenum = 1
        for ln in infl.readlines():
            ln = ln.rstrip()
            
            curline = []
            charnum = 1
            
            while charnum < 1+len(ln):
                lastcharnum = charnum
                while col and posLE(col[0].endpos, (linenum, charnum)):
                    col = colorls and colorls.pop(0)
                if not col:
                    charnum = 1+len(ln)
                    if lastcharnum < charnum:
                        curline.append( (None, ln[lastcharnum-1 : charnum-1]) )
                    continue
                
                _, colline, colchar = col[0].pos
                if posGT((colline, colchar), (linenum, charnum)):
                    if colline > linenum:
                        charnum = 1+len(ln)
                    else:
                        charnum = colchar
                    if lastcharnum < charnum:
                        curline.append( (None, ln[lastcharnum-1 : charnum-1]) )
                    continue
                
                _, colendline, colendchar = col[0].endpos
                if colendline > linenum:
                    charnum = 1+len(ln)
                else:
                    charnum = colendchar
                if lastcharnum < charnum:
                    curline.append( (col[1], ln[lastcharnum-1 : charnum-1]) )
                    
            res.append(curline)
            linenum += 1

    return res

