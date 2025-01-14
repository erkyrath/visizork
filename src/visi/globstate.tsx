import React from 'react';
import { useState, useContext, createContext } from 'react';

import { ZObject } from './zstate';
import { gamedat_global_nums, gamedat_globals_sort_index, gamedat_globals_sort_alpha, gamedat_object_ids, gamedat_string_map, gamedat_dictword_addrs, gamedat_verbs, check_commentary } from './gamedat';
import { GlobalData, unpack_address, signed_zvalue } from './gamedat';

import { ReactCtx } from './context';
import { ObjPageLink, Commentary } from './widgets';

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

    let sortglobs: GlobalData[];
    if (sort == 'recent') {
        let updatetimes = zstate.globalsupdate;
        sortglobs = [ ...gamedat_globals_sort_index ];
        sortglobs.sort((g1, g2) => {
            let up2 = updatetimes[g2.num];
            let up1 = updatetimes[g1.num];
            if (up2 != up1)
                return (up2 - up1);
            return g1.num - g2.num;
        });
    }
    else if (sort == 'alpha') {
        sortglobs = gamedat_globals_sort_alpha;
    }
    else {
        sortglobs = gamedat_globals_sort_index;
    }

    let counter = 0;
    let globls = [];
    while (counter < zstate.globals.length) {
        let index = sortglobs[counter].num;
        globls.push(<GlobalVar key={ index } index={ index } value={ zstate.globals[index] } origvalue={ zstate.origglobals[index] } />);
        counter++;
    }

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
                    <input id="sortrecent_radio" type="radio" name="sort" value="recent" checked={ sort=='recent' } onChange={ (ev) => evhan_sort_change('recent') } />
                    <label htmlFor="sortrecent_radio">Recent</label>
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

export function GlobalVar({ index, value, origvalue }: { index:number, value:number, origvalue:number })
{
    let rctx = useContext(ReactCtx);
    let ctx = useContext(GlobListCtx);
    let selected = ctx.selected;
    
    let changed = (value != origvalue);
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
        case 'WORD':
            vartype = <VarShowWord value={ value } />;
            break;
        case 'VERB':
            vartype = <VarShowVerb value={ value } />;
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
            vartype = <span>{ signed_zvalue(value) }</span>;
            withnum = true;
            break;
        default:
            vartype = <i>{ glo.vartype }</i>;
            break;
        }
    }

    let origtext = 'original value: ';
    if (changed) {
        if (glo && glo.vartype == 'OBJ') {
            if (origvalue == 0) {
                origtext += 'nothing';
            }
            else {
                let obj = gamedat_object_ids.get(origvalue);
                origtext += (obj ? obj.name : '???');
            }
        }
        else {
            origtext += origvalue;
        }
    }

    let withcom: string|undefined;
    if (glo) {
        withcom = check_commentary(glo.name, 'GLOB');
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
            { (withcom ?
               <Commentary topic={ withcom } smaller={ true } />
               : null) }
            { (rctx.shownumbers ?
               <span className="ShowAddr">{ index }: </span>
               : null) }
            <code>{ (glo ? glo.name : '???') }</code>:{' '}
            { (changed ?
               <span className="ChangedNote" title={ origtext }>*</span>
               : null) }
            { ((rctx.shownumbers && !withnum) ?
               <>
                   <span className="ShowAddr">({ value })</span>{' '}
               </>
               : null) }
            { vartype ? vartype : null }
            { (withcom ?
               <span className="LineExtraHeightSmall"></span>
               : null) }
        </li>
    );
}

function VarShowObject({ value }: { value:number })
{
    if (value == 0)
        return (<i>nothing</i>);

    let obj = gamedat_object_ids.get(value);
    if (obj) {
        return (
            <>
                <ObjPageLink onum={ value } />
                <span><code>{ obj.name }</code></span>
            </>
        );
    }

    return (<i>invalid object { value }</i>);
}

function VarShowVerb({ value }: { value:number })
{
    if (value >= 0 && value < gamedat_verbs.length) {
        return (
            <>
                <span><code>{ gamedat_verbs[value] }</code></span>
            </>
        );
    }

    return (<i>invalid verb { value }</i>);
}

function VarShowString({ value }: { value:number })
{
    let obj = gamedat_string_map.get(unpack_address(value));
    if (obj) {
        return (<span className="PrintString">&#x201C;{ obj.text }&#x201D;</span>);
    }

    return (<span>???</span>);
}

function VarShowWord({ value }: { value:number })
{
    if (value == 0) {
        return <i>no word</i>;
    }
    
    let wd = gamedat_dictword_addrs.get(value);

    if (wd) {
        return (<span className="PrintDictWord">&#x2018;{ wd.text }&#x2019;</span>);
    }

    return (<i>invalid word { value }</i>);
}

