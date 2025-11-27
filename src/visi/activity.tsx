import React from 'react';
import { useState, useContext, createContext } from 'react';

import { ZObject, ZStackCall, ZStackItem, ZStackPrint } from './zstate';
import { gamedat_string_map, gamedat_routine_addrs, gamedat_dictword_addrs, gamedat_object_ids, unpack_address, signed_zvalue, DictWordData, StringData } from './gamedat';

import { ReactCtx } from './context';
import { ObjPageLink } from './widgets';

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

    let issel = (print.addr == seladdr);
    let strdat: StringData|undefined = gamedat_string_map.get(print.addr);
    let dictdat: DictWordData|undefined;
    if (!strdat) {
        dictdat = gamedat_dictword_addrs.get(print.addr);
    }

    let textel;
    if (strdat) {
        textel = (
            <>
                {' '}<span className="PrintString">&#x201C;{ strdat.text }&#x201D;</span>
            </>
        );
    }
    else if (dictdat) {
        textel = (
            <>
                {' '}<span className="PrintDictWord">&#x2018;{ dictdat.text }&#x2019;</span>
            </>
        );
    }
    else {
        textel = (
            <> <i>string not recognized</i></>
        );
    }
    
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
                { (rctx.shownumbers ?
                   <span className="ShowAddr">{ print.addr }: </span>
                   : null) }
                { textel }
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

    let showsubs = (subls.length > 0);
    if (iscollapse && call.children.length == 1) {
        let onechild = call.children[0];
        if (onechild.type == 'call' && onechild.children.length == 0)
            showsubs = false;
    }
    
    let funcname = (funcdat ? funcdat.name : '???');
    if (call.addr == 0)
        funcname = 'false';

    let argtypes: string[] = funcdat?.argtypes ?? [];
    let argls: JSX.Element[] = []
    counter = 0;
    for (let arg of call.args) {
        let argtype: string|null = argtypes[counter];
        let el = <StackCallArg key={ counter } value={ arg } argtype={ argtype } />
        argls.push(el);
        counter++;
    }
    
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
                { (rctx.shownumbers ?
                   <span className="ShowAddr">{ call.addr }: </span>
                   : null) }
                <code>&lt;{ funcname }{ argls }&gt;</code>
            </li>
            { (showsubs ?
               <ul className="DataList">
                   { (iscollapse ? <li><code>&lt;...&gt;</code></li> : subls) }
               </ul>
               : null ) }
        </>
    );
}

export function StackCallArg({ value, argtype }: { value:number, argtype:string|null })
{
    switch (argtype) {
    case 'OBJ':
        return (
            <span> <ArgShowObject value={ value } /></span>
        )
    case 'STR':
        return (
            <span> <ArgShowString value={ value } /></span>
        )
    default:
        return (
            <span> { signed_zvalue(value) }</span>
        );
    }
}

function ArgShowObject({ value }: { value:number })
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

    return (<i>?obj:{ value }</i>);
}

function ArgShowString({ value }: { value:number })
{
    let obj = gamedat_string_map.get(unpack_address(value));
    if (obj) {
        return (<span className="PrintString">&#x201C;{ obj.text }&#x201D;</span>);
    }

    return (<span>???</span>);
}


type ChangeEv = React.ChangeEvent<HTMLInputElement>;
