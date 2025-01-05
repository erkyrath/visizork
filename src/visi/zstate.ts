
export type ZObject = {
    onum: number;
    parent: number;
    child: number;
    sibling: number;
};

export type ZStackCall = {
    type: 'call';
    addr: number;
    children: ZStackItem[];
    hasprint?: boolean;
};

export type ZStackPrint = {
    type: 'print';
    addr: number;
};

export type ZStackItem = ZStackCall | ZStackPrint;

export type ZState = {
    globtableaddr: number;
    objtableaddr: number;
    globals: number[];
    objects: ZObject[];
    strings: number[];
    calltree: ZStackItem;
};

export function zstate_empty() : ZState
{
    return {
        globtableaddr: 0,
        objtableaddr: 0,
        globals: [],
        objects: [],
        strings: [],
        calltree: { type:'call', addr:0, children:[] },
    };
}
