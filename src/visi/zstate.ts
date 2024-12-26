
export type ZObject = {
    onum: number;
    parent: number;
    child: number;
    sibling: number;
}

export type ZState = {
    objects: ZObject[];
    strings: number[];
};

export function zstate_empty() : ZState
{
    return {
        objects: [],
        strings: [],
    };
}
