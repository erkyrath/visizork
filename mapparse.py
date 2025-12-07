#!/usr/bin/env python3

import sys
import json
from xml.dom.minidom import parse, Node

fontcss = '''
@font-face {
    font-family: "Lato";
    font-style: normal;
    src: url("../font/Lato-Regular.ttf") format("truetype");
}
@font-face {
    font-family: "Lato";
    font-style: italic;
    src: url("../font/Lato-Italic.ttf") format("truetype");
}
@font-face {
    font-family: "Lato";
    font-style: normal;
    font-weight: bold;
    src: url("../font/Lato-Bold.ttf") format("truetype");
}
@font-face {
    font-family: "Lato";
    font-style: italic;
    font-weight: bold;
    src: url("../font/Lato-BoldItalic.ttf") format("truetype");
}
@font-face {
    font-family: "Courier Prime";
    font-style: normal;
    src: url("../font/CourierPrime-Regular.ttf") format("truetype");
}
@font-face {
    font-family: "Courier Prime";
    font-style: normal;
    font-weight: bold;
    src: url("../font/CourierPrime-Bold.ttf") format("truetype");
}
'''

class Room:
    def __init__(self, nod):
        val = nod.getAttribute('id')
        assert val.startswith('r-')
        self.name = val[ 2 : ].upper()
        self.xpos = float(nod.getAttribute('x'))
        self.ypos = float(nod.getAttribute('y'))
        self.width = float(nod.getAttribute('width'))
        self.height = float(nod.getAttribute('height'))
    def __repr__(self):
        return '<Room "%s">' % (self.name,)
    def tojson(self):
        return {
            'name': self.name,
            'x': self.xpos,
            'y': self.ypos,
            'width': self.width,
            'height': self.height,
        }

doc = parse('gamedat/zork1-map.svg')

def remove_children(nod, func):
    ls = nod.childNodes
    ix = 0
    while ix < len(ls):
        if func(ls[ix]):
            del ls[ix]
        else:
            ix += 1

def iterate(nod, func):
    if nod.nodeType == Node.ELEMENT_NODE:
        res = func(nod)
        if res:
            return res
    for subnod in nod.childNodes:
        res = iterate(subnod, func)
        if res:
            return res

def find_by_id(nod, val):
    nod = iterate(doc, lambda nod: (nod if nod.getAttribute('id')==val else None))
    return nod
        
def clean_sodi(nod):
    keys = list(nod.attributes.keys())
    for key in keys:
        if key.startswith('sodipodi:') or key.startswith('inkscape:'):
            del nod.attributes[key]

def clean_all_styles(nod):
    if nod.attributes and 'style' in nod.attributes:
        del nod.attributes['style']

def clean_textnode_styles(nod):
    if nod.nodeName == 'tspan':
        clean_all_styles(nod)
    if nod.nodeName == 'text':
        if 'style' in nod.attributes:
            prop = nod.getAttribute('style')
            ls = prop.split(';')
            newls = []
            for val in ls:
                if val.startswith('-inkscape'):
                    continue
                if val.startswith('stroke-'):
                    continue
                if val.startswith('font-variant'):
                    continue
                if val.startswith('text-decoration'):
                    continue
                if val.endswith('-spacing:normal'):
                    continue
                if val in ('text-transform:none', 'dominant-baseline:auto', 'baseline-shift:baseline', 'text-orientation:mixed', 'text-indent:0', 'vector-effect:none', 'font-feature-settings:normal', 'font-variation-settings:normal', 'font-stretch:normal', 'paint-order:stroke fill markers', 'stop-color:#000000', 'stop-opacity:1'):
                    continue
                newls.append(val)
            nod.setAttribute('style', ';'.join(newls))

def clear_connnode_styles(nod):
    if nod.nodeName == 'path':
        if 'style' in nod.attributes:
            prop = nod.getAttribute('style')
            ls = prop.split(';')
            newls = []
            for val in ls:
                if val.startswith('-inkscape'):
                    continue
                if val.startswith('font-'):
                    continue
                if val in ('stroke-dasharray:none', 'stroke-dashoffset:0', 'vector-effect:none', 'fill-opacity:1', 'opacity:1'):
                    continue
                newls.append(val)
            nod.setAttribute('style', ';'.join(newls))
    
            
svgnod = doc.childNodes[1]
docsize = (int(svgnod.getAttribute('width')), int(svgnod.getAttribute('height')))
viewbox = svgnod.getAttribute('viewBox')
viewbox = [ float(val) for val in viewbox.split(' ') ]

remove_children(svgnod, lambda nod: nod.nodeType == Node.ELEMENT_NODE and nod.getAttribute('id')=='sketchlayer')
remove_children(svgnod, lambda nod: nod.prefix=='sodipodi')

for nod in svgnod.childNodes:
    if nod.nodeType == Node.ELEMENT_NODE and nod.tagName == 'style':
        subnod = nod.childNodes[0]
        subnod.data += fontcss
    
iterate(doc, clean_sodi)

roomlayer = find_by_id(doc, 'roomlayer')
for nod in roomlayer.childNodes:
    clean_all_styles(nod)

labellayer = find_by_id(doc, 'labellayer')
iterate(labellayer, clean_textnode_styles)

connlayer = find_by_id(doc, 'connlayer')
for nod in connlayer.childNodes:
    clear_connnode_styles(nod)

roomlist = []
            
for nod in roomlayer.childNodes:
    if nod.nodeName == 'rect':
        room = Room(nod)
        roomlist.append(room)
roomlist.sort(key=lambda room:room.name)
        
outfl = open('css/map.svg', 'w')
doc.writexml(outfl)
outfl.close()

assert(viewbox[0] == 0)
assert(viewbox[1] == 0)
obj = {
    'docsize': { 'w': docsize[0], 'h': docsize[1] },
    'viewsize': { 'w': viewbox[2], 'h': viewbox[3] },
}
obj['rooms'] = [ room.tojson() for room in roomlist ]

outfl = open('src/game/mapinfo.js', 'w')
outfl.write('window.gamedat_mapinfo = ')
json.dump(obj, outfl, separators=(',', ':'))
outfl.write(';\n')
outfl.close()

fl = open('src/game/objects.js')
dat = fl.read()
fl.close()

dat = dat[ dat.find('[') : ]
dat = dat[ : dat.rfind(']')+1 ]
objinfo = json.loads(dat)
orooms = [ val['name'] for val in objinfo if 'isroom' in val ]

roomnames = [ room.name for room in roomlist ]

diff = set(roomnames) - set(orooms)
if diff:
    print('Wrong:', diff)
diff = set(orooms) - set(roomnames)
if diff:
    print('Missing:', diff)

