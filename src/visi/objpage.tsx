import React from 'react';
import { useState, useMemo, useContext } from 'react';

import { ZObject, zobj_properties } from './zstate';
import { ObjectData, gamedat_object_ids, gamedat_object_room_ids, gamedat_object_global_ids } from './gamedat';
import { unpack_address, gamedat_string_map, gamedat_routine_addrs, gamedat_property_nums, gamedat_global_nums } from './gamedat';

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

    let globholdls = [];
    if (obj.iscenery && obj.iscenery.length) {
        let counter = 0;
        for (var sconum of obj.iscenery) {
            let scobj = gamedat_object_ids.get(sconum);
            if (scobj) {
                globholdls.push(
                    <span key={ counter++ }>
                        {counter++ ? ', ' : ' '}
                        <ObjPageLink onum={ scobj.onum } />
                        <code>{ scobj.name }</code>
                    </span>
                );
            }
        }
    }

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
                { (globholdls.length ?
                   <li>
                       Scenery in:{' '}
                       { globholdls }
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
    let rctx = useContext(ReactCtx);
    
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
    case 'DIR':
        propvalues = <DirProp values={ values } />;
        break;
    //### ADJS
    //### WORDS
    //### WORDRTNS
    default:
        propvalues = <BytesProp values={ values } />;
        break;
    }
    
    return (
        <li>
            { (rctx.shownumbers ?
               <span className="ShowAddr">{ pnum }: </span>
               : null) }
            <code>{ prop.name }</code>:{' '}
            { propvalues }
        </li>
    );
}

//### change stars! (whole-prop changes)
//### shownumbers!

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
    let rctx = useContext(ReactCtx);
    
    if (values.length != 2)
        return BytesProp({ values });

    let val = values[0] * 0x100 + values[1];
    let obj = gamedat_string_map.get(unpack_address(val));

    if (!obj)
        return BytesProp({ values });
    
    return (
        <>
            { (rctx.shownumbers ?
               <span className="ShowAddr">({ val }) </span>
               : null) }
            <span className="PrintString">&#x201C;{ obj.text }&#x201D;</span>
        </>
    );
}

function RoutineProp({ values } : { values:number[] })
{
    let rctx = useContext(ReactCtx);
    
    if (values.length != 2)
        return BytesProp({ values });

    let val = values[0] * 0x100 + values[1];
    if (val == 0)
        return (
            <>
                { (rctx.shownumbers ?
                   <span className="ShowAddr">(0) </span>
                   : null) }
                <i>no function</i>
            </>
        );
    
    let obj = gamedat_routine_addrs.get(unpack_address(val));

    if (!obj)
        return BytesProp({ values });

    function evhan_click(ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
        ev.preventDefault();
        if (obj)
            rctx.setLoc(obj.sourceloc, false);
    }
    
    return (
        <>
            { (rctx.shownumbers ?
               <span className="ShowAddr">({ val }) </span>
               : null) }
            <a className="Src_Id" href="#" onClick={ evhan_click }><code>{ obj.name }</code></a>
        </>
    );
}

function ObjectsProp({ values } : { values:number[] })
{
    let counter = 0;
    let ells = values.map((onum) => {
        let index = counter++;
        return (
            <span key={ index }>
                { index ? ', ' : '' }
                <ObjectProp onum={ onum } />
            </span>
        );
    });

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
            { (rctx.shownumbers ?
               <span className="ShowAddr">({ onum }) </span>
               : null) }
            <ObjPageLink onum={ onum } />
            <code>{ obj.name }</code>
        </>);
}

function DirProp({ values } : { values:number[] })
{
    if (values.length == 1) {
        return <ObjectProp onum={ values[0] } />;
    }

    if (values.length == 2) {
        // can't go that way message
        return <StrProp values={ values } />;
    }

    if (values.length == 3) {
        // call this routine to decide (then a null byte)
        return (
            <>
                <i>call</i>{' '}
                <RoutineProp values={ values.slice(0, 2) } />
            </>
        );
    }

    if (values.length == 4) {
        // ROOM if (GLOBAL+16) [ else fail-message ]
        let glob = gamedat_global_nums.get(values[1]-16);
        let hasfail = !(values[2] == 0 && values[3] == 0);
        return (
            <>
                <ObjectProp onum={ values[0] } />
                {' '}<i>if</i>{' '}
                <code>{ (glob ? glob.name : '???' ) }</code>
                { (hasfail ?
                   <>
                       {' '}<i>else</i>{' '}
                       <StrProp values={ values.slice(2, 4) } />
                   </>
                   : null) }
            </>
        );
    }

    if (values.length == 5) {
        // ROOM if OBJ has open [ else fail-message] (then null byte)
        let hasfail = !(values[2] == 0 && values[3] == 0);
        return (
            <>
                <ObjectProp onum={ values[0] } />
                {' '}<i>if</i>{' '}
                <ObjectProp onum={ values[1] } />
                {' '}<i>open</i>
                { (hasfail ?
                   <>
                       {' '}<i>else</i>{' '}
                       <StrProp values={ values.slice(2, 4) } />
                   </>
                   : null) }
            </>
        );
    }

    // Shouldn't get here...
    return BytesProp({ values });
}

