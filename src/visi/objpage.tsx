import React from 'react';
import { useState, useMemo, useContext } from 'react';

import { ZObject, zobj_properties } from './zstate';
import { ObjectData, gamedat_object_ids, gamedat_object_room_ids, gamedat_object_global_ids } from './gamedat';
import { unpack_address, gamedat_string_map, gamedat_routine_addrs, gamedat_property_nums } from './gamedat';

import { ReactCtx } from './context';
import { ObjPageLink } from './widgets';

export function ObjectPage({ onum } : { onum:number })
{
    let rctx = useContext(ReactCtx);
    let zstate = rctx.zstate;

    let props = useMemo(
        () => zobj_properties(zstate, onum),
        [ zstate, onum ]
    );

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
            {counter++ ? ', ' : ' '}
            <ObjPageLink onum={ obj.onum } />
            <code>{ obj.name }</code>
        </span>
    );

    let propls = props.map((prop) =>
        <ObjProperty key={ prop.pnum } pnum={ prop.pnum } values={ prop.values } />
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

    function evhan_click_back(ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
        ev.preventDefault();
        rctx.setTab('objtree');
    }

    //### Scenery-in?
    
    return (
        <div className="ScrollContent">
            <div className="ObjPageBack">
                <a href="#" onClick={ evhan_click_back }>Back to World</a>
            </div>
            <div>
                <code><b>{ obj.name }</b></code> &nbsp; ({ label })
            </div>
            <ul className="DataList">
                { (obj.desc ?
                   <li>
                       Printed name:{' '}
                       <span className="PrintString">&#x201C;{ obj.desc }&#x201D;</span>
                   </li>
                   : null) }
                { (parent ?
                   <li>
                       Contained in:{' '}
                       <ObjPageLink onum={ parent.onum } />
                       <code>{ parent.name }</code>
                   </li>
                   : null) }
                { (childls.length ?
                   <li>
                       Contains:{' '}
                       { childls }
                   </li>
                   : null) }
                { (propls.length ?
                   <li>
                       Properties:
                       <ul className="DataList">
                           { propls }
                       </ul>
                   </li>
                   : null) }
            </ul>
        </div>
    );
}

function ObjProperty({ pnum, values }: { pnum:number, values:number[] })
{
    let prop = gamedat_property_nums.get(pnum);
    if (!prop) {
        return <li>??? { prop }</li>;
    }

    let propvalues;
    
    switch (prop.vartype || '') {
    case 'INT':
        propvalues = <IntProp values={ values } />;
        break;
    case 'STR':
        propvalues = <StrProp values={ values } />;
        break;
    case 'RTN':
        propvalues = <RoutineProp values={ values } />;
        break;
    case 'OBJS':
        propvalues = <ObjectsProp values={ values } />;
        break;        
    default:
        propvalues = <BytesProp values={ values } />;
        break;
    }
    
    return (
        <li>
            <code>{ prop.name }</code>:{' '}
            { propvalues }
        </li>
    );
}

function BytesProp({ values } : { values:number[] })
{
    let counter = 0;
    let valls = values.map((val) => {
        let index = counter++;
        return (
            <span key={ index }> { val }</span>
        );
    });

    return (<span>{ valls }</span>);
}

function IntProp({ values } : { values:number[] })
{
    if (values.length != 2)
        return BytesProp({ values });

    let val = values[0] * 0x100 + values[1];
    return (<span>{ val }</span>);
}

function StrProp({ values } : { values:number[] })
{
    if (values.length != 2)
        return BytesProp({ values });

    let val = values[0] * 0x100 + values[1];
    let obj = gamedat_string_map.get(unpack_address(val));

    if (!obj)
        return BytesProp({ values });
    
    return (<span className="PrintString">&#x201C;{ obj.text }&#x201D;</span>);
}

function RoutineProp({ values } : { values:number[] })
{
    let rctx = useContext(ReactCtx);
    
    if (values.length != 2)
        return BytesProp({ values });

    let val = values[0] * 0x100 + values[1];
    if (val == 0)
        return (<i>no function</i>);
    
    let obj = gamedat_routine_addrs.get(unpack_address(val));

    if (!obj)
        return BytesProp({ values });

    function evhan_click(ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
        ev.preventDefault();
        if (obj)
            rctx.setLoc(obj.sourceloc, false);
    }
    
    return (<a className="Src_Id" href="#" onClick={ evhan_click }><code>{ obj.name }</code></a>);
}

function ObjectsProp({ values } : { values:number[] })
{
    let counter = 0;
    let ells = values.map((onum) => (
        <ObjectProp key={ counter++ } onum={ onum } />
    ));

    return <span>{ ells }</span>;
}

function ObjectProp({ onum } : { onum:number })
{
    let rctx = useContext(ReactCtx);
    
    if (onum == 0)
        return (<i>nothing</i>);
    
    let obj = gamedat_object_ids.get(onum);
    if (!obj)
        return (<i>??? { onum }</i>);

    return (
        <>
            {' '}
            <ObjPageLink onum={ onum } />
            <code>{ obj.name }</code>
        </>);
}

