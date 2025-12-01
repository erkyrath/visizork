import React from 'react';
import { useRef } from 'react';

export function GameMap()
{
    let scrollref = useRefDiv();
    let dragstart: {x:number, y:number}|null = null;
    let scrollstart: {x:number, y:number}|null = null;

    function evhan_mousedown(ev: React.PointerEvent<HTMLDivElement>) {
        ev.preventDefault();
        ev.stopPropagation();
        if (scrollref.current && ev.button == 0) {
            dragstart = { x: ev.clientX, y: ev.clientY };
            scrollstart = { x: scrollref.current.scrollLeft, y: scrollref.current.scrollTop };
            scrollref.current.setPointerCapture(ev.pointerId);
        }
    }

    function evhan_mousemove(ev: React.PointerEvent<HTMLDivElement>) {
        if (scrollref.current && dragstart && scrollstart) {
            ev.preventDefault();
            scrollref.current.scrollLeft = scrollstart.x - (ev.clientX - dragstart.x);
            scrollref.current.scrollTop = scrollstart.y - (ev.clientY - dragstart.y);
        }
    }

    function evhan_mouseup(ev: React.PointerEvent<HTMLDivElement>) {
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

