import React from 'react';
import { useState, useContext, createContext } from 'react';

import { ZObject } from '../visi/zstate';
import { signed_zvalue } from '../visi/gametypes';
import { ObjectData, GlobalData } from '../visi/gametypes';
import { gamedat_ids, gamedat_distances, gamedat_object_treesort } from './gamedat';
import { ArgShowObject, ArgShowProperty } from '../visi/actshowers';
import { StackCallCtx } from '../visi/context';

export function contains_label(obj: ObjectData) : string
{
    if (!obj.isroom) {
        if (obj.onum == gamedat_ids.ADVENTURER || obj.onum == gamedat_ids.THIEF || obj.onum == gamedat_ids.TROLL)
            return 'carries';
        else
            return 'contains'
    }
    return '';
}

export function sorter_for_key(key: number) : (roots:ZObject[], map:Map<number, ZObject>) => void
{
    let originobj: number = (key ? key : gamedat_ids.ADVENTURER);

    return function(roots: ZObject[], map: Map<number, ZObject>) {
        let advroom = originobj;

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
            if (sort1 == 1 && distmap !== undefined)
                return distmap[o1.onum] - distmap[o2.onum];
            return (o1.onum - o2.onum);
        });
    }
}

export function ObjListSorter({ followKey, setFollowKey } : { followKey:number, setFollowKey:(v:number)=>void })
{
    let follow: string = (followKey == 0) ? 'adv' : 'thief';
    
    function evhan_follow_change(val: string) {
        if (val == 'adv')
            setFollowKey(0);
        else if (val == 'thief')
            setFollowKey(gamedat_ids.THIEF);
    }
    
    return (
        <div>
            Follow{' '}
            <input id="followadv_radio" type="radio" name="follow" value="adv" checked={ follow=='adv' } onChange={ (ev) => evhan_follow_change('adv') } />
            <label htmlFor="followadv_radio">Adventurer</label>{' '}
            <input id="followthief_radio" type="radio" name="follow" value="thief" checked={ follow=='thief' } onChange={ (ev) => evhan_follow_change('thief') } />
            <label htmlFor="followthief_radio">Thief</label>
        </div>
    );
}

export function global_value_display(tag: string, value: number, glo: GlobalData) : JSX.Element|null
{
    return null;
}

export function stack_call_arg_display(tag: string, value: number) : JSX.Element|null
{
    switch (tag) {
        
    case 'PERFORMO':
        let ctx = useContext(StackCallCtx);
        if (ctx.args[0] == 137) {      /* action WALK */
            return (
                <ArgShowProperty value={ value } />
            );
        }
        return (
            <ArgShowObject value={ value } />
        )
        
    case 'PERFORMI':
        return (
            <ArgShowObject value={ value } />
        )
        
    case 'COMBATRES':
        return (
            <ArgShowCombatRes value={ value } />
        )
    
    case 'MELEEMODE':
        return (
            <ArgShowMeleeMode value={ value } />
        )
    
    case 'VILLAINOO':
        return (
            <ArgShowVillainOO value={ value } />
        )
    
    }


    return null;
}

function ArgShowCombatRes({ value }: { value:number })
{
    let flag: string|null;

    switch (value) {
    case 1:
        return (<span><code>,MISSED</code></span>);
    case 2:
        return (<span><code>,UNCONSCIOUS</code></span>);
    case 3:
        return (<span><code>,KILLED</code></span>);
    case 4:
        return (<span><code>,LIGHT-WOUND</code></span>);
    case 5:
        return (<span><code>,SERIOUS-WOUND</code></span>);
    case 6:
        return (<span><code>,STAGGER</code></span>);
    case 7:
        return (<span><code>,LOSE-WEAPON</code></span>);
    case 8:
        return (<span><code>,HESITATE</code></span>);
    case 9:
        return (<span><code>,SITTING-DUCK</code></span>);
    default:
        return (<span> { signed_zvalue(value) }</span>);
    }
}

function ArgShowMeleeMode({ value }: { value:number })
{
    let flag: string|null;

    switch (value) {
    case 1:
        return (<span><code>,F-BUSY?</code></span>);
    case 2:
        return (<span><code>,F-DEAD</code></span>);
    case 3:
        return (<span><code>,F-UNCONSCIOUS</code></span>);
    case 4:
        return (<span><code>,F-CONSCIOUS</code></span>);
    case 5:
        return (<span><code>,F-FIRST?</code></span>);
    default:
        return (<span> { signed_zvalue(value) }</span>);
    }
}

function ArgShowVillainOO({ value }: { value:number })
{
    let flag: string|null;

    // These values are the sub-table addresses in VILLAINS.

    switch (value) {
    case 11821:
        return (<span><i>troll-data</i></span>);
    case 11831:
        return (<span><i>thief-data</i></span>);
    case 11841:
        return (<span><i>cyclops-data</i></span>);
    default:
        return (<span> { signed_zvalue(value) }</span>);
    }
}
