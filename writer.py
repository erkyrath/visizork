import json

num_to_objname = {
    1: 'HANDS',
    2: 'ZORKMID',
    3: 'PATHOBJ',
    4: 'ADVENTURER',
    5: 'ME',
    6: 'LUNGS',
    7: 'GRUE',
    8: 'GROUND',
    9: 'SAILOR',
    10: 'BLESSINGS',
    11: 'NOT-HERE-OBJECT',
    12: 'IT',
    13: 'PSEUDO-OBJECT',
    14: 'INTNUM',
    15: 'SLIDE-ROOM',
    16: '',
    17: '',
    18: '',
    19: '',
    20: 'LADDER-BOTTOM',
    21: 'LADDER-TOP',
    22: 'SMELLY-ROOM',
    23: 'SQUEEKY-ROOM',
    24: 'MINE-ENTRANCE',
    25: 'CANYON-VIEW',
    26: 'CLIFF-MIDDLE',
    27: 'CANYON-BOTTOM',
    28: 'ON-RAINBOW',
    29: 'ARAGAIN-FALLS',
    30: 'SHORE',
    31: '',
    32: '',
    33: '',
    34: '',
    35: '',
    36: '',
    37: 'CHASM-ROOM',
    38: 'NS-PASSAGE',
    39: 'DAMP-CAVE',
    40: 'DEEP-CANYON',
    41: 'EW-PASSAGE',
    42: 'TWISTING-PASSAGE',
    43: 'WINDING-PASSAGE',
    44: 'NARROW-PASSAGE',
    45: 'COLD-PASSAGE',
    46: '',
    47: '',
    48: 'IN-STREAM',
    49: 'STREAM-VIEW',
    50: 'RESERVOIR-SOUTH',
    51: 'STRANGE-PASSAGE',
    52: '',
    53: '',
    54: '',
    55: '',
    56: '',
    57: 'GRATING-ROOM',
    58: '',
    59: '',
    60: '',
    61: '',
    62: '',
    63: '',
    64: '',
    65: '',
    66: '',
    67: '',
    68: '',
    69: '',
    70: '',
    71: 'EAST-OF-CHASM',
    72: 'CELLAR',
    73: 'STAIRS',
    74: '',
    75: 'PATH',
    76: '',
    77: '',
    78: '',
    79: 'EAST-OF-HOUSE',
    80: 'SOUTH-OF-HOUSE',
    81: 'NORTH-OF-HOUSE',
    82: 'ROOMS',
    83: 'BROKEN-CANARY',
    84: 'CANARY',
    85: 'BAUBLE',
    86: 'BROKEN-EGG',
    87: 'EGG',
    88: 'UP-A-TREE',
    89: 'NEST',
    90: 'CONTROL-PANEL',
    91: 'WRENCH',
    92: 'WHITE-CLIFF',
    93: 'CLIMBABLE-CLIFF',
    94: 'STUDIO',
    95: 'OWNERS-MANUAL',
    96: 'ENGRAVINGS-CAVE',
    97: 'ENGRAVINGS',
    98: 'PUTTY',
    99: 'TUBE',
    100: 'RESERVOIR',
    101: 'TRUNK',
    102: 'TROLL-ROOM',
    103: 'GUIDE',
    104: 'TORCH',
    105: 'TORCH-ROOM',
    106: 'PEDESTAL',
    107: 'ROUND-ROOM',
    108: 'BOAT-LABEL',
    109: 'MAP',
    110: 'SWORD',
    111: 'WOODEN-DOOR',
    112: 'MACHINE-SWITCH',
    113: 'STILETTO',
    114: 'THIEF',
    115: 'LARGE-BAG',
    116: 'SCARAB',
    117: 'LADDER',
    118: '',
    119: 'COAL',
    120: 'SANDY-BEACH',
    121: 'SHOVEL',
    122: 'KEYS',
    123: 'SCREWDRIVER',
    124: 'GAS-ROOM',
    125: 'BRACELET',
    126: 'SANDY-CAVE',
    127: 'SAND',
    128: 'RUSTY-KNIFE',
    129: 'ROPE',
    130: '',
    131: 'RIVER',
    132: 'RAINBOW',
    133: 'DOME-ROOM',
    134: 'RAILING',
    135: 'PRAYER',
    136: 'END-OF-RAINBOW',
    137: 'POT-OF-GOLD',
    138: 'LOUD-ROOM',
    139: 'BAR',
    140: 'DAM-BASE',
    141: 'INFLATABLE-BOAT',
    142: 'PUNCTURED-BOAT',
    143: 'GRATING-CLEARING',
    144: 'LEAVES',
    145: 'BODIES',
    146: 'GUNK',
    147: 'CANDLES',
    148: 'GALLERY',
    149: 'PAINTING',
    150: '',
    151: '',
    152: '',
    153: '',
    154: 'DAM-LOBBY',
    155: 'MATCH',
    156: 'INFLATED-BOAT',
    157: 'MACHINE-ROOM',
    158: 'MACHINE',
    159: 'LEAK',
    160: 'MAILBOX',
    161: 'ADVERTISEMENT',
    162: 'BUOY',
    163: 'EMERALD',
    164: 'LAMP',
    165: 'BAG-OF-COINS',
    166: 'BURNED-OUT-LANTERN',
    167: 'MAZE-5',
    168: 'BONES',
    169: 'KNIFE',
    170: 'JADE',
    171: 'DIAMOND',
    172: 'RESERVOIR-NORTH',
    173: 'PUMP',
    174: 'GRATE',
    175: 'EGYPT-ROOM',
    176: 'CRACK',
    177: 'BARROW',
    178: 'STONE-BARROW',
    179: 'BARROW-DOOR',
    180: 'WEST-OF-HOUSE',
    181: 'FRONT-DOOR',
    182: 'BOARDED-WINDOW',
    183: 'TRAP-DOOR',
    184: 'DAM',
    185: 'CYCLOPS-ROOM',
    186: 'CYCLOPS',
    187: 'ATLANTIS-ROOM',
    188: 'TRIDENT',
    189: 'GARLIC',
    190: 'TREASURE-ROOM',
    191: 'CHALICE',
    192: 'RUG',
    193: 'LIVING-ROOM',
    194: 'TROPHY-CASE',
    195: 'BLUE-BUTTON',
    196: 'RED-BUTTON',
    197: 'BROWN-BUTTON',
    198: 'YELLOW-BUTTON',
    199: 'MAINTENANCE-ROOM',
    200: 'TOOL-CHEST',
    201: 'ATTIC',
    202: 'ATTIC-TABLE',
    203: 'KITCHEN',
    204: 'KITCHEN-TABLE',
    205: 'SLIDE',
    206: 'TIMBER-ROOM',
    207: 'TIMBERS',
    208: 'COFFIN',
    209: 'SCEPTRE',
    210: 'BROKEN-LAMP',
    211: 'BOOK',
    212: 'SOUTH-TEMPLE',
    213: 'ALTAR',
    214: 'BUBBLE',
    215: 'DAM-ROOM',
    216: 'BOLT',
    217: 'TROLL',
    218: 'AXE',
    219: 'HOT-BELL',
    220: 'NORTH-TEMPLE',
    221: 'BELL',
    222: 'BAT-ROOM',
    223: 'BAT',
    224: 'SANDWICH-BAG',
    225: 'LUNCH',
    226: 'SHAFT-ROOM',
    227: 'RAISED-BASKET',
    228: 'LOWER-SHAFT',
    229: 'LOWERED-BASKET',
    230: 'LAND-OF-LIVING-DEAD',
    231: 'SKULL',
    232: 'ENTRANCE-TO-HADES',
    233: 'GHOSTS',
    234: 'CHIMNEY',
    235: 'KITCHEN-WINDOW',
    236: 'BOTTLE',
    237: 'WATER',
    238: 'GLOBAL-WATER',
    239: '',
    240: 'MOUNTAIN-RANGE',
    241: 'TREE',
    242: 'FOREST',
    243: 'WHITE-HOUSE',
    244: 'SONGBIRD',
    245: 'GRANITE-WALL',
    246: 'WALL',
    247: 'GLOBAL-OBJECTS',
    248: 'TEETH',
    249: 'LOCAL-GLOBALS',
    250: 'BOARD',
}

objname_to_num = dict([ (val, key) for (key, val) in num_to_objname.items() ])

def sourceloc(tup):
    file, line, char = tup
    return { 'file':file, 'line':line, 'char':char }



def write_objects(filename, zcode):
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

