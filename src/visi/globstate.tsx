import React from 'react';
import { useState, useContext, createContext } from 'react';

import { ZState, ZObject } from './zstate';

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

export function GlobalVar({ index, value }: { index:number, value:number })
{
    return (
        <li>
            { index }: { value }
        </li>
    );
}
