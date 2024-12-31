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
    let loc = rctx.sourceloc;
    let lochi = rctx.sourcehi;

    let filestr = loc[0];
    let filename = sourcefile_map[filestr] || '???';

    useEffect(() => {
        if (noderef.current) {
            let hilites: string[] = [];
            for (let addr of zstate.strings) {
                let dat = gamedat_string_map.get(addr);
                if (dat) {
                    if (typeof dat.sourceloc === 'string') {
                        hilites.push(dat.sourceloc);
                    }
                    else {
                        dat.sourceloc.map((val) => hilites.push(val));
                    }
                }
            }
            rebuild_sourcefile(noderef.current, loc, lochi, hilites);
        }
    }, [ loc, lochi, zstate ]);

    function evhan_click_back(ev: React.MouseEvent<HTMLElement, MouseEvent>) {
        ev.stopPropagation();
        console.log('### back');
    }
    
    function evhan_click_forward(ev: React.MouseEvent<HTMLElement, MouseEvent>) {
        ev.stopPropagation();
        console.log('### forward');
    }
    
    return (
        <>
            <div className="TabBar">
                <button className="NavButton" onClick={ evhan_click_back }>&lt;</button>
                <button className="NavButton" onClick={ evhan_click_forward }>&gt;</button>
                <div className="TabLabel">{ filename }</div>
            </div>
            <div className="TabContent">
                <div id="scrollcontent_file" className="ScrollContent">
                    <div className="SourceRef" ref={ noderef }></div>
                </div>
            </div>
        </>
    );
}

function rebuild_sourcefile(nodel: HTMLDivElement, locstr: string, lochi: boolean, hilites: string[])
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

    let counter = 1;
    for (let linel of filel.children) {
        let issel = (counter >= loc.line && counter <= loc.endline);
        let ishi = hiset.has(counter);
        let cla = (ishi ? 'Hilit' : '');
        if (issel && (lochi || !ishi))
            cla = (lochi ? 'Selected' : 'SelRange');
        linel.className = cla;
        counter++;
    }
    
    let scrollel = document.getElementById('scrollcontent_file');
    let linel = document.getElementById('line_'+loc.line);
    if (scrollel && linel) {
        scrollel.scrollTop = linel.offsetTop - Math.floor(scrollel.offsetHeight/4);
    }
}

const useRefDiv = () => useRef<HTMLDivElement>(null);

