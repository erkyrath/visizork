import React from 'react';
import { useState, useContext } from 'react';

import { ObjectData, ObjectDataIdMap, RoomIdSet, ROOM_HOLDER } from './gamedat';
import { ZState } from './zstate';

import { ReactCtx } from './context';

export function ObjectTree()
{
    let rctx = useContext(ReactCtx);
    let zstate = rctx.zstate;

    let gamedat_object_ids = (window as any).gamedat_object_ids as ObjectDataIdMap;
    let gamedat_object_room_ids = (window as any).gamedat_object_room_ids as RoomIdSet;
    
    let roots = [];
    let map = new Map();
    for (let tup of zstate.objects) {
        map.set(tup.onum, tup);
        if (tup.parent == 0 || tup.parent == ROOM_HOLDER)
            roots.push(tup);
    }

    roots.sort((o1, o2) => {
        if (gamedat_object_room_ids.has(o1.onum) && !gamedat_object_room_ids.has(o2.onum))
            return -1;
        if (gamedat_object_room_ids.has(o2.onum) && !gamedat_object_room_ids.has(o1.onum))
            return 1;
        return (o1.onum - o2.onum);
    });

    function showchild(tup: any) {
        let obj = gamedat_object_ids.get(tup.onum);
        if (!obj) {
            return <li key={ tup.onum }>{ tup.onum }: ???</li>;
        }

        let children = [];
        if (tup.onum != ROOM_HOLDER) {
            let childset = new Set();
            let val = tup.child;
            while (val != 0) {
                if (childset.has(val)) {
                    console.log('BUG: loop in sibling chain');
                    break;
                }
                let ctup = map.get(val);
                if (!ctup)
                    break;
                children.push(ctup);
                childset.add(val);
                val = ctup.sibling;
            }
        }
        
        return (
            <li key={ tup.onum }>
                { (obj.isroom ? 'room ' : 'obj ') }{ tup.onum }: { obj.name } "{ obj.desc }"
                { (children.length ? (
                    <ul>
                        { children.map(showchild) }
                    </ul>) : null) }
                { (tup.onum == ROOM_HOLDER ? (
                    <ul>
                        <li>(contains all rooms)</li>
                    </ul>) : null) }
            </li>
        );
    }
    
    return (
        <ul>
            { roots.map(showchild) }
        </ul>
    );
}
