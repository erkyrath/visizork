import json
import re

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
globname_to_num = {}
globnum_to_name = {}
globname_to_vartype = {}
attribute_list = []
property_list = []
propname_to_vartype = {}

def load_gameinfo():
    global info_loaded
    if info_loaded:
        return
    pat = re.compile(r'(\S+)\s+(\S+)\s+(\S+)\s*(.*)?')
    fl = open('gamedat/game-info')
    for ln in fl.readlines():
        ln = ln.strip()
        if not ln or ln.startswith('#'):
            continue
        match = pat.match(ln)
        typ, num, name = match.group(1), match.group(2), match.group(3)
        extra = match.group(4)
        num = int(num)
        if typ == 'Object':
            objname_to_num[name] = num
            objnum_to_name[num] = name
        if typ == 'Property':
            propname_to_num[name] = num
            propnum_to_name[num] = name
            property_list.append( (num, name) )
            if extra:
                propname_to_vartype[name] = extra
        if typ == 'Attribute':
            attribute_list.append( (num, name) )
        if typ == 'Global':
            globname_to_num[name] = num
            globnum_to_name[num] = name
            if extra:
                globname_to_vartype[name] = extra
    fl.close()
    info_loaded = True

def sourceloc(tup=None, endtup=None, tok=None):
    if tok:
        tup = tok.pos
        endtup = tok.endpos
    if tup is None:
        return ''
    file, line, char = tup
    filekey = sourcefile_map[file]
    res = '%s:%d:%d' % (filekey, line, char,)
    if endtup:
        efile, eline, echar = endtup
        if file != efile:
            raise Exception('sourceloc span across files')
        res += ':%d:%d' % (eline, echar,)
    return res

def write_dictwords(filename, dictdat):
    print('...writing dictword data:', filename)

    ls = []
    for wd in dictdat.words:
        dat = { 'num': wd.num, 'text': wd.text, 'flags': wd.flags }
        dat['spec2'] = wd.special[1]
        ls.append(dat)

    fl = open(filename, 'w')
    fl.write('window.gamedat_dictwords = ');
    json.dump(ls, fl, separators=(',', ':'))
    fl.write(';\n')
    fl.close()

def write_strings(filename, zcode, txdat, objdat):
    print('...writing string data:', filename)
    load_gameinfo()

    objname_to_descloc = {}
    for obj in zcode.objects:
        if obj.desc:
            objname_to_descloc[obj.name] = obj.desctok

    strtext_to_pos = {}
    for st in zcode.strings:
        if st.text not in strtext_to_pos:
            strtext_to_pos[st.text] = []
        strtext_to_pos[st.text].append(st)

    istrtext_to_pos = {}
    for st in zcode.istrings:
        text = st.text.replace('.  ', '. ')
        text = text.replace('    ****', '   ****')
        tup = (st.rtn, text)
        if tup not in istrtext_to_pos:
            istrtext_to_pos[tup] = []
        istrtext_to_pos[tup].append(st)

    funcaddr_to_name = {}
    for zfunc, tfunc in zip(zcode.routines, txdat.routines):
        funcaddr_to_name[tfunc.addr] = zfunc.name
        
    ls = []
    for str in txdat.strings:
        posls = strtext_to_pos.get(str.text)
        posval = None
        if not posls:
            print('ERROR: missing str', str)
        else:
            if len(posls) == 1:
                posval = sourceloc(tok=posls[0])
            else:
                posval = [ sourceloc(tok=val) for val in posls ]
        ls.append([ str.addr, str.text, posval ])
    for str in txdat.istrings:
        fname = funcaddr_to_name[str.rtn.addr]
        srctok = istrtext_to_pos.get((fname, str.text)).pop(0)
        ls.append([ str.addr, str.text, sourceloc(tok=srctok), str.rtn.addr ])
    for obj in objdat.objects:
        if not obj.desc:
            continue
        oname = objnum_to_name[obj.num]
        srctok = objname_to_descloc.get(oname)
        ls.append([ obj.propaddr+1, obj.desc, sourceloc(tok=srctok), obj.num ])

    for tup, tls in istrtext_to_pos.items():
        if tls:
            raise Exception('unused istrings: %s, %s' % tup)

    fl = open(filename, 'w')
    fl.write('window.gamedat_strings = ');
    json.dump(ls, fl, separators=(',', ':'))
    fl.write(';\n')
    fl.close()

