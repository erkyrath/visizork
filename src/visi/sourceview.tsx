import React from 'react';
import { useState, useContext, useRef, useEffect } from 'react';

import { sourcefile_map, gamedat_sourcefiles } from './gamedat';
import { gamedat_string_map, parse_sourceloc } from './gamedat';

import { ReactCtx } from './context';

export function SourceView()
{
    let noderef = useRefDiv();
    
    let rctx = useContext(ReactCtx);
    let zstate = rctx.zstate;
    let loc = rctx.loc;

    let filestr = loc[0];
    let filename = sourcefile_map[filestr] || '???';

    useEffect(() => {
        if (noderef.current) {
            let hilites = zstate.strings.map((addr) => {
                let dat = gamedat_string_map.get(addr);
                return (dat ? dat.sourceloc : '');
            });
            rebuild_sourcefile(noderef.current, loc, hilites);
        }
    }, [ loc ]);
    
    return (
        <div id="scrollcontent_file" className="ScrollContent">
            <h2>Source file: { filename }</h2>
            <div className="SourceRef" ref={ noderef }></div>
        </div>
    );
}

function rebuild_sourcefile(nodel: HTMLDivElement, locstr: string, hilites: string[])
{
    let loc = parse_sourceloc(locstr);
    if (!loc)
        return;
    
    let filename = sourcefile_map[loc.filekey] || '???';

    let hiset = new Set();
    for (let val of hilites) {
        let hiloc = parse_sourceloc(val);
        if (!hiloc)
            continue;
        if (hiloc.filekey != loc.filekey)
            continue;
        let ix = hiloc.line;
        while (ix <= hiloc.endline) {
            hiset.add(ix);
            ix++;
        }
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
        // Keep the node list
    }
    else {
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

    let cla = ((loc.line == loc.endline) ? 'Selected' : 'SelRange');
    let counter = 1;
    for (let linel of filel.children) {
        let issel = (counter >= loc.line && counter <= loc.endline);
        let ishi = hiset.has(counter);
        linel.className = (issel ? cla : (ishi ? 'Hilit' : ''));
        counter++;
    }
    
    let scrollel = document.getElementById('scrollcontent_file');
    let linel = document.getElementById('line_'+loc.line);
    if (scrollel && linel) {
        scrollel.scrollTop = linel.offsetTop - Math.floor(scrollel.offsetHeight/4);
    }
}

const useRefDiv = () => useRef<HTMLDivElement>(null);
