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
    const [ sort, setSort ] = useState('addr');
    
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

    function evhan_sort_change(val: string) {
        setSort(val);
    }
    
    return (
        <GlobListCtx.Provider value={ { selected, setSelected } }>
            <div className="ScrollContent" onClick={ evhan_click_background }>
                <div>
                    Sort by{' '}
                    <input id="sortaddr_radio" type="radio" name="sort" value="addr" checked={ sort=='addr' } onChange={ (ev) => evhan_sort_change('addr') } />
                    <label htmlFor="sortaddr_radio">Address</label>{' '}
                    <input id="sortalpha_radio" type="radio" name="sort" value="alpha" checked={ sort=='alpha' } onChange={ (ev) => evhan_sort_change('alpha') } />
                    <label htmlFor="sortalpha_radio">Alpha</label>
                </div>
                { (rctx.shownumbers ?
                   <div>
                       Global variables begin at address { rctx.zstate.globtableaddr }.
                   </div>
                   : null) }
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
    let withnum = false;
    if (glo) {
        switch (glo.vartype) {
        case 'OBJ':
            vartype = <VarShowObject value={ value } />;
            break;
        case 'STR':
            vartype = <VarShowString value={ value } />;
            break;
        case 'DATA':
            vartype = <i>data table in source</i>;
            break;
        case 'TABLE':
            vartype = <i>runtime table</i>;
            break;
        case 'UNUSED':
            vartype = <>{ value } <i>(not used)</i></>
            withnum = true;
            break;
        case '':
        case undefined:
            vartype = <span>{ (value < 32768) ? value : (value - 65536) }</span>;
            withnum = true;
            break;
        default:
            vartype = <i>{ glo.vartype }</i>;
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
            <code>{ (glo ? glo.name : '???') }</code>:{' '}
            { ((rctx.shownumbers && !withnum) ?
               <>
                   <span className="ShowAddr">({ value })</span>{' '}
               </>
               : null) }
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
        return (<span><code>{ obj.name }</code></span>);
    }

    return (<i>invalid object { value }</i>);
}

function VarShowString({ value }: { value:number })
{
    let obj = gamedat_string_map.get(unpack_address(value));
    if (obj) {
        return (<span className="PrintString">&#x201C;{ obj.text }&#x201D;</span>);
    }

    return (<span>???</span>);
}
