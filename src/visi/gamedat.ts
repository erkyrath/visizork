
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
    sourceloc: SourceLoc;
};

export type ObjectDataIdMap = Map<number, ObjectData>;
export type ObjectDataNameMap = Map<string, ObjectData>;
export type RoomIdSet = Set<number>;

export const ROOM_HOLDER = (window as any).ROOM_HOLDER as number;

export const gamedat_object_ids = (window as any).gamedat_object_ids as ObjectDataIdMap;
export const gamedat_object_names = (window as any).gamedat_object_ids as ObjectDataNameMap;
export const gamedat_object_room_ids = (window as any).gamedat_object_room_ids as RoomIdSet;
