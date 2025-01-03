
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
};

export type ZStackPrint = {
    type: 'print';
    addr: number;
};

export type ZStackItem = ZStackCall | ZStackPrint;

export type ZState = {
    globals: number[];
    objects: ZObject[];
    strings: number[];
    calltree: ZStackItem;
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
