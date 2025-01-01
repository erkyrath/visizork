import React from 'react';
import { useState, useContext, createContext } from 'react';

import { ZState, ZObject } from './zstate';

import { ReactCtx } from './context';

export function GlobalState()
{
    let rctx = useContext(ReactCtx);
    let zstate = rctx.zstate;

    return (
        <div className="ScrollContent">
            <ul className="DataList">

            </ul>
	</div>
    );
}
