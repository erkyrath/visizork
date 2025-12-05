#!/usr/bin/env python3

import sys
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
    
svgnod = doc.childNodes[1]
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

outfl = open('css/map.svg', 'w')
doc.writexml(outfl)
outfl.close()
