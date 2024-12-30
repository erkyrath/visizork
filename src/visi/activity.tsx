import React from 'react';
import { useState, useContext, createContext } from 'react';

import { ZState, ZObject, ZFuncCall } from './zstate';
import { gamedat_string_map, gamedat_routine_map } from './gamedat';

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
            rctx.setLoc(strdat.sourceloc);
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
                    <CallEntry call={ zstate.calltree } />
                </ul>
            </div>
        </ListCtx.Provider>
    );
}

export function CallEntry({ call }: { call:ZFuncCall })
{
    let rctx = useContext(ReactCtx);
    let ctx = useContext(ListCtx);
    let [ selindex, seladdr ] = ctx.selected;

    let funcdat = gamedat_routine_map.get(call.addr);
    let issel = (call.addr == seladdr);

    let counter = 0;
    let subls = call.children.map((subcall) => (
        <CallEntry key={ counter++ } call={ subcall } />
    ));
    
    function evhan_click(ev: React.MouseEvent<HTMLLIElement, MouseEvent>) {
        ev.stopPropagation();
        ctx.setSelected([-1, call.addr]);
        if (funcdat) {
            rctx.setLoc(funcdat.sourceloc);
        }
    }
    
    return (
        <>
            <li className={ issel ? 'Selected' : '' } onClick={ evhan_click }>
                call { call.addr }:{' '}
                { (funcdat ? funcdat.name : '???') }
            </li>
            <ul className="DataList">
                { (subls.length ? subls : null ) }
            </ul>
        </>
    );
}
