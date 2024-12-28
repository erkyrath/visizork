#!/usr/bin/env python3

import sys
import optparse

from zillex import Lexer, dumptokens
from zilana import Zcode
from zilana import markcomments, stripcomments
from zilana import stripifdefs
from txdparse import TXDData, ObjDumpData
from writer import write_objects, write_strings, compute_room_distances

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
    print('static strings:', len(zcode.strings), '/', 'unique:', len(strset))
    print('routines:', len(zcode.routines))
    print('objects:', len(zcode.objects))

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
    
if opts.gamedat:
    if opts.zilfile and opts.objdump:
        write_objects('src/game/objects.js', zcode, objdat)
    if opts.txdfile and opts.objdump:
        write_strings('src/game/strings.js', txdat, objdat)
    if opts.zilfile:
        compute_room_distances('src/game/distances.js', zcode)
        