def write_propattrs(filename):
    print('...writing property and attribute data:', filename)
    load_gameinfo()

    attrls = [ { 'num':num, 'name':name } for (num, name) in attribute_list ]

    propls = [ { 'num':num, 'name':name } for (num, name) in property_list ]
    for obj in propls:
        val = propname_to_vartype.get(obj['name'])
        if val:
            obj['vartype'] = val
    
    fl = open(filename, 'w')
    fl.write('window.gamedat_properties = ');
    json.dump(propls, fl)
    fl.write(';\n')
    fl.write('window.gamedat_attributes = ');
    json.dump(attrls, fl)
    fl.write(';\n')
    fl.close()
    
def write_verbs(filename, zcode):
    print('...writing verbs:', filename)

    ls = [ verb.name for verb in zcode.verbs ]

    fl = open(filename, 'w')
    fl.write('window.gamedat_verbs = ');
    json.dump(ls, fl)
    fl.write(';\n')
    fl.close()

def write_routines(filename, zcode, txdat):
    print('...writing routine data:', filename)
    if len(zcode.routines) != len(txdat.routines):
        raise Exception('routine length mismatch')
    ls = []
    for zfunc, tfunc in zip(zcode.routines, txdat.routines):
        dat = {
            'name': zfunc.name,
            'addr': tfunc.addr,
            'sourceloc': sourceloc(tok=zfunc.rtok),
        }
        ls.append(dat)

    fl = open(filename, 'w')
    fl.write('window.gamedat_routines = ');
    json.dump(ls, fl, separators=(',', ':'))
    fl.write(';\n')
    fl.close()

def write_globals(filename, zcode):
    print('...writing globals data:', filename)
    load_gameinfo()
    found = set()
    ls = []
    for glo in zcode.globals:
        if glo.name in found:
            # Annoyingly, WON-FLAG and LUCKY appear twice.
            # TODO: record two sourcelocs?
            continue
        found.add(glo.name)
        if glo.name not in globname_to_num:
            raise Exception('missing global ' + glo.name)
        dat = {
            'name': glo.name,
            'num': globname_to_num[glo.name],
            'sourceloc': sourceloc(tok=glo.gtok),
        }
        if glo.name in globname_to_vartype:
            dat['vartype'] = globname_to_vartype[glo.name]
        ls.append(dat)

    fl = open(filename, 'w')
    fl.write('window.gamedat_globals = ');
    json.dump(ls, fl)
    fl.write(';\n')
    fl.close()

def write_constants(filename, zcode):
    print('...writing constants data:', filename)
    ls = []
    for con in zcode.constants:
        dat = {
            'name': con.name,
            'value': con.value,
            'sourceloc': sourceloc(tok=con.ctok),
        }
        ls.append(dat)

    fl = open(filename, 'w')
    fl.write('window.gamedat_constants = ');
    json.dump(ls, fl, separators=(',', ':'))
    fl.write(';\n')
    fl.close()

def write_objects(filename, zcode, objdat):
    print('...writing object data:', filename)
    load_gameinfo()
    ls = []
    map = {}
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
            'propaddr': odump.propaddr,
            'origparent': odump.parent,
            'sourceloc': sourceloc(tok=obj.objtok),
        }
        if obj.type == 'ROOM':
            dat['isroom'] = True
        if 5 in odump.props:
            # "GLOBAL" property
            dat['scenery'] = odump.props[5]
        ls.append(dat)
        map[dat['onum']] = dat

    for (onum, dat) in map.items():
        scenls = dat.get('scenery')
        if scenls:
            for val in scenls:
                idat = map[val]
                if 'iscenery' not in idat:
                    idat['iscenery'] = []
                idat['iscenery'].append(onum)
    
    fl = open(filename, 'w')
    fl.write('window.gamedat_objects = ');
    json.dump(ls, fl, separators=(',', ':'))
    fl.write(';\n')
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
    fl.write(';\n')
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
    
