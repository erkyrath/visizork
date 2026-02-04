import React from 'react';

export function CombatTables()
{
    return (
        <div className="ScrollContent">
            <p>
                Outcomes: staggered, light wound, serious wound, unconscious, killed.
            </p>
            <HitTable />
        </div>
    );
}

// Copied straight from the DEF tables
const table_def1 = [ '---', '---', '---', '---', 'sta', 'sta', 'unc', 'unc', 'kil', 'kil', 'kil', 'kil', 'kil' ];
const table_def2a = [ '---', '---', '---', '---', '---', 'sta', 'sta', 'lig', 'lig', 'unc' ];
const table_def2b = [ '---', '---', '---', 'sta', 'sta', 'lig', 'lig', 'lig', 'unc', 'kil', 'kil', 'kil' ];
const table_def3a = [ '---', '---', '---', '---', '---', 'sta', 'sta', 'lig', 'lig', 'ser', 'ser' ];
const table_def3b = [ '---', '---', '---', 'sta', 'sta', 'lig', 'lig', 'lig', 'ser', 'ser', 'ser' ];
const table_def3c = [ '---', 'sta', 'sta', 'lig', 'lig', 'lig', 'lig', 'ser', 'ser', 'ser' ];

const table_def1_res = [ table_def1, table_def1.slice(1), table_def1.slice(2) ];
const table_def2_res = [ table_def2a, table_def2b, table_def2b.slice(1), table_def2b.slice(2) ];
const table_def3_res = [ table_def3a, table_def3a.slice(1), table_def3b, table_def3b.slice(1), table_def3c ];

export function HitTable()
{
    return (
        <table className="CombatHitTable">
            <tr>
                <th></th>
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
            <HitTableRow label="1:1" arr={ table_def1_res[0] } />
            <HitTableRow label="1:2" arr={ table_def1_res[1] } />
            <HitTableRow label="1:3" arr={ table_def1_res[2] } />
            <HitTableRow label="2:1" arr={ table_def2_res[0] } />
            <HitTableRow label="2:2" arr={ table_def2_res[1] } />
            <HitTableRow label="2:3" arr={ table_def2_res[2] } />
            <HitTableRow label="2:4" arr={ table_def2_res[3] } />
            <HitTableRow label="3:1" arr={ table_def3_res[0] } />
            <HitTableRow label="3:2" arr={ table_def3_res[1] } />
            <HitTableRow label="3:3" arr={ table_def3_res[2] } />
            <HitTableRow label="3:4" arr={ table_def3_res[3] } />
            <HitTableRow label="3:5" arr={ table_def3_res[4] } />
        </table>
    )
}

export function HitTableRow({ label, arr }: { label:string, arr:string[] })
{
    return (
        <tr>
        <th>{ label }</th>
            <td>{ arr[0] }</td>
            <td>{ arr[1] }</td>
            <td>{ arr[2] }</td>
            <td>{ arr[3] }</td>
            <td>{ arr[4] }</td>
            <td>{ arr[5] }</td>
            <td>{ arr[6] }</td>
            <td>{ arr[7] }</td>
            <td>{ arr[8] }</td>
        </tr>
    );
}
