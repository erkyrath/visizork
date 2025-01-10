import React from 'react';
import { useState, useContext, createContext } from 'react';

import { gamedat_global_names, gamedat_routine_addrs, unpack_address, signed_zvalue } from './gamedat';

import { ReactCtx } from './context';
import { ObjPageLink, Commentary } from './widgets';

export function TimerTable()
{
    let rctx = useContext(ReactCtx);
    let zstate = rctx.zstate;

    let C_INTS = gamedat_global_names.get('C-INTS');
    if (!C_INTS) {
        return <i>No C-INTS</i>;
    }

    let ells = [];
    let activecount = 0;
    
    let pos = zstate.globals[C_INTS.num];
    while (pos+6 < zstate.timertable.length) {
        let flag = zstate.timertable[pos] * 0x100 + zstate.timertable[pos+1];
        let count = zstate.timertable[pos+2] * 0x100 + zstate.timertable[pos+3];
        let addr = zstate.timertable[pos+4] * 0x100 + zstate.timertable[pos+5];
        let rtn = gamedat_routine_addrs.get(unpack_address(addr));

        if (flag)
            activecount++;

        function evhan_click(ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
            ev.preventDefault();
            if (rtn)
                rctx.setLoc(rtn.sourceloc, false);
        }
    
        ells.push(
            <li key={ pos }>
                { (flag ?
                   <span className="TimerActive">&#x2611;</span> :
                   <span className="TimerInactive">&#x2610;</span>) }
                {' '}
                { (rctx.shownumbers ?
                   <span className="ShowAddr">({ addr }) </span>
                   : null) }
                <a className="Src_Id" href="#" onClick={ evhan_click }><code>{ rtn ? rtn.name : '' }</code></a>
                {', '}
                <i>count </i>
                { signed_zvalue(count) }
            </li>
        );
        
        pos += 6;
    }

    return (
        <div className="ScrollContent">
            <Commentary topic={ 'TIMERS-LEGEND' } />
                <div>
                    { ells.length } timers, { activecount } active:
                </div>
            <ul className="DataList">
                { ells }
            </ul>
        </div>
    );
}
