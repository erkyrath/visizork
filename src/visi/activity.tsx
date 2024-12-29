import React from 'react';
import { useState, useContext, createContext } from 'react';

import { ZState, ZObject } from './zstate';
import { gamedat_string_map } from './gamedat';

import { ReactCtx } from './context';

export type ListContextContent = {
    selected: number;
    setSelected: (val:number) => void;
};

function new_context() : ListContextContent
{
    return {
        selected: -1,
        setSelected: (val) => {},
    };
}

const ListCtx = createContext(new_context());

export function StringActivity()
{
    const [ selected, setSelected ] = useState(-1);
    
    let rctx = useContext(ReactCtx);
    let zstate = rctx.zstate;

    let counter = 0;
    let ells = zstate.strings.map((addr) => {
        let key = counter++;
        return (
            <StringEntry key={ key } index={ key } addr={ addr } />
        );
    });
    
    function evhan_click_background(ev: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        ev.stopPropagation();
        setSelected(-1);
    }

    return (
        <ListCtx.Provider value={ { selected, setSelected } }>
            <div className="ScrollContent" onClick={ evhan_click_background }>
                <ul className="DataList">
                    { ells }
                </ul>
            </div>
        </ListCtx.Provider>
    );
}

export function StringEntry({ addr, index }: { addr:number, index:number })
{
    let rctx = useContext(ReactCtx);
    let ctx = useContext(ListCtx);
    let selected = ctx.selected;

    let strdat = gamedat_string_map.get(addr);

    function evhan_click(ev: React.MouseEvent<HTMLLIElement, MouseEvent>) {
        ev.stopPropagation();
        ctx.setSelected(index);
        if (strdat) {
            rctx.setLoc(strdat.sourceloc);
        }
    }
    
    if (!strdat) {
        return (
            <li>
                string not recognized: { addr }
            </li>
        );
    }
    return (
        <li className={ (index==selected) ? 'Selected' : '' } onClick={ evhan_click }>
            { addr }: { strdat.text } { strdat.sourceloc }
        </li>
    );
}
