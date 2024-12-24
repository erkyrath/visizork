import React from 'react';
import { useState, useContext, useEffect } from 'react';
import { Root, createRoot } from 'react-dom/client';

import { ZState } from './zstate';

// This is the GnustoRunner and the GnustoEngine, but I don't have
// type info for them yet.
let runner: any;
let engine: any;

export function init(runnerref: any)
{
    runner = runnerref;
    engine = runner.e;
    
    const appel = document.getElementById('appbody') as HTMLElement;
    let root = createRoot(appel);
    if (root)
        root.render( <MyApp /> );
}

function MyApp()
{
    const [ zstate, setZState ] = useState(engine.get_vm_report() as ZState);
    console.log('### ...', zstate);

    useEffect(() => {
        function evhan(ev: Event) {
            setZState(engine.get_vm_report());
        };
        window.addEventListener('zmachine-update', evhan);
        return () => {
            window.removeEventListener('zmachine-update', evhan);
        };
    }, []);
    
    return (
        <div className="ListPane">
            <ObjectTree zstate={ zstate } />
        </div>
    );
}

function ObjectTree({ zstate } : { zstate:ZState })
{
    let roots = [];
    let map = new Map();
    for (let tup of zstate.objects) {
        map.set(tup.onum, tup);
        if (tup.parent == 0)
            roots.push(tup);
    }

    function showchild(tup: any) {
        let obj = (window as any).gamedat_object_ids.get(tup.onum);
        if (!obj) {
            return <li key={ tup.onum }>{ tup.onum }: ???</li>;
        }

        let children = [];
        let val = tup.child;
        while (val != 0) {
            let ctup = map.get(val);
            if (!ctup)
                break;
            children.push(ctup);
            val = ctup.sibling;
        }
        
        return (
            <li key={ tup.onum }>
                { tup.onum }: { obj.name } "{ obj.desc }"
                { (obj.type=='ROOM' ? ' (R)' : '') }{': '}
                { tup.parent } { tup.sibling } { tup.child }
                <ul>
                    { (children.length ? children.map(showchild) : null) }
                </ul>
            </li>
        );
    }
    
    return (
        <ul>
            { roots.map(showchild) }
        </ul>
    );
}
