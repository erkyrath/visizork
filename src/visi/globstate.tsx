import React from 'react';
import { useState, useContext, createContext } from 'react';

import { ZState, ZObject } from './zstate';
import { gamedat_global_nums, gamedat_object_ids, gamedat_string_map } from './gamedat';
import { unpack_address } from './gamedat';

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

export function GlobalVar({ index, value }: { index:number, value:number })
{
    let rctx = useContext(ReactCtx);
    let ctx = useContext(GlobListCtx);
    let selected = ctx.selected;

    let glo = gamedat_global_nums.get(index);

    let vartype = null;
    if (glo) {
        switch (glo.vartype) {
        case 'OBJ':
            vartype = <VarShowObject value={ value } />;
            break;
        case 'STR':
            vartype = <VarShowString value={ value } />;
            break;
        case '':
        case undefined:
            vartype = null;
            break;
        default:
            vartype = <span>{ glo.vartype }</span>;
            break;
        }
    }
    
    function evhan_click(ev: React.MouseEvent<HTMLLIElement, MouseEvent>) {
        ev.stopPropagation();
        ctx.setSelected(index);
        let obj = gamedat_global_nums.get(index);
        if (obj && obj.sourceloc.length)
            rctx.setLoc(obj.sourceloc, false);
    }
    
    return (
        <li className={ (index==selected) ? 'Selected' : '' } onClick={ evhan_click }>
            { (rctx.shownumbers ?
               <span className="ShowAddr">{ index }: </span>
               : null) }
            <code>{ (glo ? glo.name : '???') }</code>
            : { value }{' '}
            { vartype ? vartype : null }
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
    let obj = gamedat_string_map.get(unpack_address(value));
    if (obj) {
        return (<span>"{ obj.text }"</span>);
    }

    return (<span>???</span>);
}
