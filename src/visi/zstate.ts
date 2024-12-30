
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
    objects: ZObject[];
    strings: number[];
    calltree: ZFuncCall;
};

export function zstate_empty() : ZState
{
    return {
        objects: [],
        strings: [],
        calltree: { type:'call', addr:0, children:[] },
    };
}
