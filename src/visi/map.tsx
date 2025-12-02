import React from 'react';
import { useRef, useContext, useEffect } from 'react';

import { gamedat_object_ids } from './gamedat';

import { ReactCtx } from './context';

export function GameMap()
{
    let scrollref = useRefDiv();
    let mapref = useRefObject();
    
    let rctx = useContext(ReactCtx);
    let zstate = rctx.zstate;

    let dragstart: {x:number, y:number}|null = null;
    let scrollstart: {x:number, y:number}|null = null;

    function evhan_mousedown(ev: PointerEv) {
        ev.preventDefault();
        ev.stopPropagation();
        if (scrollref.current && ev.button == 0) {
            dragstart = { x: ev.clientX, y: ev.clientY };
            scrollstart = { x: scrollref.current.scrollLeft, y: scrollref.current.scrollTop };
            scrollref.current.setPointerCapture(ev.pointerId);
        }
    }

    function evhan_mousemove(ev: PointerEv) {
        if (scrollref.current && dragstart && scrollstart) {
            ev.preventDefault();
            scrollref.current.scrollLeft = scrollstart.x - (ev.clientX - dragstart.x);
            scrollref.current.scrollTop = scrollstart.y - (ev.clientY - dragstart.y);
        }
    }

    function select_location() {
        if (mapref.current) {
            let herenum = zstate.globals[0];
            let hereobj = gamedat_object_ids.get(herenum);
            let herestr = '';
            if (hereobj) {
                herestr = hereobj.name;
            }
            
            let mapdoc = mapref.current.contentDocument;
            if (mapdoc && mapdoc.rootElement) {
                let curstr = mapdoc.rootElement.getAttribute('data-curselect') ?? '';
                if (herestr != curstr) {
                    let el = mapdoc.getElementById('r-'+curstr.toLowerCase());
                    if (el) {
                        el.classList.remove('Selected');
                    }

                    el = mapdoc.getElementById('r-'+herestr.toLowerCase());
                    if (el) {
                        el.classList.add('Selected');
                    }

                    mapdoc.rootElement.setAttribute('data-curselect', herestr);
                }
            }
        }
    }

    useEffect(select_location, [ zstate ]);
                                                       
    function evhan_mouseup(ev: PointerEv) {
        dragstart = null;
        scrollstart = null;
        if (scrollref.current) {
            scrollref.current.releasePointerCapture(ev.pointerId);
        }
    }
    
    return (
        <div className="ScrollXYContent" ref={ scrollref } onPointerDown={ evhan_mousedown } onPointerMove={ evhan_mousemove } onPointerUp={ evhan_mouseup } >
            <object className="GameMap" ref={ mapref } onLoad = { select_location } width="1200" height="800" type="image/svg+xml" data="css/zorkmap.svg" />
        </div>
    );
}

const useRefDiv = () => useRef<HTMLDivElement>(null);
const useRefObject = () => useRef<HTMLObjectElement>(null);
type PointerEv = React.PointerEvent<HTMLDivElement>;
