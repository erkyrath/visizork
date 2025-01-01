
export type ZObject = {
    onum: number;
    parent: number;
    child: number;
    sibling: number;
};

export type ZFuncCall = {
    type: 'call';
    addr: number;
    children: ZFuncCall[];
};

export type ZState = {
    globals: number[];
    objects: ZObject[];
    strings: number[];
    calltree: ZFuncCall;
};

export function zstate_empty() : ZState
{
    return {
        globals: [],
        objects: [],
        strings: [],
        calltree: { type:'call', addr:0, children:[] },
    };
}
