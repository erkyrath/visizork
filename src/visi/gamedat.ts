/* Typescript types and utilities for the game data.
   All of the window.gamedat_foo maps and lists are set up by
   gamedat.js (which is not this file!) 
*/

/* Convert a 16-bit Z-machine packed address into its true address value.
   For Z-machine version 3, this just means doubling it. (If we
   ever support more versions, we'll need to do more work.)
*/
export function unpack_address(val: number) : number
{
    return val * 2;
}

/* Return a 16-bit Z-machine value as a signed integer. */
export function signed_zvalue(val: number) : number
{
    return (val < 32768) ? val : (val - 65536);
}

// Sorry, this map is in a lot of places. Redundantly.
const sourcefile_key_map: any = {
    'ZORK1':    'A',
    '1ACTIONS': 'B',
    '1DUNGEON': 'C',
    'GCLOCK':   'D',
    'GGLOBALS': 'E',
    'GMACROS':  'F',
    'GMAIN':    'G',
    'GPARSER':  'H',
    'GSYNTAX':  'I',
    'GVERBS':   'J',
};

export type SourceLoc = {
    filekey: string;
    line: number;
    char: number;
    endline: number;
    endchar: number;
};

/* Return the initial sourceloc to display. */
export function sourceloc_start() : string
{
    return 'J:78:1:102:0';  // 'gverbs.zil', lines 78-101
}

/* Given a file key, return the sourceloc of its first line. */
export function sourceloc_for_key(filekey: string) : string
{
    return filekey + ':1:1:1:0';
}

/* Turn a location in "GVERBS-90" form into "J:90:1" form.
   (This format turns up in the commentary system.)
*/
export function sourceloc_for_srctoken(val: string) : string|undefined
{
    let pos = val.indexOf('-');
    if (pos < 0)
        return undefined;
    let filekey = sourcefile_key_map[val.slice(0, pos)];
    if (!filekey)
        return undefined;
    return filekey+':'+val.slice(pos+1)+':1';
}

/* Given a game symbol, return its source location in sourceloc form
   (like  "C:5:1:6:0").
*/
export function find_sourceloc_for_id(idtype: string, id:string) : string|undefined
{
    switch (idtype) {
    case 'OBJ':
        let obj = gamedat_object_names.get(id);
        if (obj)
            return obj.sourceloc;
        break;
    case 'RTN':
        let rtn = gamedat_routine_names.get(id);
        if (rtn)
            return rtn.sourceloc;
        break;
    case 'GLOB':
        let glob = gamedat_global_names.get(id);
        if (glob)
            return glob.sourceloc;
        break;
    case 'CONST':
        let con = gamedat_constant_names.get(id);
        if (con)
            return con.sourceloc;
        break;
    }

    return undefined;
}

/* Parse a sourceloc string like "C:5:1" or "C:5:1:6:0" into its component
   parts. */
export function parse_sourceloc(val: string) : SourceLoc|undefined
{
    if (!val.length)
        return undefined;

    let tup = val.split(':');
    if (tup.length < 3)
        return undefined;

    let filekey = tup[0];
    let line = parseInt(tup[1]);
    let char = parseInt(tup[2]);
    
    if (tup.length < 5) {
        return {
            filekey: filekey,
            line: line,
            char: char,
            endline: line,
            endchar: 99999
        };
    }
    
    let endline = parseInt(tup[3]);
    let endchar = parseInt(tup[4]);
    
    if (endchar == 0) {
        endline -= 1;
        endchar = 99999;
    }
    
    return {
        filekey: filekey,
        line: line,
        char: char,
        endline: endline,
        endchar: endchar
    };
}

/* Check if a commentary entry exists. If so, return back the arguments
   in "OBJ:SWORD" format. If not, don't.
*/
export function check_commentary(id: string, idtype: string) : string|undefined
{
    let res = idtype+':'+id;
    if (gamedat_commentary[res])
        return res;
    else
        return undefined;
}

interface SourceFileMap {
    [key: string]: string;
}

export const sourcefile_map: SourceFileMap = {
    A: 'zork1.zil',
    B: '1actions.zil',
    C: '1dungeon.zil',
    D: 'gclock.zil',
    E: 'gglobals.zil',
    F: 'gmacros.zil',
    G: 'gmain.zil',
    H: 'gparser.zil',
    I: 'gsyntax.zil',
    J: 'gverbs.zil',
};

