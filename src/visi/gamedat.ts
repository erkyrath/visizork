
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

export const gamedat_object_ids = (window as any).gamedat_object_ids as Map<number, ObjectData>;
export const gamedat_object_names = (window as any).gamedat_object_ids as Map<string, ObjectData>;
export const gamedat_object_room_ids = (window as any).gamedat_object_room_ids as Set<number>;
