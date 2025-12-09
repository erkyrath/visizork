import React from 'react';
import { useRef, useContext, useEffect } from 'react';

import { gamedat_ids, gamedat_object_ids, gamedat_roominfo_names } from './gamedat';

import { ReactCtx } from './context';

export function GameMap()
{
    let scrollref = useRefDiv();
    let mapref = useRefObject();
    
    let rctx = useContext(ReactCtx);
    let zstate = rctx.zstate;

    let dragstart: {x:number, y:number}|null = null;
    let scrollstart: {x:number, y:number}|null = null;

    let origdocsize: { w:number, h:number } = gamedat_ids.MAP_DOCSIZE;
    let viewsize: { w:number, h:number } = gamedat_ids.MAP_VIEWSIZE;
    let docsize: { w:number, h:number } = { w:0.8*origdocsize.w, h:0.8*origdocsize.h };
    
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

    /* This callback is used for *both* the map-load event and the useEffect
       that depends on zstate. This is because the SVG loads slightly later
       than the first useEffect invocation. */
    function select_location() {
        if (mapref.current) {
            let herenum = zstate.globals[0];
            let hereobj = gamedat_object_ids.get(herenum);
            let herestr = '';
            if (hereobj) {
                herestr = hereobj.name;
            }

            let herecen: { x:number, y:number }|null = null;
            let roomobj = gamedat_roominfo_names.get(herestr);
            if (roomobj) {
                herecen = roomobj.center;
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
                        if (scrollref.current && herecen) {
                            scrollref.current.scrollLeft = herecen.x * docsize.w / viewsize.w - 0.5 * scrollref.current.clientWidth;
                            scrollref.current.scrollTop = herecen.y * docsize.h / viewsize.h - 0.5 * scrollref.current.clientHeight;
                        }
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
            <object className="GameMap" ref={ mapref } onLoad = { select_location } width={ docsize.w } height={ docsize.h } type="image/svg+xml" data="css/map.svg" />
        </div>
    );
}

const useRefDiv = () => useRef<HTMLDivElement>(null);
const useRefObject = () => useRef<HTMLObjectElement>(null);
type PointerEv = React.PointerEvent<HTMLDivElement>;
