import React from 'react';
import { useState, useContext } from 'react';

import { ObjectData, gamedat_object_ids, gamedat_object_room_ids } from './gamedat';
import { ROOM_HOLDER, PSEUDO_OBJECT, GLOBAL_OBJECTS, LOCAL_GLOBALS } from './gamedat';
import { ZState } from './zstate';

import { ReactCtx } from './context';

export function ObjectTree()
{
    let rctx = useContext(ReactCtx);
    let zstate = rctx.zstate;

    let roots = [];
    let map = new Map();
    for (let tup of zstate.objects) {
        map.set(tup.onum, tup);
        if (tup.parent == 0 || tup.parent == ROOM_HOLDER || tup.onum == PSEUDO_OBJECT)
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
        if (tup.onum != ROOM_HOLDER && tup.onum != LOCAL_GLOBALS) {
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

            if (obj.scenery) {
                for (let sval of obj.scenery) {
                    let ctup = map.get(sval);
                    if (!ctup)
                        break;
                    children.push(ctup);
                }
            }
        }

        let label: string;
        if (obj.isroom)
            label = 'room';
        else if (obj.origparent == GLOBAL_OBJECTS)
            label = 'glob';
        else if (obj.origparent == LOCAL_GLOBALS)
            label = 'scen';
        else
            label = 'obj';
        
        return (
            <li key={ tup.onum }>
                { label } { tup.onum }: { obj.name } "{ obj.desc }"
                { (children.length ? (
                    <ul>
                        { children.map(showchild) }
                    </ul>) : null) }
                { (tup.onum == ROOM_HOLDER ? (
                    <ul>
                        <li>(contains all rooms)</li>
                    </ul>) : null) }
                { (tup.onum == LOCAL_GLOBALS ? (
                    <ul>
                        <li>(contains all scenery)</li>
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
