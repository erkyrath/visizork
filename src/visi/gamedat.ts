
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
