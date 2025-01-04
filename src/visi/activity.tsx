import React from 'react';
import { useState, useContext, createContext } from 'react';

import { ZState, ZObject, ZStackCall, ZStackItem, ZStackPrint } from './zstate';
import { gamedat_string_map, gamedat_routine_addrs } from './gamedat';

import { ReactCtx } from './context';

type SelPair = [ number, number ];

export type ListContextContent = {
    selected: SelPair;
    setSelected: (tup:SelPair) => void;
    collapse: boolean;
};

function new_context() : ListContextContent
{
    return {
        selected: [-1, -1],
        setSelected: (val) => {},
        collapse: true,
    };
}

const ListCtx = createContext(new_context());

export function CallActivity()
{
    const [ selected, setSelected ] = useState([-1, -1] as SelPair);
    const [ collapse, setCollapse ] = useState(true);
    
    let rctx = useContext(ReactCtx);
    let zstate = rctx.zstate;

    function evhan_click_background(ev: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        ev.stopPropagation();
        setSelected([-1, -1]);
    }

    function evhan_change_collapse(ev: ChangeEv) {
        setCollapse(!collapse);
    }

    return (
        <ListCtx.Provider value={ { selected, setSelected, collapse } }>
            <div className="ScrollContent" onClick={ evhan_click_background }>
                <div>
                    <input id="collapse_checkbox" type="checkbox" checked={ collapse } onChange={ evhan_change_collapse } />
                    <label htmlFor="collapse_checkbox">Collapse non-printing calls</label>
                </div>
                <ul className="DataList">
                    <StackItem item={ zstate.calltree } />
                </ul>
            </div>
        </ListCtx.Provider>
    );
}

export function StackItem({ item }: { item:ZStackItem })
{
    if (item.type == 'call' && item.addr != 0)
        return <StackCall call={ item } />;
    if (item.type == 'print')
        return <StackPrint print={ item } />;
    return null;
}

export function StackPrint({ print }: { print:ZStackPrint })
{
    let rctx = useContext(ReactCtx);
    let ctx = useContext(ListCtx);
    let [ selindex, seladdr ] = ctx.selected;

    let strdat = gamedat_string_map.get(print.addr);
    let issel = (print.addr == seladdr);
    
    function evhan_click(ev: React.MouseEvent<HTMLLIElement, MouseEvent>) {
        ev.stopPropagation();
        ctx.setSelected([-1, print.addr]);
        if (strdat) {
            let loc = (typeof strdat.sourceloc === 'string') ? strdat.sourceloc : strdat.sourceloc[0]; //###?
            rctx.setLoc(loc, true);
        }
    }

    return (
        <>
            <li className={ issel ? 'Selected' : '' } onClick={ evhan_click }>
                { strdat ? (
                    <>
                        {' '}<span className="PrintString">&#x201C;{ strdat.text }&#x201D;</span>
                    </>
                ) : (
                    <> <i>string not recognized</i></>
                ) }
            </li>
        </>
    );
}

export function StackCall({ call }: { call:ZStackCall })
{
    let rctx = useContext(ReactCtx);
    let ctx = useContext(ListCtx);
    let [ selindex, seladdr ] = ctx.selected;

    let funcdat = gamedat_routine_addrs.get(call.addr);
    let issel = (call.addr == seladdr);
    let iscollapse = (ctx.collapse && !call.hasprint);

    let counter = 0;
    let subls = call.children.map((subitem) => (
        <StackItem key={ counter++ } item={ subitem } />
    ));
    
    let funcname = (funcdat ? funcdat.name : '???');
    if (call.addr == 0)
        funcname = 'false';
    
    function evhan_click(ev: React.MouseEvent<HTMLLIElement, MouseEvent>) {
        ev.stopPropagation();
        ctx.setSelected([-1, call.addr]);
        if (funcdat) {
            rctx.setLoc(funcdat.sourceloc, false);
        }
    }

    return (
        <>
            <li className={ issel ? 'Selected' : '' } onClick={ evhan_click }>
                <code>&lt;{ funcname }&gt;</code>
            </li>
            { (subls.length ?
               <ul className="DataList">
                   { (iscollapse ? <li>...</li> : subls) }
               </ul>
               : null ) }
        </>
    );
}

type ChangeEv = React.ChangeEvent<HTMLInputElement>;
