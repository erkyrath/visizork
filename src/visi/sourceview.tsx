import React from 'react';
import { useState, useContext } from 'react';

import { ReactCtx } from './context';

interface SourceFileMap {
    [key: string]: string;
}

const sourcefile_map: SourceFileMap = {
    A: 'zork1.zil',
    B: '1actions.zil',
    C: '1dungeon.zil',
    D: 'gclock.zil',
    E: 'gglobals.zil',
    F: 'gmacros.zil',
    G: 'gmain.zil',
    H: 'gparser.zil',
    I: 'gsyntax.zil',
    J: 'gverbs.zil',
};

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
