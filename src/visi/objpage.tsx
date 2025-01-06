import React from 'react';
import { useState, useContext } from 'react';

import { ZState, ZObject } from './zstate';

import { ReactCtx } from './context';

export function ObjectPage({ onum } : { onum:number })
{
    return (
        <div>
            OBJ { onum }
        </div>
    );
}
