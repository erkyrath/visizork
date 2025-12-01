import React from 'react';
import { useRef } from 'react';

export function GameMap()
{
    let scrollref = useRefDiv();
    let dragpos: {x:number, y:number}|null = null;

    function evhan_mousedown(ev: React.PointerEvent<HTMLDivElement>) {
        ev.preventDefault();
        ev.stopPropagation();
        if (ev.button == 0 && scrollref.current) {
            dragpos = { x: ev.clientX, y: ev.clientY };
            scrollref.current.setPointerCapture(ev.pointerId);
            console.log('### down', dragpos);
        }
    }

    function evhan_mousemove(ev: React.PointerEvent<HTMLDivElement>) {
        if (dragpos) {
            ev.preventDefault();
            console.log('### move', ev.clientX, ev.clientY);
        }
    }

    function evhan_mouseup(ev: React.PointerEvent<HTMLDivElement>) {
        dragpos = null;
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

