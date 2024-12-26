import React from 'react';
import { useState, useContext } from 'react';

import { ObjectData, gamedat_object_ids, gamedat_object_room_ids, gamedat_object_global_ids, gamedat_object_treesort, gamedat_distances } from './gamedat';
import { ADVENTURER, ROOM_HOLDER, PSEUDO_OBJECT, GLOBAL_OBJECTS, LOCAL_GLOBALS } from './gamedat';
import { ZState, ZObject } from './zstate';

import { ReactCtx } from './context';

export function ObjectTree()
{
    let rctx = useContext(ReactCtx);
    let zstate = rctx.zstate;

    let roots: ZObject[] = [];
    let map = new Map();
    for (let tup of zstate.objects) {
        map.set(tup.onum, tup);
        if (tup.parent == 0 || tup.parent == ROOM_HOLDER || tup.parent == GLOBAL_OBJECTS || tup.onum == PSEUDO_OBJECT)
            roots.push(tup);
    }

    let advroom = ADVENTURER;
    while (true) {
        let tup = map.get(advroom);
        if (!tup || tup.parent == 0 || tup.parent == ROOM_HOLDER)
            break;
        advroom = tup.parent;
    }

    if (!gamedat_distances[advroom])
        advroom = 180;
    let distmap = gamedat_distances[advroom];

    roots.sort((o1, o2) => {
        let sort1 = gamedat_object_treesort.get(o1.onum) ?? 0;
        let sort2 = gamedat_object_treesort.get(o2.onum) ?? 0;
        if (sort1 != sort2)
            return sort1 - sort2;
        if (sort1 == 1)
            return distmap[o1.onum] - distmap[o2.onum];
        return (o1.onum - o2.onum);
    });

    function showchild(tup: ZObject, parentnum: number) {
        let onum = tup.onum;
        let obj = gamedat_object_ids.get(onum);
        if (!obj) {
            return <li key={ onum }>{ onum }: ???</li>;
        }

        let children: ZObject[] = [];
        if (onum != ROOM_HOLDER && onum != LOCAL_GLOBALS && onum != GLOBAL_OBJECTS) {
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
        else if (gamedat_object_global_ids.has(onum))
            label = 'glob';
        else if (tup.parent != parentnum)
            label = 'scen';
        else
            label = 'obj';
        
        return (
            <li key={ onum }>
                { label } { onum }: { obj.name } "{ obj.desc }"
                { (children.length ? (
                    <ul>
                        { children.map((o) => showchild(o, onum)) }
                    </ul>) : null) }
                { (onum == ROOM_HOLDER ? (
                    <ul>
                        <li>(contains all rooms)</li>
                    </ul>) : null) }
                { (onum == GLOBAL_OBJECTS ? (
                    <ul>
                        <li>(contains all global-scoped)</li>
                    </ul>) : null) }
                { (onum == LOCAL_GLOBALS ? (
                    <ul>
                        <li>(contains all scenery)</li>
                    </ul>) : null) }
            </li>
        );
    }
    
    return (
        <ul>
            { roots.map((o) => showchild(o, 0)) }
        </ul>
    );
}
