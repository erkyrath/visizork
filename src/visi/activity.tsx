import React from 'react';
import { useState, useContext } from 'react';

import { ZState, ZObject } from './zstate';
import { gamedat_string_map } from './gamedat';

import { ReactCtx } from './context';

export function StringActivity()
{
    let rctx = useContext(ReactCtx);
    let zstate = rctx.zstate;

    let counter = 0;
    let ells = zstate.strings.map((addr) => {
        let strdat = gamedat_string_map.get(addr);
        if (!strdat) {
            return (
                <li key={ counter++ }>
                    string not recognized: { addr }
                </li>
            );
        }
        return (
            <li key={ counter++ }>
                { addr }: { strdat.text } { strdat.sourceloc }
            </li>
        );
    });
    
    return (
        <div className="ScrollContent">
            <ul className="DataList">
                { ells }
            </ul>
        </div>
    );
}
