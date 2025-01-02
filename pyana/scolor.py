from enum import StrEnum

from zillex import Lexer, TokType, dumptokens

linkids = set()

def colorize_file(filename, zcode):
    linkids.update([ obj.name for obj in zcode.objects ])
    linkids.update([ rtn.name for rtn in zcode.routines ])
    linkids.update([ glo.name for glo in zcode.globals ])
    
    lex = Lexer(filename)
    tokls = lex.readfile(includes=False)
    #dumptokens(tokls, withpos=True)
    
    res = []
    colorize(tokls, res)
    #dumpcolors(res)
    lines = color_file_lines(filename, res)
    return lines

class Color(StrEnum):
    STR = 'STR'
    ID = 'ID'
    DICT = 'DICT'
    COMMENT = 'COMMENT'

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
            if tok.children[0].idmatch(('SYNONYM', 'ADJECTIVE')):
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
        ### <SYNTAX>, <SYNONYM>, <BUZZ>
        if tok.children:
            colorize(tok.children, res)

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

