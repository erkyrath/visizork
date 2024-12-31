
export type SourceLoc = {
    filekey: string;
    line: number;
    char: number;
    endline: number;
    endchar: number;
};

export function sourceloc_start() : string
{
    return 'J:78:1';  // { file:'gverbs.zil', line: 78, char: 1 }
}

export function sourceloc_for_key(filekey: string) : string
{
    return filekey + ':1:1:1:0';
}

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

export type ObjectData = {
    onum: number;
    name: string;
    isroom?: boolean;
    desc: string;
    origparent: number;
    scenery?: number[];
    sourceloc: string;
};

export type StringData = {
    text: string;
    sourceloc: string|string[];
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

interface SourceLinesMap {
    [key: string]: string[];
};

export const gamedat_ids = (window as any).gamedat_ids;

export const gamedat_object_ids = (window as any).gamedat_object_ids as Map<number, ObjectData>;
export const gamedat_object_names = (window as any).gamedat_object_ids as Map<string, ObjectData>;
export const gamedat_object_room_ids = (window as any).gamedat_object_room_ids as Set<number>;
export const gamedat_object_global_ids = (window as any).gamedat_object_global_ids as Set<number>;
export const gamedat_object_treesort = (window as any).gamedat_object_treesort as Map<number, number>;
export const gamedat_string_map = (window as any).gamedat_string_map as Map<number, StringData>;
export const gamedat_routine_map = (window as any).gamedat_routine_map as Map<number, RoutineData>;
export const gamedat_sourcefiles = (window as any).gamedat_sourcefiles as SourceLinesMap;
export const gamedat_distances = (window as any).gamedat_distances as AllDistanceMap;
