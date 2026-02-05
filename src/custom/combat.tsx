import React from 'react';
import { useState, useContext } from 'react';

import { gamedat_object_names, gamedat_routine_names } from '../custom/gamedat';

import { ReactCtx } from '../visi/context';

export function CombatTables()
{
    return (
        <div className="ScrollContent">
            <VillainTable />
            <p>
                The combat table is used for all attacks, player and monster.
                Select a row based on the defender's strength and the
                attacker's <em>advantage</em> over the defender. That is,
                if the defender has strength 2 and the attacker has
                strength 3, use line
                2<span className="SlightlySpacySlash">/</span>D+1.
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

export function VillainTable()
{
    let rctx = useContext(ReactCtx);

    function evhan_click_id(ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) {
        ev.preventDefault();
        let obj = gamedat_object_names.get(id);
        if (obj) {
            rctx.setLoc(obj.sourceloc, false);
            return
        }
    }

    return (
        <table className="CombatVillainTable">
            <tr>
                <th>Enemy</th>
                <td><a className="Src_Id" href="#" onClick={ (ev) => evhan_click_id(ev, 'TROLL') }>TROLL</a></td>
                <td><a className="Src_Id" href="#" onClick={ (ev) => evhan_click_id(ev, 'THIEF') }>THIEF</a></td>
                <td><a className="Src_Id" href="#" onClick={ (ev) => evhan_click_id(ev, 'CYCLOPS') }>CYCLOPS</a></td>
            </tr>
            <tr>
                <th>Weakness</th>
                <td>SWORD</td>
                <td>KNIFE</td>
                <td>nothing</td>
            </tr>
            <tr>
                <th>Weaken</th>
                <td>1</td>
                <td>1</td>
                <td>0</td>
            </tr>
            <tr>
                <th>Awaken</th>
                <td>0</td>
                <td>0</td>
                <td>0</td>
            </tr>
            <tr>
                <th>Melee<br/>routine</th>
                <td>TROLL-<br/>MELEE</td>
                <td>THIEF-<br/>MELEE</td>
                <td>CYCLOPS-<br/>MELEE</td>
            </tr>
            <tr>
                <th><code>STRENGTH</code></th>
                <td>-</td>
                <td>-</td>
                <td>-</td>
            </tr>
        </table>
    );
}
    
