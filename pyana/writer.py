import json

info_loaded = False

objnum_to_name = {}
objname_to_num = {}
propnum_to_name = {}
propname_to_num = {}

def load_gameinfo():
    global info_loaded
    if info_loaded:
        return
    fl = open('gamedat/game-info')
    for ln in fl.readlines():
        ln = ln.strip()
        if not ln or ln.startswith('#'):
            continue
        typ, num, name = ln.split()
        num = int(num)
        if typ == 'Object':
            objname_to_num[name] = num
            objnum_to_name[num] = name
        if typ == 'Property':
            propname_to_num[name] = num
            propnum_to_name[num] = name
    fl.close()
    info_loaded = True

def sourceloc(tup):
    file, line, char = tup
    return { 'file':file, 'line':line, 'char':char }

def write_objects(filename, zcode):
    load_gameinfo()
    ls = []
    for (name, type, desc, loc) in zcode.objects:
        if name in objname_to_num:
            onum = objname_to_num[name]
            ls.append( (onum, name, type, desc, sourceloc(loc)) )
        else:
            print('onum not found: %s "%s"' % (name, desc,))
    
    fl = open(filename, 'w')
    fl.write('window.gamedat_objects = ');
    json.dump(ls, fl)
    fl.write('\n')
    fl.close()

def compute_room_distances(zcode):
    map = zcode.mapconnections()
    
    reached = []
    reacheddist = {}
    todo = [ ('WEST-OF-HOUSE', 0) ]
    while todo:
        (cur, dist) = todo.pop(0)
        if cur in reacheddist:
            continue
        reached.append(cur)
        reacheddist[cur] = dist
        for (dir, dest) in map[cur]:
            todo.append( (dest, dist+1) )

    if len(reached) != len(zcode.roomnames):
        print('failed to reach all rooms!')
        
    print('###', reached)
    return reacheddist
    
