/* Typescript type definitions used by the Gnusto engine report.

   Gnusto is not itself written in Typescript, so nothing validates its
   report format. But it's a pretty simple format.
*/

import { gamedat_object_ids, gamedat_ids, unpack_address } from './gamedat';
import { gamedat_routine_names, gamedat_global_names, gamedat_string_map } from './gamedat';

/* Highly abbreviated typedef for GnustoRunner. This shows only the
   bits used by VisiZorkApp. */
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

/* Extract the source location for the first string printed in a
   calltree.
*/
export function sourceloc_for_first_text(item: ZStackItem) : string|undefined
{
    if (item.type == 'print') {
        let obj = gamedat_string_map.get(item.addr);
        if (obj) {
            if (typeof obj.sourceloc === 'string')
                return obj.sourceloc;
            else
                return obj.sourceloc[0];
        }
        return undefined;
    }

    if (item.type == 'call') {
        for (let child of item.children) {
            let res = sourceloc_for_first_text(child);
            if (res !== undefined)
                return res;
        }
        return undefined;
    }
}

export type ZProp = {
    pnum: number;
    values: number[];
};

/* Parse a property-table slice into a list of object properties. */
export function zobj_properties(proptable: Uint8Array, onum: number): ZProp[]
{
    let res: ZProp[] = [];

    let obj = gamedat_object_ids.get(onum);
    if (!obj)
        return res;

    let pos = obj.propaddr - gamedat_ids.PROP_TABLE_START;
    if (pos < 0)
        return res;

    let val = proptable[pos];
    pos += (1 + 2*val);
    while (true) {
        val = proptable[pos];
        if (!val)
            break;
        let len = (val >> 5) + 1;
        let pnum = (val & 0x1F);
        let prop = {
            pnum: pnum,
            values: [ ...proptable.slice(pos+1, pos+1+len) ]
        };
        res.push(prop);
        pos += (1+len);
    }

    res.reverse();
    return res;
}

/* Gnusto generates a ZState report, but we want to keep track of more
   information than that. This extended type has the extra info.
*/
export interface ZStatePlus extends ZState
{
    // Global values from when the game first started.
    origglobals: number[];
    // Property values from when the game first started.
    origprops: Map<number, ZProp[]>;
    // Attribute values from when the game first started.
    origattrs: Map<number, number>;
    // The counter value when each global last changed.
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

/* Get the ZState report from the engine, and then beef it up with extra
   information.
   
   On the first turn, this caches the original values of globs/props/attrs.
   We'll use those cached values for later reports.

   We also keep the previous turn's globals, so that we can do the
   "when did each global last change?" check.
*/
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
            let res = zobj_properties(report.proptable, obj.onum);
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

/* A terrible hack: dig into the VM and overwrite the I-LANTERN timer
   entry with 5000!
*/
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
    // Activity tab looking bare. Sorry! You want new batteries, you
    // gotta put up with some jank.
    
    engine.reset_vm_report();
    window.dispatchEvent(new Event('zmachine-update'));
}
