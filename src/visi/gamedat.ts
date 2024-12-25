
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
export type RoomIdSet = Set<number>;

export const ROOM_HOLDER = (window as any).ROOM_HOLDER as number;
