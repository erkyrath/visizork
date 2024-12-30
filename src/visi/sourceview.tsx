import React from 'react';
import { useState, useContext, useRef, useEffect } from 'react';

import { sourcefile_map, gamedat_sourcefiles } from './gamedat';

import { ReactCtx } from './context';

export function SourceView()
{
    let noderef = useRefDiv();
    
    let rctx = useContext(ReactCtx);
    let loc = rctx.loc;

    let filestr = loc[0];
    let filename = sourcefile_map[filestr] || '???';

    useEffect(() => {
        if (noderef.current) {
            rebuild_sourcefile(noderef.current, loc);
        }
    }, [ loc ]);
    
    return (
        <div id="scrollcontent_file" className="ScrollContent">
            <h2>Source file: { filename }</h2>
            <div className="SourceRef" ref={ noderef }></div>
        </div>
    );
}

function rebuild_sourcefile(nodel: HTMLDivElement, loc: string)
{
    let loctup = loc.split(':');
    let filestr = loctup[0];
    let filename = sourcefile_map[filestr] || '???';

    let line = parseInt(loctup[1]);
    let char = parseInt(loctup[2]);
    let endline: number;
    let endchar: number;
    
    if (loctup.length >= 5) {
        endline = parseInt(loctup[3]);
        endchar = parseInt(loctup[4]);
    }
    else {
        endline = line+1;
        endchar = 0;
    }
    
    let fileid = 'sourcefile_' + filename.replace('.zil', '');
    
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
        
        let lines = gamedat_sourcefiles[filename];
        if (lines) {
            let counter = 1;
            for (let ln of lines) {
                let linel = document.createElement('div');
                linel.id = 'line_' + counter;
                if (ln.length == 0)
                    ln = ' ';
                linel.appendChild(document.createTextNode(ln));
                filel.appendChild(linel);
                counter++;
            }
        }
        
        nodel.appendChild(filel);
    }

    let counter = 1;
    for (let linel of filel.children) {
        let issel = (counter >= line && (counter < endline || (counter == endline && endchar > 0)));
        linel.className = (issel ? 'Selected' : '');
        counter++;
    }
    
    let scrollel = document.getElementById('scrollcontent_file');
    let linel = document.getElementById('line_'+line);
    if (scrollel && linel) {
        scrollel.scrollTop = linel.offsetTop - Math.floor(scrollel.offsetHeight/4);
    }
}

const useRefDiv = () => useRef<HTMLDivElement>(null);
