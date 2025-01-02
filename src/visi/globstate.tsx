import React from 'react';
import { useState, useContext, createContext } from 'react';

import { ZState, ZObject } from './zstate';
import { gamedat_global_nums, gamedat_object_ids, gamedat_string_map } from './gamedat';

import { ReactCtx } from './context';

export function GlobalState()
{
    let rctx = useContext(ReactCtx);
    let zstate = rctx.zstate;

    let counter = 0;
    let globls = zstate.globals.map((val) => {
        let index = counter++;
        return <GlobalVar key={ index } index={ index } value={ val } />;
    });

    return (
        <div className="ScrollContent">
            <ul className="DataList">
                { globls }
            </ul>
        </div>
    );
}

//###
const glob_is_object = new Set([0, 111]);
const glob_is_string = new Set([28, 29]);

export function GlobalVar({ index, value }: { index:number, value:number })
{
    let glo = gamedat_global_nums.get(index);
    
    return (
        <li>
            { index } <code>{ (glo ? glo.name : '???') }</code>
            : { value }{' '}
            { (glob_is_object.has(index) ?
               <VarShowObject value={ value } />
               : null )}
            { (glob_is_string.has(index) ?
               <VarShowString value={ value } />
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
        return (<span>({ obj.name })</span>);
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
