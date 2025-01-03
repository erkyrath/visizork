import React from 'react';
import { useState, useContext, createContext } from 'react';

import { ZState, ZObject, ZStackCall, ZStackItem, ZStackPrint } from './zstate';
import { gamedat_string_map, gamedat_routine_addrs } from './gamedat';

import { ReactCtx } from './context';

type SelPair = [ number, number ];

export type ListContextContent = {
    selected: SelPair;
    setSelected: (tup:SelPair) => void;
};

function new_context() : ListContextContent
{
    return {
        selected: [-1, -1],
        setSelected: (val) => {},
    };
}

const ListCtx = createContext(new_context());

export function StringActivity()
{
    const [ selected, setSelected ] = useState([-1, -1] as SelPair);
    
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
        setSelected([-1, -1]);
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
    let [ selindex, seladdr ] = ctx.selected;

    let strdat = gamedat_string_map.get(addr);
    let issel = (index == selindex && addr == seladdr);

    function evhan_click(ev: React.MouseEvent<HTMLLIElement, MouseEvent>) {
        ev.stopPropagation();
        ctx.setSelected([index, addr]);
        if (strdat) {
            if (typeof strdat.sourceloc === 'string')
                rctx.setLoc(strdat.sourceloc, true);
            else
                rctx.setLoc(strdat.sourceloc[0], true);
        }
    }
    
    return (
        <li className={ issel ? 'Selected' : '' } onClick={ evhan_click }>
            { strdat ? (
                <>{ addr }: { strdat.text }</>
            ) : (
                <>{ addr }: <i>string not recognized</i></>
            ) }
        </li>
    );
}

export function CallActivity()
{
    const [ selected, setSelected ] = useState([-1, -1] as SelPair);
    
    let rctx = useContext(ReactCtx);
    let zstate = rctx.zstate;

    function evhan_click_background(ev: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        ev.stopPropagation();
        setSelected([-1, -1]);
    }

    return (
        <ListCtx.Provider value={ { selected, setSelected } }>
            <div className="ScrollContent" onClick={ evhan_click_background }>
                <ul className="DataList">
                    <StackItem item={ zstate.calltree } />
                </ul>
            </div>
        </ListCtx.Provider>
    );
}

export function StackItem({ item }: { item:ZStackItem })
{
    if (item.type == 'call')
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

    let issel = (print.addr == seladdr);
    
    function evhan_click(ev: React.MouseEvent<HTMLLIElement, MouseEvent>) {
        ev.stopPropagation();
        ctx.setSelected([-1, print.addr]);
        /*###
        if (funcdat) {
            rctx.setLoc(funcdat.sourceloc, false);
            }
            */
    }

    return (
        <>
            <li className={ issel ? 'Selected' : '' } onClick={ evhan_click }>
                print { print.addr }: 
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
                call { call.addr }: <code>{ funcname }</code>
            </li>
            <ul className="DataList">
                { (subls.length ? subls : null ) }
            </ul>
        </>
    );
}
