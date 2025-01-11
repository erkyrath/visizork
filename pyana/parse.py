#!/usr/bin/env python3

# python3 pyana/parse.py -z gamesrc/zork1.zil --obj --txd --gamedat
# python3 pyana/parse.py -z gamesrc/zork1.zil --src

import sys
import optparse

from zillex import Lexer, dumptokens
from zilana import Zcode
from zilana import stripcomments
from zilana import stripifdefs
from txdparse import TXDData, ObjDumpData, DictDumpData
from writer import write_propattrs, write_verbs, write_constants, write_globals, write_objects, write_routines, write_strings, write_dictwords, compute_room_distances
from gensource import write_source, write_source_colored

popt = optparse.OptionParser()

popt.add_option('-z', '--zil',
                action='store', dest='zilfile')
popt.add_option('--nostrip',
                action='store_true', dest='nostrip')
popt.add_option('--dump',
                action='store_true', dest='dump')
popt.add_option('--gamedat',
                action='store_true', dest='gamedat')
popt.add_option('-t', '--txd',
                action='store_true', dest='txdfile')
popt.add_option('-o', '--obj',
                action='store_true', dest='objdump')
popt.add_option('-d', '--dict',
                action='store_true', dest='dictdump')
popt.add_option('--src',
                action='store_true', dest='sourcelist')

(opts, args) = popt.parse_args()

if opts.zilfile:
    print('reading %s...' % (opts.zilfile,))
    lex = Lexer(opts.zilfile)
    ls = lex.readfile(includes=True)
    if not opts.nostrip:
        stripcomments(ls)
        stripifdefs(ls)
    if opts.dump:
        dumptokens(ls, withpos=False)
    zcode = Zcode(ls)
    zcode.build()
    strset = set([ val.text for val in zcode.strings ])
    print('globals:', len(zcode.globals))
    print('constants:', len(zcode.constants))
    print('static strings:', len(zcode.strings), '/', 'unique:', len(strset))
    print('inline strings:', len(zcode.istrings))
    print('routines:', len(zcode.routines))
    print('objects:', len(zcode.objects))
    print('verbs:', len(zcode.verbs))

if opts.txdfile:
    print('reading TXD dump...')
    txdat = TXDData()
    txdat.readdump('gamedat/game-dump.txt')
    print('routines:', len(txdat.routines))
    print('strings:', len(txdat.strings))
    print('istrings:', len(txdat.istrings))

if opts.objdump:
    print('reading object dump...')
    objdat = ObjDumpData()
    objdat.readdump('gamedat/obj-dump.txt')
    print('objects:', len(objdat.objects))
    
if opts.dictdump:
    print('reading dict dump...')
    dictdat = DictDumpData()
    dictdat.readdump('gamedat/dict-dump.txt')
    print('dict words:', len(dictdat.words))
    
if opts.gamedat:
    write_propattrs('src/game/propattrs.js')
    if opts.dictdump:
        write_dictwords('src/game/dictwords.js', dictdat)
    if opts.zilfile:
        write_verbs('src/game/verbs.js', zcode)
    if opts.zilfile:
        write_globals('src/game/globals.js', zcode)
        write_constants('src/game/constants.js', zcode)
    if opts.zilfile and opts.objdump:
        write_objects('src/game/objects.js', zcode, objdat)
    if opts.zilfile and opts.txdfile:
        write_routines('src/game/routines.js', zcode, txdat)
    if opts.zilfile and opts.txdfile and opts.objdump:
        write_strings('src/game/strings.js', zcode, txdat, objdat)
    if opts.zilfile:
        compute_room_distances('src/game/distances.js', zcode)

if opts.sourcelist:
    if not opts.zilfile:
        print('need -z gamesrc/zork1.zil')
    else:
        write_source_colored('src/game/source.js', zcode)
