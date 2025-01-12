import React from 'react';
import { useState, useContext, createContext } from 'react';

import { gamedat_global_names, gamedat_routine_addrs, unpack_address, signed_zvalue } from './gamedat';

import { ReactCtx } from './context';
import { ObjPageLink, Commentary } from './widgets';

export function TimerTable()
{
    const [ selected, setSelected ] = useState(-1);
    
    let rctx = useContext(ReactCtx);
    let zstate = rctx.zstate;

    let C_INTS = gamedat_global_names.get('C-INTS');
    if (!C_INTS) {
        return <i>No C-INTS</i>;
    }

    let ells = [];
    let activecount = 0;
    
    let timerpos = zstate.globals[C_INTS.num];
    while (timerpos+6 < zstate.timertable.length) {
        let pos = timerpos;
        let flag = zstate.timertable[pos] * 0x100 + zstate.timertable[pos+1];
        let count = zstate.timertable[pos+2] * 0x100 + zstate.timertable[pos+3];
        let addr = zstate.timertable[pos+4] * 0x100 + zstate.timertable[pos+5];
        let rtn = gamedat_routine_addrs.get(unpack_address(addr));

        if (flag)
            activecount++;

        function evhan_click(ev: React.MouseEvent<HTMLLIElement, MouseEvent>) {
            ev.stopPropagation();
            setSelected(pos);
            if (rtn)
                rctx.setLoc(rtn.sourceloc, false);
        }
    
        ells.push(
            <li key={ pos } className={ (pos==selected) ? 'Selected' : '' } onClick={ evhan_click }>
                { (flag ?
                   <span className="TimerActive">&#x2611;</span> :
                   <span className="TimerInactive">&#x2610;</span>) }
                {' '}
                { (rctx.shownumbers ?
                   <span className="ShowAddr">({ addr }) </span>
                   : null) }
                <code>{ rtn ? rtn.name : '???' }</code>
                {', '}
                <i>count </i>
                { signed_zvalue(count) }
            </li>
        );
        
        timerpos += 6;
    }

    function evhan_click_background(ev: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        ev.stopPropagation();
        setSelected(-1);
    }

    return (
        <div className="ScrollContent" onClick={ evhan_click_background }>
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
