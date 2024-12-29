import os.path
import json

from writer import sourcefile_map

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
    fl.write('\n')
    fl.close()
    
