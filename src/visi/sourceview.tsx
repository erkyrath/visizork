import React from 'react';
import { useState, useContext, useRef, useEffect } from 'react';

import { sourcefile_map, gamedat_sourcefiles } from './gamedat';
import { gamedat_global_names, gamedat_constant_names, gamedat_object_names, gamedat_string_map, gamedat_routine_names, parse_sourceloc } from './gamedat';
import { sourceloc_start, gamedat_commentarymap } from './gamedat';

import { ReactCtx } from './context';
import { SourceLocState } from './context';

export function SourceView()
{
    let noderef = useRefDiv();
    
    let rctx = useContext(ReactCtx);
    let zstate = rctx.zstate;

    let atstart = (rctx.sourcelocpos == 0);
    let atend = (rctx.sourcelocpos == rctx.sourcelocs.length-1);
    
    let loc: string;
    let lochi: boolean;
    if (rctx.sourcelocpos < rctx.sourcelocs.length) {
        ({ loc, lochi } = rctx.sourcelocs[rctx.sourcelocpos]);
    }
    else {
        loc = sourceloc_start();
        lochi = false;
    }

    let filestr = loc[0];
    let filename = sourcefile_map[filestr] || '???';

    function evhan_click_id(val: string) {
        let obj = gamedat_object_names.get(val);
        if (obj) {
            rctx.setLoc(obj.sourceloc, false);
            return;
        }
        let rtn = gamedat_routine_names.get(val);
        if (rtn) {
            rctx.setLoc(rtn.sourceloc, false);
            return;
        }
        let glo = gamedat_global_names.get(val);
        if (glo) {
            rctx.setLoc(glo.sourceloc, false);
            return;
        }
        let con = gamedat_constant_names.get(val);
        if (con) {
            rctx.setLoc(con.sourceloc, false);
            return;
        }
        console.log('BUG: clicked unknown id', val);
    }

    function evhan_click_obj(onum: number) {
        rctx.setObjPage(onum);
    }
    
    function evhan_click_comment(topic: string) {
        rctx.showCommentary(topic);
    }
    
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
            rebuild_sourcefile(noderef.current, loc, lochi, hilites, evhan_click_id, evhan_click_obj, evhan_click_comment);
        }
    }, [ loc, lochi, zstate ]);

    function evhan_click_back(ev: React.MouseEvent<HTMLElement, MouseEvent>) {
        ev.stopPropagation();
        rctx.shiftLoc(false);
    }
    
    function evhan_click_forward(ev: React.MouseEvent<HTMLElement, MouseEvent>) {
        ev.stopPropagation();
        rctx.shiftLoc(true);
    }
    
    return (
        <>
            <div className="TabBar">
                <button className="NavButton" disabled={ atstart } onClick={ evhan_click_back }>&lt;</button>
                <button className="NavButton" disabled={ atend } onClick={ evhan_click_forward }>&gt;</button>
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

const pat_tab = new RegExp('\t', 'g');

function rebuild_sourcefile(nodel: HTMLDivElement, locstr: string, lochi: boolean, hilites: string[], handle_click_id: (val:string)=>void, handle_click_obj: (val:number)=>void, handle_click_comment: (val:string)=>void)
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
        // Clear the node list and rebuild it
        while (nodel.firstChild) {
            nodel.removeChild(nodel.firstChild);
        }
    
        filel = document.createElement('div');
        filel.id = fileid;
        filel.className = 'SourceFile';
        
        let lines = gamedat_sourcefiles[filename];
        let commentlist = gamedat_commentarymap[loc.filekey];
        
        let compos = 0;
        let comline: number|undefined;
        let comtoken: string|undefined;
        if (compos+1 < commentlist.length) {
            comline = commentlist[compos+0] as number;
            comtoken = commentlist[compos+1] as string;
        }
        
        if (lines) {
            let counter = 1;
            for (let srcln of lines) {
                let linel = document.createElement('div');
                linel.id = 'line_' + counter;
                let extraheight = false;
                if (comtoken !== undefined && counter == comline) {
                    let token = comtoken;
                    let ael = document.createElement('a');
                    ael.className = 'CommentButton';
                    let imgel = document.createElement('img');
                    imgel.setAttribute('src', 'css/comment.svg');
                    ael.appendChild(imgel);
                    ael.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); handle_click_comment(token); });
                    linel.appendChild(ael);
                    
                    compos += 2;
                    if (compos+1 < commentlist.length) {
                        comline = commentlist[compos+0] as number;
                        comtoken = commentlist[compos+1] as string;
                        if (comline == counter+1) {
                            extraheight = true;
                        }
                    }
                    else {
                        comline = undefined;
                        comtoken = undefined;
                    }
                }
                
                if (srcln.length == 0) {
                    linel.appendChild(document.createTextNode(' '));
                }
                else {
                    for (let span of srcln) {
                        if (typeof span === 'string') {
                            linel.appendChild(document.createTextNode(span.replace(pat_tab, '    ')));
                        }
                        else {
                            let [ cla, val ] = span;
                            let spanel;
                            if (cla == 'Id') {
                                spanel = document.createElement('a');
                                spanel.setAttribute('href', '#')
                                spanel.className = 'Src_'+cla;
                                spanel.addEventListener('click', (ev) => { ev.preventDefault(); handle_click_id(val); });
                            }
                            else if (cla == 'Iddef') {
                                let obj = gamedat_object_names.get(val);
                                if (obj) {
                                    var butel = document.createElement('button');
                                    butel.className = 'ObjPage';
                                    butel.appendChild(document.createTextNode('i'));
                                    butel.addEventListener('click', (ev) => { ev.stopPropagation(); handle_click_obj(obj.onum); });
                                    linel.appendChild(butel);
                                }
                                spanel = document.createElement('span');
                                spanel.className = 'Src_'+cla;
                            }
                            else {
                                spanel = document.createElement('span');
                                spanel.className = 'Src_'+cla;
                            }
                            spanel.appendChild(document.createTextNode(val.replace(pat_tab, '    ')));
                            linel.appendChild(spanel);
                        }
                    }
                }
                if (extraheight) {
                    // With two comment markers in a row, we need some
                    // extra vertical space. Sorry, hacky.
                    // (We're not doing with with a line CSS class because
                    // the line classes will be adjusted later.)
                    let spanel = document.createElement('span');
                    spanel.className = 'LineExtraHeight';
                    spanel.appendChild(document.createTextNode(' '));
                    linel.appendChild(spanel);
                }
                
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
        let cla = '';
        if (lochi) {
            if (issel)
                cla = 'Selected';
            else if (ishi)
                cla = 'Hilit';
        }
        else {
            if (ishi)
                cla = 'Hilit';
            if (issel) {
                if (cla.length)
                    cla += ' ';
                cla += 'SelRange';
            }
        }
        linel.className = cla;
        counter++;
    }

    // It looks nicer if large highlighted spans are at the top, but
    // single highlighted lines are partway down.
    let heightratio = 0.25;
    if (loc.endline - loc.line > 7)
        heightratio = 0.125;
    
    let scrollel = document.getElementById('scrollcontent_file');
    let linel = document.getElementById('line_'+loc.line);
    if (scrollel && linel) {
        scrollel.scrollTop = linel.offsetTop - Math.floor(scrollel.offsetHeight * heightratio);
    }
}

const useRefDiv = () => useRef<HTMLDivElement>(null);

