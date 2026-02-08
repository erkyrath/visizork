import React from 'react';
import { useState, useContext } from 'react';

import { zobj_properties } from '../visi/zstate';
import { signed_zvalue } from '../visi/gametypes';
import { gamedat_object_names, gamedat_routine_names, gamedat_global_names } from './gamedat';

import { ZilSourceLoc } from '../visi/main';
import { ReactCtx } from '../visi/context';

export function CombatTables()
{
    let rctx = useContext(ReactCtx);
    
    function evhan_click_id(ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) {
        ev.preventDefault();
        let dat: ZilSourceLoc = { id: id, commentary: true };
        window.dispatchEvent(new CustomEvent('zil-source-location', { detail:dat }));
    }

    return (
        <div className="ScrollContent">
            <p>
                The <a href="#" onClick={ (ev) => evhan_click_id(ev, 'GLOB:VILLAINS') }>villain table</a>{' '}
                describes the three enemies you can
                fight. (Although the cyclops does not follow regular
                combat rules, so his entries are never used.)
            </p>
            <p>
                The table shows what weapon the monster is weak again,
                the weakness penalty, the awakening probability (if it is
                unconscious), and the table of melee outcome messages. Also
                {' '}<code>STRENGTH</code>, which is really a property rather
                than a table entry, but I&#x2019;m including it here anyway.
            </p>
            <VillainTable evhan_click_id={ evhan_click_id } />
            <p>
                The <a href="#" onClick={ (ev) => evhan_click_id(ev, 'GLOB:DEF1') }>combat table</a>{' '}
                is used for all attacks, player and monster.
                Select a row based on the defender&#x2019;s combat strength and the
                attacker&#x2019;s <em>advantage</em> over the defender. That is,
                if the defender has strength 2 and the attacker has
                strength 3, use line
                &#x201C;2<span className="SlightlySpacySlash">/</span>D+1&#x201D;.
            </p>
            <p>
                (For the computation of combat strength, see
                {' '}<a href="#" onClick={ (ev) => evhan_click_id(ev, 'RTN:FIGHT-STRENGTH') }><code>FIGHT-STRENGTH</code></a>{' '}
                and
                {' '}<a href="#" onClick={ (ev) => evhan_click_id(ev, 'RTN:VILLAIN-STRENGTH') }><code>VILLAIN-STRENGTH</code></a>.)
            </p>
            <p>
                Then roll a nine-sided die.
                Outcomes (for the defender) are:
                miss,{' '}
                <span className="ComEntry_sta">staggered</span>,{' '}
                <span className="ComEntry_lig">light wound</span>,{' '}
                <span className="ComEntry_ser">serious wound</span>,{' '}
                <span className="ComEntry_unc">unconscious</span>,{' '}
                <span className="ComEntry_kil">killed</span>.
            </p>
            <HitTable />
            <p>
                If you are staggered, you have a 25% chance of being
                disarmed.
                If you are knocked out, your opponent gets 1-3
                free shots at you, and most of the results are
                &#x201C;killed&#x201D;. (The dungeon is unkind to
                the unconscious.)
            </p>
        </div>
    );
}

// Copied straight from the DEF tables
const table_def1 = [ ''   , ''   , ''   , ''   , 'sta', 'sta', 'unc', 'unc', 'kil', 'kil', 'kil', 'kil', 'kil' ];
const table_def2a = [ ''   , ''   , ''   , ''   , ''   , 'sta', 'sta', 'lig', 'lig', 'unc' ];
const table_def2b = [ ''   , ''   , ''   , 'sta', 'sta', 'lig', 'lig', 'lig', 'unc', 'kil', 'kil', 'kil' ];
const table_def3a = [ ''   , ''   , ''   , ''   , ''   , 'sta', 'sta', 'lig', 'lig', 'ser', 'ser' ];
const table_def3b = [ ''   , ''   , ''   , 'sta', 'sta', 'lig', 'lig', 'lig', 'ser', 'ser', 'ser' ];
const table_def3c = [ ''   , 'sta', 'sta', 'lig', 'lig', 'lig', 'lig', 'ser', 'ser', 'ser' ];

const table_def1_res = [
    table_def1.slice(0, 9),
    table_def1.slice(1, 10),
    table_def1.slice(2, 11)
];
const table_def2_res = [
    table_def2a.slice(0, 9),
    table_def2b.slice(0, 9),
    table_def2b.slice(1, 10),
    table_def2b.slice(2, 11)
];
const table_def3_res = [
    table_def3a.slice(0, 9),
    table_def3a.slice(1, 10),
    table_def3b.slice(0, 9),
    table_def3b.slice(1, 10),
    table_def3c.slice(0, 9)
];

