import json

def sourceloc(tup):
    file, line, char = tup
    return { 'file':file, 'line':line, 'char':char }

def write_objects(filename, zcode):
    counter = len(zcode.objects)
    ls = []
    for (name, type, desc, loc) in zcode.objects:
        ls.append( (counter, name, type, desc, sourceloc(loc)) )
        counter -= 1
    
    fl = open(filename, 'w')
    fl.write('window.gamedat_objects = ');
    json.dump(ls, fl)
    fl.write('\n')
    fl.close()

