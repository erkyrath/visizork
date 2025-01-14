import React from 'react';
import { useState, useMemo, useContext } from 'react';

import { ZObject, ZProp, zobj_properties } from './zstate';
import { ObjectData, gamedat_object_ids, gamedat_object_room_ids, gamedat_object_global_ids } from './gamedat';
import { unpack_address, signed_zvalue, gamedat_string_map, gamedat_dictword_addrs, gamedat_dictword_adjs, gamedat_routine_addrs, gamedat_property_nums, gamedat_attribute_nums, gamedat_global_nums } from './gamedat';

import { ReactCtx } from './context';
import { ObjPageLink } from './widgets';

export function ObjectPage({ onum } : { onum:number })
{
    let rctx = useContext(ReactCtx);
    let zstate = rctx.zstate;

    let props = useMemo(
        () => zobj_properties(zstate.proptable, onum),
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
            { (rctx.shownumbers ?
               <span className="ShowAddr">({ obj.onum }) </span>
               : null) }
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
                        { (rctx.shownumbers ?
                           <span className="ShowAddr">({ scobj.onum }) </span>
                           : null) }
                        <ObjPageLink onum={ scobj.onum } />
                        <code>{ scobj.name }</code>
                    </span>
                );
            }
        }
    }

    // These should have the same length and order as props.
    let origprops = zstate.origprops.get(onum);

    let propls = [];
    let index = 0;
    while (index < props.length) {
        let prop = props[index];
        let origprop: ZProp|undefined;
        if (origprops)
            origprop = origprops[index];
        let origvalues: number[];
        if (!origprop || origprop.pnum != prop.pnum)
            origvalues = [];
        else
            origvalues = origprop.values;

        propls.push(
            <ObjPropertyList key={ prop.pnum } pnum={ prop.pnum } values={ prop.values } origvalues={ origvalues } />
        );

        index++;
    }

    let origattrs = zstate.origattrs.get(onum) || 0;
    
    let attrls = [];
    index = 0;
    while (index < 32) {
        let curflag = (tup.attrs & (1 << (31-index)));
        let origflag = (origattrs & (1 << (31-index)));
        if (curflag || origflag) {
            let attr = gamedat_attribute_nums.get(index);
            if (!attr)
                continue;

            let changed = false;
            let cla = '';
            if (curflag) {
                if (!origflag) {
                    changed = true;
                    cla = 'AddAttr';
                }
            }
            else {
                if (origflag) {
                    changed = true;
                    cla = 'DelAttr';
                }
            }
            attrls.push(
                <span key={ index }>
                    { attrls.length ? ', ' : '' }
                    { (changed ?
                       <span className="ChangedNote">*</span>
                       : null) }
                    <code className={ cla }>{ attr.name }</code>{' '}
                </span>
            );
        }
        index++;
    }
    
    let label: string;
    if (obj.isroom)
        label = 'room';
    else if (gamedat_object_global_ids.has(onum))
        label = 'global object';
    else if (obj.iscenery && obj.iscenery.length)
        label = 'scenery';
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
                       { (rctx.shownumbers ?
                          <span className="ShowAddr">({ parent.onum }) </span>
                          : null) }
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
                { (attrls.length ?
                   <li>
                       Attributes:{' '}
                       { attrls }
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

function ObjPropertyList({ pnum, values, origvalues }: { pnum:number, values:number[], origvalues:number[] })
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
    case 'ADJS':
        propvalues = <AdjsProp values={ values } />;
        break;
    case 'WORDS':
        propvalues = <DictWordsProp values={ values } />;
        break;
    case 'WORDRTNS':
        propvalues = <WordsRoutinesProp values={ values } />;
        break;
    default:
        propvalues = <BytesProp values={ values } />;
        break;
    }

    let changeflag;
    if (values.length == origvalues.length) {
        changeflag = false;
        let ix = 0;
        while (ix < values.length) {
            if (values[ix] != origvalues[ix]) {
                changeflag = true;
                break;
            }
            ix++;
        }
    }
    else {
        changeflag = true;
    }
    
    let origtext = 'Original value: ';
    if (changeflag) {
        //### this could be nicer for STR and INT
        origtext += origvalues.join(' ');
    }

    return (
        <li>
            { (changeflag ?
               <span className="ChangedNote" title={ origtext }>*</span>
               : null) }
            { (rctx.shownumbers ?
               <span className="ShowAddr">{ pnum }: </span>
               : null) }
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
    return (<span>{ signed_zvalue(val) }</span>);
}

function AdjsProp({ values } : { values:number[] })
{
    let rctx = useContext(ReactCtx);
    
    let counter = 0;
    let valls = values.map((val) => {
        let index = counter++;
        let wd = gamedat_dictword_adjs.get(val);
        
        return (
            <span key={ counter }>
                { index ? ', ' : '' }
                { (rctx.shownumbers ?
                   <span className="ShowAddr">({ val }) </span>
                   : null) }
                { (wd ?
                   <span className="PrintDictWord">&#x2018;{ wd.text }&#x2019;</span>
                   :
                   <i>invalid adj { val }</i>
                  ) }
            </span>
        );
    });

    return (<span>{ valls }</span>);
}

function DictWordsProp({ values } : { values:number[] })
{
    let valls = [];
    let counter = 0;
    while (counter < values.length) {
        let index = counter;
        counter += 2;
        let val = values[index] * 0x100 + values[index+1];
        valls.push(
            <span key={ index }>
                { index ? ', ' : '' }
                <DictWordProp addr={ val } />
            </span>
        );
    };

    return (<span>{ valls }</span>);
}

function WordsRoutinesProp({ values } : { values:number[] })
{
    let valls = [];
    let counter = 0;
    while (counter < values.length) {
        let index = counter;
        counter += 4;
        let val = values[index] * 0x100 + values[index+1];
        valls.push(
            <span key={ index }>
                { index ? ', ' : '' }
                <DictWordProp addr={ val } />
                {' '}
            </span>
        );
        valls.push(<RoutineProp key={ index+2 } values={ values.slice(index+2, index+4) } />);
    };

    return (<span>{ valls }</span>);
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

function DictWordProp({ addr } : { addr:number })
{
    let rctx = useContext(ReactCtx);

    let wd = gamedat_dictword_addrs.get(addr);
    
    return (
        <span>
            { (rctx.shownumbers ?
               <span className="ShowAddr">({ addr }) </span>
               : null) }
            { (wd ?
               <span className="PrintDictWord">&#x2018;{ wd.text }&#x2019;</span>
               :
               <i>invalid word { addr }</i>
              ) }
        </span>
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
    let rctx = useContext(ReactCtx);
    
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
        let globnum = values[1] - 16;
        let glob = gamedat_global_nums.get(globnum);
        let hasfail = !(values[2] == 0 && values[3] == 0);
        return (
            <>
                <ObjectProp onum={ values[0] } />
                {' '}<i>if</i>{' '}
                { (rctx.shownumbers ?
                   <span className="ShowAddr">({ globnum }) </span>
                   : null) }
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

