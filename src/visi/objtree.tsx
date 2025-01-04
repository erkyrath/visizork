import React from 'react';
import { useState, useContext, createContext } from 'react';

import { ObjectData, gamedat_object_ids, gamedat_object_room_ids, gamedat_object_global_ids, gamedat_object_treesort, gamedat_distances } from './gamedat';
import { gamedat_ids } from './gamedat';
import { ZState, ZObject } from './zstate';

import { ReactCtx } from './context';

export type ObjTreeContextContent = {
    map: Map<number, ZObject>;
    selected: number;
    setSelected: (val:number) => void;
};

function new_context() : ObjTreeContextContent
{
    return {
        map: new Map(),
        selected: -1,
        setSelected: (val) => {},
    };
}

const ObjTreeCtx = createContext(new_context());

export function ObjectTree()
{
    const [ selected, setSelected ] = useState(-1);
    
    let rctx = useContext(ReactCtx);
    let zstate = rctx.zstate;

    let roots: ZObject[] = [];
    let map: Map<number, ZObject> = new Map();
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

    var rootls = roots.map((o) =>
        <ShowObject key={ o.onum } tup={ o } parentnum={ 0 } /> );

    function evhan_click_background(ev: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        ev.stopPropagation();
        setSelected(-1);
    }

    return (
        <ObjTreeCtx.Provider value={ { map, selected, setSelected } }>
            <div className="ScrollContent" onClick={ evhan_click_background }>
                <ul className="DataList">
                    { rootls }
                </ul>
            </div>
        </ObjTreeCtx.Provider>
    );
}

function ShowObject({ tup, parentnum } : {tup:ZObject, parentnum:number})
{
    let rctx = useContext(ReactCtx);
    let ctx = useContext(ObjTreeCtx);
    let map = ctx.map;
    let selected = ctx.selected;
    
    let onum = tup.onum;
    let obj = gamedat_object_ids.get(onum);
    if (!obj) {
        return <li>{ onum }: ???</li>;
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

    let special: string = '';
    switch (onum) {
    case gamedat_ids.ROOMS:
        special = '(contains all rooms)';
        break;
    case gamedat_ids.GLOBAL_OBJECTS:
        special = '(contains all global-scoped objects)';
        break;
    case gamedat_ids.LOCAL_GLOBALS:
        special = '(contains all scenery)';
        break;
    }

    var childls = children.map((o) =>
        <ShowObject key={ o.onum } tup={ o } parentnum={ onum } /> );

    function evhan_click(ev: React.MouseEvent<HTMLLIElement, MouseEvent>) {
        ev.stopPropagation();
        ctx.setSelected(onum);
        let obj = gamedat_object_ids.get(onum);
        if (obj)
            rctx.setLoc(obj.sourceloc, false);
    }

    let cla = '';
    if (onum == selected)
        cla = 'Selected';
    if (obj.isroom) {
        if (cla.length)
            cla += ' ';
        cla += 'IsRoom';
    }
    
    return (
        <>
            <li className={ cla } onClick={ evhan_click }>
                { label } <code>{ obj.name }</code>
                {' '}
                { ((obj.desc && obj.desc.length) ?
                   <span className="PrintString">&#x201C;{ obj.desc }&#x201D;</span>
                   :
                   <i>(nameless)</i> ) }
            </li>
            { (childls.length ? (
                <ul className="DataList">
                    { childls }
                </ul>) : null) }
            { (special.length ? (
                <ul className="DataList">
                    <li><i>{ special }</i></li>
                </ul>) : null) }
        </>
    );
}

