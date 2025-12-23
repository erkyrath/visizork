import { gamedat_routine_names, gamedat_global_names, gamedat_string_map, unpack_address } from './gamedat';
import { GnustoEngine } from '../visi/zstate';

export function show_commentary_hook(topic: string, engine: GnustoEngine)
{
    if (topic == 'BATTERIES') {
        refresh_batteries(engine);
    }
}

/* A terrible hack: dig into the VM and overwrite the I-LANTERN timer
   entry with 5000!
*/
function refresh_batteries(engine: GnustoEngine)
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