export function HitTable()
{
    return (
        <table className="CombatHitTable">
            <tr>
                <th>roll:</th>
                <th>1</th>
                <th>2</th>
                <th>3</th>
                <th>4</th>
                <th>5</th>
                <th>6</th>
                <th>7</th>
                <th>8</th>
                <th>9</th>
            </tr>
            <HitTableLabel label="Defender strength 1" />
            <HitTableRow deflabel="1" label="+0" arr={ table_def1_res[0] } />
            <HitTableRow deflabel="1" label="+1" arr={ table_def1_res[1] } />
            <HitTableRow deflabel="1" label="+2" arr={ table_def1_res[2] } />
            <HitTableLabel label="Defender strength 2" />
            <HitTableRow deflabel="2" label="&#x2212;1" arr={ table_def2_res[0] } />
            <HitTableRow deflabel="2" label="+0" arr={ table_def2_res[1] } />
            <HitTableRow deflabel="2" label="+1" arr={ table_def2_res[2] } />
            <HitTableRow deflabel="2" label="+2" arr={ table_def2_res[3] } />
            <HitTableLabel label="Defender strength 3+" />
            <HitTableRow deflabel="3" label="&#x2212;2" arr={ table_def3_res[0] } />
            <HitTableRow deflabel="3" label="&#x2212;1" arr={ table_def3_res[1] } />
            <HitTableRow deflabel="3" label="+0" arr={ table_def3_res[2] } />
            <HitTableRow deflabel="3" label="+1" arr={ table_def3_res[3] } />
            <HitTableRow deflabel="3" label="+2" arr={ table_def3_res[4] } />
        </table>
    )
}

export function HitTableRow({ deflabel, label, arr }: { deflabel:string, label:string, arr:string[] })
{
    let index = 0;
    let ls = arr.map((val) => <td key={ index++ } className={ 'ComEntry_'+val }>{ val.toUpperCase() || '\xA0-\xA0' }</td>);
    
    return (
        <tr>
            <th>D{ label }</th>
            { ls }
        </tr>
    );
}

export function HitTableLabel({ label }: { label:string })
{
    return (
        <tr className="RowLabel">
            <td colSpan={ 10 }>{ label }</td>
        </tr>
    );
}

export function VillainTable({ evhan_click_id }: { evhan_click_id:(ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string)=>void })
{
    let rctx = useContext(ReactCtx);
    let zstate = rctx.zstate;

    let specifics = zstate.specifics as { awaken: number[] };

    let strength: { [key:number]: { orig:number, cur:number }} = {
        217: { orig: 2, cur: 0 },
        114: { orig: 5, cur: 0 },
        186: { orig: 10000, cur: 0 },
    };

    // TROLL, THIEF, CYCLOPS
    for (let onum of [ 217, 114, 186 ]) {
        let props = zobj_properties(zstate.proptable, onum);
        let origprops = zstate.origprops.get(onum);
        for (let prop of props) {
            if (prop.pnum == 7) {
                strength[onum].cur = prop.values[0]*256+prop.values[1];
                break;
            }
        }
    }

    return (
        <table className="CombatVillainTable">
            <tr>
                <th>Enemy</th>
                <td><a className="Src_Id" href="#" onClick={ (ev) => evhan_click_id(ev, 'OBJ:TROLL') }>TROLL</a></td>
                <td><a className="Src_Id" href="#" onClick={ (ev) => evhan_click_id(ev, 'OBJ:THIEF') }>THIEF</a></td>
                <td><a className="Src_Id" href="#" onClick={ (ev) => evhan_click_id(ev, 'OBJ:CYCLOPS') }>CYCLOPS</a></td>
            </tr>
            <tr>
                <th>Weakness</th>
                <td><a className="Src_Id" href="#" onClick={ (ev) => evhan_click_id(ev, 'OBJ:SWORD') }>SWORD</a></td>
                <td><a className="Src_Id" href="#" onClick={ (ev) => evhan_click_id(ev, 'OBJ:KNIFE') }>KNIFE</a></td>
                <td>nothing</td>
            </tr>
            <tr>
                <th>Penalty</th>
                <td>1</td>
                <td>1</td>
                <td>0</td>
            </tr>
            <tr>
                <th>Awaken</th>
                <td>
                    { (specifics.awaken[0] ? <span className="ChangedNote">*</span> : null) }
                    { specifics.awaken[0] }
                </td>
                <td>
                    { (specifics.awaken[1] ? <span className="ChangedNote">*</span> : null) }
                    { specifics.awaken[1] }
                </td>
                <td>
                    { (specifics.awaken[2] ? <span className="ChangedNote">*</span> : null) }
                    { specifics.awaken[2] }
                </td>
            </tr>
            <tr>
                <th>Message<br/>table</th>
                <td><a className="Src_Id" href="#" onClick={ (ev) => evhan_click_id(ev, 'GLOB:TROLL-MELEE') }>TROLL-<br/>MELEE</a></td>
                <td><a className="Src_Id" href="#" onClick={ (ev) => evhan_click_id(ev, 'GLOB:THIEF-MELEE') }>THIEF-<br/>MELEE</a></td>
                <td><a className="Src_Id" href="#" onClick={ (ev) => evhan_click_id(ev, 'GLOB:CYCLOPS-MELEE') }>CYCLOPS-<br/>MELEE</a></td>
            </tr>
            <tr>
                <th><code>STRENGTH</code></th>
                <td>
                    { ((strength[217].cur!=strength[217].orig) ? <span className="ChangedNote">*</span> : null) }
                    { signed_zvalue(strength[217].cur) }
                </td>
                <td>
                    { ((strength[114].cur!=strength[114].orig) ? <span className="ChangedNote">*</span> : null) }
                    { signed_zvalue(strength[114].cur) }
                </td>
                <td>
                    { ((strength[186].cur!=strength[186].orig) ? <span className="ChangedNote">*</span> : null) }
                    { signed_zvalue(strength[186].cur) }
                </td>
            </tr>
        </table>
    );
}
    
