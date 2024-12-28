import React from 'react';
import { useState, useContext } from 'react';

import { sourcefile_map } from './gamedat';

import { ReactCtx } from './context';

export function SourceView()
{
    let rctx = useContext(ReactCtx);
    let loc = rctx.loc;

    let [ filestr, linestr, charstr ] = loc.split(':');

    let file = sourcefile_map[filestr] || '???';
    let line = parseInt(linestr);
    let char = parseInt(charstr);

    return (
        <div className="ScrollContent">
            Location: { file }, { line }:{ char }
        </div>
    );
}
