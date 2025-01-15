import os.path
import json

from writer import sourcefile_map
from scolor import prep_syntax_coloring, colorize_file

def write_source(filename):
    print('...writing', len(sourcefile_map), 'source files:', filename)
    map = {}
    for srcfile in sourcefile_map:
        pathname = os.path.join('gamesrc', srcfile)
        lines = []
        with open(pathname) as infl:
            for ln in infl.readlines():
                lines.append(ln.rstrip())
        map[srcfile] = lines

    fl = open(filename, 'w')
    fl.write('window.gamedat_sourcefiles = ');
    json.dump(map, fl, separators=(',', ':'))
    fl.write(';\n')
    fl.close()
    
def write_source_colored(filename, zcode):
    print('...writing colorized', len(sourcefile_map), 'source files:', filename)
    prep_syntax_coloring(zcode)
    map = {}
    for srcfile in sourcefile_map:
        lines = colorize_file(os.path.join('gamesrc', srcfile), zcode)
        shortlines = []
        for srcline in lines:
            ls = []
            for (col, val) in srcline:
                if not col:
                    ls.append(val)
                else:
                    ls.append([str(col).title(), val])
            shortlines.append(ls)
        map[srcfile] = shortlines

    fl = open(filename, 'w')
    fl.write('window.gamedat_sourcefiles = ');
    json.dump(map, fl, separators=(',', ':'))
    fl.write(';\n')
    fl.close()
    
