import React from 'react';
import { useState, useContext } from 'react';

import { ObjectData, gamedat_object_ids, gamedat_object_room_ids, gamedat_object_global_ids, gamedat_object_treesort, gamedat_distances } from './gamedat';
import { gamedat_ids } from './gamedat';
import { ZState, ZObject } from './zstate';

import { ReactCtx } from './context';

export function ObjectTree()
{
    const [ selected, setSelected ] = useState(-1);
    
    let rctx = useContext(ReactCtx);
    let zstate = rctx.zstate;

    let roots: ZObject[] = [];
    let map = new Map();
    for (let tup of zstate.objects) {
        map.set(tup.onum, tup);
        if (tup.parent == 0 || tup.parent == gamedat_ids.ROOMS || tup.parent == gamedat_ids.GLOBAL_OBJECTS || tup.onum == gamedat_ids.PSEUDO_OBJECT)
            roots.push(tup);
    }

    let advroom: number = gamedat_ids.ADVENTURER;
    while (true) {
        let tup = map.get(advroom);
        if (!tup || tup.parent == 0 || tup.parent == gamedat_ids.ROOMS)
            break;
        advroom = tup.parent;
    }

    if (!gamedat_distances[advroom])
        advroom = gamedat_ids.STARTROOM;
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
        if (onum != gamedat_ids.ROOMS && onum != gamedat_ids.LOCAL_GLOBALS && onum != gamedat_ids.GLOBAL_OBJECTS) {
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
            <li key={ onum } className={ (onum==selected) ? 'Selected' : '' }>
                { label } { onum }: { obj.name } "{ obj.desc }"
                { (children.length ? (
                    <ul className="DataList">
                        { children.map((o) => showchild(o, onum)) }
                    </ul>) : null) }
                { (onum == gamedat_ids.ROOMS ? (
                    <ul className="DataList">
                        <li>(contains all rooms)</li>
                    </ul>) : null) }
                { (onum == gamedat_ids.GLOBAL_OBJECTS ? (
                    <ul className="DataList">
                        <li>(contains all global-scoped)</li>
                    </ul>) : null) }
                { (onum == gamedat_ids.LOCAL_GLOBALS ? (
                    <ul className="DataList">
                        <li>(contains all scenery)</li>
                    </ul>) : null) }
            </li>
        );
    }
    
    return (
        <ul className="DataList">
            { roots.map((o) => showchild(o, 0)) }
        </ul>
    );
}
