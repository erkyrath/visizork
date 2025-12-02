import React from 'react';
import { useRef, useContext } from 'react';

import { ReactCtx } from './context';

export function GameMap()
{
    let scrollref = useRefDiv();
    
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
                                                       
    function evhan_mouseup(ev: PointerEv) {
        dragstart = null;
        scrollstart = null;
        if (scrollref.current) {
            scrollref.current.releasePointerCapture(ev.pointerId);
        }
    }
    
    return (
        <div className="ScrollXYContent" ref={ scrollref } onPointerDown={ evhan_mousedown } onPointerMove={ evhan_mousemove } onPointerUp={ evhan_mouseup } >
            <object className="GameMap" width="1200" height="800" type="image/svg+xml" data="css/zorkmap.svg" />
        </div>
    );
}

const useRefDiv = () => useRef<HTMLDivElement>(null);
type PointerEv = React.PointerEvent<HTMLDivElement>;
