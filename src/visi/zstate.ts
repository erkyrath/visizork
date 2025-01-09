import { gamedat_object_ids, gamedat_ids } from './gamedat';

/* Highly abbreviated typedef for GnustoRunner. This shows only the
   bit used by VisiZorkApp. */
export type GnustoRunner = {
    e: GnustoEngine;
    commentary: any; //###
};

/* Highly abbreviated typedef for GnustoEngine. */
export type GnustoEngine = {
    prepare_vm_report: (dat:any) => void;
    get_vm_report: () => ZState;
};

export type ZObject = {
    onum: number;
    parent: number;
    child: number;
    sibling: number;
    attrs: number;
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
    counter: number;
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

    res.reverse();
    return res;
}

export interface ZStatePlus extends ZState
{
    origglobals: number[];
    origprops: Map<number, ZProp[]>;
    origattrs: Map<number, number>;
}

export function zstateplus_empty() : ZStatePlus
{
    return {
        counter: -1,
        globtableaddr: 0,
        objtableaddr: 0,
        globals: [],
        objects: [],
        strings: [],
        calltree: { type:'call', addr:0, children:[] },
        proptable: new Uint8Array(),

        origglobals: [],
        origprops: new Map(),
        origattrs: new Map(),
    };
}

// These are initialized on the first get_updated_report() call,
// so they represent the game-start situation.
let origglobals: number[] | undefined;
let origprops: Map<number, ZProp[]> | undefined;
let origattrs: Map<number, number> | undefined;

export function get_updated_report(engine: GnustoEngine) : ZStatePlus
{
    let report = engine.get_vm_report();

    if (origglobals === undefined) {
        origglobals = report.globals;
    }

    if (origprops === undefined) {
        origprops = new Map();
        for (let obj of report.objects) {
            let res = zobj_properties(report, obj.onum);
            origprops.set(obj.onum, res);
        }
    }

    if (origattrs === undefined) {
        origattrs = new Map();
        for (let obj of report.objects) {
            origattrs.set(obj.onum, obj.attrs);
        }
    }

    return {
        ...report,
        origglobals: origglobals,
        origprops: origprops,
        origattrs: origattrs
    };
}

