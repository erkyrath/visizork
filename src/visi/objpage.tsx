import React from 'react';
import { useState, useContext } from 'react';

import { ZState, ZObject, zobj_properties } from './zstate';
import { ObjectData, gamedat_object_ids, gamedat_object_room_ids, gamedat_object_global_ids } from './gamedat';

import { ReactCtx } from './context';
import { ObjPageLink } from './widgets';

export function ObjectPage({ onum } : { onum:number })
{
    let rctx = useContext(ReactCtx);
    let zstate = rctx.zstate;

    let obj = gamedat_object_ids.get(onum);
    if (!obj) {
        return <div>Object { onum } not found</div>;
    }

    let map: Map<number, ZObject> = new Map();
    for (let tup of zstate.objects) {
        map.set(tup.onum, tup);
    }
    
    let tup = map.get(onum);
    if (!tup) {
        return <div>Object { onum } not found</div>;
    }
    let parent = gamedat_object_ids.get(tup.parent);

    let children = [];
    let cnum = tup.child;
    while (cnum) {
        let obj = gamedat_object_ids.get(cnum);
        if (obj)
            children.push(obj);
        let tup = map.get(cnum);
        if (tup) 
            cnum = tup.sibling;
        else
            break;
    }

    let counter = 0;
    let childls = children.map((obj) =>
        <span key={ obj.onum }>
            {' '}
            <ObjPageLink onum={ obj.onum } />
            <code>{ obj.name }</code>
        </span>
    );
    
    let label: string;
    if (obj.isroom)
        label = 'room';
    else if (gamedat_object_global_ids.has(onum))
        label = 'global object';
    /*###else if (tup.parent != parentnum)
        label = 'scenery'; ###*/
    else
        label = 'object';

    let props = zobj_properties(zstate, onum);

    function evhan_click_back(ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
        ev.preventDefault();
        rctx.setTab('objtree');
    }
    
    return (
        <div className="ScrollContent">
            <div className="ObjPageBack">
                <a href="#" onClick={ evhan_click_back }>Back to World</a>
            </div>
            <div>
                <code><b>{ obj.name }</b></code> &nbsp; ({ label })
            </div>
            { (obj.desc ?
               <div>
                   Printed name:{' '}
                   <span className="PrintString">&#x201C;{ obj.desc }&#x201D;</span>
               </div>
               : null) }
            { (parent ?
               <div>
                   Contained in:{' '}
                   <ObjPageLink onum={ parent.onum } />
                   <code>{ parent.name }</code>
               </div>
               : null) }
            { (childls.length ?
               <div>
                   Contains:{' '}
                   { childls }
               </div>
               : null) }
        </div>
    );
}
