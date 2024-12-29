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
            rebuild_sourcefile(noderef.current, file, line, char);
        }
    }, [ loc ]);
    
    return (
        <div className="ScrollContent">
            <div>Location: { file }, { line }:{ char }</div>
            <div className="SourceRef" ref={ noderef }></div>
        </div>
    );
}

function rebuild_sourcefile(nodel: HTMLDivElement, file: string, line: number, char: number)
{
    let fileid = 'sourcefile_' + file.replace('.zil', '');
    
    let filel;
    for (let nod of nodel.children) {
        if (nod.className == 'SourceFile') {
            filel = nod;
            break;
        }
    }
    
    if (filel && filel.id == fileid) {
        console.log('### keeping', fileid);
    }
    else {
        console.log('### rebuilding', fileid);
        while (nodel.firstChild) {
            nodel.removeChild(nodel.firstChild);
        }
    
        filel = document.createElement('div');
        filel.id = fileid;
        filel.className = 'SourceFile';
        
        filel.appendChild(document.createTextNode(file+':'+line+':'+char));
        nodel.appendChild(filel);
    }
}

const useRefDiv = () => useRef<HTMLDivElement>(null);
