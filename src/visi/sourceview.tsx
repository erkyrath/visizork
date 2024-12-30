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
            <h2>{ filename }</h2>
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
    let endline: number|undefined;
    let endchar: number|undefined;
    
    if (loctup.length >= 5) {
        endline = parseInt(loctup[3]);
        endchar = parseInt(loctup[4]);
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
        let counter = 1;
        for (let linel of filel.children) {
            linel.className = (counter == line) ? 'Selected' : '';
            counter++;
        }
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
                if (counter == line)
                    linel.className = 'Selected';
                if (ln.length == 0)
                    ln = ' ';
                linel.appendChild(document.createTextNode(ln));
                filel.appendChild(linel);
                counter++;
            }
        }
        
        nodel.appendChild(filel);
    }

    let scrollel = document.getElementById('scrollcontent_file');
    let linel = document.getElementById('line_'+line);
    if (scrollel && linel) {
        scrollel.scrollTop = linel.offsetTop - Math.floor(scrollel.offsetHeight/4);
    }
}

const useRefDiv = () => useRef<HTMLDivElement>(null);
