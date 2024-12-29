import React from 'react';
import { useState, useContext, useRef, useEffect } from 'react';

import { sourcefile_map } from './gamedat';

import { ReactCtx } from './context';

export function SourceView()
{
    let noderef = useRefDiv();
    
    let rctx = useContext(ReactCtx);
    let loc = rctx.loc;

    let [ filestr, linestr, charstr ] = loc.split(':');

    let file = sourcefile_map[filestr] || '???';
    let line = parseInt(linestr);
    let char = parseInt(charstr);

    useEffect(() => {
        if (noderef.current) {
            let el = document.createElement('div');
            //###
            el.appendChild(document.createTextNode(file+':'+line+':'+char));
            noderef.current.appendChild(el);
        }
    }, [ loc ]);
    
    return (
        <div className="ScrollContent">
            <div>Location: { file }, { line }:{ char }</div>
            <div ref={ noderef }></div>
        </div>
    );
}

const useRefDiv = () => useRef<HTMLDivElement>(null);