export const sourcefile_list: [ string, string ][] = [
    ['zork1.zil',    'A'],
    ['1actions.zil', 'B'],
    ['1dungeon.zil', 'C'],
    ['gmain.zil',    'G'],
    ['gmacros.zil',  'F'],
    ['gglobals.zil', 'E'],
    ['gparser.zil',  'H'],
    ['gsyntax.zil',  'I'],
    ['gverbs.zil',   'J'],
    ['gclock.zil',   'D'],
];

export type AttributeData = {
    name: string;
    num: number;
};

export type PropertyData = {
    name: string;
    num: number;
    vartype?: string;
};

export type GlobalData = {
    name: string;
    num: number;
    vartype?: string;
    sourceloc: string;
};

export type ConstantData = {
    name: string;
    value: number;
    sourceloc: string;
};

export type ObjectData = {
    onum: number;
    name: string;
    isroom?: boolean;
    desc: string;
    propaddr: number;
    origparent: number;
    scenery?: number[];
    iscenery?: number[];
    sourceloc: string;
};

export type StringData = {
    text: string;
    sourceloc: string|string[];
};

export type DictWordData = {
    num: number;
    text: string;
    flags: string;
};

export type RoutineData = {
    name: string;
    addr: number;
    sourceloc: string;
};

interface DistanceMap {
    [key: number]: number;
};
interface AllDistanceMap {
    [key: number]: DistanceMap;
};

export type SourceSpan = string | [ string, string ];
export type SourceLine = SourceSpan[];

interface SourceLinesMap {
    [key: string]: SourceLine[];
};

export type CommentarySpan = string | string[];
export type CommentaryLine = number | string;

interface CommentaryMap {
    [key: string]: CommentarySpan[];
};
interface CommentaryLineMap {
    [key: string]: CommentaryLine[];
};

export const gamedat_ids = (window as any).gamedat_ids;

export const gamedat_property_nums = (window as any).gamedat_property_nums as Map<number, PropertyData>;
export const gamedat_attribute_nums = (window as any).gamedat_attribute_nums as Map<number, AttributeData>;
export const gamedat_global_nums = (window as any).gamedat_global_nums as Map<number, GlobalData>;
export const gamedat_global_names = (window as any).gamedat_global_names as Map<string, GlobalData>;
export const gamedat_globals_sort_index = (window as any).gamedat_globals_sort_index as GlobalData[];
export const gamedat_globals_sort_alpha = (window as any).gamedat_globals_sort_alpha as GlobalData[];
export const gamedat_constant_names = (window as any).gamedat_constant_names as Map<string, ConstantData>;
export const gamedat_object_ids = (window as any).gamedat_object_ids as Map<number, ObjectData>;
export const gamedat_object_names = (window as any).gamedat_object_names as Map<string, ObjectData>;
export const gamedat_object_room_ids = (window as any).gamedat_object_room_ids as Set<number>;
export const gamedat_object_global_ids = (window as any).gamedat_object_global_ids as Set<number>;
export const gamedat_object_treesort = (window as any).gamedat_object_treesort as Map<number, number>;
export const gamedat_string_map = (window as any).gamedat_string_map as Map<number, StringData>;
export const gamedat_dictword_addrs = (window as any).gamedat_dictword_addrs as Map<number, DictWordData>;
export const gamedat_dictword_adjs = (window as any).gamedat_dictword_adjs as Map<number, DictWordData>;
export const gamedat_routine_addrs = (window as any).gamedat_routine_addrs as Map<number, RoutineData>;
export const gamedat_routine_names = (window as any).gamedat_routine_names as Map<string, RoutineData>;
export const gamedat_verbs = (window as any).gamedat_verbs as string[];
export const gamedat_sourcefiles = (window as any).gamedat_sourcefiles as SourceLinesMap;
export const gamedat_distances = (window as any).gamedat_distances as AllDistanceMap;
export const gamedat_commentary = (window as any).gamedat_commentary as CommentaryMap;
export const gamedat_commentarymap = (window as any).gamedat_commentarymap as CommentaryLineMap;
