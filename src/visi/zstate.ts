import { gamedat_object_ids, gamedat_ids, unpack_address } from './gamedat';
import { gamedat_routine_names, gamedat_global_names } from './gamedat';

/* Highly abbreviated typedef for GnustoRunner. This shows only the
   bit used by VisiZorkApp. */
export type GnustoRunner = {
    e: GnustoEngine;
    commentary: CommentaryClass;
};

/* Highly abbreviated typedef for GnustoEngine. */
export type GnustoEngine = {
    getUnsignedWord: (address:number) => number;
    setWord: (value:number, address:number) => void;
    
    prepare_vm_report: (dat:any) => void;
    reset_vm_report: () => void;
    get_vm_report: () => ZState;
};

/* And for the Commentary module. */
export type CommentaryClass = {
    show: (node:Node|undefined, topic:string|undefined) => void;
    hide: () => void;
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
    timertable: Uint8Array;
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
    globalsupdate: number[];
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
        timertable: new Uint8Array(),

        origglobals: [],
        origprops: new Map(),
        origattrs: new Map(),
        globalsupdate: [],
    };
}

// These are initialized on the first get_updated_report() call,
// so they represent the game-start situation.
let origglobals: number[] | undefined;
let origprops: Map<number, ZProp[]> | undefined;
let origattrs: Map<number, number> | undefined;

// This represents the previous turn.
let lastglobals: number[] | undefined;

// The update timestamp (counter) when each global last changed.
// (Comparing lastglobals to the current globals.)
let globalsupdate: number[] | undefined;

export function get_updated_report(engine: GnustoEngine) : ZStatePlus
{
    let report = engine.get_vm_report();

    if (origglobals === undefined) {
        origglobals = report.globals;
    }
    
    if (globalsupdate === undefined || lastglobals === undefined) {
        globalsupdate = report.globals.map((val) => report.counter);
    }
    else {
        let ix = 0;
        while (ix < report.globals.length) {
            if (lastglobals[ix] != report.globals[ix])
                globalsupdate[ix] = report.counter;
            ix++;
        }
    }

    lastglobals = report.globals;
    
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
        origattrs: origattrs,
        globalsupdate: globalsupdate
    };
}

export function refresh_batteries(engine: GnustoEngine)
{
    // This should be the same as the last report we got this turn.
    let report = engine.get_vm_report();

    // Locate the timer entry for I-LANTERN.
    let I_LANTERN = gamedat_routine_names.get('I-LANTERN');
    if (!I_LANTERN)
        return;

    let C_TABLE = gamedat_global_names.get('C-TABLE');
    if (!C_TABLE)
        return;

    let C_INTS = gamedat_global_names.get('C-INTS');
    if (!C_INTS)
        return;

    let pos = report.globals[C_INTS.num];
    let countpos = 0;
    while (pos+6 < report.timertable.length) {
        let addr = report.timertable[pos+4] * 0x100 + report.timertable[pos+5];
        if (unpack_address(addr) == I_LANTERN.addr) {
            let ctableaddr = report.globals[C_TABLE.num];
            countpos = ctableaddr+pos+2;
            break;
        }
        pos += 6;
    }

    if (!countpos) {
        console.log('BUG: could not find I-LANTERN timer');
        return;
    }

    engine.setWord(5000, countpos);

    // But now we have to trigger the generation of a new report,
    // so that the Timers UI updates. This is a hack; it leaves the
    // Activity tab looking bare. Sorry!
    
    engine.reset_vm_report();
    window.dispatchEvent(new Event('zmachine-update'));
}
