import React from 'react';
import { useState, useContext, createContext } from 'react';

import { ReactCtx } from './context';

export function TimerTable()
{
    let rctx = useContext(ReactCtx);
    let zstate = rctx.zstate;

    return (
        <div className="ScrollContent">
            TIMERS
        </div>
    );
}
