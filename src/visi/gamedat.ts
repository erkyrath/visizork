
export type SourceLoc = {
    file: string;
    line: number;
    char: number;
};

export type ObjectData = {
    onum: number;
    name: string;
    isroom?: boolean;
    desc: string;
    origparent: number;
    scenery?: number[];
    sourceloc: SourceLoc;
};

export const ROOM_HOLDER = (window as any).ROOM_HOLDER as number;
export const GLOBAL_OBJECTS = 247; //###
export const LOCAL_GLOBALS = 249; //###
export const PSEUDO_OBJECT = 13; //###

export const gamedat_object_ids = (window as any).gamedat_object_ids as Map<number, ObjectData>;
export const gamedat_object_names = (window as any).gamedat_object_ids as Map<string, ObjectData>;
export const gamedat_object_room_ids = (window as any).gamedat_object_room_ids as Set<number>;
export const gamedat_object_global_ids = (window as any).gamedat_object_global_ids as Set<number>;
export const gamedat_object_treesort = (window as any).gamedat_object_treesort as Map<number, number>;
export const gamedat_distances = (window as any).gamedat_distances;
