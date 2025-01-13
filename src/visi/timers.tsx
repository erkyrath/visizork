import React from 'react';
import { useState, useContext, createContext } from 'react';

import { gamedat_global_names, gamedat_routine_addrs, unpack_address, signed_zvalue, check_commentary } from './gamedat';

import { ReactCtx } from './context';
import { ObjPageLink, Commentary } from './widgets';

export type TimerListContextContent = {
    selected: number;
    setSelected: (val:number) => void;
};

function new_context() : TimerListContextContent
{
    return {
        selected: -1,
        setSelected: (val) => {},
    };
}

const TimerListCtx = createContext(new_context());

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

        if (flag)
            activecount++;

        ells.push(
            <TimerEntry key={ pos } addr={ addr } flag={ flag } count={ count } />
        );
        
        timerpos += 6;
    }

    function evhan_click_background(ev: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        ev.stopPropagation();
        setSelected(-1);
    }

    return (
        <TimerListCtx.Provider value={ { selected, setSelected } }>
            <div className="ScrollContent" onClick={ evhan_click_background }>
                <Commentary topic={ 'TIMERS-LEGEND' } />
                <div>
                    { ells.length } timers, { activecount } active:
                </div>
                <ul className="DataList">
                    { ells }
                </ul>
            </div>
        </TimerListCtx.Provider>
    );
}

function TimerEntry({ addr, flag, count }: { addr:number, flag:number, count:number })
{
    let rctx = useContext(ReactCtx);
    let zstate = rctx.zstate;

    let ctx = useContext(TimerListCtx);
    let selected = ctx.selected;

    let rtn = gamedat_routine_addrs.get(unpack_address(addr));
    
    let withcom: string|undefined;
    if (rtn) {
        withcom = check_commentary(rtn.name, 'RTN');
    }

    function evhan_click(ev: React.MouseEvent<HTMLLIElement, MouseEvent>) {
        ev.stopPropagation();
        ctx.setSelected(addr);
        if (rtn)
            rctx.setLoc(rtn.sourceloc, false);
    }
    
    return (
        <li className={ (addr==selected) ? 'Selected' : '' } onClick={ evhan_click }>
            { (withcom ?
               <Commentary topic={ withcom } smaller={ true } />
               : null) }
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
            { (withcom ?
               <span className="LineExtraHeightSmall"></span>
               : null) }
        </li>
    );
}
