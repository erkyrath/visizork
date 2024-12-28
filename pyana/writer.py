import json

sourcefile_map = {
    'zork1.zil':    'A',
    '1actions.zil': 'B',
    '1dungeon.zil': 'C',
    'gclock.zil':   'D',
    'gglobals.zil': 'E',
    'gmacros.zil':  'F',
    'gmain.zil':    'G',
    'gparser.zil':  'H',
    'gsyntax.zil':  'I',
    'gverbs.zil':   'J',
}

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
    filekey = sourcefile_map[file]
    return '%s:%d:%d' % (filekey, line, char,)

def write_strings(filename, txdat, objdat):
    print('...writing string data:', filename)
    load_gameinfo()

    ls = []
    for str in txdat.strings:
        ls.append([ str.addr, str.text ])
    for str in txdat.istrings:
        ls.append([ str.addr, str.text, str.rtn.addr ])
    for obj in objdat.objects:
        ls.append([ obj.propaddr+1, obj.desc, obj.num ])

    fl = open(filename, 'w')
    fl.write('window.gamedat_strings = ');
    json.dump(ls, fl, separators=(',', ':'))
    fl.write('\n')
    fl.close()
    

def write_objects(filename, zcode, objdat):
    print('...writing object data:', filename)
    load_gameinfo()
    ls = []
    for obj in zcode.objects:
        if obj.name not in objname_to_num:
            print('onum not found: %s "%s"' % (obj.name, obj.desc,))
            continue
        onum = objname_to_num[obj.name]
        if onum not in objdat.objmap:
            print('obj dump not found: %s' % (onum,))
            continue
        odump = objdat.objmap[onum]
        dat = {
            'onum':onum, 'name':obj.name, 'desc':obj.desc,
            'origparent': odump.parent,
            'sourceloc': sourceloc(obj.pos),
        }
        if obj.type == 'ROOM':
            dat['isroom'] = True
        if 5 in odump.props:
            # "GLOBAL" property
            dat['scenery'] = odump.props[5]
        ls.append(dat)
    
    fl = open(filename, 'w')
    fl.write('window.gamedat_objects = ');
    json.dump(ls, fl)
    fl.write('\n')
    fl.close()

def compute_room_distances(filename, zcode):
    print('...writing room distances:', filename)
    load_gameinfo()
    map = zcode.mapconnections()

    dat = {}

    for start in zcode.roomnames:
        dist = compute_distance_from(zcode, map, start)
        idist = dict([ (objname_to_num[key], val) for key, val in dist.items() ])
        dat[objname_to_num[start]] = idist
        
    fl = open(filename, 'w')
    fl.write('window.gamedat_distances = ');
    json.dump(dat, fl, separators=(',', ':'))
    fl.write('\n')
    fl.close()

def compute_distance_from(zcode, map, fromroom):    
    reached = []
    reacheddist = {}
    todo = [ (fromroom, 0) ]
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
        
    return reacheddist
    
