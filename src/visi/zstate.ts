import { gamedat_object_ids, gamedat_ids } from './gamedat';

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
    proptable: Uint8Array;
};

export type ZProp = {
    pnum: number;
    values: number[];
};

export function zobj_properties(zstate: ZState, onum: number): ZProp[]
{
    let res: ZProp[] = [];

    let obj = gamedat_object_ids.get(onum);
    if (!obj)
        return res;

    let pos = obj.propaddr - gamedat_ids.PROP_TABLE_START;
    if (pos < 0)
        return res;

    let val = zstate.proptable[pos];
    pos += (1 + 2*val);
    while (true) {
        val = zstate.proptable[pos];
        if (!val)
            break;
        let len = (val >> 5) + 1;
        let pnum = (val & 0x1F);
        let prop = {
            pnum: pnum,
            values: [ ...zstate.proptable.slice(pos+1, pos+1+len) ]
        };
        res.push(prop);
        pos += (1+len);
    }

    return res;
}

export function zstate_empty() : ZState
{
    return {
        globtableaddr: 0,
        objtableaddr: 0,
        globals: [],
        objects: [],
        strings: [],
        calltree: { type:'call', addr:0, children:[] },
        proptable: new Uint8Array(),
    };
}
