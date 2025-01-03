import React from 'react';
import { useState, useContext, createContext } from 'react';

import { ZState, ZObject } from './zstate';
import { gamedat_global_nums, gamedat_object_ids, gamedat_string_map } from './gamedat';

import { ReactCtx } from './context';

export type GlobListContextContent = {
    selected: number;
    setSelected: (val:number) => void;
};

function new_context() : GlobListContextContent
{
    return {
        selected: -1,
        setSelected: (val) => {},
    };
}

const GlobListCtx = createContext(new_context());

export function GlobalState()
{
    const [ selected, setSelected ] = useState(-1);
    
    let rctx = useContext(ReactCtx);
    let zstate = rctx.zstate;

    let counter = 0;
    let globls = zstate.globals.map((val) => {
        let index = counter++;
        return <GlobalVar key={ index } index={ index } value={ val } />;
    });

    function evhan_click_background(ev: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        ev.stopPropagation();
        setSelected(-1);
    }

    return (
        <GlobListCtx.Provider value={ { selected, setSelected } }>
            <div className="ScrollContent" onClick={ evhan_click_background }>
                <ul className="DataList">
                    { globls }
                </ul>
            </div>
        </GlobListCtx.Provider>
    );
}

//###
const glob_is_object = new Set([0, 111]);
const glob_is_string = new Set([28, 29]);
const glob_is_table = new Set([3, 4, 5, 6, 7, 18, 21, 22, 23, 25, 27, 34, 37, 38]);

export function GlobalVar({ index, value }: { index:number, value:number })
{
    let rctx = useContext(ReactCtx);
    let ctx = useContext(GlobListCtx);
    let selected = ctx.selected;

    let glo = gamedat_global_nums.get(index);
    
    function evhan_click(ev: React.MouseEvent<HTMLLIElement, MouseEvent>) {
        ev.stopPropagation();
        ctx.setSelected(index);
        let obj = gamedat_global_nums.get(index);
        if (obj)
            rctx.setLoc(obj.sourceloc, false);
    }
    
    return (
        <li className={ (index==selected) ? 'Selected' : '' } onClick={ evhan_click }>
            { index } <code>{ (glo ? glo.name : '???') }</code>
            : { value }{' '}
            { (glob_is_object.has(index) ?
               <VarShowObject value={ value } />
               : null )}
            { (glob_is_string.has(index) ?
               <VarShowString value={ value } />
               : null )}
            { (glob_is_table.has(index) ?
               <span>(table)</span>
               : null )}
        </li>
    );
}

function VarShowObject({ value }: { value:number })
{
    if (value == 0)
        return (<i>nothing</i>);

    let obj = gamedat_object_ids.get(value);
    if (obj) {
        //### link?
        return (<span>(<code>{ obj.name }</code>)</span>);
    }

    return (<span>???</span>);
}

function VarShowString({ value }: { value:number })
{
    let obj = gamedat_string_map.get(2*value); //### packed string address
    if (obj) {
        return (<span>"{ obj.text }"</span>);
    }

    return (<span>???</span>);
}
